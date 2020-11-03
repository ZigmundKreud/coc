/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

export class CocItem extends Item {

    /** @override */
    prepareData() {
        super.prepareData();
        const itemData = this.data;
        console.log(itemData);
    }
}
