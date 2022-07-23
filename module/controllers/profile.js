import {Traversal} from "../utils/traversal.js";
import {Path} from "./path.js";

export class Profile {

    static addToActor(actor, itemData) {
        if (actor.items.filter(item => item.type === "profile").length > 0) {
            ui.notifications.error("Vous avez déjà un profil.");
            return false;
        } else {

            // ajoute le profil dans Items
            return actor.createEmbeddedDocuments("Item", [itemData], {}).then(newProfile => {
                let newProfileData = newProfile[0];
                return Traversal.mapItemsOfType(["path"]).then(paths => {
                    newProfileData.system.paths = newProfileData.system.paths.map(p => {
                        let pathData = paths[p._id];
                        pathData.flags.core = { sourceId: p.sourceId };
                        pathData.system.profile = {
                            _id: newProfileData._id,
                            name: newProfileData.name,
                            img: newProfileData.img,
                            key: newProfileData.system.key,
                            sourceId: newProfileData.flags.core.sourceId,
                        };
                        return pathData;
                    });
                    // add paths from profile
                    return Path.addPathsToActor(actor, newProfileData.system.paths)
                });
            });
        }
    }

     /**
     * @name removeFromActor
     * @description Supprime le profil et ses voies de l'acteur en paramètre
     * @public @static
     *
     * @param {CocActor} actor l'acteur sur lequel supprimer le profil
     * @param {CocItem} profile l'item profil à supprimer
     * @returns
     */
    static removeFromActor(actor, profile) {
        const paths = actor.items.filter(item => item.type === "path" && item.system.profile?._id === profile.id);
        return Dialog.confirm({
            title: "Supprimer le profil",
            content: `<p>Etes-vous sûr de vouloir supprimer le profil de ${actor.name} ?</p>`,
            yes: () => {
                Path.removePathsFromActor(actor, paths).then(() => {
                    ui.notifications.info(parseInt(paths.length) + ((paths.length > 1) ? " voies ont été supprimées." : " voie a été supprimée"));
                });
                ui.notifications.info("Le profil a été supprimé.");
                return actor.deleteEmbeddedDocuments("Item", [profile.id]);
            },
            defaultYes: false
        });
    }

}