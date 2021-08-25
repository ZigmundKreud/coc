import { CoCBaseSheet } from "./base-sheet.js";
import { COC } from "../system/config.js";

export class CoCEncounterSheet extends CoCBaseSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", game.coc.skin, "sheet", "actor", "encounter"],
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
        html.find('.weapon-add').click(this._onWeaponAdd.bind(this));
        html.find('.weapon-remove').click(this._onWeaponRemove.bind(this));
    }

    /* -------------------------------------------- */
    /* WEAPON ADD/REMOVE CALLBACKS                  */
    /* -------------------------------------------- */

    async _onWeaponAdd(event) {
        event.preventDefault();
        let data = await this.getData();
        data.weapons = Object.values(data.data.weapons);
        data.weapons.push({"name": "", "mod": null, "dmg": null});
        return this.actor.update({'data.weapons': data.weapons});
    }

    async _onWeaponRemove(event) {
        event.preventDefault();
        const elt = $(event.currentTarget).parents(".weapon");
        const idx = elt.data("itemId");
        let data = await this.getData();
        data.weapons = Object.values(data.data.weapons);
        if(data.weapons.length == 1) data.weapons[0] = {"name":"", "mod":null, "dmg":null};
        else data.weapons.splice(idx, 1);
        return this.actor.update({'data.weapons': data.weapons});
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
