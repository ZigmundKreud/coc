export class Species {

    static addToActor(actor, event, itemData) {
        if (actor.items.filter(item => item.type === "species").length > 0) {
            ui.notifications.error("Vous avez déjà une race.");
            return false;
        } else {
            let items = coc.capacities.filter(e => itemData.data.capacities.includes(e._id));
            items.push(itemData);
            return actor.createOwnedItem(items);
        }
    }

    static removeFromActor(actor, event, itemData) {
        const actorData = actor.data;
        Dialog.confirm({
            title: "Supprimer la race ?",
            content: `<p>Etes-vous sûr de vouloir supprimer la race de ${actor.name} ?</p>`,
            yes: () => {
                let items = actorData.items.filter(i => i.type === "capacity" && i.data.scope === "species").map(e => e._id);
                items.push(itemData.data._id);
                return actor.deleteOwnedItem(items);
            },
            defaultYes: false
        });
    }
}