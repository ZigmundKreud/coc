/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import { Capacity } from "../controllers/capacity.js";
import { Path } from "../controllers/path.js";
import { ArrayUtils } from "../utils/array-utils.js";
import { Traversal } from "../utils/traversal.js";
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
        html.find('.coc-compendium-pack').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if ( li.attr("data-open") === "1" ) {
                li.attr("data-open", "0");
                pack.apps[0].close();
            }
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
                let lockItems = game.settings.get("coc", "lockItems");
                if ((!game.user.isGM && lockItems) || this.item.actor) return;    // Si l'item est verrouillé ou appartient à un actor, l'effet n'est pas modifiable
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
                effect.update({ disabled: !effect.disabled })
            }
        });

        html.find('.checkbox').click(this._onVerifyCheckboxes.bind(this));
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
        Item.fromDropData(data).then(item => {
            const itemData = duplicate(item);
            switch (itemData.type) {
                case "path": return this._onDropPathItem(event, itemData);
                case "capacity": return this._onDropCapacityItem(event, itemData);
                case "profile": return this._onDropProfileItem(event, itemData);
                case "species":
                default: return false;
            }
        });
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
        if (this.item.type === "profile") return Path.addToItem(this.item, itemData);
        else return false;
    }

    /* -------------------------------------------- */

    _onDropCapacityItem(event, itemData) {
        event.preventDefault();
        if (this.item.type === "path") return Capacity.addToItem(this.item, itemData);
        else return false;
    }

    /* -------------------------------------------- */

    async _onEditItem(ev){
        ev.preventDefault();
        const li = $(ev.currentTarget).closest(".item");
        const id = li.data("itemId");

        if (id) {
            return Traversal.find(id).then(e => {
                if (e) return e.sheet.render(true);
                else {
                    ui.notifications.error("Impossible de trouver l'entité");
                    return false;
                }
            });
        }
        else return null;
    }

    /* -------------------------------------------- */

    _onDeleteItem(ev){
        ev.preventDefault();
        let data = duplicate(this.item);
        const li = $(ev.currentTarget).closest(".item");
        const id = li.data("itemId");
        const itemType = li.data("itemType");
        let array = null;
        switch(itemType){
            case "path" : array = data.system.paths; break;
            case "capacity" : array = data.system.capacities; break;
        }
        const item = array.find(e => e._id === id);
        if(array && array.includes(item)) {
            ArrayUtils.remove(array, item)
        }
        return this.item.update(data);
    }

    /** @override */
    getData(options) {
        const data = super.getData(options);

        let lockItems = game.settings.get("coc", "lockItems");
        options.editable &= (game.user.isGM || !lockItems);

        const itemData = data.data;
        data.labels = this.item.labels;
        data.config = game.coc.config;
        data.itemType = data.item.type.titleCase();
        data.itemProperties = this._getItemProperties(data.item);
        data.effects = data.item.effects;
        // Gestion de l'affichage des boutons de modification des effets
        // Les boutons sont masqués si l'item appartient à un actor
        data.isEffectsEditable = !this.item.actor && options.editable;
        data.item = itemData;
        data.system = itemData.system;

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
            const entries = Object.entries(item.system.properties)
            props.push(...entries.filter(e => e[1] === true).map(e => {
                return game.coc.config.itemProperties[e[0]]
            }));
        }
        return props.filter(p => !!p);
    }

    /**
     *
     * @param {*} event
     * @returns
     */
     _onVerifyCheckboxes(event){
        const input = $(event.currentTarget).find("input");
        const name = input.attr('name');
        const checked = input.prop('checked')
        if (name === "system.properties.equipment" && !checked) {
            let data = duplicate(this.item);
            data.system.properties.equipable = false;
            data.system.slot = "";
            data.system.properties.stackable = false;
            data.system.qty = 1;
            data.system.stacksize = null;
            data.system.properties.unique = false;
            data.system.properties.consumable = false;
            data.system.properties.tailored = false;
            data.system.properties["2H"] = false;
            data.system.price = 0;
            data.system.value = 0;
            data.system.rarity = "";
            return this.item.update(data);
        }
        if (name === "system.properties.equipable" && !checked) {
            let data = duplicate(this.item);
            data.system.slot = "";
            return this.item.update(data);
        }
        if (name === "system.properties.stackable" && !checked) {
            let data = duplicate(this.item);
            data.system.qty = 1;
            data.system.stacksize = null;
            return this.item.update(data);
        }
        if (name === "system.properties.weapon" && !checked) {
            let data = duplicate(this.item);
            data.system.skill = "@attacks.melee.mod";
            data.system.skillBonus = 0;
            data.system.dmgBase = 0;
            data.system.dmgStat = "";
            data.system.dmgBonus = 0;
            data.system.critrange = "20"
            data.system.properties.bashing = false;
            data.system.properties["13strmin"] = false;
            return this.item.update(data);
        }
        if (name === "system.properties.protection" && !checked) {
            let data = duplicate(this.item);
            data.system.defBase = 0;
            data.system.defBonus = 0;
            data.system.properties.dr = false;
            data.system.dr = 0;
            return this.item.update(data);
        }
        if (name === "system.properties.dr" && !checked) {
            let data = duplicate(this.item);
            data.system.dr = 0;
            return this.item.update(data);
        }
        if (name === "system.properties.ranged" && !checked) {
            let data = duplicate(this.item);
            data.system.range = 0;
            data.system.properties.reloadable = false;
            data.system.properties.salve = false;
            data.system.properties.proneshot = false;
            data.system.properties.explosive = false;
            data.system.reload = "";
            return this.item.update(data);
        }
        if (name === "system.properties.reloadable" && !checked) {
            let data = duplicate(this.item);
            data.system.reload = "";
            return this.item.update(data);
        }
        if (name === "system.properties.effects" && !checked) {
            let data = duplicate(this.item);
            data.system.properties.heal = false;
            data.system.properties.buff = false;
            data.system.properties.temporary = false;
            data.system.properties.persistent = false;
            data.system.properties.spell = false;
            data.system.effects.heal.formula = null;
            data.system.effects.buff.formula = null;
            data.system.properties.duration.formula = null;
            data.system.properties.duration.units = "";
            data.system.properties.activable = false;
            return this.item.update(data);
        }
        if (name === "system.properties.heal" && !checked) {
            let data = duplicate(this.item);
            data.system.effects.heal.formula = null;
            return this.item.update(data);
        }
        if (name === "system.properties.buff" && !checked) {
            let data = duplicate(this.item);
            data.system.effects.buff.formula = null;
            return this.item.update(data);
        }
        if (name === "system.properties.temporary" && !checked) {
            let data = duplicate(this.item);
            data.system.properties.duration.formula = null;
            data.system.properties.duration.units = "";
            return this.item.update(data);
        }
        if (name === "system.properties.spell" && !checked) {
            let data = duplicate(this.item);
            data.system.properties.activable = false;
            return this.item.update(data);
        }
    }
}
