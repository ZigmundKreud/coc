/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CocActor extends Actor {

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();
        let actorData = this.data;
        console.log(actorData);
    }
}
