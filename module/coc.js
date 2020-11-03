/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

import {CocActorSheet} from "./actors/actor-sheet.js";
import {CocItemSheet} from "./items/item-sheet.js";
import {CocActor} from "./actors/actor.js";
import {CocItem} from "./items/item.js";

Hooks.once("init", async function () {

    console.info("COC Module Initializing...");

    // Define custom Entity classes
    CONFIG.Actor.entityClass = CocActor;
    CONFIG.Item.entityClass = CocItem;

    // Create a namespace within the game global
    // game.coc = {
    //     config: COC
    // };

    // Register actor sheets
    Actors.registerSheet("coc", CocActorSheet, {types: ["character", "npc"], makeDefault: true});
    // Register item sheets
    // Items.registerSheet("cof", CofItemSheet, {types: ["item", "capacity", "profile", "path", "species", "armor", "shield", "melee", "ranged", "spell", "trapping"], makeDefault: true});
    Items.registerSheet("cof", CocItemSheet, {types: ["item", "capacity", "profile", "path", "species"], makeDefault: true});

});
