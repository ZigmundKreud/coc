/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */

Hooks.once("ready", async () => {

    await game.coc.config.getProfiles();
    await game.coc.config.getTraits();
    await game.coc.config.getPaths();
    await game.coc.config.getCapacities();

    console.debug("System Initialized.");

});
