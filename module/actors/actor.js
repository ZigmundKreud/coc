/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
import { Stats } from "../system/stats.js";
import { COC } from "../system/config.js";
import { Macros } from "../system/macros.js";

export class CoCActor extends Actor {

    /* -------------------------------------------- */
    /*  Constructor                                 */
    /* -------------------------------------------- */
    /* Définition des images par défaut             */
    /* -------------------------------------------- */
    constructor(...args) {
        let data = args[0];

        if (!data.img && COC.actorIcons[data.type]){
            data.img = COC.actorIcons[data.type];
            if (!data.token) data.token = {};
            if (!data.token.img) data.token.img = COC.actorIcons[data.type];
        }
        super(...args);
    }

    /* -------------------------------------------- */
    /*  Data Preparation                            */
    /* -------------------------------------------- */
    /* Avant application des effets                 */
    /* -------------------------------------------- */
    /** @override */
    prepareBaseData() {
        let actorData = this;
        if (!actorData.system.settings) {
            actorData.system.settings = {
                "combat": { "folded": [] },
                "inventory": { "folded": [] },
                "capacities": { "folded": [] },
                "effects": { "folded": [] }
            };
        }
    }

    /* -------------------------------------------- */
    /* Après application des effets                 */
    /* -------------------------------------------- */
    /** @override */
    prepareDerivedData() {
        let actorData = this;
        if (actorData.type === "encounter") this._prepareDerivedEncounterData(actorData);
        else this._prepareDerivedCharacterData(actorData);
    }

    /**
     *
     * @param {*} actorData
     */
    _prepareDerivedEncounterData(actorData) {
        // Stats
        this.computeNpcMods(actorData);

        // Attributs
        let attributes = actorData.system.attributes;

        // Initiative
        attributes.init.value = attributes.init.base + attributes.init.bonus;

        // Points de vie
        attributes.hp.max = attributes.hp.base + attributes.hp.bonus;

        // Défense
        attributes.def.value = attributes.def.base + attributes.def.bonus;

        // Réduction de dommages
        attributes.dr.value = attributes.dr.base.value + attributes.dr.bonus.value;

        // Attaques
        let attacks = actorData.system.attacks;
        for (let attack of Object.values(attacks)) {
            attack.mod = attack.base + attack.bonus;
        }
    }

    /**
     *
     * @param {*} actorData
     */
    _prepareDerivedCharacterData(actorData) {
        if(actorData.type === "npc") this.computeNpcMods(actorData);
        else this.computeMods(actorData);

        this.computeAttributes(actorData);
        this.computeAttacks(actorData);
        this.computeDef(actorData);
        this.computeXP(actorData);
    }

    /**
     *
     * @param {*} items
     * @returns
     */
    getProfile(items) {
        let profile = items.find(i => i.type === "profile")
        if(profile) return profile;
        else return null;
    }

    /**
     *
     * @param {*} items
     * @returns
     */
    getProtection(items) {
        const protections = items.filter(i => i.type === "item" && i.system.worn && i.system.def).map(i => i.system.def);
        return protections.reduce((acc, curr) => acc + curr, 0);
    }

    /**
     * @name
     * @description Calcule le malus due à la Défense. Le bonus d'une armure diminue le malus d'autant

     * @param {*} items
     * @returns {int} retourne le malus 0 ou un nombre négatif
     */
    getMalusFromProtection(items) {
        let malus = 0;
        let protections = items.filter(i => i.type === "item" && i.system.subtype === "armor" && i.system.worn && i.system.def).map(i => (-1 * i.system.defBase) + i.system.defBonus);
        if (protections.length > 0) malus = protections.reduce((acc, curr) => acc + curr, 0);
        return malus;
    }

    /**
     *
     * @param {*} items
     * @returns
     */
    getResistance(items) {
        const resistances = items.filter(i => i.type === "item" && i.system.worn && i.system.dr).map(i => i.system.dr);
        return resistances.reduce((acc, curr) => acc + curr, 0);
    }

    /**
     *
     * @param {*} items
     * @returns
     */
    getCurrentXP(items) {
        const capacities = items.filter(i => i.type === "capacity");
        return capacities.map(cap => (cap.system.rank > 2) ? 2 : 1).reduce((acc, curr) => acc + curr, 0);
    }

