import { CoCRoll } from "../controllers/roll.js";
import { CocHealingRoll } from "../controllers/healing-roll.js";
import { SkillRoll } from "../controllers/skill-roll.js";
import { DamageRoll } from "../controllers/dmg-roll.js";
export class Macros {
  static createCocMacro = async function (dropData, slot) {
    // Create item macro if rollable item - weapon, spell, prayer, trait, or skill
    if (dropData.type == "Item") {
      const item = await fromUuid(dropData.uuid);

      if (item === undefined) return;
      if (item.type === "encounterWeapon") return;

      const actor = item.actor;

      const macroName = item.name + " (" + game.actors.get(actor.id).name + ")";
      const command = `let onlyDamage = false;\nlet customLabel = "";\nlet skillDescription = "";\nlet dmgDescription = "";\n\nif (event) {\n  if (event.shiftKey) onlyDamage = true;\n}\n\ngame.coc.macros.rollItemMacro("${item._id}", "${item.name}", "${item.type}", 0, 0, 0, onlyDamage, customLabel, skillDescription, dmgDescription);`;
      this.createMacro(slot, macroName, command, item.img);
    }
    // Create a macro to open the actor sheet of the actor dropped on the hotbar
    else if (dropData.type == "Actor") {
      const actor = await fromUuid(dropData.uuid);
      const command = `game.actors.get("${actor.id}").sheet.render(true)`;
      this.createMacro(slot, actor.name, command, actor.img);
    }
    // Create a macro to open the journal sheet of the journal dropped on the hotbar
    else if (dropData.type == "JournalEntry") {
      const journal = await fromUuid(dropData.uuid);
      const command = `game.journal.get("${journal.id}").sheet.render(true)`;
      this.createMacro(slot, journal.name, command, journal.img ? journal.img : "icons/svg/book.svg");
    }
  };

  /**
   * @description Create a macro
   * @param {*} slot
   * @param {*} name
   * @param {*} command
   * @param {*} img
   */
  static createMacro = async function (slot, name, command, img) {
    let macro = game.macros.contents.find((m) => m.name === name && m.command === command);
    if (!macro) {
      macro = await Macro.create(
        {
          name: name,
          type: "script",
          img: img,
          command: command,
          flags: { "coc.macro": true },
        },
        { displaySheet: false }
      );
      game.user.assignHotbarMacro(macro, slot);
    }
  };

