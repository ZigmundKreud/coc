export class Trait {

    static addToActor(actor, event, itemData) {
        if (actor.items.filter(item => item.type === "trait").length > 0) {
            ui.notifications.error("Vous possédez déjà un trait.");
            return false;
        } else {
            return actor.createEmbeddedDocuments("Item", [itemData], {});
        }
    }

    static removeFromActor(actor, entity) {
        console.log(entity);
        Dialog.confirm({
            title: "Supprimer le trait",
            content: `<p>Etes-vous sûr de vouloir supprimer le trait ${entity.name} de ${actor.name} ?</p>`,
            yes: () => {
                return entity.delete();
            },
            defaultYes: true
        });
    }

}