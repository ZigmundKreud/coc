export class Inventory {

    /**
     * Callbacks on consume actions
     * @param event
     */
    static onConsume(actor, event) {
        const li = $(event.currentTarget).closest(".item");
        const item = actor.items.get(li.data("itemId"));
        const consumable = li.data("itemConsumable");
        if(consumable){
            let itemData = duplicate(item.data);
            itemData.data.qty = (itemData.data.qty > 0) ? itemData.data.qty - 1 : 0;
            return item.update(itemData).then(i=> item.applyEffects(actor, event));
            // return actor.updateOwnedItem(itemData);
        }
    }
}