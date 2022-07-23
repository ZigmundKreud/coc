import {Traversal} from "../utils/traversal.js";
import { ArrayUtils } from "../utils/array-utils.js";
import { EntitySummary } from "./entity-summary.js";

export class Capacity {

    static addToActor(actor, itemData) {
        if (actor.items.filter(item => item.type === "capacity" && item.name === itemData.name).length > 0) {
            ui.notifications.error("Vous possédez déjà cette capacité.");
            return false;
        } else {
            // activate the capacity as it is droped on an actor sheet
            // if (itemData.type === "capacity") itemData.data.checked = true;

            return actor.createEmbeddedDocuments("Item", [itemData], {});
        }
    }

    /**
     * Supprime une capacité de la feuille de personnage et met à jour les infos d'un éventuel path
     * @param {*} actor
     * @param {*} capacity
     * @returns
     */
     static removeFromActor(actor, capacity) {
        const capacityData = capacity;
        if (capacityData.system.path) {
            let path = actor.items.find(item => item.id === capacityData.system.path._id);
            if (path) {
                let pathData = duplicate(path);
                if (capacityData.flags.core.sourceId) {
                    let pcap = pathData.system.capacities.find(c => c.sourceId === capacityData.flags.core.sourceId);
                    pcap.data.checked = false;
                }
                return path.update(pathData).then(() => { return actor.deleteEmbeddedDocuments("Item", [capacity.id]); });
            }
        }
        return actor.deleteEmbeddedDocuments("Item", [capacity.id]);
    }

    /**
     * Callback on capacity create action
     * @param event the create event
     * @private
     */
    static create(actor, event) {
        const data = {name: "New Capacity", type: "capacity", data: {checked: true}};
        return actor.createEmbeddedDocuments("Item", [data], {renderSheet: true}); // Returns one Entity, saved to the database
    }


   /**
     *
     * @param {*} entity
     * @param {*} capacityData
     * @returns
     */
    static addToItem(entity, capacityData) {
        let data = duplicate(entity);
        let caps = data.system.capacities;
        let capsIds = caps.map(c => c._id);
        if (capsIds && !capsIds.includes(capacityData._id)) {
            data.system.capacities.push(EntitySummary.create(capacityData));
            return entity.update(data);
        }
        else ui.notifications.error("Cet objet contient déjà cette capacité.")
    }

    /**
     *
     * @param {*} actor
     * @param {*} event
     * @param {*} isUncheck
     * @returns
     */
    static toggleCheck(actor, event, isUncheck) {
        const elt = $(event.currentTarget).parents(".capacity");
        // get id of clicked capacity
        const capId = elt.data("itemId");
        // get id of parent path
        const pathId = elt.data("pathId");
        // get path from owned items
        const path = duplicate(actor.items.get(pathId));
        const pathData = path.system;
        const capacities = pathData.capacities;
        const capsIds = capacities.map(c => c._id);
        const toggledRank = capsIds.indexOf(capId);
        if (isUncheck) {
            capacities.filter(c => capsIds.indexOf(c._id) >= toggledRank).map(cap => {
                cap.data.checked = false;
                return cap;
            });
        } else {
            capacities.filter(c => capsIds.indexOf(c._id) <= toggledRank).map(cap => {
                cap.data.checked = true;
                return cap;
            });
        }

        // modification de la voie (path)
        return actor.updateEmbeddedDocuments("Item", [path]).then(newPath => {
            newPath = newPath instanceof Array ? newPath[0] : [newPath];
            // liste de toutes les capacités (capacities)
            return Traversal.mapItemsOfType("capacity").then(caps => {
                let items = actor.items.filter(i => i.type === "capacity" && i.system.path?._id === newPath._id);
                let itemsIds = items.map(i => i.flags.core.sourceId.split(".").pop());
                let itemsSrcIds = items.map(i => i.flags.core.sourceId);
                if (isUncheck) {
                    const unchecked = newPath.system.capacities.filter(c => !c.data.checked);
                    const uncheckedSrcIds = unchecked.map(c => c.data.sourceId);
                    let inter = ArrayUtils.intersection(uncheckedSrcIds, itemsSrcIds);
                    let toRemove = items.filter(i => inter.includes(i.flags.core.sourceId)).map(i => i.id);
                    return actor.deleteEmbeddedDocuments("Item", toRemove);
                } else {
                    const checked = newPath.system.capacities.filter(c => c.data.checked);
                    const checkedIds = checked.map(c => c._id);
                    let diff = ArrayUtils.difference(checkedIds, itemsIds);
                    let newCap = null;
                    let toAdd = checked.filter(c => diff.includes(c._id)).map(c => {
                        newCap = caps[c._id];
                        newCap.system.rank = c.data.rank;
                        newCap.system.path = c.data.path;
                        newCap.system.checked = c.data.checked;
                        newCap.flags.core = { sourceId: c.sourceId };
                        return newCap;
                    });
                    toAdd = toAdd instanceof Array ? toAdd : [toAdd];
                    let items = [];
                    toAdd.forEach(c => { items.push(c.toObject(false)) });
                    // création de l'élémént
                    return actor.createEmbeddedDocuments("Item", items);
                }
            });
        });
    }

}