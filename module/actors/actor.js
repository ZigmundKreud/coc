/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
import {Stats} from "../system/stats.js";

export class CoCActor extends Actor {

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();
        let actorData = this.data;
        // console.log(actorData);
        this.computeModsAndAttributes(actorData);
        this.computeAttacks(actorData);
    }

    /* -------------------------------------------- */

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();
        let actorData = this.data;
        this.computeDef(actorData);
        this.computeXP(actorData);
    }

    /* -------------------------------------------- */

    getProfile(items) {
        return items.find(i => i.type === "profile")
    }

    /* -------------------------------------------- */

    getActiveCapacities(items) {
        return items.filter(i => i.type === "capacity")
    }

    /* -------------------------------------------- */

    computeModsAndAttributes(actorData) {

        let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;
        // let items = actorData.items;
        // let lvl = actorData.data.level.value;
        // let profile = this.getProfile(items);

        for(const stat of Object.values(stats)){
            stat.value = stat.base + stat.bonus;
            stat.mod = Stats.getModFromStatValue(stat.value);
        }

        attributes.init.base = stats.dex.value;
        attributes.init.value = attributes.init.base + attributes.init.bonus;

        // attributes.fp.base = 3 + stats.cha.mod;
        // attributes.fp.max = attributes.fp.base + attributes.fp.bonus;
        // attributes.dr.value = attributes.dr.base.value + attributes.dr.bonus.value;
        // attributes.rp.value = attributes.rp.base + attributes.rp.bonus;
        attributes.hp.max = attributes.hp.base + attributes.hp.bonus;

        // const magicMod = this.getMagicMod(stats, profile);

        // if(profile){
        //     attributes.hd.value = profile.data.dv;
        //     switch (profile.data.key) {
        //         case "barde" :
        //         case "forgesort" :
        //         case "pretre" :
        //         case "druide" :
        //             attributes.mp.base = lvl + magicMod;
        //             break;
        //         case "ensorceleur" :
        //         case "magicien" :
        //         case "necromancien" :
        //             attributes.mp.base = 2 * lvl + magicMod;
        //             break;
        //         default :
        //             attributes.mp.base = 0;
        //             break;
        //     }
        // }
        // else attributes.mp.base = 0;
        // attributes.mp.max = attributes.mp.base + attributes.mp.bonus;
    }

    /* -------------------------------------------- */

    computeAttacks(actorData) {

        let stats = actorData.data.stats;
        let attacks = actorData.data.attacks;

        let melee = attacks.melee;
        let ranged = attacks.ranged;
        let magic = attacks.magic;

        let strMod = stats.str.mod;
        let dexMod = stats.dex.mod;

        // STATS RELATED TO PROFILE
        let magicMod = eval(attacks.magic.stat.split("@")[1]);
        // console.log(magicMod);
        melee.base = (strMod) ? strMod : 0;
        ranged.base = (dexMod) ? dexMod : 0;
        magic.base = (magicMod) ? magicMod : 0;
        for (let attack of Object.values(attacks)) {
            attack.mod = attack.base + attack.bonus;
        }
    }

    /* -------------------------------------------- */

    computeDef(actorData) {
        // let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;
        // let items = actorData.items;

        // let armors = this.getWornArmors(items);
        // let shields = this.getWornShields(items);
        // let spells = this.getActiveSpells(items);

        // COMPUTE DEF SCORES
        // let armor = armors.map(armor => armor.data.def).reduce((acc, curr) => acc + curr, 0);
        // let shield = shields.map(shield => shield.data.def).reduce((acc, curr) => acc + curr, 0);
        // let spell = spells.map(spell => spell.data.def).reduce((acc, curr) => acc + curr, 0);

        // attributes.def.base = 10 + armor + shield + spell + stats.dex.mod;
        attributes.def.value = attributes.def.base + attributes.def.bonus;
    }

    /* -------------------------------------------- */

    computeXP(actorData) {
        let items = actorData.items;
        let lvl = actorData.data.level.value;
        const alert = actorData.data.alert;

        const capacities = this.getActiveCapacities(items);
        let currxp = capacities.map(cap => (cap.data.rank > 2) ? 2 : 1).reduce((acc, curr) => acc + curr, 0);
        const maxxp = 2 * lvl;

        // UPDATE XP
        actorData.data.xp.max = maxxp;
        actorData.data.xp.value = maxxp - currxp;

        if (maxxp - currxp < 0) {
            const diff = currxp - maxxp;
            alert.msg = (diff == 1) ? `Vous avez dépensé ${diff} point de capacité en trop !` : `Vous avez dépensé ${diff} points de capacité en trop !`;
            alert.type = "error";
        } else if (maxxp - currxp > 0) {
            const diff = maxxp - currxp;
            alert.msg = (diff == 1) ? `Il vous reste ${diff} point de capacité à dépenser !` : `Il vous reste ${diff} points de capacité à dépenser !`;
            alert.type = "info";
        } else {
            alert.msg = null;
            alert.type = null;
        }
    }
}
