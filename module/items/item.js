/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import { CocHealingRoll } from "../controllers/healing-roll.js";
import { COC } from "../system/config.js";
export class CoCItem extends Item {

    /* -------------------------------------------- */
    /*  Constructor                                 */
    /* -------------------------------------------- */
    /* Définition de l'image par défaut             */
    /* -------------------------------------------- */
    constructor(...args) {
        let data = args[0];
        if (!data.img && COC.itemIcons[data.type]) data.img = COC.itemIcons[data.type];

        super(...args);
    }

    /** @override */
    prepareData() {
        super.prepareData();
        const itemData = this.data;
        const actorData = (this.actor) ? this.actor.data : null;
        switch (itemData.type) {
            case "item" :
                this._prepareArmorData(itemData, actorData);
                this._prepareWeaponData(itemData, actorData);
                break;
            case "path" :
            case "trait" :
            case "capacity" :
            case "profile" :
                if(!itemData.data.setting) itemData.data.setting = "base";
                itemData.data.key = itemData.data.setting + "-" + itemData.name.slugify({strict: true});
                break;
            default :
                break;
        }
    }

    _prepareArmorData(itemData, actorData) {
        itemData.data.def = parseInt(itemData.data.defBase, 10) + parseInt(itemData.data.defBonus, 10);
    }

    _prepareWeaponData(itemData, actorData) {
        itemData.data.skillBonus = (itemData.data.skillBonus) ? itemData.data.skillBonus : 0;
        itemData.data.dmgBonus = (itemData.data.dmgBonus) ? itemData.data.dmgBonus : 0;

        if (actorData) {
            // Compute skill mod
            const skillMod = eval("actorData.data." + itemData.data.skill.split("@")[1]);
            itemData.data.mod = parseInt(skillMod) + parseInt(itemData.data.skillBonus);
            // Compute damage mod
            const dmgStat = eval("actorData.data." + itemData.data.dmgStat.split("@")[1]);
            const dmgBonus = (dmgStat) ? parseInt(dmgStat) + parseInt(itemData.data.dmgBonus) : parseInt(itemData.data.dmgBonus);
            const dmgBase = itemData.data.dmgBase;
            if (dmgBonus < 0) itemData.data.dmg = dmgBase + " - " + parseInt(-dmgBonus);
            else if (dmgBonus === 0) itemData.data.dmg = dmgBase;
            else itemData.data.dmg = dmgBase + " + " + dmgBonus;
        }
    }

    applyEffects(actor){
        const itemData = this.data;

        if(itemData.data.properties.heal){
            const heal = itemData.data.effects.heal;
            const r = new CocHealingRoll(itemData.name, heal.formula, false);
            r.roll(actor);
        }
    }

    modifyQuantity(increment, isDecrease) {
        if(this.data.data.properties.stackable){
            let itemData = duplicate(this.data);
            const qty = itemData.data.qty;
            if(isDecrease) itemData.data.qty = qty - increment;
            else itemData.data.qty = qty + increment;
            if(itemData.data.qty < 0) itemData.data.qty = 0;
            if(itemData.data.stacksize && itemData.data.qty > itemData.data.stacksize) itemData.data.qty = itemData.data.stacksize;
            if(itemData.data.price){
                const qty = (itemData.data.qty) ? itemData.data.qty : 1;
                itemData.data.value = qty * itemData.data.price;
            }
            return this.update(itemData);
        }
    }
}
