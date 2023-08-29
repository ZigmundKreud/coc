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
            
            if (modifications.label) status.label = modifications.label;
            if (modifications.changes) status.changes = modifications.changes;
			if (modifications.icon) status.icon = modifications.icon;

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
        label:"COC.CustomStatus.prone",
        changes:[
			{
				key: "data.attacks.melee.bonus",
				mode: 2,
				value: -5
			},       

			{
				key: "data.attacks.ranged.bonus",
				mode: 2,
				value: -5
			},           

			{
				key: "data.attacks.magic.bonus",
				mode: 2,
				value: -5
			},

			{
				key: "data.attributes.def.bonus",
				mode: 2,
				value: -5
			}
		]
    },
    "blind":{
        label:"COC.CustomStatus.blind",
        changes:[
			{
				key: "data.attacks.melee.bonus",
				mode: 2,
				value: -5
			},

			{
				key: "data.attacks.ranged.bonus",
				mode: 2,
				value: -10
			},

			{
				key: "data.attacks.magic.bonus",
				mode: 2,
				value: -5
			},          

			{
				key: "data.attributes.init.bonus",
				mode: 2,
				value: -5
			}          		
		]        
    },
    "stun":{
        label:"COC.CustomStatus.stun",
        changes:[
			{
				key: "data.attributes.def.bonus",
				mode: 2,
				value: -5
			}
		]        
    },
    "downgrade":{
        label:"COC.CustomStatus.weak",
		changes:[
			{
				key: "flags.coc.weakened",
				mode: 5,
				value: "true"
			}
		] 
    },
    "restrain":{
        label:"COC.CustomStatus.restrain",
		changes:[
			{
				key: "flags.coc.weakened",
				mode: 5,
				value: "true"
			}
		]        
    },
	"dead":{
		label:"COC.CustomStatus.dead",
        changes:[
			{
				key: "data.attributes.hp.value",
				mode: 5,
				value: "0"
			}
		] 
	}
}

