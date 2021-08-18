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
    }

    /* -------------------------------------------- */

    /** @override */
    getData(options) {
        // const context = super.getData(options);

        // Basic data
        let isOwner = this.actor.isOwner;

        const data = {
            owner: isOwner,
            limited: this.actor.limited,
            options: this.options,
            editable: this.isEditable,
            config : game.coc.config,
            cssClass: isOwner ? "editable" : "locked",
            isCharacter: this.actor.type === "character",
            isNPC: this.actor.type === "npc",
            isVehicle: this.actor.type === 'vehicle',
            rollData: this.actor.getRollData.bind(this.actor)
        };

        // The Actor's data
        const actorData = this.actor.data.toObject(false);
        data.actor = actorData;
        data.data = actorData.data;

        data.folded = {
            "combat": (actorData.data.settings?.combat) ? actorData.data.settings?.combat.folded : [],
            "inventory": (actorData.data.settings?.inventory) ? actorData.data.settings?.inventory.folded : [],
            "capacities": (actorData.data.settings?.capacities) ? actorData.data.settings?.capacities.folded : [],
            "effects": (actorData.data.settings?.effects) ? actorData.data.settings?.effects.folded : []
        };

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

        // console.log(actor.data);
        // console.log(actor.data.data);
        // context.data.stats = actor.data.data.stats;
        // context.data.attacks = actor.data.data.attacks;
        // actor.data.attributes = Object.values(actor.data.data.attributes);
        // actor.data.aptitudes = Object.values(actor.data.data.aptitudes);
        // actor.data.resources = Object.values(actor.data.data.resources);
        // actor.data.equipment = actor.data.items.filter(i => i.type === "item");

        // const idx = await game.packs.get("coc.capacities").getContent();
        // const caps = idx.concat(game.items.filter(item => item.data.type === "capacity")).map(e => e.data);
        // let paths = data.items.filter(i => i.type === "path");
        // let capacities = data.items.filter(i => i.type === "capacity");
        // const capKeys = capacities.map(c => c.data.key);
        // for(let p of paths){
        //     p.capacities = p.data.capacities.map(cid => {
        //         let cap = caps.find(c => c._id === cid);
        //         cap.checked = capKeys.includes(cap.data.key);
        //         return cap;
        //     });
        // }
        // data.paths = paths;
        // data.capacities = capacities;
        // data.trait = data.items.find(i => i.type === "trait");
        // data.profile = data.items.find(i => i.type === "profile");
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
