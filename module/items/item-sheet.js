/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import {ArrayUtils} from "../utils/array-utils.js";
import {Traversal} from "../utils/traversal.js";

export class CoCItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", "base", "sheet", "item", this.type],
            template: "/systems/coc/templates/items/item-sheet.hbs",
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /**
     * Activate the default set of listeners for the Entity sheet
     * These listeners handle basic stuff like form submission or updating images
     *
     * @param html {JQuery}     The rendered template ready to have listeners attached
     */
    activateListeners(html) {
        super.activateListeners(html);

        // html.find('.editor-content[data-edit]').each((i, div) => this._activateEditor(div));

        html.find('.droppable').on("dragover", function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.currentTarget).addClass('dragging');
        });

        html.find('.droppable').on("dragleave", function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.currentTarget).removeClass('dragging');
        });

        html.find('.droppable').on("drop", function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.currentTarget).removeClass('dragging');
        });

        // Click to open
        html.find('.compendium-pack').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if ( li.attr("data-open") === "1" ) pack.close();
            else {
                li.attr("data-open", "1");
                li.find("i.folder").removeClass("fa-folder").addClass("fa-folder-open");
                pack.render(true);
            }
        });

        // Display item sheet
        html.find('.item-edit').click(this._onEditItem.bind(this));
        // Delete items
        html.find('.item-delete').click(this._onDeleteItem.bind(this));

        // Item Effects
        html.find('.item-name').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            if (!elt || elt.length === 0) this._onEditItem(ev);
            else {
                if (this.item.actor) return;    // Si l'item appartient à un actor, l'effet n'est pas modifiable
                const effectId = elt.data("itemId");
                let effect = this.item.effects.get(effectId);
                if (effect) {
                    new ActiveEffectConfig(effect).render(true);
                }
            }
        });
        // Abonnement des évènements sur les effets
        html.find('.effect-create').click(ev => {
            ev.preventDefault();
            if (!this.isEditable) return;
            return this.item.createEmbeddedDocuments("ActiveEffect", [{
                label: game.i18n.localize("COC.ui.newEffect"),
                icon: "icons/svg/aura.svg",
                origin: this.item.uuid,
                "duration.rounds": undefined,
                disabled: false
            }]);
        });
        html.find('.effect-edit').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let effect = this.item.effects.get(effectId);
            if (effect) {
                new ActiveEffectConfig(effect).render(true);
            }
        });
        html.find('.effect-delete').click(ev => {
            ev.preventDefault();
            if (!this.isEditable) return;
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let effect = this.item.effects.get(effectId);
            if (effect) effect.delete();
        });
        html.find('.effect-toggle').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let effect = this.item.effects.get(effectId);
            if (effect) {
                effect.update({ disabled: !effect.data.disabled })
            }
        });

    }

    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

    /* -------------------------------------------- */

    /** @override */
    _onDrop(event) {
        event.preventDefault();
        if (!this.options.editable) return false;
        // Get dropped data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return false;
        }
        if (!data) return false;

        // Case 1 - Dropped Item
        if (data.type === "Item") {
            return this._onDropItem(event, data);
        }
        // Case 2 - Dropped Actor
        if (data.type === "Actor") {
            return this._onDropActor(event, data);
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
    async _onDropItem(event, data) {
        const item = await Item.fromDropData(data);
        const itemData = duplicate(item.data);
        switch (itemData.type) {
            case "path"    :
                return await this._onDropPathItem(event, itemData);
            case "profile" :
                return await this._onDropProfileItem(event, itemData);
            case "capacity" :
                return await this._onDropCapacityItem(event, itemData);
            default:
                return;
        }
    }
    /* -------------------------------------------- */
    /**
     * Handle dropping an Actor on the sheet to trigger a Polymorph workflow
     * @param {DragEvent} event   The drop event
     * @param {Object} data       The data transfer
     * @private
     */
    _onDropActor(event, data) {
        return false;
    }

    /* -------------------------------------------- */

    _onDropProfileItem(event, itemData) {
        return false;
    }

    /* -------------------------------------------- */

    _onDropPathItem(event, itemData) {
        event.preventDefault();
        let data = duplicate(this.item.data);
        const id = itemData._id;
        if(data.type === "profile"){
            if(!data.data.paths.includes(id)){
                data.data.paths.push(id);
                return this.item.update(data);
            }
            else ui.notifications.error("Ce profil contient déjà cette voie.")
        }
        return false;
    }

    /* -------------------------------------------- */

    _onDropCapacityItem(event, itemData) {
        event.preventDefault();
        let data = duplicate(this.item.data);
        const id = itemData._id;
        if(data.data.capacities && !data.data.capacities.includes(id)){
            let caps = data.data.capacities;
            caps.push(id);
            return this.item.update(data);
        }
        else ui.notifications.error("Cette voie contient déjà cette capacité.")
    }

    /* -------------------------------------------- */

    async _onEditItem(ev){
        ev.preventDefault();
        const li = $(ev.currentTarget).closest(".item");
        const id = li.data("itemId");
        const itemType = li.data("itemType");
        let pack = null;
        switch(itemType){
            case "profile" : pack = "coc.profiles"; break;
            case "path" : pack = "coc.paths"; break;
            case "capacity" : pack = "coc.capacities"; break;
        }
        if(pack) return Traversal.getDocument(id, "item", pack).then(e => { if(e) e.sheet.render(true) });
    }

    /* -------------------------------------------- */

    _onDeleteItem(ev){
        ev.preventDefault();
        let data = duplicate(this.item.data);
        const li = $(ev.currentTarget).closest(".item");
        const id = li.data("itemId");
        const itemType = li.data("itemType");
        let array = null;
        switch(itemType){
            case "path" : array = data.data.paths; break;
            case "capacity" : array = data.data.capacities; break;
        }
        if(array && array.includes(id)) {
            ArrayUtils.remove(array, id)
            return this.item.update(data);
        }
    }

    /** @override */
    getData(options) {
         const data = super.getData(options);
        const itemData = data.data;

        data.labels = this.item.labels;
        data.config = game.coc.config;
        data.itemType = data.item.type.titleCase();
        data.itemProperties = this._getItemProperties(data.item);
        data.effects = data.item.effects;
        // Gestion de l'affichage des boutons de modification des effets
        // Les boutons sont masqués si l'item appartient à un actor
        data.isEffectsEditable = this.item.actor ? false : true;
        data.item = itemData;
        data.data = itemData.data;
        
        return data;       
    }

    /* -------------------------------------------- */

    /**
     * Get the Array of item properties which are used in the small sidebar of the description tab
     * @return {Array}
     * @private
     */
    _getItemProperties(item) {
        const props = [];
        // const labels = this.item.labels;

        if ( item.type === "item" ) {
            const entries = Object.entries(item.data.data.properties)
            props.push(...entries.filter(e => e[1] === true).map(e => {
                return game.coc.config.itemProperties[e[0]]
            }));
        }

        // else if ( item.type === "spell" ) {
        //     // props.push(
        //         // labels.components,
        //         // labels.materials,
        //         // item.data.components.concentration ? game.i18n.localize("DND5E.Concentration") : null,
        //         // item.data.components.ritual ? game.i18n.localize("DND5E.Ritual") : null
        //     // )
        // }
        //
        // else if ( item.type === "equipment" ) {
        //     props.push(CONFIG.DND5E.equipmentTypes[item.data.armor.type]);
        //     props.push(labels.armor);
        // }

        // else if ( item.type === "feat" ) {
        //     props.push(labels.featType);
        // }

        // Action type
        // if ( item.data.actionType ) {
        //     props.push(CONFIG.DND5E.itemActionTypes[item.data.actionType]);
        // }

        // Action usage
        // if ( (item.type !== "weapon") && item.data.activation && !isObjectEmpty(item.data.activation) ) {
        //     props.push(
        //         labels.activation,
        //         labels.range,
        //         labels.target,
        //         labels.duration
        //     )
        // }
        return props.filter(p => !!p);
    }
}
