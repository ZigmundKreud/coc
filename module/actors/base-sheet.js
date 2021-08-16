/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {CoCRoll} from "../controllers/roll.js";
import {Capacity} from "../controllers/capacity.js";
import {Path} from "../controllers/path.js";
import {Profile} from "../controllers/profile.js";
import {Traversal} from "../utils/traversal.js";
import {Trait} from "../controllers/trait.js";
import {ArrayUtils} from "../utils/array-utils.js";

export class CoCBaseSheet extends ActorSheet {

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Double click to open
        html.find('.compendium-pack').dblclick(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget);
            const pack = game.packs.get(li.data("pack"));
            if (pack) {
                if (li.attr("data-open") === "1") {
                    li.attr("data-open", "0");
                    pack.apps[0].close();
                }
                else {
                    li.attr("data-open", "1");
                    pack.render(true);
                }
            }
        });

        // Click to open
        html.find('.item-create.compendium-pack').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if (li.attr("data-open") === "1") pack.close();
            else {
                li.attr("data-open", "1");
                pack.render(true);
            }
        });

        // Initiate a roll
        html.find('.rollable').click(ev => {
            ev.preventDefault();
            return this._onRoll(ev);
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

        html.find('.foldable h3.item-name').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget);
            const ol = li.parents('.inventory-list');
            const tab = ol.data('tab');
            const category = ol.data('category');
            const itemList = ol.find('.item-list');
            const actor = this.actor;
            itemList.slideToggle("fast", function () {
                ol.toggleClass("folded");
                if (actor.data.data.settings) {
                    if (ol.hasClass("folded")) {
                        if (!actor.data.data.settings[tab].folded.includes(category)) {
                            actor.data.data.settings[tab].folded.push(category);
                        }
                    } else {
                        ArrayUtils.remove(actor.data.data.settings[tab].folded, category)
                    }
                }
                actor.update({ "data.settings": actor.data.data.settings })
            });
        });

        // Equip/Unequip items
        html.find('.item-equip').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(elt.data("itemId"));
            let itemData = item.data;
            itemData.data.worn = !itemData.data.worn;
            return this.actor.updateEmbeddedDocuments("Item", [itemData], {}).then(() => this.render(true));
        });

        html.find('.item-qty').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.items.get(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty) ? itemData.data.qty + 1 : 1;
            return this.actor.updateEmbeddedDocuments("Item", [itemData], {}).then(() => this.render(true));
        });
        html.find('.item-qty').contextmenu(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.items.get(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty > 0) ? itemData.data.qty -1 : 0;
            return this.actor.updateEmbeddedDocuments("Item", [itemData], {}).then(() => this.render(true));
        });

        // html.find('.item-name, .item-edit').click(this._onEditItem.bind(this));
        html.find('.item-edit').click(this._onEditItem.bind(this));
        html.find('.item-delete').click(ev => {
            return this._onDeleteItem(ev);
        });
    }

    _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest(".item");
        const id = li.data("itemId");
        const type = (li.data("itemType")) ? li.data("itemType") : "item";
        const pack = (li.data("pack")) ? "coc." + li.data("pack") : null;

        // look first in actor owned items elsewhere into world/compendiums items
        let entity = this.actor.items.get(id);
        return (entity) ? entity.sheet.render(true) : Traversal.getDocument(id, type, pack).then(e => e.sheet.render(true));
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
        if (!this.actor.isOwner) return false;
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const itemId = li.data("itemId");
        const entity = this.actor.items.get(itemId);
        switch (entity.data.type) {
            case "capacity" :
                return Capacity.removeFromActor(this.actor, event, entity);
                break;
            case "trait" :
                return Trait.removeFromActor(this.actor, event, entity);
                break;
            case "path" :
                return Path.removeFromActor(this.actor, event, entity);
                break;
            case "profile" :
                return Profile.removeFromActor(this.actor, event, entity);
                break;
            case "trait" :
            default: {
                return this.actor.deleteEmbeddedDocuments("Item", [itemId], {});
            }
        }
    }


    /* -------------------------------------------- */
    /* DROP EVENTS CALLBACKS                        */
    /* -------------------------------------------- */

    /** @override */
    _onDrop(event) {
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
    _onDropItem(event, data) {
        if (!this.actor.isOwner) return false;
        return Item.fromDropData(data).then(item => {
            const itemData = duplicate(item.data);
            switch (itemData.type) {
                case "capacity"    : return Capacity.addToActor(this.actor, event, itemData);
                case "trait"    : return Trait.addToActor(this.actor, event, itemData);
                case "path"    : return Path.addToActor(this.actor, event, itemData);
                case "profile" : return Profile.addToActor(this.actor, event, itemData);
                default:
                    // Handle item sorting within the same Actor
                    const actor = this.actor;
                    let sameActor = (data.actorId === actor.id) || (actor.isToken && (data.tokenId === actor.token.id));
                    if (sameActor) return this._onSortItem(event, itemData);
                    // Create the owned item
                    return this.actor.createEmbeddedDocuments("Item", [itemData], {});
            }
        });
    }

    /* -------------------------------------------- */
    /* ROLL EVENTS CALLBACKS                        */
    /* -------------------------------------------- */

    /**
     * Initiates a roll from any kind depending on the "data-roll-type" attribute
     * @param event the roll event
     * @private
     */
    async _onRoll(event) {
        const elt = $(event.currentTarget)[0];
        const rolltype = elt.attributes["data-roll-type"].value;
        let data = await this.getData();
        switch (rolltype) {
            case "skillcheck" :
                return CoCRoll.skillCheck(data.data, this.actor, event);
                break;
            case "weapon" :
                return CoCRoll.rollWeapon(data.data, this.actor, event);
                break;
            case "encounter-weapon" :
                return CoCRoll.rollEncounterWeapon(data.data, this.actor, event);
                break;
            case "encounter-damage" :
                return CoCRoll.rollEncounterDamage(data.data, this.actor, event);
                break;
            case "spell" :
                return CoCRoll.rollSpell(data.data, this.actor, event);
                break;
            case "damage" :
                return CoCRoll.rollDamage(data.data, this.actor, event);
                break;
            case "hp" :
                return CoCRoll.rollHitPoints(data.data, this.actor, event);
                break;
            case "attributes" :
                return CoCRoll.rollAttributes(data.data, this.actor, event);
                break;
        }
    }
}
