/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {CoCRoll} from "../controllers/roll.js";

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
        // if (!this.options.editable) return;


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


        // Initiate a roll
        html.find('.rollable').click(ev => {
            ev.preventDefault();
            return this._onRoll(ev);
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
