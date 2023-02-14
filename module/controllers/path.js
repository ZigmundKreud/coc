import { Traversal } from "../utils/traversal.js";
import { EntitySummary } from "./entity-summary.js";

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
                updatedPath.system.capacities = updatedPath.system.capacities.map(cap => {
                    // Ajout de données utilisées pour la gestion des voies/capa
                    cap.data = {
                        key: cap.name.slugify({ strict: true }),
                        rank: updatedPath.system.capacities.indexOf(cap) + 1,
                        sourceId: cap.sourceId,
                        checked: false,
                        path: {
                            _id: updatedPath._id,
                            name: updatedPath.name,
                            img: updatedPath.img,
                            key: updatedPath.system.key,
                            sourceId: pathsData[index].flags.core.sourceId,
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
        if (actor.items.filter(item => item.type === "path" && item.name === pathData.name).length > 0) {
            ui.notifications.error("Vous possédez déjà cette voie.");
            return false;
        } else {
            return this.addPathsToActor(actor, [pathData]);
        }
    }

    static getPathsFromActorByKey(actor, pathKeys) {
        const start = performance.now();
        let items = [];
        const ownedPaths = actor.items.filter(item => pathKeys.includes(item.system.key) && item.type === "path");
        if(ownedPaths.length>0){
            const ownedPathsIds = ownedPaths.map(c => c._id);
            const ownedPathsCapacities = ownedPaths.map(c => c.system.capacities).flat();
            // retrieve owned capacities matching profile paths capacities
            const allCaps = Traversal.getItemsOfType("capacity");
            const pathCaps = allCaps.filter(p => { if(p && p._id && ownedPathsCapacities.includes(p._id)) return ownedPathsCapacities.includes(p._id) });
            if(pathCaps.length > 0){
                const pathCapsKeys = pathCaps.map(c => c.system.key);
                const capsIds = actor.items.filter(item => pathCapsKeys.includes(item.system.key) && item.type === "capacity").map(c => c._id);
                items = items.concat(capsIds);
            }
            items = items.concat(ownedPathsIds);
        }
        const end = performance.now();
        const duration = end-start;
        //console.log("Duration : " + duration + " ms");
        return items;
    }

    /**
     *
     * @param {*} entity
     * @param {*} pathData
     * @returns
     */
     static addToItem(entity, pathData) {
        let data = duplicate(entity);
        let paths = data.system.paths;
        let pathsIds = paths.map(p => p._id);
        if (pathsIds && !pathsIds.includes(pathData._id)) {
            data.system.paths.push(EntitySummary.create(pathData));
            return entity.update(data);
        }
        else ui.notifications.error("Cet objet contient déjà cette voie.")
    }

    static removeFromActor(actor, entity) {
        Dialog.confirm({
            title: "Supprimer une voie",
            content: `<p>Etes-vous sûr de vouloir supprimer la ${entity.name} de ${actor.name} ?</p>`,
            yes: () => {
                const pathData = entity;
                let items = actor.items.filter(item => item.type === "capacity" && item.system.path._id === pathData._id).map(c => c._id);
                items.push(entity.id);
                return actor.deleteEmbeddedDocuments("Item", items);
            },
            defaultYes: true
        });
    }

    /**
     *
     * @param {*} actor
     * @param {*} paths
     * @returns
     */
    static removePathsFromActor(actor, paths) {
        let items = [];
        paths = paths instanceof Array ? paths : [paths];
        paths.map(path => {
            let caps = actor.items.filter(item => {
                if (item.type === "capacity") {
                    if (item.system.path._id === path.id) return true;
                }
            });
            caps.map(c => items.push(c.id));
            items.push(path.id);
        });
        return actor.deleteEmbeddedDocuments("Item", items);
    }

}