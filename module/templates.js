/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // CHARACTER
        "systems/coc/templates/actors/parts/actor-header.hbs",
        "systems/coc/templates/actors/parts/actor-description.hbs",

        "systems/coc/templates/actors/parts/stats/actor-attacks.hbs",
        "systems/coc/templates/actors/parts/stats/actor-attributes.hbs",
        "systems/coc/templates/actors/parts/stats/npc-attributes.hbs",
        "systems/coc/templates/actors/parts/stats/actor-recovery.hbs",
        "systems/coc/templates/actors/parts/stats/actor-resources.hbs",
        "systems/coc/templates/actors/parts/stats/actor-stats.hbs",
        "systems/coc/templates/actors/parts/stats/actor-vitality.hbs",
        "systems/coc/templates/actors/parts/stats/actor-defence.hbs",
        "systems/coc/templates/actors/parts/stats/actor-init.hbs",

        "systems/coc/templates/actors/parts/capacities/actor-capacities.hbs",
        "systems/coc/templates/actors/parts/capacities/actor-paths.hbs",

        "systems/coc/templates/actors/parts/combat/actor-combat.hbs",
        "systems/coc/templates/actors/parts/combat/actor-combat-item.hbs",

        "systems/coc/templates/actors/parts/inventory/actor-inventory.hbs",
        "systems/coc/templates/actors/parts/inventory/actor-inventory-item.hbs",

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
        "systems/coc/templates/items/parts/details/equipment-details.hbs",
        "systems/coc/templates/items/parts/details/protection-details.hbs",
        "systems/coc/templates/items/parts/details/spell-details.hbs",
        "systems/coc/templates/items/parts/details/weapon-details.hbs",
        "systems/coc/templates/items/parts/details/usage-details.hbs",
        "systems/coc/templates/items/parts/details/effects-details.hbs",
        "systems/coc/templates/items/parts/details/trait-details.hbs",
        "systems/coc/templates/items/parts/details/setting-details.hbs"

    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
