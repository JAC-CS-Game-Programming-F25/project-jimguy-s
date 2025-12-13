import State from "../../../lib/State.js";
import Room from "../services/Room.js";

export default class PlayState extends State {
    static TOTAL_ROOMS = 5;

    constructor() {
        super();

        this.currentRoomNumber = 1;
        this.score = 0;
        this.room = null;

        // Load first room
        this.loadRoom(1, null);
    }

    async loadRoom(roomNumber, entranceDirection) {
        console.log(
            `Loading room ${roomNumber} (entrance: ${entranceDirection})...`
        );

        try {
            // Fetch the room JSON file
            const roomDefinition = await fetch(
                `../assets/maps/room${roomNumber}.json`
            ).then((response) => response.json());

            // Create the new room with current score and entrance direction
            this.room = new Room(
                roomDefinition,
                roomNumber,
                this.score,
                entranceDirection
            );
            this.currentRoomNumber = roomNumber;

            console.log(`Room ${roomNumber} loaded successfully!`);
        } catch (error) {
            console.error(`Failed to load room ${roomNumber}:`, error);
        }
    }

    update(dt) {
        if (this.room) {
            this.room.update(dt);

            // Check if player walked to an exit
            if (this.room.triggerRoomTransition) {
                const { nextRoom, entranceDirection } =
                    this.room.triggerRoomTransition;

                // Update score before transitioning
                this.score = this.room.getScore();

                // Check if game is complete
                if (nextRoom > PlayState.TOTAL_ROOMS) {
                    console.log("All rooms cleared! Victory!");
                    // TODO: Transition to VictoryState
                    return;
                }

                // Load the next room
                console.log(`Transitioning to room ${nextRoom}...`);
                this.loadRoom(nextRoom, entranceDirection);
            }
        }
    }

    render() {
        if (this.room) {
            this.room.render();
        }
    }
}
