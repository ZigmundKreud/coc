
export class UpdateUtils {

    static async updateTraits() {
        await game.packs.get("coc.traits").getContent().then(index => {
            index.forEach(entity => {
                let data = duplicate(entity.data);
                console.log(data);
                if(data.data.family === "action") data.img = "systems/coc/ui/icons/Icon.1_12.png";
                else if(data.data.family === "reflexion") data.img = "systems/coc/ui/icons/Icon.7_20.png";
                else data.img = "systems/coc/ui/icons/Icon.1_07.png";
                data.data.key = "trait-"+data.name.slugify({strict: true});
                data.data.source = "Chroniques Oubliées Contemporain";
                data.data.setting = "base";
                // systems/coc/ui/icons/Icon.6_62.png
                entity.update(data);
            })
        });
    }

    static async updateCapacities() {
        const entities = game.items.filter(item => item.type === "capacity");
        for(let entity of entities){
            let data = duplicate(entity.data);
            console.log(data);
            data.img = "systems/coc/ui/icons/Icon.4_81.png";
            data.data.source = "Chroniques Oubliées Contemporain";
            if(!data.data.setting) data.data.setting = "base";
            data.data.key = data.data.setting + "-" + data.name.slugify({strict: true});
            switch(data.data.setting){
                case "epouvante" : data.img = "systems/coc/ui/icons/Icon.6_55.png"; break;
                case "pulp" : data.img = "systems/coc/ui/icons/Icon.6_38.png"; break;
                case "zombis" : data.img = "systems/coc/ui/icons/Icon.3_37.png"; break;
                case "espionnage" : data.img = "systems/coc/ui/icons/Icon.1_10.png"; break;
                case "surhumains" : data.img = "systems/coc/ui/icons/Icon.5_78.png"; break;
                case "cyberpunk" : data.img = "systems/coc/ui/icons/Icon.4_81.png"; break;
                default: break;
            }
            data.data.properties = {};
            entity.update(data);
        }
    }

    static async updatePaths() {
        const entities = game.items.filter(item => item.type === "path");
        for(let entity of entities){
            // console.log(entity);
            let data = duplicate(entity.data);
            // console.log(data);
            data.data.capacities = [];
            // data.data.properties = {};
            // if(!data.data.setting) data.data.setting = "base";
            // data.data.key = data.data.setting + "-" + data.name.slugify({strict: true});
            // data.data.source = "Chroniques Oubliées Contemporain";
            // switch(data.data.setting){
            //     case "epouvante" : data.img = "systems/coc/ui/icons/Icon.6_55.png"; break;
            //     case "pulp" : data.img = "systems/coc/ui/icons/Icon.6_38.png"; break;
            //     case "zombis" : break;
            //     case "espionnage" : data.img = "systems/coc/ui/icons/Icon.1_10.png"; break;
            //     case "surhumains" : data.img = "systems/coc/ui/icons/Icon.5_78.png"; break;
            //     case "cyberpunk" : data.img = "systems/coc/ui/icons/Icon.4_81.png"; break;
            //     default: break;
            // }
            // console.log(data.data.setting);
            entity.update(data);
        }
    }
}