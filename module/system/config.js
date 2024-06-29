export const System = {};

System.label = "Chroniques Oubliées Contemporain";
System.name = "coc";
System.rootPath = "/systems/" + System.name;
System.dataPath = System.rootPath + "/data";
System.templatesPath = System.rootPath + "/templates";
System.debugMode = true;
System.DEV_MODE = false;

System.ASCII = `
   ******    *******     ******
  **////**  **/////**   **////**
 **    //  **     //** **    //
/**       /**      /**/**
/**       /**      /**/**
//**    **//**     ** //**    **
 //******  //*******   //******
  //////    ///////     ////// `;

export const COC = {};

COC.stats = {
    "str": "COC.stats.str.label",
    "dex": "COC.stats.dex.label",
    "con": "COC.stats.con.label",
    "int": "COC.stats.int.label",
    "wis": "COC.stats.wis.label",
    "cha": "COC.stats.cha.label"
};

COC.skills = {
    "melee": "COC.attacks.melee.label",
    "ranged": "COC.attacks.ranged.label",
    "magic": "COC.attacks.magic.label"
};

COC.statAbbreviations = {
    "str": "COC.stats.str.abbrev",
    "dex": "COC.stats.dex.abbrev",
    "con": "COC.stats.con.abbrev",
    "int": "COC.stats.int.abbrev",
    "wis": "COC.stats.wis.abbrev",
    "cha": "COC.stats.cha.abbrev"
};

COC.itemProperties = {
    "equipable": "COC.properties.equipable",
    "stackable": "COC.properties.stackable",
    "unique": "COC.properties.unique",
    "ranged": "COC.properties.ranged",
    "proficient": "COC.properties.proficient",
    "finesse": "COC.properties.finesse",
    "two-handed": "COC.properties.two-handed",
    "equipment": "COC.properties.equipment",
    "weapon": "COC.properties.weapon",
    "protection": "COC.properties.protection",
    "reloadable": "COC.properties.reloadable",
    "bow": "COC.properties.bow",
    "crossbow": "COC.properties.crossbow",
    "powder": "COC.properties.powder",
    "throwing": "COC.properties.throwing",
    "dr": "COC.properties.dr",
    "sneak": "COC.properties.sneak",
    "powerful": "COC.properties.powerful",
    "critscience": "COC.properties.critscience",
    "specialization": "COC.properties.specialization",
    "effects": "COC.properties.effects",
    "activable": "COC.properties.activable",
    "2H": "COC.properties.2H",
    "13strmin": "COC.properties.13strmin",
    "bashing": "COC.properties.bashing",
    "sling": "COC.properties.sling",
    "spell": "COC.properties.spell",
    "profile": "COC.properties.profile",
    "prestige": "COC.properties.prestige",
    "alternative": "COC.properties.alternative",
    "racial": "COC.properties.racial",
    "creature": "COC.properties.creature",
    "proneshot": "COC.properties.proneshot",
    "salve": "COC.properties.salve",
    "explosive": "COC.properties.explosive"
};

COC.itemSlots = {
    hand: "COC.slot.hand",
    head: "COC.slot.head",
    ear: "COC.slot.ear",
    neck: "COC.slot.neck",
    shoulders: "COC.slot.shoulders",
    chest: "COC.slot.chest",
    back: "COC.slot.back",
    arm: "COC.slot.arm",
    finger: "COC.slot.finger",
    wrist: "COC.slot.wrist",
    waist: "COC.slot.waist",
    legs: "COC.slot.legs",
    feet: "COC.slot.feet",
    belt: "COC.slot.belt",
    backpack: "COC.slot.backpack",
    quiver: "COC.slot.quiver"
};

COC.itemTypes = {
    "profile": "COC.category.profile",
    "capacity": "COC.category.capacity",
    "path": "COC.category.path",
    "trait": "COC.category.trait",
    "item": "COC.category.item",
    "encounterWeapon": "COC.category.encounterWeapon"
};

COC.itemCategories = {
    "armor": "COC.category.armor",
    "shield": "COC.category.shield",
    "melee": "COC.category.melee",
    "ranged": "COC.category.ranged",
    "spell": "COC.category.spell",
    "currency": "COC.category.currency",
    "jewel": "COC.category.jewel",
    "ammunition": "COC.category.ammunition",
    "consumable": "COC.category.consumable",
    "container": "COC.category.container",
    "mount": "COC.category.mount",
    "vehicle": "COC.category.vehicle",
    "trapping": "COC.category.trapping",
    "other": "COC.category.other"
}

