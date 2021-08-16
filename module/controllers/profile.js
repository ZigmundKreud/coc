import {Traversal} from "../utils/traversal.js";
import {Path} from "./path.js";

export class Profile {

    static addToActor(actor, event, itemData) {
        if (actor.items.filter(item => item.type === "profile").length > 0) {
            ui.notifications.error("Vous avez déjà un profil.");
            return false;
        } else {

            // ajoute le profil dans Items
            return actor.createEmbeddedDocuments("Item", [itemData], {}).then(newProfile => {
                let newProfileData = newProfile[0].data;
                return Traversal.mapItemsOfType(["path"]).then(paths => {
                    newProfileData.data.paths = newProfileData.data.paths.map(p => {
                        let pathData = paths[p._id];
                        pathData.flags.core = { sourceId: p.sourceId };
                        pathData.data.profile = {
                            _id: newProfileData._id,
                            name: newProfileData.name,
                            img: newProfileData.img,
                            key: newProfileData.data.key,
                            sourceId: newProfileData.flags.core.sourceId,
                        };
                        return pathData;
                    });
                    // add paths from profile
                    return Path.addPathsToActor(actor, newProfileData.data.paths)
                });
            });

            // add paths from profile
            console.log(itemData);
            // return game.packs.get("coc.paths").getDocuments().then(pack => {
            //     const ingame = game.items.filter(item => item.data.type === "path");
            //     let items = ingame.concat(pack.filter(item => itemData.data.paths.includes(item.id))).map(i => i.data);
            //     console.log(items);
            //     add profile
            //     items.push(itemData);
            //     return actor.createEmbeddedDocuments("Item", items, {});
            // });
            return actor.createEmbeddedDocuments("Item", [itemData], {});
        }
    }

    static removeFromActor(actor, event, entity) {
        const profileData = entity.data;
        return Dialog.confirm({
            title: "Supprimer le profil ?",
            content: `<p>Etes-vous sûr de vouloir supprimer le profil de ${actor.name} ?</p>`,
            yes: () => {
                entity.delete();
                // // retrieve path data from profile paths
                // const pathsKeys = Traversal.getItemsOfType("path").filter(p => profileData.data.paths.includes(p.id)).map(p => p.data.key);
                // let items = Path.getPathsFromActorByKey(actor, pathsKeys);
                // // add the profile item to be removed
                // items.push(entity._id);
                // return actor.deleteOwnedItem(items);
            },
            defaultYes: false
        });
    }

}