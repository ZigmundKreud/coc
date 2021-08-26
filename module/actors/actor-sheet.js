/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import { CoCBaseSheet } from "./base-sheet.js";
import { COC } from "../system/config.js";

export class CoCActorSheet extends CoCBaseSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", game.coc.skin, "sheet", "actor", "character"],
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

        // Effects controls
        html.find('.effect-toggle').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let updateData = duplicate(this.actor);
            let effects = updateData.effects;
            const effect = effects.find(e => e._id === effectId);
            if (effect) {
                effect.disabled = !effect.disabled;
                return this.actor.update(updateData);
            }
        });
        html.find('.effect-create').click(ev => {
            ev.preventDefault();
            return this.actor.createEmbeddedDocuments("ActiveEffect", [{
                label: game.i18n.localize("COC.ui.newEffect"),
                icon: "icons/svg/aura.svg",
                origin: this.actor.uuid,
                "duration.rounds": undefined,
                disabled: true
            }]);
        });
        html.find('.effect-edit').click(this._onEditItem.bind(this));
        html.find('.effect-delete').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let effect = this.actor.effects.get(effectId);
            if (effect) effect.delete();
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData(options = {}) {
        const data = super.getData(options);
        if (COC.debug) console.log("COC | ActorSheet getData", data);
        
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

        // Gestion des boutons de modification des effets (visible pour l'actor)
        data.isEffectsEditable = true;
        if (COC.debug) console.log("COC | ActorSheet getData", data);
        return data;
    }

    /* -------------------------------------------- */

    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

}
