/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import {CoCActor} from "./actors/actor.js";
import {CoCItem} from "./items/item.js";

import {CoCActorSheet} from "./actors/actor-sheet.js";
import {CoCItemSheet} from "./items/item-sheet.js";

import { registerSystemSettings } from "./settings.js";
import {preloadHandlebarsTemplates} from "./templates.js";
import {registerHandlebarsHelpers} from "./helpers.js";

import {COC} from "./config.js";


Hooks.once("init", async function () {

    console.debug("Initialisation du Système Chroniques Oubliées Contemporain...");

    /**
     * Set an initiative formula for the system
     * @type {String}
     */

    CONFIG.Combat.initiative = {
        formula: "@attributes.init.value + @stats.wis.value/100",
        decimals: 2
    };

    // Define custom Entity classes
    CONFIG.Actor.entityClass = CoCActor;
    CONFIG.Item.entityClass = CoCItem;

    // Create a namespace within the game global
    game.coc = {
        skin : "base",
        config: COC
    };

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // Register actor sheets
    Actors.registerSheet("coc", CoCActorSheet, {types: ["character", "npc"], makeDefault: true});
    // Register item sheets
    Items.registerSheet("coc", CoCItemSheet, {types: ["item", "trait", "capacity", "profile", "path", "trait"], makeDefault: true});

    // Register System Settings
    registerSystemSettings();

    // Preload Handlebars Templates
    preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();

});