    /**
     *
     * @param {*} actorData
     */
    computeMods(actorData) {
        let stats = actorData.system.stats;
        for(const stat of Object.values(stats)){
            stat.value = stat.base + stat.bonus;
            stat.mod = Stats.getModFromStatValue(stat.value);
        }
    }

    /**
     *
     * @param {*} actorData
     */
    computeNpcMods(actorData) {
        let stats = actorData.system.stats;
        for(const stat of Object.values(stats)){
            stat.value = Stats.getStatValueFromMod(stat.mod);
        }
    }

    /**
     *
     * @param {*} actorData
     */
    computeAttributes(actorData) {

        let stats = actorData.system.stats;
        let attributes = actorData.system.attributes;
        let items = actorData.items;
        let lvl = actorData.system.level.value;

        const profile = this.getProfile(items);
        const protection = this.getProtection(items);

        // Initiative
        attributes.init.base = stats.dex.value;
        attributes.init.penalty = this.getMalusFromProtection(items);
        attributes.init.value = attributes.init.base + attributes.init.bonus + attributes.init.penalty;

         // Points de chance
        attributes.fp.base = this.computeBaseFP(stats.cha.mod, profile);
        attributes.fp.max = attributes.fp.base + attributes.fp.bonus;

        // Réduction des dommages
        attributes.dr.value = attributes.dr.base.value + attributes.dr.bonus.value;

        // Points de récupération
        attributes.rp.max = attributes.rp.base + attributes.rp.bonus;

        // Points de vie
        attributes.hp.max = attributes.hp.base + attributes.hp.bonus;

        // Points de magie
        attributes.mp.base = lvl + stats.cha.mod;
        attributes.mp.max = attributes.mp.base + attributes.mp.bonus;

        attributes.hd.value = (profile && profile.system.dv) ? profile.system.dv : attributes.hd.value;
    }

    /**
     *
     * @param {*} actorData
     */
    computeAttacks(actorData) {

        let stats = actorData.system.stats;
        let attacks = actorData.system.attacks;

        let melee = attacks.melee;
        let ranged = attacks.ranged;
        let magic = attacks.magic;

        let strMod = stats.str.mod;
        let dexMod = stats.dex.mod;

        const profile = this.getProfile(actorData.items);

        // STATS RELATED TO PROFILE
        attacks.magic.stat = (profile && profile.system.spellcasting) ? profile.system.spellcasting : attacks.magic.stat;

        let magicMod = eval(attacks.magic.stat.split("@")[1]);

        const atcBonus = (profile) ? profile.system.bonuses.atc : 0;
        const atdBonus = (profile) ? profile.system.bonuses.atd : 0;
        const atmBonus = (profile) ? profile.system.bonuses.atm : 0;

        melee.base = (strMod) ? strMod + atcBonus : atcBonus;
        ranged.base = (dexMod) ? dexMod + atdBonus : atdBonus;
        magic.base = (magicMod) ? magicMod + atmBonus : atmBonus;

        for (let attack of Object.values(attacks)) {
            attack.mod = attack.base + attack.bonus + attack.malus;
        }

    }

    /**
     *
     * @param {*} actorData
     */
    computeDef(actorData) {
        let stats = actorData.system.stats;
        let attributes = actorData.system.attributes;

        // Calcule DEF et RD
        const protection = this.getProtection(actorData.items);
        const dr = this.getResistance(actorData.items);

        attributes.def.base = 10 + protection + stats.dex.mod;
        attributes.def.value = attributes.def.base + attributes.def.bonus;

        attributes.dr.base.value = (dr) ? dr : 0;
        attributes.dr.value = attributes.dr.base.value + attributes.dr.bonus.value;

    }

    /**
     * @name computeXP
     * @description calcule les XPs dépensés dans les capacités
     * @param {*} actorData
     */
    computeXP(actorData) {
        let items = actorData.items;
        let lvl = actorData.system.level.value;
        const alert = actorData.system.alert;

        const profile = this.getProfile(actorData.items);

        let currxp = this.getCurrentXP(items);
        const maxxp = (profile && profile.system.bonuses.xp) ? 2 * lvl + profile.system.bonuses.xp : 2 * lvl;

        // UPDATE XP
        actorData.system.xp.max = maxxp;
        actorData.system.xp.value = maxxp - currxp;

        if (maxxp - currxp < 0) {
            const diff = currxp - maxxp;
            alert.msg = (diff == 1) ? `Vous avez dépensé ${diff} point de capacité en trop !` : `Vous avez dépensé ${diff} points de capacité en trop !`;
            alert.type = "error";
        } else if (maxxp - currxp > 0) {
            const diff = maxxp - currxp;
            alert.msg = (diff == 1) ? `Il vous reste ${diff} point de capacité à dépenser !` : `Il vous reste ${diff} points de capacité à dépenser !`;
            alert.type = "info";
        } else {
            alert.msg = null;
            alert.type = null;
        }
    }

