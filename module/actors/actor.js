/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
import {Stats} from "../system/stats.js";

export class CoCActor extends Actor {

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();
        // console.debug("Actor prepareDerivedData");

        const actorData = this.data;
        // const data = actorData.data;
        // const flags = actorData.flags;

        if(actorData.type === "npc") this.computeNpcMods(actorData);
        else this.computeMods(actorData);

        this.computeAttributes(actorData);
        this.computeAttacks(actorData);
        this.computeDef(actorData);
        this.computeXP(actorData);
    }

    /* -------------------------------------------- */

    getProfile(items) {
        let profile = items.find(i => i.type === "profile")
        if(profile) return profile.data;
        else return null;
    }

    /* -------------------------------------------- */

    getProtection(items) {
        const protections = items.filter(i => i.type === "item" && i.data.worn && i.data.def).map(i => i.data.def);
        return protections.reduce((acc, curr) => acc + curr, 0);
    }

    /* -------------------------------------------- */

    getResistance(items) {
        const resistances = items.filter(i => i.type === "item" && i.data.worn && i.data.dr).map(i => i.data.dr);
        return resistances.reduce((acc, curr) => acc + curr, 0);
    }

    /* -------------------------------------------- */

    getCurrentXP(items) {
        const capacities = items.filter(i => i.type === "capacity");
        return capacities.map(cap => (cap.data.rank > 2) ? 2 : 1).reduce((acc, curr) => acc + curr, 0);
    }

    /* -------------------------------------------- */

    computeMods(actorData) {
        let stats = actorData.data.stats;
        for(const stat of Object.values(stats)){
            stat.value = stat.base + stat.bonus;
            stat.mod = Stats.getModFromStatValue(stat.value);
        }
    }

    /* -------------------------------------------- */

    computeNpcMods(actorData) {
        let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;
        for(const stat of Object.values(stats)){
            stat.value = Stats.getStatValueFromMod(stat.mod);
        }
    }

    /* -------------------------------------------- */

    computeAttributes(actorData) {

        let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;
        let lvl = actorData.data.level.value;

        const profile = this.getProfile(actorData.items);
        const protection = this.getProtection(actorData.items);

        attributes.init.base = stats.dex.value;
        attributes.init.penalty = - parseInt(protection);
        attributes.init.value = attributes.init.base + attributes.init.bonus + attributes.init.penalty;

        attributes.fp.base = 3 + stats.cha.mod;
        attributes.fp.bonus = (profile && profile.data.bonuses.fp) ? profile.data.bonuses.fp : 0;
        attributes.fp.max = attributes.fp.base + attributes.fp.bonus;
        attributes.dr.value = attributes.dr.base.value + attributes.dr.bonus.value;
        attributes.rp.max = attributes.rp.base + attributes.rp.bonus;
        attributes.hp.max = attributes.hp.base + attributes.hp.bonus;

        attributes.mp.base = lvl + stats.cha.mod;
        attributes.mp.max = attributes.mp.base + attributes.mp.bonus;

        attributes.hd.value = (profile && profile.data.dv) ? profile.data.dv : attributes.hd.value;
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

        const profile = this.getProfile(actorData.items);

        // STATS RELATED TO PROFILE
        attacks.magic.stat = (profile && profile.data.spellcasting) ? profile.data.spellcasting : attacks.magic.stat;

        let magicMod = eval(attacks.magic.stat.split("@")[1]);

        const atcBonus = (profile) ? profile.data.bonuses.atc : 0;
        const atdBonus = (profile) ? profile.data.bonuses.atd : 0;
        const atmBonus = (profile) ? profile.data.bonuses.atm : 0;

        melee.base = (strMod) ? strMod + atcBonus : atcBonus;
        ranged.base = (dexMod) ? dexMod + atdBonus : atdBonus;
        magic.base = (magicMod) ? magicMod + atmBonus : atmBonus;

        for (let attack of Object.values(attacks)) {
            attack.mod = attack.base + attack.bonus;
        }

    }

    /* -------------------------------------------- */

    computeDef(actorData) {
        let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;
        // COMPUTE DEF SCORES
        const protection = this.getProtection(actorData.items);
        const dr = this.getResistance(actorData.items);

        attributes.def.base = 10 + protection + stats.dex.mod;
        attributes.def.value = attributes.def.base + attributes.def.bonus;

        attributes.dr.base.value = (dr) ? dr : 0;
        attributes.dr.value = attributes.dr.base.value + attributes.dr.bonus.value;

    }

    /* -------------------------------------------- */

    computeXP(actorData) {
        let items = actorData.items;
        let lvl = actorData.data.level.value;
        const alert = actorData.data.alert;

        const profile = this.getProfile(actorData.items);

        let currxp = this.getCurrentXP(items);
        const maxxp = (profile && profile.data.bonuses.xp) ? 2 * lvl + profile.data.bonuses.xp : 2 * lvl;

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
