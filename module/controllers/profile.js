import {Traversal} from "../utils/traversal.js";
import {Path} from "./path.js";

export class Profile {

    static async addToActor(actor, event, itemData) {
        if (actor.items.filter(item => item.type === "profile").length > 0) {
            ui.notifications.error("Vous avez déjà un profil.");
            return false;
        } else {
            // add paths from profile
            const pack = await game.packs.get("coc.paths").getContent();
            const ingame = game.items.filter(item => item.data.type === "path");
            let items = ingame.concat(pack.filter(item => itemData.data.paths.includes(item._id)));
            // add profile
            items.push(itemData);
            return actor.createOwnedItem(items)
        }
    }

    static removeFromActor(actor, event, entity) {
        const profileData = entity.data;
        return Dialog.confirm({
            title: "Supprimer le profil ?",
            content: `<p>Etes-vous sûr de vouloir supprimer le profil de ${actor.name} ?</p>`,
            yes: () => {
                // retrieve path data from profile paths
                const pathsKeys = Traversal.getItemsOfType("path").filter(p => profileData.data.paths.includes(p._id)).map(p => p.data.key);
                let items = Path.getPathsFromActorByKey(actor, pathsKeys);
                // add the profile item to be removed
                items.push(entity._id);
                return actor.deleteOwnedItem(items);
            },
            defaultYes: false
        });
    }

}