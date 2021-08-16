import {CharacterGeneration} from "./chargen.js";
import {COC, System} from "./config.js";
import {Macros} from "./macros.js";

export default function registerHooks() {

    /**
     * Primary use of this hook is to intercept chat commands.
     * /char  - Begin character generation
     * /table - Roll on a table
     * /cond  - Lookup a condition
     * /name  - Generate a name
     * /avail - Start an item availability test
     * /pay - Player: Remove money from character. GM: Start a payment request
     * /credit - Player: Not allowed. GM: Start a credit request to send money to players
     * /help - display a help message on all the commands above
     */
    // Hooks.on("chatMessage", (html, content, msg) => {
    //     let regExp;
    //     regExp = /(\S+)/g;
    //     let commands = content.match(regExp);
    //     let command = (commands.length>0 && commands[0].split("/").length > 0) ? commands[0].split("/")[1].trim() : null;
    //     let arg1 = (commands.length > 1) ? commands[1].trim() : null;
    //     const actor = game.coc.macros.getSpeakersActor();
    //
    //     const validCommands = ["for", "str", "dex", "con", "int", "sag", "wis", "cha", "atc", "melee", "atd", "ranged", "atm", "magic"];
    //
    //     if(command && validCommands.includes(command)) {
    //         game.coc.macros.rollStatMacro(actor, command, null);
    //         return false;
    //     }
    //     else if(command && command === "skill") {
    //         if(arg1 && validCommands.includes(arg1)) {
    //             game.coc.macros.rollStatMacro(actor, arg1, null);
    //         } else {
    //             ui.notifications.error("Vous devez préciser la caractéristique à tester, par exemple \"/skill str\".");
    //         }
    //         return false;
    //     }
    //     else if(command && command === "stats") {
    //         CharacterGeneration.statsCommand();
    //         return false;
    //     }
    // });
    //
    // /**
    //  * Create a macro when dropping an entity on the hotbar
    //  * Item      - open roll dialog for item
    //  * Actor     - open actor sheet
    //  * Journal   - open journal sheet
    //  */
    // Hooks.on("hotbarDrop", async (bar, data, slot) => {
    //     // Create item macro if rollable item - weapon, spell, prayer, trait, or skill
    //     if (data.type == "Item") {
    //         let item = data.data;
    //         let command = `game.coc.macros.rollItemMacro("${item._id}", "${item.name}", "${item.type}");`;
    //         let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
    //         if (!macro) {
    //             macro = await Macro.create({
    //                 name: item.name,
    //                 type : "script",
    //                 img: item.img,
    //                 command : command
    //             }, {displaySheet: false})
    //         }
    //         game.user.assignHotbarMacro(macro, slot);
    //     }
    //     // Create a macro to open the actor sheet of the actor dropped on the hotbar
    //     else if (data.type == "Actor") {
    //         let actor = game.actors.get(data.id);
    //         let command = `game.actors.get("${data.id}").sheet.render(true)`
    //         let macro = game.macros.entities.find(m => (m.name === actor.name) && (m.command === command));
    //         if (!macro) {
    //             macro = await Macro.create({
    //                 name: actor.data.name,
    //                 type: "script",
    //                 img: actor.data.img,
    //                 command: command
    //             }, {displaySheet: false})
    //             game.user.assignHotbarMacro(macro, slot);
    //         }
    //     }
    //     // Create a macro to open the journal sheet of the journal dropped on the hotbar
    //     else if (data.type == "JournalEntry") {
    //         let journal = game.journal.get(data.id);
    //         let command = `game.journal.get("${data.id}").sheet.render(true)`
    //         let macro = game.macros.entities.find(m => (m.name === journal.name) && (m.command === command));
    //         if (!macro) {
    //             macro = await Macro.create({
    //                 name: journal.data.name,
    //                 type: "script",
    //                 img: (journal.data.img) ? journal.data.img : "icons/svg/book.svg",
    //                 command: command
    //             }, {displaySheet: false})
    //             game.user.assignHotbarMacro(macro, slot);
    //         }
    //     }
    //     return false;
    // });
}