  /**
   * @name getSpeakersActor
   * @description
   *
   * @returns
   */
  static getSpeakersActor = function () {
    // Vérifie qu'un seul token est sélectionné
    const tokens = canvas.tokens.controlled;
    if (tokens.length > 1) {
      ui.notifications.warn(game.i18n.localize("COC.notification.MacroMultipleTokensSelected"));
      return null;
    }

    const speaker = ChatMessage.getSpeaker();
    let actor;
    // Si un token est sélectionné, le prendre comme acteur cible
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    // Sinon prendre l'acteur par défaut pour l'utilisateur courrant
    if (!actor) actor = game.actors.get(speaker.actor);
    return actor;
  };

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
  static rollStatMacro = async function (actor, stat, bonus = 0, malus = 0, onEnter = "submit", label, description, dialog = true, dice = "1d20", difficulty) {
    // Plusieurs tokens sélectionnés
    if (actor === null) return;
    // Aucun acteur cible
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

    let statObj;
    switch (stat) {
      case "for":
      case "str":
        statObj = eval(`actor.system.stats.str`);
        break;
      case "dex":
        statObj = eval(`actor.system.stats.dex`);
        break;
      case "con":
        statObj = eval(`actor.system.stats.con`);
        break;
      case "int":
        statObj = eval(`actor.system.stats.int`);
        break;
      case "sag":
      case "wis":
        statObj = eval(`actor.system.stats.wis`);
        break;
      case "cha":
        statObj = eval(`actor.system.stats.cha`);
        break;
      case "atc":
      case "melee":
        statObj = eval(`actor.system.attacks.melee`);
        break;
      case "atd":
      case "ranged":
        statObj = eval(`actor.system.attacks.ranged`);
        break;
      case "atm":
      case "magic":
        statObj = eval(`actor.system.attacks.magic`);
        break;
      default:
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

    if (dialog) {
      CoCRoll.skillRollDialog(actor, label && label.length > 0 ? label : game.i18n.localize(statObj.label), mod, bonus, malus, "20", statObj.superior, onEnter, description, actor.isWeakened);
    } else {
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
  /**
   * Lance une macro d'objet pour l'objet spécifié.
   * 
   * @param {string} itemId - L'ID de l'objet à lancer.
   * @param {string} itemName - Le nom de l'objet à lancer.
   * @param {string} itemType - Le type de l'objet à lancer.
   * @param {number} [bonus=0] - Le bonus à appliquer au jet.
   * @param {number} [malus=0] - Le malus à appliquer au jet.
   * @param {number} [dmgBonus=0] - Le bonus de dégâts à appliquer au jet.
   * @param {boolean} [dmgOnly=false] - Si on doit lancer uniquement les dégâts.
   * @param {string} [customLabel] - Une étiquette personnalisée pour le jet.
   * @param {string} [skillDescr] - Une description de la compétence utilisée.
   * @param {string} [dmgDescr] - Une description des dégâts lancés.
   * @param {boolean} [dialog=true] - Si on doit afficher une boîte de dialogue pour le jet.
   * 
   * @returns {Promise<void>} - Une promesse qui se résout lorsque le jet est terminé.
   */
  static rollItemMacro = async function (itemId, itemName, itemType, bonus = 0, malus = 0, dmgBonus = 0, dmgOnly = false, customLabel, skillDescr, dmgDescr, dialog = true) {
    const actor = this.getSpeakersActor();
    // Several tokens selected
    if (actor === null) return;
    // Aucun acteur cible
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

    const item = actor.items.get(itemId);
    if (!item) return ui.notifications.warn(game.i18n.format("COC.notification.MacroItemMissing", { item: itemName }));

    const itemData = item;

    if (itemData.system.properties.weapon || itemData.system.properties.heal) {
      if (itemData.system.properties.weapon) {
        if (itemData.system.properties.equipable && !itemData.system.worn) {
          return ui.notifications.warn(game.i18n.format("COC.notification.MacroItemUnequiped", { item: itemName }));
        }
        const label = customLabel && customLabel.length > 0 ? customLabel : itemData.name;
        const critrange = itemData.system.critrange;

        // Compute MOD
        const itemModStat = itemData.system.skill.split("@")[1];
        const itemModBonus = parseInt(itemData.system.skillBonus);

        let mod = actor.computeWeaponMod(itemModStat, itemModBonus);

        // Compute DM
        const itemDmgBase = itemData.system.dmgBase;
        const itemDmgStat = itemData.system.dmgStat.split("@")[1];
        const itemDmgBonus = parseInt(itemData.system.dmgBonus);

        let dmg = actor.computeDm(itemDmgBase, itemDmgStat, itemDmgBonus);

        if (dialog) {
          if (dmgOnly) CoCRoll.rollDamageDialog(actor, label, dmg, 0, false, "submit", dmgDescr);
          else CoCRoll.rollWeaponDialog(actor, label, mod, bonus, malus, critrange, dmg, dmgBonus, "submit", skillDescr, dmgDescr);
        } else {
          let formula = dmgBonus ? dmg + "+" + dmgBonus : dmg;
          if (dmgOnly) new DamageRoll(label, formula, false, dmgDescr).roll();
          else {
            let skillRoll = await new SkillRoll(label, "1d20", "+" + +mod, bonus, malus, null, critrange, skillDescr).roll();

            let result = skillRoll.dice[0].results[0].result;
            let critical = result >= critrange.split("-")[0] || result == 20;

            new DamageRoll(label, formula, critical, dmgDescr).roll();
          }
        }
      }
      if (itemData.system.properties.heal) {
        new CocHealingRoll(itemData.name, itemData.system.effects.heal.formula, false).roll(actor);
      }
    } else {
      return item.sheet.render(true);
    }
  };

  /**
   * Exécute une macro de jet de guérison.
   *
   * @async
   * @function rollHealMacro
   * @param {string} label - L'étiquette pour le jet de guérison.
   * @param {string} healFormula - La formule utilisée pour calculer la quantité de guérison.
   * @param {boolean} isCritical - Indique si le jet est un coup critique : double le montant de guérison.
   * @returns {Promise<void>} - Une promesse qui se résout lorsque le jet est terminé.
   */
  static rollHealMacro = async function (label, healFormula, isCritical) {
    const actor = this.getSpeakersActor();
    // Several tokens selected
    if (actor === null) return;
    // No token selected
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoTokenSelected"));

    new CocHealingRoll(label, healFormula, isCritical).roll(actor);
  };

  /**
   * Lance une macro de compétence pour l'acteur spécifié.
   *
   * @param {string} label - L'étiquette pour le jet de compétence.
   * @param {number} mod - Le modificateur pour le jet de compétence.
   * @param {number} bonus - Le bonus pour le jet de compétence.
   * @param {number} malus - Le malus pour le jet de compétence.
   * @param {number} critRange - La plage critique pour le jet de compétence.
   * @param {boolean} [isSuperior=false] - Si le jet est supérieur.
   * @param {string} description - La description du jet de compétence.
   * @returns {Promise<void>} Une promesse qui se résout lorsque le jet est terminé.
   */
  static rollSkillMacro = async function (label, mod, bonus, malus, critRange, isSuperior = false, description) {
    const actor = this.getSpeakersActor();

    // Several tokens selected
    if (actor === null) return;
    // Aucun acteur cible
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

    let crit = parseInt(critRange);
    crit = !isNaN(crit) ? crit : 20;
    CoCRoll.skillRollDialog(actor, label, mod, bonus, malus, crit, isSuperior, "submit", description);
  };

  /**
   * Exécute une macro de jet de dégâts de manière asynchrone.
   *
   * @param {string} label - L'étiquette pour le jet de dégâts.
   * @param {string} dmgFormula - La formule utilisée pour calculer les dégâts.
   * @param {string} dmgBonus - Tout bonus à ajouter au jet de dégâts.
   * @param {boolean} isCritical - Indique si le jet est un coup critique.
   * @param {string} dmgDescr - Une description des dégâts.
   * @returns {Promise<void>} Une promesse qui se résout lorsque l'exécution de la macro est terminée.
   */
  static rollDamageMacro = async function (label, dmgFormula, dmgBonus, isCritical, dmgDescr) {
    const actor = this.getSpeakersActor();

    // Several tokens selected
    if (actor === null) return;
    // Aucun acteur cible
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COC.notification.MacroNoActorAvailable"));

    CoCRoll.rollDamageDialog(actor, label, dmgFormula, dmgBonus, isCritical, "submit", dmgDescr);
  };
}
