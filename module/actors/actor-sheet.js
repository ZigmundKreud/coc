/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class CoCActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", game.coc.skin, "sheet", "actor", "character"],
            template: "/systems/coc/templates/actors/actor-sheet.hbs",
            width: 950,
            height: 670,
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "stats"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        // if (!this.options.editable) return;


        html.find('.weapon-add').click(ev => {
            ev.preventDefault();
            const data = this.getData().data;
            data.weapons = Object.values(data.weapons);
            data.weapons.push({"name":"", "mod":null, "dmg":null});
            this.actor.update({'data.weapons': data.weapons});
        });

        html.find('.weapon-remove').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".weapon");
            const idx = elt.data("itemId");
            const data = this.getData().data;
            data.weapons = Object.values(data.weapons);
            if(data.weapons.length == 1) data.weapons[0] = {"name":"", "mod":null, "dmg":null};
            else data.weapons.splice(idx, 1);
            this.actor.update({'data.weapons': data.weapons});
        });

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
