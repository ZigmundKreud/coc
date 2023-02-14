import { CoCBaseSheet } from "./base-sheet.js";
import { COC } from "../system/config.js";

export class CoCEncounterSheet extends CoCBaseSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", "base", "sheet", "actor", "encounter"],
            template: "/systems/coc/templates/actors/actor-sheet.hbs",
            width: 970,
            height: 750,
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "stats"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-create.weapon-add').click(ev => {
            ev.preventDefault();
            return this.actor.createEmbeddedDocuments("Item", [{type:"encounterWeapon",name:"Attaque"}]);
        });
        html.find('.item-create.capacity-add').click(ev => {
            ev.preventDefault();
            return this.actor.createEmbeddedDocuments("Item", [{type:"capacity",name:"Capacité"}]);
        });
    }

    /** @override */
    getData(options) {
        const data = super.getData(options);
        if (COC.debug) console.log("COC | EncounterSheet getData", data);

        // Combat and Inventory
        data.inventory = data.items.filter(i => i.type === "item");
        data.capacities = data.items.filter(i => i.type === "capacity");

        data.weapons = data.items.filter(item=>item.type === "encounterWeapon");
        data.weapons.forEach((weapon)=>{
            weapon.system.weapon.modTotal = weapon.system.weapon.mod + weapon.system.weapon.skillBonus;
            weapon.system.weapon.dmgTotal = weapon.system.weapon.dmg;
            if (weapon.system.weapon.dmgBonus > 0) weapon.system.weapon.dmgTotal += ` + ${weapon.system.weapon.dmgBonus}`;
        });

        // Gestion des boutons de modification des effets (visible pour l'encounter)
        data.isEffectsEditable = true;
        if (COC.debug) console.log("COC | EncounterSheet getData", data);
        return data;
    }
}
