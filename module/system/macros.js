import { CoCRoll } from "../controllers/roll.js";
import { CocHealingRoll } from "../controllers/healing-roll.js";
import { SkillRoll } from "../controllers/skill-roll.js";
import { DamageRoll} from "../controllers/dmg-roll.js"
export class Macros {

    /**
     * @name getSpeakersActor
     * @description
     *
     * @returns
     */
    static getSpeakersActor = function(){
        // Vérifie qu'un seul token est sélectionné
        const tokens = canvas.tokens.controlled;
        if (tokens.length > 1) {
            ui.notifications.warn(game.i18n.localize('COC.notification.MacroMultipleTokensSelected'));
            return null;
        }

        const speaker = ChatMessage.getSpeaker();
        let actor;
        // Si un token est sélectionné, le prendre comme acteur cible
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        // Sinon prendre l'acteur par défaut pour l'utilisateur courrant
        if (!actor) actor = game.actors.get(speaker.actor);
        return actor;
    }

    /**
     * @anme rollStatMacro
     * @description
     *
     * @param {*} actor
     * @param {*} stat
     * @param {*} bonus
     * @param {*} malus
     * @param {*} onEnter
     * @param {*} label
     * @param {*} description
     * @param {*} dialog
     * @param {*} dice
     * @param {*} difficulty
     * @returns
     */
     static rollStatMacro = async function (actor, stat, bonus = 0, malus = 0, onEnter = "submit", label, description, dialog=true, dice="1d20", difficulty) {
        // Plusieurs tokens sélectionnés
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

        let statObj;
        switch(stat){
            case "for" :
            case "str" : statObj = eval(`actor.system.stats.str`); break;
            case "dex" : statObj = eval(`actor.system.stats.dex`); break;
            case "con" : statObj = eval(`actor.system.stats.con`); break;
            case "int" : statObj = eval(`actor.system.stats.int`); break;
            case "sag" :
            case "wis" : statObj = eval(`actor.system.stats.wis`); break;
            case "cha" : statObj = eval(`actor.system.stats.cha`); break;
            case "atc" :
            case "melee" : statObj = eval(`actor.system.attacks.melee`); break;
            case "atd" :
            case "ranged" : statObj = eval(`actor.system.attacks.ranged`); break;
            case "atm" :
            case "magic" : statObj = eval(`actor.system.attacks.magic`); break;
            default :
                ui.notifications.error(game.i18n.localize("COC.notification.MacroUnknownStat"));
                break;
        }
        let mod = statObj.mod;

        // Caractéristiques
        if (stat === "for" || stat === "str" || stat === "dex") {

            // Prise en compte de la notion d'encombrement
            // malus += actor.getOverloadedSkillMalus(stat);

            // Prise en compte des bonus ou malus liés à la caractéristique
            let skillBonus = statObj.skillbonus;
            if (skillBonus) bonus += skillBonus;
            let skillMalus = statObj.skillmalus;
            if (skillMalus) malus += skillMalus;
        }

        if (dialog){
            CoCRoll.skillRollDialog(actor, label && label.length > 0 ? label : game.i18n.localize(statObj.label), mod, bonus, malus, 20, statObj.superior, onEnter, description);
        }
        else{
            return new SkillRoll(label && label.length > 0 ? label : game.i18n.localize(statObj.label), dice, "+" + +mod, bonus, malus, difficulty, "20", description).roll();
        }
    };

    /**
     * @name rollItemMacro
     * @description
     *
     * @param {*} itemId
     * @param {*} itemName
     * @param {*} itemType
     * @param {*} bonus
     * @param {*} malus
     * @param {*} dmgBonus
     * @param {*} dmgOnly
     * @param {*} customLabel
     * @param {*} skillDescr
     * @param {*} dmgDescr
     * @returns
     */
     static rollItemMacro = async function (itemId, itemName, itemType, bonus = 0, malus = 0, dmgBonus=0, dmgOnly=false, customLabel, skillDescr, dmgDescr, dialog=true) {
        const actor = this.getSpeakersActor();
        // Several tokens selected
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

        const item = actor.items.get(itemId);
        if (!item) return ui.notifications.warn(game.i18n.format('COC.notification.MacroItemMissing', {item:itemName}));

        const itemData = item;

        if(itemData.system.properties.weapon || itemData.system.properties.heal){
            if (itemData.system.properties.weapon){
                if (itemData.system.properties.equipable && !itemData.system.worn) {
                    return ui.notifications.warn(game.i18n.format('COC.notification.MacroItemUnequiped', {item: itemName}));
                }
                const label =  customLabel && customLabel.length > 0 ? customLabel : itemData.name;
                const critrange = itemData.system.critrange;

                // Compute MOD
                const itemModStat = itemData.system.skill.split("@")[1];
                const itemModBonus = parseInt(itemData.system.skillBonus);

                let mod = actor.computeWeaponMod(itemModStat, itemModBonus);

                // Compute DM
                const itemDmgBase = itemData.system.dmgBase;
                const itemDmgStat = itemData.system.dmgStat.split("@")[1];
                const itemDmgBonus = parseInt(itemData.system.dmgBonus);

                let dmg = actor.computeDm(itemDmgBase, itemDmgStat, itemDmgBonus)

                if (dialog){
                    if (dmgOnly) CoCRoll.rollDamageDialog(actor, label, dmg, 0, false, "submit", dmgDescr);
                    else CoCRoll.rollWeaponDialog(actor, label, mod, bonus, malus, critrange, dmg, dmgBonus, "submit", skillDescr, dmgDescr);
                }
                else {
                    let formula = dmgBonus ? dmg +  "+" + dmgBonus : dmg;
                    if (dmgOnly) new DamageRoll(label, formula, false, dmgDescr).roll();
                    else {
                        let skillRoll = await new SkillRoll(label, "1d20", "+" + +mod, bonus, malus, null, critrange, skillDescr).roll();

                        let result = skillRoll.dice[0].results[0].result;
                        let critical = ((result >= critrange.split("-")[0]) || result == 20);

                        new DamageRoll(label, formula, critical, dmgDescr).roll();
                    }
                }
            }
            if (itemData.system.properties.heal){
                new CocHealingRoll(itemData.name, itemData.system.effects.heal.formula, false).roll(actor);
            }
        }
        else { return item.sheet.render(true); }
    };

    static rollHealMacro = async function (label, healFormula, isCritical){
        const actor = this.getSpeakersActor();
        // Several tokens selected
        if (actor === null) return;
        // No token selected
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoTokenSelected"));

        new CocHealingRoll(label, healFormula, isCritical).roll(actor);
    }

    static rollSkillMacro = async function(label, mod, bonus, malus, critRange, isSuperior = false, description){
        const actor = this.getSpeakersActor();

        // Several tokens selected
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

        let crit = parseInt(critRange);
        crit = !isNaN(crit) ? crit : 20;
        CoCRoll.skillRollDialog(actor, label, mod, bonus, malus, crit, isSuperior, "submit", description);
    }

    static rollDamageMacro = async function(label, dmgFormula, dmgBonus, isCritical, dmgDescr){
        const actor = this.getSpeakersActor();

        // Several tokens selected
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

        CoCRoll.rollDamageDialog(actor, label, dmgFormula, dmgBonus, isCritical, "submit", dmgDescr);

    }


}
