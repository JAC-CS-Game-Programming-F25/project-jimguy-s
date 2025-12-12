import State from "../../../lib/State.js";
import Room from "../services/Room.js";

export default class PlayState extends State {
    constructor(roomDefinition) {
        super();

        this.room = new Room(roomDefinition);
    }

    update(dt) {
        this.room.update(dt);
    }

    render() {
        this.room.render();
    }
}