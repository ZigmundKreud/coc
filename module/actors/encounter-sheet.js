import { CoCBaseSheet } from "./base-sheet.js";
import { COC } from "../system/config.js";

export class CoCEncounterSheet extends CoCBaseSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", game.coc.skin, "sheet", "actor", "encounter"],
            template: "/systems/coc/templates/actors/actor-sheet.hbs",
            width: 970,
            height: 750,
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "stats"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.weapon-add').click(this._onWeaponAdd.bind(this));
        html.find('.weapon-remove').click(this._onWeaponRemove.bind(this));
    }

    /* -------------------------------------------- */
    /* WEAPON ADD/REMOVE CALLBACKS                  */
    /* -------------------------------------------- */

    async _onWeaponAdd(event) {
        event.preventDefault();
        let data = await this.getData();
        data.weapons = Object.values(data.data.weapons);
        data.weapons.push({"name": "", "mod": null, "dmg": null});
        return this.actor.update({'data.weapons': data.weapons});
    }

    async _onWeaponRemove(event) {
        event.preventDefault();
        const elt = $(event.currentTarget).parents(".weapon");
        const idx = elt.data("itemId");
        let data = await this.getData();
        data.weapons = Object.values(data.data.weapons);
        if(data.weapons.length == 1) data.weapons[0] = {"name":"", "mod":null, "dmg":null};
        else data.weapons.splice(idx, 1);
        return this.actor.update({'data.weapons': data.weapons});
    }

    /** @override */
    getData(options) {
        const data = super.getData(options);
        if (COC.debug) console.log("COC | EncounterSheet getData", data);
        
        // The Actor's data
        const actorData = this.actor.data.toObject(false);

        // Owned Items
        data.profile = actorData.items.find(item => item.type === "profile");
        data.trait = actorData.items.find(item => item.type === "trait");

        // PATHS & CAPACITIES
        const paths = actorData.items.filter(item => item.type === "path");
        data.paths = paths;
        data.pathCount = data.paths.length;
        data.capacities = {
            count: actorData.items.filter(item => item.type === "capacity").length,
            collections: []
        }
        data.capacities.collections.push({
            id: "standalone-capacities",
            label: "Capacités Hors-Voies",
            items: Object.values(actorData.items).filter(item => {
                if (item.type === "capacity" && !item.data.path) {
                    return true;
                }
            }).sort((a, b) => (a.name > b.name) ? 1 : -1)
        });
        for (const path of paths) {
            data.capacities.collections.push({
                id: (path.data.key) ? path.data.key : path.name.slugify({ strict: true }),
                label: path.name,
                items: Object.values(actorData.items).filter(item => {
                    if (item.type === "capacity" && item.data.path._id === path._id) return true;
                }).sort((a, b) => (a.data.rank > b.data.rank) ? 1 : -1)
            });
        }


        data.items = actorData.items;
        for ( let i of actorData.items ) {
            const item = this.actor.items.get(i._id);
            i.labels = item.labels;
        }
        data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));

        // Labels and filters
        data.labels = this.actor.labels || {};

        // Combat and Inventory
        data.combat = {
            count: data.items.filter(i => i.data.worn).length,
            categories: []
        };
        data.inventory = {
            count: data.items.filter(i => i.type === "item").length,
            categories: []
        };
        for (const category of Object.keys(game.coc.config.itemCategories)) {
            data.combat.categories.push({
                id: category,
                label: game.coc.config.itemCategories[category],
                items: Object.values(data.items).filter(item => item.type === "item" && item.data.subtype === category && item.data.worn).sort((a, b) => (a.name > b.name) ? 1 : -1)
            });
            data.inventory.categories.push({
                id: category,
                label: "COC.category." + category,
                items: Object.values(data.items).filter(item => item.type === "item" && item.data.subtype === category).sort((a, b) => (a.name > b.name) ? 1 : -1)
            });
        }

        data.combat.categories.forEach(category => {
            if (category.items.length > 0) {
                category.items.forEach(item => {
                    if (item.data.properties?.weapon) {
                        // Compute MOD
                        const itemModStat = item.data.skill.split("@")[1];
                        const itemModBonus = parseInt(item.data.skillBonus);

                        item.data.mod = this.actor.computeWeaponMod(itemModStat, itemModBonus);

                        // Compute DM
                        const itemDmgBase = item.data.dmgBase;
                        const itemDmgStat = item.data.dmgStat.split("@")[1];
                        const itemDmgBonus = parseInt(item.data.dmgBonus);

                        item.data.dmg = this.actor.computeDm(itemDmgBase, itemDmgStat, itemDmgBonus)
                    }
                });
            }
        });

        if (COC.debug) console.log("COC | EncounterSheet getData", data);
        return data;
    }
}
