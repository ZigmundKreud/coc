import {COC} from "../config.js";

export class Traversal {

    static async getEntity(id, type, pack) {
        let entity = null;
        // Case 1 - Import from World entities
        if(type === "item") entity = game.items.get(id);
        else if(type === "actor") entity = game.actors.get(id);
        else if(type === "journal") entity = game.journal.get(id);
        // Case 2 - Import from a Compendium pack
        if (!entity && pack) {
            await game.packs.get(pack).getEntity(id).then(e => entity = e);
        }
        return entity;
    }

    static getAllEntitiesOfType(type, pack) {
        const compendium = game.packs.get(pack).getContent();
        const ingame = game.items.filter(item => item.type === type);
        return ingame.concat(compendium);
    }

    static getItemsOfType(type) {
        let compendium = [];
        let ingame = [];
        switch(type){
            case "path" :
                // compendium = await game.packs.get("coc.paths").getContent().then(index => index.map(entity => entity.data));
                compendium = COC.paths;
                ingame = game.items.filter(item => item.type === "path").map(entity => entity.data);
                break;
            case "capacity" :
                // compendium = await game.packs.get("coc.capacities").getContent().then(index => index.map(entity => entity.data));
                compendium = COC.capacities;
                ingame = game.items.filter(item => item.type === "capacity").map(entity => entity.data);
                break;
        }
        return ingame.concat(compendium);
    }

    /*
     * DATA
     */

    static getInGameEntitiesDataOfType (type) {
        return game.items.filter(item => item.type === type).map(entity => entity.data);
    }

    static getAllCapacitiesData () {
        const compendium = game.coc.config.capacities;
        const ingame = this.getInGameEntitiesDataOfType("capacity");
        return ingame.concat(compendium);
    }

    static getAllPathsData () {
        const compendium = game.coc.config.paths;
        const ingame = this.getInGameEntitiesDataOfType("path");
        return ingame.concat(compendium);
    }

    static getAllProfilesData () {
        const compendium = game.coc.config.profiles;
        const ingame = this.getInGameEntitiesDataOfType("profile");
        return ingame.concat(compendium);
    }

    static findPathDataByKey (key) {
        return this.getAllPathsData().find(entity => entity.data.key === key);
    }

}