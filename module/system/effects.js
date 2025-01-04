/**
 * Modifie l'ordre des statuts pour mettre ceux de COC en premier et en vert
 */
export function customizeStatusEffects() {
    /// Parcours des modifications
    for(let modificationId in EffectsModifications) {
        // Recherche du status correspondant à la modification
		let statusIndex = CONFIG.statusEffects.findIndex(eff=>eff.id === modificationId);
		let status;

        // Si le statut a été trouvé
        // Modification du libellé et ajout de l'effet (des modificateurs) si nécessaire
        if (statusIndex){				
            // Récupération de l'objet de modification concerné 
			status = CONFIG.statusEffects[statusIndex];
            let modifications = EffectsModifications[modificationId];
            
            if (modifications.name) status.name = modifications.name;
            if (modifications.changes) status.changes = modifications.changes;
			if (modifications.img) status.img = modifications.img;

        }
		CONFIG.statusEffects.splice(statusIndex,1);
		CONFIG.statusEffects.unshift(status);
    }
}

/**
 * Modificateurs des différents status de COC
 */
export const EffectsModifications = {     
    "prone":{
        name:"COC.CustomStatus.prone",
        changes:[
			{
				key: "system.attacks.melee.bonus",
				mode: 2,
				value: -5
			},       

			{
				key: "system.attacks.ranged.bonus",
				mode: 2,
				value: -5
			},           

			{
				key: "system.attacks.magic.bonus",
				mode: 2,
				value: -5
			},

			{
				key: "system.attributes.def.bonus",
				mode: 2,
				value: -5
			}
		]
    },
    "blind":{
        name:"COC.CustomStatus.blind",
        changes:[
			{
				key: "system.attacks.melee.bonus",
				mode: 2,
				value: -5
			},

			{
				key: "system.attacks.ranged.bonus",
				mode: 2,
				value: -10
			},

			{
				key: "system.attacks.magic.bonus",
				mode: 2,
				value: -5
			},          

			{
				key: "system.attributes.init.bonus",
				mode: 2,
				value: -5
			}          		
		]        
    },
    "stun":{
        name:"COC.CustomStatus.stun",
        changes:[
			{
				key: "system.attributes.def.bonus",
				mode: 2,
				value: -5
			}
		]        
    },
    "downgrade":{
        name:"COC.CustomStatus.weak",
		changes:[
			{
				key: "flags.coc.weakened",
				mode: 5,
				value: "true"
			}
		] 
    },
    "restrain":{
        name:"COC.CustomStatus.restrain",
		changes:[
			{
				key: "flags.coc.weakened",
				mode: 5,
				value: "true"
			}
		]        
    },
	"dead":{
		name:"COC.CustomStatus.dead",
        changes:[
			{
				key: "system.attributes.hp.value",
				mode: 5,
				value: "0"
			}
		] 
	}
}

