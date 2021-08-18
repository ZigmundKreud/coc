
export const registerSystemSettings = function() {

    game.settings.register("coc", "useRecovery", {
        name: "Points de récupération",
        hint: "Utiliser la règle optionnelle des points de récupération",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("coc", "useFortune", {
        name: "Points de chance",
        hint: "Utiliser la règle optionnelle des points de chance",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("coc", "useMadness", {
        name: "Points de Folie",
        hint: "Afficher les points de folie sur la fiche de personnage",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("coc", "useMana", {
        name: "Points de Mana",
        hint: "Utiliser la règle optionnelle des points de mana",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("coc", "useDamageResistance", {
        name: "Résistance aux dommages",
        hint: "Afficher la résistance aux dommages sur la feuille de personnage",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("coc", "displayDifficulty", {
        name: "Affiche la difficulté",
        hint: "Active l'affichage de la difficulté sur les jets de compétences/attributs et d'armes.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("coc", "useComboRolls", {
        name: "Active les jets \"combo\"",
        hint: "Permet de lancer les jets d'attaque et de dommages simultanément.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("coc", "cocthSkin", {
        name: "Skin COC Cthulhu",
        hint: "Utiliser la skin COC Cthulhu",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: checked => {
            game.coc.skin = (checked) ? "cocth" : "base";
            window.location.reload()
        }
    });


};
