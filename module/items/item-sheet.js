/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

export class CocItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["coc", "sheet", "item"],
            template: "/modules/coc/templates/items/item-sheet.hbs",
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }
}
