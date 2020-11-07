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
        return ingame.cocncat(compendium);
    }

    // static getItemsOfType(type) {
    //     let compendium = [];
    //     let ingame = [];
    //     switch(type){
    //         case "path" :
    //             compendium = coc.paths;
    //             ingame = game.items.filter(item => item.type === "path").map(entity => entity.data);
    //             break;
    //         case "capacity" :
    //             compendium = coc.capacities;
    //             ingame = game.items.filter(item => item.type === "capacity").map(entity => entity.data);
    //             break;
    //     }
    //     return ingame.cocncat(compendium);
    // }

    /*
     * DATA
     */

    // static getInGameEntitiesDataOfType (type) {
    //     return game.items.filter(item => item.type === type).map(entity => entity.data);
    // }
}