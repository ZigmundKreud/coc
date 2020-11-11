export const COC = {};

COC.itemProperties = {
    "equipable": "COC.properties.equipable",
    "stackable": "COC.properties.stackable",
    "unique": "COC.properties.unique",
    "2h": "COC.properties.2H",
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
    "creature" : "COC.properties.creature",
    "proneshot" : "COC.properties.proneshot",
    "salve" : "COC.properties.salve",
    "explosive" : "COC.properties.explosive"
};

COC.profiles = [];
COC.paths = [];
COC.capacities = [];
COC.traits = [];

// Mise en cache des données de profil
COC.getProfiles = async function () {
    let profiles = await game.packs.get("coc.profiles").getContent().then(index => index.map(entity => entity.data));
    COC.profiles = profiles;
    console.debug("Profiles loaded");
};

// Mise en cache des données de voies
COC.getPaths = async function () {
    let paths = await game.packs.get("coc.paths").getContent().then(index => index.map(entity => entity.data));
    COC.paths = paths;
    // console.log(COC.paths);
    console.debug("Paths loaded");
};

// Mise en cache des données de capacités
COC.getCapacities = async function () {
    let capacities = await game.packs.get("coc.capacities").getContent().then(index => index.map(entity => entity.data));
    COC.capacities = capacities;
    // console.log(COC.capacities);
    console.debug("Capacities loaded");
};

// Mise en cache des données de capacités
COC.getTraits = async function () {
    let traits = await game.packs.get("coc.traits").getContent().then(index => index.map(entity => entity.data));
    COC.traits = traits;
    // console.log(COC.traits);
    console.debug("Traits loaded");
};

COC.itemTypes = {
    "profile": "COC.category.profile",
    "capacity": "COC.category.capacity",
    "path": "COC.category.path",
    "trait": "COC.category.trait",
    "item": "COC.category.item"
};