COC.itemIcons = {
    "item": "icons/svg/tankard.svg",
    "capacity": "icons/svg/wing.svg",
    "profile": "icons/svg/statue.svg",
    "path": "icons/svg/upgrade.svg",
    "trait": "icons/svg/eye.svg",
    "encounterWeapon": "icons/svg/pawprint.svg"
}

COC.actorIcons = {
    "npc": "icons/svg/angel.svg",
    "encounter": "icons/svg/terror.svg"
}

COC.actorsAllowedItems = {
    "character": [
        "item",
        "capacity",
        "trait",
        "profile",
        "path"
    ],
    "npc": [
        "item",
        "capacity",
        "trait",
        "profile",
        "path"
    ],
    "encounter": [
        "item",
        "capacity",
        "encounterWeapon"
    ]
}

COC.debug = false;

/**
 * Creature sizes.
 * @enum {string}
 */
COC.actorSizes = {
    tiny: "COC.encounter.size.tiny",
    small: "COC.encounter.size.small",
    short: "COC.encounter.size.short",
    med: "COC.encounter.size.medium",
    big: "COC.encounter.size.big",
    huge: "COC.encounter.size.huge",
    colossal: "COC.encounter.size.colossal"
};

/**
 * Encounter archetype.
 * @enum {string}
 */
COC.encounterArchetypes = {
    standard: "COC.encounter.archetype.standard",
    rapide: "COC.encounter.archetype.rapide",
    puissant: "COC.encounter.archetype.puissant",
    inférieur: "COC.encounter.archetype.inférieur"
};
/**
 * Encounter category.
 * @enum {string}
 */
COC.encounterCategories = {
    vivante: "COC.encounter.category.vivante",
    humanoïde: "COC.encounter.category.humanoïde",
    "non-vivante": "COC.encounter.category.non-vivante"
};

/**
 * Encounter Boss Rank.
 * @enum {string}
 */
COC.encounterBossRanks = {
    "1": "COC.encounter.boss.rank.endurci",
    "2": "COC.encounter.boss.rank.expert",
    "3": "COC.encounter.boss.rank.elite",
    "4": "COC.encounter.boss.rank.legendaire"
};

COC.DICE_VALUES = {
    "1d4": "1d4",
    "1d6": "1d6",
    "1d8": "1d8",
    "1d10": "1d10",
    "1d12": "1d12",
    "1d20": "1d20"
};

COC.DAMAGE_STAT = {
    "@stats.str.mod": "COC.stats.str.label",
    "@stats.dex.mod": "COC.stats.dex.label",
    "@stats.con.mod": "COC.stats.con.label",
    "@stats.int.mod": "COC.stats.int.label",
    "@stats.wis.mod": "COC.stats.wis.label",
    "@stats.cha.mod": "COC.stats.cha.label"
};

COC.SKILL = {
    "@attacks.melee.mod": "COC.attacks.melee.label",
    "@attacks.ranged.mod": "COC.attacks.ranged.label",
    "@attacks.magic.mod": "COC.attacks.magic.label"
};

COC.DURATION = {
    rounds: "COC.ui.rounds",
    minutes: "COC.ui.minutes",
    hours: "COC.ui.hours",
    days: "COC.ui.days"
};

COC.SPELLCASTING = {
    "@stats.int.mod": "COC.stats.int.label",
    "@stats.wis.mod": "COC.stats.wis.label",
    "@stats.cha.mod": "COC.stats.cha.label"
};

COC.FAMILY = {
    "action": "COC.Family.action",
    "adventure": "COC.Family.adventure",
    "reflexion": "COC.Family.reflexion"
};

COC.SETTING = {
    "base": "COC.setting.base",
    "epouvante": "COC.setting.epouvante",
    "pulp": "COC.setting.pulp",
    "zombis": "COC.setting.zombis",
    "espionnage": "COC.setting.espionnage",
    "surhumains": "COC.setting.surhumains",
    "cyberpunk": "COC.setting.cyberpunk"
};

COC.RELOAD = {
    s: "COC.ui.simpleAction",
    l: "COC.ui.limitedAction"
};
