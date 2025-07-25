export class CharacterGeneration {

    static async _buildStatsMessage(actor, flavor, rolls) {
        const tpl = 'systems/coc/templates/chat/stats-roll-card.hbs';
        const grandTotal = rolls.map(r => r.total).reduce((acc, val) => acc + val);
        foundry.applications.handlebars.renderTemplate(tpl, { rolls:rolls, grandTotal: grandTotal}).then(html => {
            let msgData = {
                user: game.user.id,
                flavor: flavor,
                sound: CONFIG.sounds.dice,
                content : html
            };
            if(actor) msgData.speaker = ChatMessage.getSpeaker({actor: actor});
            ChatMessage.create(msgData);
        });
    }

    static statsCommand(actor) {
        const stats = CharacterGeneration.rollStats();
        CharacterGeneration._buildStatsMessage(actor, "<h2>Création de personnage</h2><h3>Jets de caractéristiques</h3>", stats);
        return stats;
    }

    static rollStats() {
        let stats = [];
        for(let i=0; i<6; i++){
            let r = new Roll("4d6kh3");
            r.roll({"async": false});
            stats[i] = {
                formula : r.formula,
                result : r.result,
                total : r.total,
                dices : r.terms[0].results
            };
        }
        return stats;
    }
}