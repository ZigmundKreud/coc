/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import { CoCRoll } from "../controllers/roll.js";
import { Capacity } from "../controllers/capacity.js";
import { Path } from "../controllers/path.js";
import { Profile } from "../controllers/profile.js";
import { Traversal } from "../utils/traversal.js";
import { Trait } from "../controllers/trait.js";
import { ArrayUtils } from "../utils/array-utils.js";
import { Inventory } from "../controllers/inventory.js";
import { COC } from "../system/config.js";

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

        // Equip/Unequip item
        html.find('.inventory-equip').click(this._onToggleEquip.bind(this));

        // Stackable item
        html.find('.inventory-qty').click(this._onIncrease.bind(this));
        html.find('.inventory-qty').contextmenu(this._onDecrease.bind(this));

        // html.find('.item-name, .item-edit').click(this._onEditItem.bind(this));
        html.find('.item-edit').click(this._onEditItem.bind(this));
        html.find('.item .item-name h4').click(this._onItemSummary.bind(this));
        html.find('.item-delete').click(this._onDeleteItem.bind(this));
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
    }

    /**
    * Callback on render item actions : display or not the summary
    * @param event
    * @private
    */
    _onItemSummary(event) {
        event.preventDefault();
        let li = $(event.currentTarget).parents('.item').children('.item-summary');
        let entity = this.actor.items.get($(event.currentTarget).parents('.item').data("itemId"));
        if (entity && (entity.data.type === "capacity" || entity.data.type === "encounterWeapon" ) ) {
            if (li.hasClass('expanded')) {
                li.css("display", "none");
            }
            else {
                li.css("display", "block");
            }
            li.toggleClass('expanded');
        } else {
            this._onEditItem(event);
        }
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

    _onToggleEquip(event) {
        event.preventDefault();
        //AudioHelper.play({ src: "/systems/coc/sounds/sword.mp3", volume: 0.8, autoplay: true, loop: false }, false);
        return Inventory.onToggleEquip(this.actor, event);
    }

    _onIncrease(event) {
        event.preventDefault();
        return Inventory.onModifyQuantity(this.actor, event, 1, false);
    }

    _onDecrease(event) {
        event.preventDefault();
        return Inventory.onModifyQuantity(this.actor, event, 1, true);
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
        let itemId = li.data("itemId");
        const entity = this.actor.items.find(item => item.id === itemId);
        itemId = itemId instanceof Array ? itemId : [itemId];
        switch (entity.data.type) {
            case "capacity": return Capacity.removeFromActor(this.actor, entity);
            case "path": return Path.removeFromActor(this.actor, entity);
            case "profile": return Profile.removeFromActor(this.actor, entity);
            case "species": return Species.removeFromActor(this.actor, entity);
            default: return this.actor.deleteEmbeddedDocuments("Item", itemId);
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
            if (!COC.actorsAllowedItems[this.actor.data.type]?.includes(item.data.type)) return;
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
        // SHIFT + click
        if (event.shiftKey) {
            switch (rolltype) {
                // Spend recovery point without getting hit points
                case "recovery": return CoCRoll.rollRecoveryUse(data.data, this.actor, false)    
            }
        }
        switch (rolltype) {
            case "skillcheck" : return CoCRoll.skillCheck(data.data, this.actor, event);
            case "weapon" : return CoCRoll.rollWeapon(data.data, this.actor, event);
            case "damage" : return CoCRoll.rollDamage(data.data, this.actor, event);
            case "encounter-weapon" : return CoCRoll.rollEncounterWeapon(data.data, this.actor, event);
            case "encounter-damage" : return CoCRoll.rollEncounterDamage(data.data, this.actor, event);
            case "spell" : return CoCRoll.rollSpell(data.data, this.actor, event);            
            case "hp" : return CoCRoll.rollHitPoints(data.data, this.actor, event);
            case "attributes" : return CoCRoll.rollAttributes(data.data, this.actor, event);
            case "recovery": return CoCRoll.rollRecoveryUse(data.data, this.actor, true);
        }
    }

        /** @override */
	getData(options) {
        const data = super.getData(options);
        const actorData = data.data;
		data.isGm = game.user.isGM;
        
        // Basic data
        let isOwner = this.actor.isOwner;

        data.owner =  isOwner;
        data.limited =  this.actor.limited;
        data.options =  this.options;
        data.editable =  this.isEditable;
        data.config =  game.coc.config;
        data.cssClass =  isOwner ? "editable" : "locked";
        data.isCharacter =  this.actor.type === "character";
        data.isNPC =  this.actor.type === "npc";
        data.isEncounter = this.actor.type === "encounter";
        data.isVehicle =  this.actor.type === 'vehicle';
        data.rollData =  this.actor.getRollData.bind(this.actor);
        
        data.effects = data.actor.effects;
        data.folded = {
            "combat": (actorData.data.settings?.combat) ? actorData.data.settings?.combat.folded : [],
            "inventory": (actorData.data.settings?.inventory) ? actorData.data.settings?.inventory.folded : [],
            "capacities": (actorData.data.settings?.capacities) ? actorData.data.settings?.capacities.folded : [],
            "effects": (actorData.data.settings?.effects) ? actorData.data.settings?.effects.folded : []
        };        
        data.actor = actorData;
        data.data = actorData.data;       

        return data;
	}
}