    /**
     * @name computeWeaponMod
     * @description calcule le modificateur final pour une arme
     *  Total = Mod lié à la caractéristique + Mod lié au bonus
     * @param {int} itemModStat le modificateur issue de la caractéristique
     * @param {int} itemModBonus le modificateur issue du bonus

     * @returns {int} retourne mod
     */
     computeWeaponMod(itemModStat, itemModBonus) {
        let total = 0;

        const fromStat = eval("this.system." + itemModStat);
        total = fromStat + itemModBonus;

        return total;
    }

    /**
     * @name computeDm
     * @description calculer les dégâts d'une arme

     * @param {string} itemDmgBase le modificateur issue de la caractéristique
     * @param {string} itemDmgStat la caractéristique utilisée pour les dégâts
     * @param {int} itemDmgBonus le bonus aux dégâts

     * @returns {string} retourne la chaine de caractères utilisée pour le lancer de dés
     */
    computeDm(itemDmgBase, itemDmgStat, itemDmgBonus) {
        let total = itemDmgBase;

        const fromStat = eval("this.system." + itemDmgStat);
        const fromBonus = (fromStat) ? parseInt(fromStat) + itemDmgBonus : itemDmgBonus;
        if (fromBonus < 0) total = itemDmgBase + " - " + parseInt(-fromBonus);
        if (fromBonus > 0) total = itemDmgBase + " + " + fromBonus;

        return total;
    }

    /**
     * @name rollStat
     * @description Lance un dé pour l'habilité demandée
     * @returns {Promise}
     */
    rollStat(stat, options = {}) {
        const { bonus = 0, malus = 0 } = options;
        return Macros.rollStatMacro(this, stat, bonus, malus, null, options.label, options.descr, options.dialog, options.dice, options.difficulty);
    }

    /**
    * @name syncItemActiveEffects
    * @param {*} item
    * @description synchronise l'état des effets qui appartiennent à un item équipable avec l'état "équipé" de cet item
    * @returns {Promise}
    */
     syncItemActiveEffects(item){
        // Récupération des effets qui proviennent de l'item
        let effectsData = this.effects.filter(effect=>effect.origin.endsWith(item.id))?.map(effect=> duplicate(effect));
        if (effectsData.length > 0){
            effectsData.forEach(effect=>effect.disabled = !item.system.worn);

            this.updateEmbeddedDocuments("ActiveEffect", effectsData);
        }
    }

    /**
     * @name rollWeapon
     * @description
     * @returns {Promise}
     */
     rollWeapon(item, options = {}) {
        const { bonus = 0, malus = 0, dmgBonus = 0, dmgOnly = false } = options;

        return Macros.rollItemMacro(item.id, item.name, item.type, bonus, malus, dmgBonus, dmgOnly);
     }

    /**
     *
     * @param {*} item
     * @param {*} bypassChecks
     * @returns
     */
     toggleEquipItem(item, bypassChecks) {
        if (!this.canEquipItem(item, bypassChecks)) return;

        const equipable = item.system.properties.equipable;
        if(equipable){
            let itemData = duplicate(item);
            itemData.system.worn = !itemData.system.worn;

            return item.update(itemData).then((item)=>{
                AudioHelper.play({ src: "/systems/coc/sounds/sword.mp3", volume: 0.8, autoplay: true, loop: false }, false);
                if (!bypassChecks) this.syncItemActiveEffects(item);
            });
        }
    }

    /**
     * Check if an item can be equiped
     * @param item
     * @param bypassChecks
     */
     canEquipItem(item, bypassChecks) {
        if (!this.items.some(it=>it.id === item.id)){
            ui.notifications.warn(game.i18n.format('COC.notification.MacroItemMissing', {item:item.name}));
            return false;
        }
        let itemData = item.system;
        if (!itemData?.properties.equipment || !itemData?.properties.equipable){
            ui.notifications.warn(game.i18n.format("COC.notification.ItemNotEquipable", {itemName:item.name}));
            return;
        }

        if (!this._hasEnoughFreeHands(item, bypassChecks)){
            ui.notifications.warn(game.i18n.localize("COC.notification.NotEnoughFreeHands"));
            return false;
        }
        if (!this._isArmorSlotAvailable(item, bypassChecks)){
            ui.notifications.warn(game.i18n.localize("COC.notification.ArmorSlotNotAvailable"));
            return false;
        }

        return true;
    }

