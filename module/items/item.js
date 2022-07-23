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
        const itemData = this;
        const actorData = (this.actor) ? this.actor : null;
        switch (itemData.type) {
            case "item" :
                this._prepareArmorData(itemData, actorData);
                this._prepareWeaponData(itemData, actorData);
                break;
            case "path" :
            case "trait" :
            case "capacity" :
            case "profile" :
                if(!itemData.system.setting) itemData.system.setting = "base";
                itemData.system.key = itemData.system.setting + "-" + itemData.name.slugify({strict: true});
                break;
            default :
                break;
        }
    }

    _prepareArmorData(itemData, actorData) {
        itemData.system.def = parseInt(itemData.system.defBase, 10) + parseInt(itemData.system.defBonus, 10);
    }

    _prepareWeaponData(itemData, actorData) {
        itemData.system.skillBonus = (itemData.system.skillBonus) ? itemData.system.skillBonus : 0;
        itemData.system.dmgBonus = (itemData.system.dmgBonus) ? itemData.system.dmgBonus : 0;

        if (actorData) {
            // Compute skill mod
            const skillMod = eval("actorData.system." + itemData.system.skill.split("@")[1]);
            itemData.system.mod = parseInt(skillMod) + parseInt(itemData.system.skillBonus);
            // Compute damage mod
            const dmgStat = eval("actorData.system." + itemData.system.dmgStat.split("@")[1]);
            const dmgBonus = (dmgStat) ? parseInt(dmgStat) + parseInt(itemData.system.dmgBonus) : parseInt(itemData.system.dmgBonus);
            const dmgBase = itemData.system.dmgBase;
            if (dmgBonus < 0) itemData.system.dmg = dmgBase + " - " + parseInt(-dmgBonus);
            else if (dmgBonus === 0) itemData.system.dmg = dmgBase;
            else itemData.system.dmg = dmgBase + " + " + dmgBonus;
        }
    }

    applyEffects(actor){
        const itemData = this;

        if(itemData.system.properties.heal){
            const heal = itemData.system.effects.heal;
            const r = new CocHealingRoll(itemData.name, heal.formula, false);
            r.roll(actor);
        }
    }

    modifyQuantity(increment, isDecrease) {
        if(this.system.properties.stackable){
            let itemData = duplicate(this);
            const qty = itemData.system.qty;
            if(isDecrease) itemData.system.qty = qty - increment;
            else itemData.system.qty = qty + increment;
            if(itemData.system.qty < 0) itemData.system.qty = 0;
            if(itemData.system.stacksize && itemData.system.qty > itemData.system.stacksize) itemData.system.qty = itemData.system.stacksize;
            if(itemData.system.price){
                const qty = (itemData.system.qty) ? itemData.system.qty : 1;
                itemData.system.value = qty * itemData.system.price;
            }
            return this.update(itemData);
        }
    }
}
