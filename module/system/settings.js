
export const registerSystemSettings = function() {

    game.settings.register("coc", "useRecovery", {
        name: "Points de récupération",
        hint: "Utiliser la règle optionnelle des points de récupération",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("coc", "useFortune", {
        name: "Points de chance",
        hint: "Utiliser la règle optionnelle des points de chance",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("coc", "useMadness", {
        name: "Points de Folie",
        hint: "Afficher les points de folie sur la fiche de personnage",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("coc", "useMana", {
        name: "Points de Mana",
        hint: "Utiliser la règle optionnelle des points de mana",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("coc", "useDamageResistance", {
        name: "Résistance aux dommages",
        hint: "Afficher la résistance aux dommages sur la feuille de personnage",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("coc", "displayDifficulty", {
        name: "Affiche la difficulté",
        hint: "Active l'affichage de la difficulté sur les jets de compétences/attributs et d'armes",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("coc", "useComboRolls", {
        name: "Active les jets \"combo\"",
        hint: "Permet de lancer les jets d'attaque et de dommages simultanément.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("coc", "displayChatDamageButtonsToAll", {
        name: "Affiche les boutons de dommages",
        hint: "Affiche les boutons d'application des dommages dans les messages de chat à tout le monde.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
    
    game.settings.register("coc", "moveItem", {
        name: "Mode de déplacement des items",
        hint: "Comportement du drag & drop d'un item sur une fiche de personnage (Maintenir MAJ lors du drop pour inverser)",
        scope: "world",
        type: String,
        choices: {
            "0" : "Copier l'item (par défaut dans Foundry)",
            "1" : "Déplacer l'item"
        },
        config: true,
        default: "0"        
    });   

    game.settings.register("coc", "lockItems",{
        name: "Verrouiller les objets",
        hint: "Interdire aux joueurs de modifier les objets",
        scope: "world",
        config: true,
        default: false,
        type: Boolean       
    });  
    
    game.settings.register("coc", "explosiveDice",{
        name: "Dé explosif pour les dommages",
        hint: "Si activée, les dommages utilisent la règle du dé explosif",
        scope: "world",
        config: true,
        default: true,
        type: Boolean       
    });

    game.settings.register("coc", "checkFreeHandsBeforeEquip", {
        name: "Vérification des mains libres",
        hint: "Vérifier que le personnage a assez de mains libres pour équiper un objet (Maintenir MAJ pour ignorer le contrôle)",
        scope: "world",
        config: true,
        default: "0",
        type: String,
        choices: {
            "0" : "Ne pas vérifier",
            "1" : "Vérification (ignorable par tous)",
            "2" : "Vérification (ignorable uniquement par le MJ)"
        }
    });  

    game.settings.register("coc", "checkArmorSlotAvailability", {
        name: "Vérification des emplacements d'armure",
        hint: "Vérifier la disponibilité d'un emplacement avant d'équiper une armure (Maintenir MAJ pour ignorer le contrôle)",
        scope: "world",
        config: true,
        default: "none",
        type: String,
        choices: {
            "none" : "Ne pas vérifier",
            "all" : "Vérification (ignorable par tous)",
            "gm" : "Vérification (ignorable uniquement par le MJ)"
        }
    }); 

};
