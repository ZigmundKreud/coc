import {CoCRoll} from "../controllers/roll.js";
import {CocHealingRoll} from "../controllers/healing-roll.js";
export class Macros {

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

    static rollStatMacro = async function (actor, stat, bonus = 0, malus = 0, onEnter = "submit", label, description) {
        // Plusieurs tokens sélectionnés
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

        let statObj;
        switch(stat){
            case "for" :
            case "str" : statObj = eval(`actor.data.data.stats.str`); break;
            case "dex" : statObj = eval(`actor.data.data.stats.dex`); break;
            case "con" : statObj = eval(`actor.data.data.stats.con`); break;
            case "int" : statObj = eval(`actor.data.data.stats.int`); break;
            case "sag" :
            case "wis" : statObj = eval(`actor.data.data.stats.wis`); break;
            case "cha" : statObj = eval(`actor.data.data.stats.cha`); break;
            case "atc" :
            case "melee" : statObj = eval(`actor.data.data.attacks.melee`); break;
            case "atd" :
            case "ranged" : statObj = eval(`actor.data.data.attacks.ranged`); break;
            case "atm" :
            case "magic" : statObj = eval(`actor.data.data.attacks.magic`); break;
            default :
                ui.notifications.error(game.i18n.localize("COC.notification.MacroUnknownStat")); 
                break;
        }
        let mod = statObj.mod;

        // Caractéristiques
        if (stat === "for" || stat === "str" || stat === "dex") {

            // Prise en compte de la notion d'encombrement
            malus += actor.getOverloadedSkillMalus(stat);

            // Prise en compte des bonus ou malus liés à la caractéristique
            let skillBonus = statObj.skillbonus;
            if (skillBonus) bonus += skillBonus;
            let skillMalus = statObj.skillmalus;
            if (skillMalus) malus += skillMalus;
        }
        await CoCRoll.skillRollDialog(actor, label && label.length > 0 ? label : game.i18n.localize(statObj.label), mod, bonus, malus, 20, statObj.superior, onEnter, description);
    };

    static rollItemMacro = async function (itemId, itemName, itemType, bonus = 0, malus = 0, dmgBonus=0, dmgOnly=false, customLabel, skillDescr, dmgDescr) {
        const actor = this.getSpeakersActor();
        // Several tokens selected
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

        const item = actor.items.get(itemId);
        if (!item) return ui.notifications.warn(game.i18n.format('COC.notification.MacroItemMissing', {item:itemName}));
        const itemData = item.data;

        if (itemData.data.weapon != undefined) {
            const weapon = itemData.data.weapon;
            const label =  customLabel && customLabel.length > 0 ? customLabel : itemData.name;                

            if (dmgOnly) CoCRoll.rollDamageDialog(actor, label, weapon.dmg, weapon.dmgBonus, "submit", dmgDescr);
            else CoCRoll.rollWeaponDialog(actor, label, weapon.mod, weapon.skillBonus, 0, weapon.critrange, weapon.dmg, weapon.dmgBonus, "submit", dmgDescr);
        }
        else if (itemData.data.properties !== undefined) {
            if(itemData.data.properties.weapon || itemData.data.properties.heal){
                if (itemData.data.properties.weapon){
                    if(itemData.data.worn){
                        const label =  customLabel && customLabel.length > 0 ? customLabel : itemData.name;                
                        const critrange = itemData.data.critrange;              

                        // Compute MOD
                        const itemModStat = itemData.data.skill.split("@")[1];
                        const itemModBonus = parseInt(itemData.data.skillBonus);
                        
                        let mod = actor.computeWeaponMod(itemModStat, itemModBonus);

                        // Compute DM
                        const itemDmgBase = itemData.data.dmgBase;                        
                        const itemDmgStat = itemData.data.dmgStat.split("@")[1];
                        const itemDmgBonus = parseInt(itemData.data.dmgBonus);

                        let dmg = actor.computeDm(itemDmgBase, itemDmgStat, itemDmgBonus)
                        
                        if (dmgOnly) CoCRoll.rollDamageDialog(actor, label, dmg, 0, false, "submit", dmgDescr);
                        else CoCRoll.rollWeaponDialog(actor, label, mod, bonus, malus, critrange, dmg, dmgBonus, "submit", skillDescr, dmgDescr);
                    }
                    else return ui.notifications.warn(game.i18n.format('COC.notification.MacroItemUnequiped', {item: itemName}));
                }
                if (itemData.data.properties.heal){
                    new CocHealingRoll(itemData.name, itemData.data.effects.heal.formula, false).roll(actor);
                }
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
