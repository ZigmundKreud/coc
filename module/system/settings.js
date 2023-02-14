
export const registerSystemSettings = function() {

    const reload = foundry.utils.debounce(() => window.location.reload(), 250);

    game.settings.register("coc", "useRecovery", {
        name: "SETTINGS.useRecovery.name",
        hint: "SETTINGS.useRecovery.hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("coc", "useFortune", {
        name: "SETTINGS.useFortune.name",
        hint: "SETTINGS.useFortune.hint",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("coc", "useMadness", {
        name: "SETTINGS.useMadness.name",
        hint: "SETTINGS.useMadness.hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("coc", "useMana", {
        name: "SETTINGS.useMana.name",
        hint: "SETTINGS.useMana.hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("coc", "useDamageResistance", {
        name: "SETTINGS.useDamageResistance.name",
        hint: "SETTINGS.useDamageResistance.hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("coc", "displayDifficulty", {
        name: "SETTINGS.displayDifficulty.name",
        hint: "SETTINGS.displayDifficulty.hint",
        scope: "world",
        config: true,
        default: "none",
        type: String,
        choices: {
            "none" : "SETTINGS.displayDifficulty.none",
            "all" : "SETTINGS.displayDifficulty.all",
            "gm" : "SETTINGS.displayDifficulty.gm"
        }
    });

    game.settings.register("coc", "useComboRolls", {
        name: "SETTINGS.useComboRolls.name",
        hint: "SETTINGS.useComboRolls.hint",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("coc", "useVarInit", {
        name: "SETTINGS.useVarInit.name",
        hint: "SETTINGS.useVarInit.hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: reload
    });

    game.settings.register("coc", "displayChatDamageButtonsToAll", {
        name: "SETTINGS.displayChatDamageButtonsToAll.name",
        hint: "SETTINGS.displayChatDamageButtonsToAll.hint",
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
            "0" : "SETTINGS.moveItem.copy",
            "1" : "SETTINGS.moveItem.move"
        },
        default: "0",
        config: true
    });

    game.settings.register("coc", "lockItems",{
        name: "SETTINGS.lockItems.name",
        hint: "SETTINGS.lockItems.hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("coc", "explosiveDice",{
        name: "SETTINGS.explosiveDice.name",
        hint: "SETTINGS.explosiveDice.hint",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("coc", "checkFreeHandsBeforeEquip", {
        name: "SETTINGS.checkFreeHandsBeforeEquip.name",
        hint: "SETTINGS.checkFreeHandsBeforeEquip.hint",
        scope: "world",
        config: true,
        default: "none",
        type: String,
        choices: {
            "none" : "SETTINGS.checkFreeHandsBeforeEquip.none",
            "all" : "SETTINGS.checkFreeHandsBeforeEquip.all",
            "gm" : "SETTINGS.checkFreeHandsBeforeEquip.gm"
        }
    });

    game.settings.register("coc", "checkArmorSlotAvailability", {
        name: "SETTINGS.checkArmorSlotAvailability.name",
        hint: "SETTINGS.checkArmorSlotAvailability.hint",
        scope: "world",
        config: true,
        default: "none",
        type: String,
        choices: {
            "none" : "SETTINGS.checkArmorSlotAvailability.none",
            "all" : "SETTINGS.checkArmorSlotAvailability.all",
            "gm" : "SETTINGS.checkArmorSlotAvailability.gm"
        }
    });

    game.settings.register("coc", "settingCyberpunk",{
        name: "SETTINGS.settingCyberpunk.name",
        hint: "SETTINGS.settingCyberpunk.hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: reload
    });

};
