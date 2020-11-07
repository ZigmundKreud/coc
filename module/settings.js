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
};
