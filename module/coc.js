/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import {CoCActor} from "./actors/actor.js";
import {CoCItem} from "./items/item.js";

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

    /**
     * Set an initiative formula for the system
     * @type {String}
     */

    CONFIG.Combat.initiative = {
        formula: "@attributes.init.value + @stats.wis.value/100",
        decimals: 2
    };

    // Record Configuration values
    CONFIG.COC = COC;

    // Define custom Entity classes
    CONFIG.Actor.documentClass = CoCActor;
    CONFIG.Item.documentClass = CoCItem;

    // Create a namespace within the game global
    game.coc = {
        macros : Macros,
        config: COC
    };

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet, {
        makeDefault: true,

    });
    Items.unregisterSheet("core", ItemSheet, {
        makeDefault: true,

    });

    // Register actor sheets
    Actors.registerSheet("coc", CoCActorSheet, {types: ["character"], makeDefault: false, label: "COC.sheet.actor"});
    Actors.registerSheet("coc", CoCNpcSheet, {types: ["npc"], makeDefault: false, label: "COC.sheet.npc"});
    Actors.registerSheet("coc", CoCEncounterSheet, {types: ["encounter"], makeDefault: false, label: "COC.sheet.encounter"});

    // Register item sheets
    Items.registerSheet("coc", CoCItemSheet, {types: ["item", "trait", "capacity", "profile", "path", "encounterWeapon"], makeDefault: false, label: "COC.sheet.item"});

    // Register System Settings
    registerSystemSettings();

    // Preload Handlebars Templates
    preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();

    // Register hooks
    registerHooks();

});

/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */
Hooks.once("ready", async () => {

    // await COC.getProfiles();
    // await COC.getTraits();
    // await COC.getPaths();
    // await COC.getCapacities();

    // await UpdateUtils.updateTraits();
    // await UpdateUtils.updateCapacities();
    // await UpdateUtils.updateProfiles();
    // await UpdateUtils.updatePacks();

    console.info("COC | " + System.label + " | System Initialized.");

});
