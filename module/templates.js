/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // CHARACTER
        "systems/coc/templates/actors/character/parts/character-combat.hbs",
        "systems/coc/templates/actors/character/parts/character-inventory.hbs",
        "systems/coc/templates/actors/character/parts/character-capacities.hbs",
        "systems/coc/templates/actors/character/parts/character-description.hbs",

        "systems/coc/templates/actors/character/parts/stats/character-attacks.hbs",
        "systems/coc/templates/actors/character/parts/stats/character-attributes.hbs",
        "systems/coc/templates/actors/character/parts/stats/character-recovery.hbs",
        "systems/coc/templates/actors/character/parts/stats/character-resources.hbs",
        "systems/coc/templates/actors/character/parts/stats/character-stats.hbs",
        "systems/coc/templates/actors/character/parts/stats/character-vitality.hbs",
        "systems/coc/templates/actors/character/parts/stats/character-defence.hbs",
        "systems/coc/templates/actors/character/parts/stats/character-init.hbs",

        "systems/coc/templates/actors/character/parts/capacities/character-capacities.hbs",
        "systems/coc/templates/actors/character/parts/capacities/character-paths.hbs",

        "systems/coc/templates/actors/character/parts/combat/character-combat.hbs",
        "systems/coc/templates/actors/character/parts/combat/character-combat-item.hbs",

        "systems/coc/templates/actors/character/parts/inventory/character-inventory.hbs",
        "systems/coc/templates/actors/character/parts/inventory/character-inventory-item.hbs",


        // NPC
        "systems/coc/templates/actors/npc/parts/npc-stats.hbs",
        "systems/coc/templates/actors/npc/parts/npc-combat.hbs",
        "systems/coc/templates/actors/npc/parts/npc-inventory.hbs",
        "systems/coc/templates/actors/npc/parts/npc-capacities.hbs",
        "systems/coc/templates/actors/npc/parts/npc-description.hbs",

        // ITEMS PROPERTIES
        "systems/coc/templates/items/parts/properties/item-properties.hbs",
        "systems/coc/templates/items/parts/properties/capacity-properties.hbs",
        "systems/coc/templates/items/parts/properties/profile-properties.hbs",

        // ITEMS DETAILS
        "systems/coc/templates/items/parts/details/item-details.hbs",
        "systems/coc/templates/items/parts/details/capacity-details.hbs",
        "systems/coc/templates/items/parts/details/path-details.hbs",
        "systems/coc/templates/items/parts/details/profile-details.hbs",
        "systems/coc/templates/items/parts/details/ranged-details.hbs",
        "systems/coc/templates/items/parts/details/species-details.hbs",
        "systems/coc/templates/items/parts/details/equipment-details.hbs",
        "systems/coc/templates/items/parts/details/protection-details.hbs",
        "systems/coc/templates/items/parts/details/spell-details.hbs",
        "systems/coc/templates/items/parts/details/weapon-details.hbs",
        "systems/coc/templates/items/parts/details/usage-details.hbs",
        "systems/coc/templates/items/parts/details/effects-details.hbs",

    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