   /**
     * Check if actor has enough free hands to equip this item
     * @param event
     * @param bypassChecks
     * @private
     */
    _hasEnoughFreeHands(item, bypassChecks){
        // Si le contrôle de mains libres n'est pas demandé, on renvoi Vrai
        let checkFreehands = game.settings.get("coc", "checkFreeHandsBeforeEquip");
        if (!checkFreehands || checkFreehands === "none") return true;

        // Si le contrôle est ignoré ponctuellement avec la touche MAJ, on renvoi Vrai
        if (bypassChecks && (checkFreehands === "all" || (checkFreehands === "gm" && game.user.isGM))) return true;

        // Si l'objet est équipé, on tente de le déséquiper donc on ne fait pas de contrôle et on renvoi Vrai
        if (item.system.worn) return true;

        // Si l'objet n'est pas tenu en main, on renvoi Vrai
        if (item.system.slot !== "hand") return true;

        // Nombre de mains nécessaire pour l'objet que l'on veux équipper
        let neededHands = item.system.properties["2H"] ? 2 : 1;

        // Calcul du nombre de mains déjà utilisées
        let itemsInHands = this.items.filter(item=>item.system.worn && item.system.slot === "hand");
        let usedHands = 0;
        itemsInHands.forEach(item=>usedHands += item.system.properties["2H"] ? 2 : 1);

        return usedHands + neededHands <= 2;
    }

    /**
     * Check if armor slot is available to equip this item
     * @param event
     * @param bypassChecks
     * @private
     */
    _isArmorSlotAvailable(item, bypassChecks){
        // Si le contrôle de disponibilité de l'emplacement d'armure n'est pas demandé, on renvoi Vrai
        let checkArmorSlotAvailability = game.settings.get("coc", "checkArmorSlotAvailability");
        if (!checkArmorSlotAvailability || checkArmorSlotAvailability === "none") return true;

        // Si le contrôle est ignoré ponctuellement avec la touche MAJ, on renvoi Vrai
        if (bypassChecks && (checkArmorSlotAvailability === "all" || (checkArmorSlotAvailability === "gm" && game.user.isGM))) return true;

        const itemData = item.system;

        // Si l'objet est équipé, on tente de le déséquiper donc on ne fait pas de contrôle et on renvoi Vrai
        if (itemData.worn) return true;

        // Si l'objet n'est pas une protection, on renvoi Vrai
        if (!itemData.properties.protection) return true;

        // Recheche d'une item de type protection déjà équipé dans le slot cible
        let equipedItem = this.items.find((slotItem)=>{
            let slotItemData = slotItem.system;

            return slotItemData.properties?.protection && slotItemData.properties.equipable && slotItemData.worn && slotItemData.slot === itemData.slot;
        });

        // Renvoie vrai si le le slot est libre, sinon renvoi faux
        return !equipedItem;
    }

    /**
     * Consume one item
     * @param {*} item
     * @returns
     */
    consumeItem(item) {
        const consumable = item.system.properties.consumable;
        const quantity = item.system.qty;

        if(consumable && quantity>0){
            let itemData = duplicate(item);
            itemData.system.qty = (itemData.system.qty > 0) ? itemData.system.qty - 1 : 0;
            AudioHelper.play({ src: "/systems/coc/sounds/gulp.mp3", volume: 0.8, autoplay: true, loop: false }, false);
            return item.update(itemData).then(item => item.applyEffects(this));
        }
    }

    /**
     * @name computeBaseFP
     * @description Calcule le nombre de points de chance de base
     * @public
     *
     * @param {Int} charismeMod Modificateur de charisme
     * @param {CofItem} profile Item de type profile
     *
     */
     computeBaseFP(charismeMod, profile) {
         if (game.settings.get("coc", "settingCyberpunk")){
             return 3 + charismeMod;
         }
         else {
            const fpBonusFromProfile = (profile && profile.system.bonuses.fp) ? profile.system.bonuses.fp : 0;
            return 2 + charismeMod + fpBonusFromProfile;
         }
    }
}
