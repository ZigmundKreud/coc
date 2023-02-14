import { CharacterGeneration } from "../system/chargen.js";
import { SkillRoll } from "./skill-roll.js";
import { DamageRoll } from "./dmg-roll.js";
import { CocHealingRoll } from "./healing-roll.js";

export class CoCRoll {
    static options() {
        return { classes: ["coc", "dialog"] };
    }

    /**
     * @name skillCheck
     * @description  Jet de compétence
     *
     * @param {*} data
     * @param {*} actor
     * @param {*} event
     * @returns
     */
    static skillCheck(data, actor, event) {
        const elt = $(event.currentTarget)[0];
        let key = elt.attributes["data-rolling"].value;
        let label = eval(`data.${key}.label`);

        const mod = eval(`data.${key}.mod`);
        const tmpmod = eval(`data.${key}.tmpmod`);

        let bonus = eval(`data.${key}.skillbonus`);
        if (!bonus) bonus = 0;

        let malus = 0;
        let skillMalus = eval(`data.${key}.skillmalus`);
        if (!skillMalus) skillMalus = 0;
        malus += skillMalus;
        let superior = eval(`data.${key}.superior`);
        const critrange = 20;

        label = (label) ? game.i18n.localize(label) : null;
        return this.skillRollDialog(actor, label, tmpmod != null ? tmpmod : mod, bonus, malus, critrange, superior);
    }

    /**
     * @name rollWeapon
     * @description  Jet d'attaque
     *
     * @param {*} data
     * @param {*} actor
     * @param {*} event
     * @returns
     */
    static rollWeapon(data, actor, event) {
        const li = $(event.currentTarget).parents(".item");
        let item = actor.items.get(li.data("itemId"));
        const itemData = item;

        const label = itemData.name;
        const critrange = itemData.system.critrange;
        const itemMod = $(event.currentTarget).parents().children(".item-mod");
        const mod = itemMod.data('itemMod');
        const dmgMod = $(event.currentTarget).parents().children(".item-dmg");
        const dmg = dmgMod.data('itemDmg');

        return this.rollWeaponDialog(actor, label, mod, 0, 0, critrange, dmg, 0);
    }

    /**
     * @name rollDamage
     * @description  Jet de dommages
     *
     * @param {*} data
     * @param {*} actor
     * @param {*} event
     * @returns
     */
     static rollDamage(data, actor, event) {
        const li = $(event.currentTarget).parents(".item");
        let item = actor.items.get(li.data("itemId"));
        let label = item.name;
        let dmg = item.system.dmg;
        return this.rollDamageDialog(actor, label, dmg, 0);
    }

