/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class CocActorSheet  extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", "sheet", "actor", "character"],
            template: "/modules/coc/templates/actors/actor-sheet.hbs",
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
    }

    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

}
