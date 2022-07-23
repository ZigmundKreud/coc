import {COC,System} from "../system/config.js";
import {Compendia} from "./compendia.js";

export class Traversal {

    static async getDocument(id, type, pack) {
        let entity = null;
        // Case 1 - Import from World entities
        if(type === "item") entity = game.items.get(id);
        else if(type === "actor") entity = game.actors.get(id);
        else if(type === "journal") entity = game.journal.get(id);
        // Case 2 - Import from a Compendium pack
        if (!entity && pack) {
            await game.packs.get(System.name + "." + pack).getDocument(id).then(e => entity = e);
        }
        return entity;
    }

    static getIndex() {
        return Compendia.getIndex().then(index =>{
            let items = game.items.map(entity => {
                return {
                    _id : entity._id,
                    name : entity.name,
                    img : entity.img,
                    sourceId : "Item."+entity._id
                }
            });
            let actors = game.actors.map(entity => {
                return {
                    _id : entity._id,
                    name : entity.name,
                    img : entity.img,
                    sourceId : "Actor."+entity._id
                }
            });
            let journal = game.journal.map(entity => {
                return {
                    _id : entity._id,
                    name : entity.name,
                    img : entity.img,
                    sourceId : "JournalEntry."+entity._id
                }
            });
            return items.concat(actors, journal, Object.values(index)).reduce(function (map, obj) {
                map[obj._id] = obj;
                return map;
            }, {});
        });
    }

    static mapItemsOfType(types) {
        return Compendia.getContent(types).then(content =>{
            return game.items.filter(item => types.includes(item.type))
                .map(entity => entity)
                .concat(Object.values(content).map(entity => entity))
                .reduce(function (map, obj) {
                    map[obj._id] = obj;
                    return map;
                }, {});
        });
    }

    static getEntitiesOfType(types) {
        return Compendia.getContent(types).then(content =>{
            return game.items.filter(item => types.includes(item.type)).concat(
                game.actors.filter(item => types.includes(item.type)),
                game.journal.filter(item => types.includes(item.type)),
                Object.values(content)
            );
        });
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
                // compendium = await game.packs.get("coc.paths").getContent().then(index => index.map(entity => entity));
                compendium = COC.paths;
                ingame = game.items.filter(item => item.type === "path").map(entity => entity);
                break;
            case "capacity" :
                // compendium = await game.packs.get("coc.capacities").getContent().then(index => index.map(entity => entity));
                compendium = COC.capacities;
                ingame = game.items.filter(item => item.type === "capacity").map(entity => entity);
                break;
        }
        return ingame.concat(compendium);
    }

    /*
     * DATA
     */

    static getInGameEntitiesDataOfType (type) {
        return game.items.filter(item => item.type === type).map(entity => entity);
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
        return this.getAllPathsData().find(entity => entity.system.key === key);
    }

    static find(id) {
        return this.getIndex().then(idx => {
            const entry = idx[id];
            if(entry){
                if(entry.sourceId){
                    const elts = entry.sourceId.split(".");
                    if(elts[0] === "Item") return game.items.get(id);
                    else if(elts[0] === "Actor") return game.actors.get(id);
                    else if(elts[0] === "JournalEntry") return game.journal.get(id);
                    else if(elts[0] === "Compendium") {
                        const packName = elts[1] + "." + elts[2];
                        return game.packs.get(packName).getDocument(id).then(entity => entity);
                    }
                }
            }
        });
    }

    static findBySource(id, source) {
        if(id && source) {
            if(source === "game.items") return game.items.get(id);
            if(source === "game.actors") return game.actors.get(id);
            if(source === "game.journal") return game.journal.get(id);
            else return game.packs.get(source).getDocument(id).then(entity => entity);
        }
    }

}