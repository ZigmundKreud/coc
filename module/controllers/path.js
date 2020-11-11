import {Traversal} from "../utils/traversal.js";

export class Path {

    static async addToActor(actor, event, itemData) {
        if (actor.items.filter(item => item.type === "path" && item.data.name === itemData.name).length > 0) {
            ui.notifications.error("Vous possédez déjà cette voie.");
            return false;
        } else {
            // const capsContent = await game.packs.get("cof.capacities").getContent();
            // let items = duplicate(capsContent.filter(entity => entity.data.data.path === itemData.data.key));
            // items.push(itemData);
            // return actor.createEmbeddedEntity("OwnedItem", items).then(() => this._render(false));
            return actor.createEmbeddedEntity("OwnedItem", itemData);
        }
    }

    static getPathsFromActorByKey(actor, pathKeys) {
        const start = performance.now();
        let items = [];
        const ownedPaths = actor.items.filter(item => pathKeys.includes(item.data.data.key) && item.data.type === "path");
        if(ownedPaths.length>0){
            const ownedPathsIds = ownedPaths.map(c => c.data._id);
            const ownedPathsCapacities = ownedPaths.map(c => c.data.data.capacities).flat();
            // retrieve owned capacities matching profile paths capacities
            const allCaps = Traversal.getItemsOfType("capacity");
            const pathCaps = allCaps.filter(p => { if(p && p._id && ownedPathsCapacities.includes(p._id)) return ownedPathsCapacities.includes(p._id) });
            if(pathCaps.length > 0){
                const pathCapsKeys = pathCaps.map(c => c.data.key);
                const capsIds = actor.items.filter(item => pathCapsKeys.includes(item.data.data.key) && item.data.type === "capacity").map(c => c.data._id);
                items = items.concat(capsIds);
            }
            items = items.concat(ownedPathsIds);
        }
        const end = performance.now();
        const duration = end-start;
        console.log("Duration : " + duration + " ms");
        return items;
    }

    static removeFromActor(actor, event, entity) {
        console.log(entity);
        const pathData = entity.data;
        Dialog.confirm({
            title: "Supprimer la voie ?",
            content: `<p>Etes-vous sûr de vouloir supprimer la voie ${entity.name} ?</p>`,
            yes: () => {
                let items = actor.items.filter(item => item.data.type === "capacity" && item.data.data.path === pathData.data.key).map(c => c.data._id);
                items.push(entity._id);
                return actor.deleteOwnedItem(items);
            },
            defaultYes: true
        });
    }

}