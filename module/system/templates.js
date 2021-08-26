import {System} from "./config.js";

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // CHARACTER

        "systems/" + System.name + "/templates/actors/actor-sheet.hbs",
        "systems/" + System.name + "/templates/actors/parts/actor-details.hbs",
        "systems/" + System.name + "/templates/actors/parts/actor-tabs.hbs",
        "systems/" + System.name + "/templates/actors/parts/encounter-tabs.hbs",
        "systems/" + System.name + "/templates/actors/parts/character-description.hbs",
        "systems/" + System.name + "/templates/actors/parts/actor-description.hbs",

        "systems/" + System.name + "/templates/actors/parts/details/actor-details.hbs",
        "systems/" + System.name + "/templates/actors/parts/details/encounter-details.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-attacks.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-attributes.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/npc-attributes.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-recovery.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-resources.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-madness.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-injuries.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-stats.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/encounter-stats.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-vitality.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-defence.hbs",
        "systems/" + System.name + "/templates/actors/parts/stats/actor-init.hbs",

        "systems/" + System.name + "/templates/actors/parts/capacities/actor-capacities.hbs",
        "systems/" + System.name + "/templates/actors/parts/capacities/encounter-capacities.hbs",
        "systems/" + System.name + "/templates/actors/parts/capacities/actor-paths.hbs",

        "systems/" + System.name + "/templates/actors/parts/combat/character-combat.hbs",
        "systems/" + System.name + "/templates/actors/parts/combat/character-combat-item.hbs",

        "systems/" + System.name + "/templates/actors/parts/combat/npc-combat.hbs",
        "systems/" + System.name + "/templates/actors/parts/combat/npc-combat-item.hbs",

        "systems/" + System.name + "/templates/actors/parts/combat/encounter-combat.hbs",

        "systems/" + System.name + "/templates/actors/parts/inventory/actor-inventory.hbs",
        "systems/" + System.name + "/templates/actors/parts/inventory/actor-inventory-item.hbs",

        "systems/" + System.name + "/templates/dialogs/roll-weapon-dialog.hbs",
        "systems/" + System.name + "/templates/dialogs/parts/roll-dmg-fields.hbs",

        // ITEMS PROPERTIES
        "systems/" + System.name + "/templates/items/parts/properties/item-properties.hbs",
        "systems/" + System.name + "/templates/items/parts/properties/capacity-properties.hbs",
        "systems/" + System.name + "/templates/items/parts/properties/profile-properties.hbs",

        // ITEMS DETAILS
        "systems/" + System.name + "/templates/items/parts/details/item-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/encounter-weapon-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/capacity-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/path-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/profile-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/ranged-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/equipment-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/protection-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/spell-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/weapon-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/usage-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/effects-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/trait-details.hbs",
        "systems/" + System.name + "/templates/items/parts/details/setting-details.hbs",

        // EFFECTS
        "systems/" + System.name + "/templates/effects/effects.hbs",
        "systems/" + System.name + "/templates/effects/effects-item.hbs"

    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
