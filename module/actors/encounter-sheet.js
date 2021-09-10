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
            weapon.data.weapon.modTotal = weapon.data.weapon.mod + weapon.data.weapon.skillBonus;
            weapon.data.weapon.dmgTotal = weapon.data.weapon.dmg;
            if (weapon.data.weapon.dmgBonus > 0) weapon.data.weapon.dmgTotal += ` + ${weapon.data.weapon.dmgBonus}`;
        });

        if (COC.debug) console.log("COC | EncounterSheet getData", data);
        return data;
    }
}
