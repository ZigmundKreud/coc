/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */

import {COC} from "../config.js";
import {UpdateUtils} from "../utils/update-utils.js";

Hooks.once("ready", async () => {

    await COC.getProfiles();
    await COC.getTraits();
    await COC.getPaths();
    await COC.getCapacities();

    // await UpdateUtils.updateTraits();
    // await UpdateUtils.updateCapacities();
    // await UpdateUtils.updatePaths();

    if(game.settings.get("coc", "cocthSkin")){
        game.coc.skin = "cocth";
    }

    console.debug("System Initialized.");

});
