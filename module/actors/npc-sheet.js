/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {CoCActorSheet} from "./actor-sheet.js";

export class CoCNpcSheet extends CoCActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", game.coc.skin, "sheet", "actor", "npc"],
            template: "/systems/coc/templates/actors/npc/npc-sheet.hbs",
            width: 770,
            height: 740,
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "stats"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }
}