    /**
     *  Handles spell rolls
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    static rollSpell(data, actor, event) {
        const li = $(event.currentTarget).parents(".item");
        let item = actor.items.get(li.data("itemId"));
        let label = item.name;
        let mod = item.system.mod;
        let critrange = item.system.critrange;
        let dmg = item.system.dmg;
        return this.rollWeaponDialog(actor, label, mod, 0, critrange, dmg);
    }

    /**
     *  Handles Hit Points Rolls
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    static rollHitPoints(data, actor, event) {
        let hp = data.system.attributes.hp;
        const lvl = data.system.level.value;
        const conMod = data.system.stats.con.mod;
        const actorData = actor;

        return Dialog.confirm({
            title: game.i18n.format("COC.dialog.rollHitPoints.title"),
            content: `<p>Êtes sûr de vouloir remplacer les points de vie de <strong>${actor.name}</strong></p>`,
            yes: async () => {
                if (actorData.system.attributes.hd && actorData.system.attributes.hd.value) {
                    const hd = actorData.system.attributes.hd.value;
                    const hdmax = parseInt(hd.split("d")[1]);
                    // If LVL 1 COMPUTE HIT POINTS
                    if (lvl == 1) {
                        hp.base = hdmax + conMod;
                        hp.max = hp.base + hp.bonus;
                        hp.value = hp.max;
                    } else {
                        const hpLvl1 = hdmax + conMod;

                        /*
                         * Formule pour le calcul des points de vie :
                         * - Niv 1 = max du dé + Mod
                         * - Niv 2 = hpLvl1 + 1DV
                         * - Niv 3 = hpLvl1 + 1DV + 1Mod
                         * - Niv 4 = hpLvl1 + 2DV + 1Mod
                         * - Niv 5 = hpLvl1 + 2DV + 2Mod
                         * - Niv 6 = hpLvl1 + 3DV + 2Mod
                         * - Niv 7 = hpLvl1 + 3DV + 3Mod
                         * - Niv 8 = hpLvl1 + 4DV + 3Mod
                         * - Niv 9 = hpLvl1 + 4DV + 4Mod
                         * - Niv 10 = hpLvl1 + 5DV + 4Mod
                         */
                        const dice2Roll = Math.floor(lvl/2);
                        const mods2add = (conMod < 0) ? Math.floor(lvl/2) : Math.floor((lvl - 1)/2);
                        const bonus = (mods2add * conMod) + hpLvl1;
                        const formula = `${dice2Roll}d${hdmax} + ${bonus}`;
                        const r = new Roll(formula);
                        await r.roll();
                        r.toMessage({
                            user: game.user.id,
                            flavor: "<h2>Roll Hit Points</h2>",
                            speaker: ChatMessage.getSpeaker({actor: actor})
                        });
                        const minHp = dice2Roll + hpLvl1;
                        hp.base = (r.total < dice2Roll + hpLvl1) ? minHp : r.total;
                        hp.max = hp.base + hp.bonus;
                        hp.value = hp.max;
                    }
                    actor.update({'system.attributes.hp': hp});
                } else ui.notifications.error("Vous devez sélectionner un profil ou choisir un Dé de Vie.");
            },
            defaultYes: false
        });
    }


    /**
     * @name rollAttributes
     * @description Handles attributes rolls
     *
     * @param {*} data
     * @param {*} actor
     * @param {*} event
     * @returns
     */
    static async rollAttributes(data, actor, event) {
        let stats = data.system.stats;
        return Dialog.confirm({
            title: "Jet de caractéristiques",
            content: `<p>Êtes-vous sûr de vouloir remplacer les caractéristiques de <strong>${actor.name}</strong> ?</p>`,
            yes: () => {
                const rolls = CharacterGeneration.statsCommand(actor);
                let i = 0;
                for (const stat of Object.values(stats)) {
                    stat.base = rolls[i].total;
                    ++i;
                }
                actor.update({'system.stats': stats});
            },
            defaultYes: false
        });
    }

        /**
     * @name rollEncounterWeapon
     * @description  Jet d'attaque d'une rencontre
     *  Basé sur les valeurs affichées sur la fiche
     *
     * @param {*} data
     * @param {*} actor
     * @param {*} event
     * @returns
     */
    static rollEncounterWeapon(data, actor, event) {
        const weapon = $(event.currentTarget).parents(".item");
        let label = weapon.find(".weapon-name").text();
        let critrange = weapon.find(".weapon-crit").text();
        let mod = weapon.find(".weapon-mod").text();
        let dmg = weapon.find(".weapon-dmg").text();
        return this.rollWeaponDialog(actor, label, mod, 0, 0, critrange, dmg, 0);
    }

    /**
     * @name rollEncounterDamage
     * @description  Jet de dommages d'une rencontre
     *  Basé sur les valeurs affichées sur la fiche
     *
     * @param {*} data
     * @param {*} actor
     * @param {*} event
     * @returns
     */
    static rollEncounterDamage(data, actor, event) {
        const weapon = $(event.currentTarget).parents(".item");
        let label = weapon.find(".weapon-name").text();
        let dmg = weapon.find(".weapon-dmg").text();
        return this.rollDamageDialog(actor, label, dmg, 0);
    }

    /* -------------------------------------------- */
    /* ROLL DIALOGS                                 */
    /* -------------------------------------------- */

    static async skillRollDialog(actor, label, mod, bonus, malus, critrange, superior=false, onEnter = "submit") {
        const rollOptionTpl = 'systems/coc/templates/dialogs/skillroll-dialog.hbs';
        let diff = null;
        const displayDifficulty = game.settings.get("coc", "displayDifficulty");
        if ( displayDifficulty !== "none" && game.user.targets.size > 0) {
            diff = [...game.user.targets][0].actor.system.attributes.def.value;
        }
        const isDifficultyDisplayed = displayDifficulty === "all" || (displayDifficulty === "gm" && game.user.isGM);
        const rollOptionContent = await renderTemplate(rollOptionTpl, {
            mod: mod,
            bonus: bonus,
            malus: malus,
            critrange: critrange,
            superior:superior,
            difficulty: diff,
            displayDifficulty: isDifficultyDisplayed
        });
        let d = new Dialog({
            title: label,
            content: rollOptionContent,
            buttons: {
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("COC.ui.cancel"),
                    callback: () => {
                    }
                },
                submit: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("COC.ui.submit"),
                    callback: (html) => {
                        const dice = html.find("#dice").val();
                        const difficulty = html.find('#difficulty').val();
                        const critrange = html.find('input#critrange').val();
                        const mod = html.find('input#mod').val();
                        const bonus = html.find('input#bonus').val();
                        const malus = html.find('input#malus').val();
                        let r = new SkillRoll(label, dice, mod, bonus, malus, difficulty, critrange);
                        r.roll(actor);
                    }
                }
            },
            default: onEnter,
            close: () => {}
        }, this.options());
        return d.render(true);
    }

    /**
     *
     * @param {*} actor
     * @param {*} label
     * @param {*} mod
     * @param {*} bonus
     * @param {*} critrange
     * @param {*} dmgFormula
     * @param {*} dmgBonus
     * @param {*} onEnter
     * @returns
     */
     static async rollWeaponDialog(actor, label, mod, bonus, malus, critrange, dmgFormula, dmgBonus, onEnter = "submit", skillDescr, dmgDescr, difficulty = null) {
        const rollOptionTpl = 'systems/coc/templates/dialogs/roll-weapon-dialog.hbs';
        let diff = null;
        let isDifficultyDisplayed = true;

        if (difficulty !== null) {
            diff = difficulty;
        }
        else {
            const displayDifficulty = game.settings.get("coc", "displayDifficulty");
            if ( displayDifficulty !== "none" && game.user.targets.size > 0) {
                diff = [...game.user.targets][0].actor.system.attributes.def.value;
            }
            isDifficultyDisplayed = displayDifficulty === "all" || (displayDifficulty === "gm" && game.user.isGM);
        }
        const rollOptionContent = await renderTemplate(rollOptionTpl, {
            mod: mod,
            bonus: bonus,
            malus: malus,
            critrange: critrange,
            difficulty: diff,
            displayDifficulty: isDifficultyDisplayed,
            dmgFormula: dmgFormula,
            dmgBonus: dmgBonus,
            dmgCustomFormula: "",
            hasSkillDescr: skillDescr && skillDescr.length > 0,
            skillDescr: skillDescr,
            hasDmgDescr: dmgDescr && dmgDescr.length > 0,
            dmgDescr: dmgDescr
        });

        let d = new Dialog({
            title: label && label.length > 0 ? label : game.i18n.format("COC.dialog.rollWeapon.title"),
            content: rollOptionContent,
            buttons: {
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("COC.ui.cancel"),
                    callback: () => {
                    }
                },
                submit: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("COC.ui.submit"),
                    callback: (html) => {
                        const dice = html.find("#dice").val();
                        const diff = html.find('#difficulty').val();
                        const critrange = html.find('input#critrange').val();
                        const mod = html.find('input#mod').val();
                        const bonus = html.find('input#bonus').val();
                        let malus = html.find('input#malus').val();
                        if (!malus) malus = 0;

                        // Jet d'attaque uniquement
                        if(!game.settings.get("coc", "useComboRolls")) {
                            let r = new SkillRoll(label, dice, mod, bonus, malus, diff, critrange, skillDescr);
                            r.weaponRoll(actor, "", dmgDescr);
                        }
                        else {
                            // Jet combiné attaque et dommages
                            let dmgBonus = html.find("#dmgBonus") ? html.find("#dmgBonus").val() : 0;
                            let dmgCustomFormula = html.find("#dmgCustomFormula") ? html.find("#dmgCustomFormula").val() : "";
                            let dmgBaseFormula = html.find("#dmgFormula") ? html.find("#dmgFormula").val() : "";
                            let dmgFormula = (dmgCustomFormula) ? dmgCustomFormula : dmgBaseFormula;

                            if (dmgBonus.indexOf("d") !== -1 || dmgBonus.indexOf("D") !== -1) {
                                if ((dmgBonus.indexOf("+") === -1) && (dmgBonus.indexOf("-") === -1)){
                                    dmgFormula = dmgFormula.concat('+', dmgBonus);
                                }
                                else dmgFormula = dmgFormula.concat(dmgBonus);
                            }
                            else {
                                const dmgBonusInt = parseInt(dmgBonus);
                                if (dmgBonusInt > 0) {
                                    dmgFormula = dmgFormula.concat('+', dmgBonusInt);
                                }
                                else if (dmgBonusInt < 0) {
                                    dmgFormula = dmgFormula.concat(' ', dmgBonus);
                                }
                            }
                            let r = new SkillRoll(label, dice, mod, bonus, malus, diff, critrange, skillDescr);
                            r.weaponRoll(actor, dmgFormula, dmgDescr);
                        }
                    }
                }
            },
            default: onEnter,
            close: () => {
            }
        }, this.options());
        return d.render(true);
    }

    static async rollDamageDialog(actor, label, formula, bonus, critical = false, onEnter = "submit", dmgDescr) {
        const rollOptionTpl = 'systems/coc/templates/dialogs/roll-dmg-dialog.hbs';
        const rollOptionContent = await renderTemplate(rollOptionTpl, {
            dmgFormula: formula,
            dmgBonus: bonus,
            dmgCustomFormula: "",
            isCritical: critical,
            hasDescription: dmgDescr && dmgDescr.length > 0,
            dmgDescr: dmgDescr
        });

        let d = new Dialog({
            title: label && label.length > 0 ? label : game.i18n.format("COC.dialog.rollDamage.title"),
            content: rollOptionContent,
            buttons: {
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("COC.ui.cancel"),
                    callback: () => {
                    }
                },
                submit: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("COC.ui.submit"),
                    callback: (html) => {
                        let dmgBonus = html.find("#dmgBonus").val();
                        let dmgCustomFormula = html.find("#dmgCustomFormula").val();
                        let dmgBaseFormula = html.find("#dmgFormula").val();
                        const isCritical = html.find("#isCritical").is(":checked");
                        let dmgFormula = (dmgCustomFormula) ? dmgCustomFormula : dmgBaseFormula;

                        if (dmgBonus.indexOf("d") !== -1 || dmgBonus.indexOf("D") !== -1) {
                            if ((dmgBonus.indexOf("+") === -1) && (dmgBonus.indexOf("-") === -1)){
                                dmgFormula = dmgFormula.concat('+', dmgBonus);
                            }
                            else dmgFormula = dmgFormula.concat(dmgBonus);
                        }
                        else {
                            const dmgBonusInt = parseInt(dmgBonus);
                            if (dmgBonusInt > 0) {
                                dmgFormula = dmgFormula.concat('+', dmgBonusInt);
                            }
                            else if (dmgBonusInt < 0) {
                                dmgFormula = dmgFormula.concat(' ', dmgBonus);
                            }
                        }

                        let r = new DamageRoll(label, dmgFormula, isCritical, dmgDescr);
                        r.roll(actor);
                    }
                }
            },
            default: onEnter,
            close: () => {
            }
        }, this.options());
        return d.render(true);
    }

   /**
     *  Handles recovery roll
     *
     * @param {*} data
     * @param {*} actor
     * @param {*} withHPrecovery true to Get HitPoints
     * @returns
     */
    static rollRecoveryUse(data, actor, withHPrecovery) {
        let recoveryPoints = data.system.attributes.rp.value;
        if (!recoveryPoints > 0) return;

        let hp = data.system.attributes.hp;
        let rp = data.system.attributes.rp;
        const level = data.system.level.value;
        const conMod = data.system.stats.con.mod;
        const actorData = actor;

        if (!withHPrecovery) {
            rp.value -= 1;
            actor.update({ 'system.attributes.rp': rp });
        }
        else {

        Dialog.confirm({
                title: game.i18n.format("COC.dialog.spendRecoveryPoint.title"),
                content: `<p>Êtes-vous sûr de vouloir dépenser 1 point de récupération ?`,
                yes: async () => {
                        const hd = actorData.system.attributes.hd.value;
                        const hdmax = parseInt(hd.split("d")[1]);
                        const bonus = level + conMod;
                        const formula = `1d${hdmax} + ${bonus}`;

                        let healingRoll = new CocHealingRoll("", formula, false, "Point de récupération", false);
                        let result = await healingRoll.roll(actor);

                        hp.value += result.total;
                        rp.value -= 1;
                        actor.update({ 'system.attributes.hp': hp, 'system.attributes.rp': rp });
                },
                defaultYes: false
            });
        }
    }

}