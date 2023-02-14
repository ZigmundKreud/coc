/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import {CoCActor} from "./actors/actor.js";
import {CoCItem} from "./items/item.js";

import CocCombat from "./controllers/combat.js";

import {CoCActorSheet} from "./actors/actor-sheet.js";
import {CoCNpcSheet} from "./actors/npc-sheet.js";
import {CoCEncounterSheet} from "./actors/encounter-sheet.js";
import {CoCItemSheet} from "./items/item-sheet.js";

import { registerSystemSettings } from "./system/settings.js";
import {preloadHandlebarsTemplates} from "./system/templates.js";
import {registerHandlebarsHelpers} from "./system/helpers.js";

import {COC, System} from "./system/config.js";
import {Macros} from "./system/macros.js";

import registerHooks from "./system/hooks.js";
import {UpdateUtils} from "./utils/update-utils.js";

Hooks.once("init", function () {

    console.info("COC | "+ System.label + " | System Initializing...");
    console.info(System.ASCII);

    // Register System Settings
    registerSystemSettings();

    /**
     * Set an initiative formula for the system
     */
    if(game.settings.get("coc", "useVarInit")){
      CONFIG.Combat.initiative = {
        formula: "1d6x + @attributes.init.value + @stats.wis.value/100",
        decimals: 2
      };
    }
    else {
      CONFIG.Combat.initiative = {
        formula: "@attributes.init.value + @stats.wis.value/100",
        decimals: 2
      };
    }

    // Record Configuration values
    CONFIG.COC = COC;

    // Define custom Entity classes
    CONFIG.Actor.documentClass = CoCActor;
    CONFIG.Item.documentClass = CoCItem;

    // Custom combat for Initiative
    CONFIG.Combat.documentClass = CocCombat;

    // Create a namespace within the game global
    game.coc = {
        macros : Macros,
        config: COC
    };

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet, { makeDefault: true });

    // Register actor sheets
    Actors.registerSheet("coc", CoCActorSheet, {types: ["character"], makeDefault: false, label: "COC.sheet.actor"});
    Actors.registerSheet("coc", CoCNpcSheet, {types: ["npc"], makeDefault: false, label: "COC.sheet.npc"});
    Actors.registerSheet("coc", CoCEncounterSheet, {types: ["encounter"], makeDefault: false, label: "COC.sheet.encounter"});

    // Register item sheets
    Items.registerSheet("coc", CoCItemSheet, {types: ["item", "trait", "capacity", "profile", "path", "encounterWeapon"], makeDefault: false, label: "COC.sheet.item"});

    // Preload Handlebars Templates
    preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();

    // Register hooks
    registerHooks();

});

Hooks.once("setup", function() {

	// Localize CONFIG objects once up-front
	const toLocalize = ["stats","skills"];
	// Exclude some from sorting where the default order matters
	const noSort = ["stats","skills"];

	// Localize and sort CONFIG objects
	for ( let o of toLocalize ) {
		const localized = Object.entries(CONFIG.COC[o]).map(e => {
		  return [e[0], game.i18n.localize(e[1])];
		});
		if ( !noSort.includes(o) ) localized.sort((a, b) => a[1].localeCompare(b[1]));
		CONFIG.COC[o] = localized.reduce((obj, e) => {
		  obj[e[0]] = e[1];
		  return obj;
		}, {});
	}
});

/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */
Hooks.once("ready", async () => {
    console.info("COC | " + System.label + " | System Initialized.");
});
