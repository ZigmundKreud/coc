import {Traversal} from "../utils/traversal.js";

export class Path {

    /**
     *
     * @param {*} actor
     * @param {*} pathsData
     * @returns
     */
    static addPathsToActor(actor, pathsData) {
        let items = [];
        pathsData = pathsData instanceof Array ? pathsData : [pathsData];
        pathsData.forEach(p => { items.push(p.toObject(false)) });
        return actor.createEmbeddedDocuments("Item", items).then(newPaths => {
            // on ajoute toutes les metadonnees aux voies nouvellement creees pour faciliter la gestions des capacites qui en dependent
            let updatedPaths = newPaths.map(newPath => {
                const index = newPaths.indexOf(newPath);
                let updatedPath = duplicate(newPath);
                updatedPath.data.capacities = updatedPath.data.capacities.map(cap => {
                    // Ajout de données utilisées pour la gestion des voies/capa
                    cap.data = {
                        key: cap.name.slugify({ strict: true }),
                        rank: updatedPath.data.capacities.indexOf(cap) + 1,
                        sourceId: cap.sourceId,
                        checked: false,
                        path: {
                            _id: updatedPath._id,
                            name: updatedPath.name,
                            img: updatedPath.img,
                            key: updatedPath.data.key,
                            sourceId: pathsData[index].sourceId,
                        }
                    };
                    return cap;
                });
                return updatedPath;
            });
            updatedPaths = updatedPaths instanceof Array ? updatedPaths : [updatedPaths];
            return actor.updateEmbeddedDocuments("Item", updatedPaths);
        });
    }

    /**
     *
     * @param {*} actor
     * @param {*} pathData
     * @returns
     */
    static addToActor(actor, pathData) {
        if (actor.items.filter(item => item.type === "path" && item.data.name === pathData.name).length > 0) {
            ui.notifications.error("Vous possédez déjà cette voie.");
            return false;
        } else {
            return this.addPathsToActor(actor, [pathData]);
            // return this.addPathsToActor(actor, [{ "itemData": pathData, "sourceId": pathData.data.flags.core.sourceId }]);
        }
    }

    // static addToActor(actor, event, itemData) {
    //     if (actor.items.filter(item => item.type === "path" && item.data.name === itemData.name).length > 0) {
    //         ui.notifications.error("Vous possédez déjà cette voie.");
    //         return false;
    //     } else {
    //         // const capsContent = await game.packs.get("coc.capacities").getContent();
    //         // let items = duplicate(capsContent.filter(entity => entity.data.data.path === itemData.data.key));
    //         // items.push(itemData);
    //         // return actor.createEmbeddedEntity("OwnedItem", items).then(() => this._render(false));
    //         return actor.createEmbeddedDocuments("Item", [itemData], {});
    //     }
    // }

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