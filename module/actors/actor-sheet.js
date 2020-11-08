/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {CoCRoll} from "../controllers/roll.js";
import {Capacity} from "../controllers/capacity.js";
import {Path} from "../controllers/path.js";
import {Profile} from "../controllers/profile.js";
import {Traversal} from "../utils/traversal.js";

export class CoCActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", game.coc.skin, "sheet", "actor", "character"],
            template: "/systems/coc/templates/actors/actor-sheet.hbs",
            width: 950,
            height: 670,
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "stats"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;


        html.find('.weapon-add').click(ev => {
            ev.preventDefault();
            const data = this.getData().data;
            data.weapons = Object.values(data.weapons);
            data.weapons.push({"name":"", "mod":null, "dmg":null});
            this.actor.update({'data.weapons': data.weapons});
        });

        html.find('.weapon-remove').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".weapon");
            const idx = elt.data("itemId");
            const data = this.getData().data;
            data.weapons = Object.values(data.weapons);
            if(data.weapons.length == 1) data.weapons[0] = {"name":"", "mod":null, "dmg":null};
            else data.weapons.splice(idx, 1);
            this.actor.update({'data.weapons': data.weapons});
        });

        // Check/Uncheck capacities
        html.find('.capacity-checked').click(ev => {
            ev.preventDefault();
            return Capacity.toggleCheck(this.actor, ev, true);
        });
        html.find('.capacity-unchecked').click(ev => {
            ev.preventDefault();
            return Capacity.toggleCheck(this.actor, ev, false);
        });
        html.find('.capacity-create').click(ev => {
            ev.preventDefault();
            return Capacity.create(this.actor, ev);
        });
        html.find('.capacity-toggle').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".capacity");
            li.find(".capacity-description").slideToggle(200);
        });


        // Initiate a roll
        html.find('.rollable').click(ev => {
            ev.preventDefault();
            return this._onRoll(ev);
        });

        // Equip/Unequip items
        html.find('.item-equip').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".item");
            const item = this.actor.getOwnedItem(elt.data("itemId"));
            let itemData = item.data;
            itemData.data.worn = !itemData.data.worn;
            return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
        });

        html.find('.item-qty').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty) ? itemData.data.qty + 1 : 1;
            return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
        });
        html.find('.item-qty').contextmenu(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty > 0) ? itemData.data.qty -1 : 0;
            return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
        });

        html.find('.item-name, .item-edit').click(this._onEditItem.bind(this));
        html.find('.item-delete').click(ev => {
            return this._onDeleteItem(ev);
        });
    }


    async _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("itemId");
        const type = (li.data("itemType")) ? li.data("itemType") : "item";
        const pack = (li.data("pack")) ? li.data("pack") : null;

        let entity = null;
        // look first in actor onwed items
        entity = this.actor.getOwnedItem(id);
        if(!entity) {
            // look into world/compendiums items
            entity = await Traversal.getEntity(id, type, pack);
        }
        if(entity) return entity.sheet.render(true);
    }

    /* -------------------------------------------- */
    /* DELETE EVENTS CALLBACKS                      */
    /* -------------------------------------------- */

    /**
     * Callback on delete item actions
     * @param event the roll event
     * @private
     */
    _onDeleteItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const itemId = li.data("itemId");
        const entity = this.actor.items.find(item => item._id === itemId);
        switch (entity.data.type) {
            case "capacity" :
                return this.actor.deleteOwnedItem(itemId);
                // return Capacity.removeFromActor(this.actor, event, entity);
                break;
            case "path" :
                return Path.removeFromActor(this.actor, event, entity);
                break;
            case "profile" :
                return Profile.removeFromActor(this.actor, event, entity);
                break;
            default: {
                return this.actor.deleteOwnedItem(itemId);
            }
        }
    }


    /* -------------------------------------------- */
    /* DROP EVENTS CALLBACKS                        */
    /* -------------------------------------------- */

    /** @override */
    async _onDrop(event) {
        event.preventDefault();
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

    /**
     * Handle dropping an Actor on the sheet to trigger a Polymorph workflow
     * @param {DragEvent} event   The drop event
     * @param {Object} data       The data transfer
     * @private
     */
    async _onDropActor(event, data) {
        return false;
    }

    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
    async _onDropItem(event, data) {
        if (!this.actor.owner) return false;
        // let authorized = true;

        // let itemData = await this._getItemDropData(event, data);
        const item = await Item.fromDropData(data);
        const itemData = duplicate(item.data);
        switch (itemData.type) {
            case "path"    :
                return await Path.addToActor(this.actor, event, itemData);
            case "profile" :
                return await Profile.addToActor(this.actor, event, itemData);
            case "capacity" :
            default:
                // activate the capacity as it is droped on an actor sheet
                // if (itemData.type === "capacity") itemData.data.checked = true;
                // Handle item sorting within the same Actor
                const actor = this.actor;
                let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
                if (sameActor) return this._onSortItem(event, itemData);
                // Create the owned item
                return this.actor.createEmbeddedEntity("OwnedItem", itemData);
        }
        // if (authorized) {
        //     // Handle item sorting within the same Actor
        //     const actor = this.actor;
        //     let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
        //     if (sameActor) return this._onSortItem(event, itemData);
        //     // Create the owned item
        //     return this.actor.createEmbeddedEntity("OwnedItem", itemData);
        // } else {
        //     return false;
        // }
    }


    /* -------------------------------------------- */
    /* ROLL EVENTS CALLBACKS                        */
    /* -------------------------------------------- */

    /**
     * Initiates a roll from any kind depending on the "data-roll-type" attribute
     * @param event the roll event
     * @private
     */
    _onRoll(event) {
        const elt = $(event.currentTarget)[0];
        const rolltype = elt.attributes["data-roll-type"].value;
        switch (rolltype) {
            case "skillcheck" :
                return CoCRoll.skillCheck(this.getData().data, this.actor, event);
                break;
            case "weapon" :
                return CoCRoll.rollWeapon(this.getData().data, this.actor, event);
                break;
            case "encounter-weapon" :
                return CoCRoll.rollEncounterWeapon(this.getData().data, this.actor, event);
                break;
            case "encounter-damage" :
                return CoCRoll.rollEncounterDamage(this.getData().data, this.actor, event);
                break;
            case "spell" :
                return CoCRoll.rollSpell(this.getData().data, this.actor, event);
                break;
            case "damage" :
                return CoCRoll.rollDamage(this.getData().data, this.actor, event);
                break;
            case "hp" :
                return CoCRoll.rollHitPoints(this.getData().data, this.actor, event);
                break;
            case "attributes" :
                return CoCRoll.rollAttributes(this.getData().data, this.actor, event);
                break;
        }
    }

    /* -------------------------------------------- */

    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

}
