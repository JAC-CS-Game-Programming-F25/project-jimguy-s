import State from "../../lib/State.js";
import Room from "../services/Room.js";
import GameStateName from "../enums/GameStateName.js";
import { input, stateMachine, sounds } from "../globals.js";
import Input from "../../lib/Input.js";
import SoundName from "../enums/SoundName.js";
import MusicManager from "../services/MusicManager.js";
import DamageBoost from "../objects/DamageBoost.js";

export default class PlayState extends State {
    static TOTAL_ROOMS = 5;

    constructor() {
        super();
    }

    enter(params = {}) {
        // If resuming from pause, don't reset
        if (params.resuming) {
            return;
        }

        MusicManager.play(SoundName.PlayStateMusic, {
            loop: true,
            volume: 0.25,
        });
        // Reset game state when starting new game
        this.currentRoomNumber = 1;
        this.score = 0;
        this.room = null;
        this.playerData = null;

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
                entranceDirection,
                this.playerData
            );
            this.currentRoomNumber = roomNumber;

            console.log(`Room ${roomNumber} loaded successfully!`);
        } catch (error) {
            console.error(`Failed to load room ${roomNumber}:`, error);
        }
    }

    update(dt) {
        // Check for pause
        if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
            sounds.play(SoundName.Select);
            stateMachine.change(GameStateName.Pause);
            return;
        }

        if (this.room) {
            this.room.update(dt);

            // Check if player died
            if (this.room.player.isDead) {
                const finalScore = this.room.getScore();
                stateMachine.change(GameStateName.GameOver, {
                    score: finalScore,
                });
                return;
            }

            // Check if Room 5 is cleared for victory
            if (this.currentRoomNumber === 5 && this.room.isCleared) {
                console.log("TRIGGERING VICTORY STATE!");
                const finalScore = this.room.getScore();
                stateMachine.change(GameStateName.Victory, {
                    score: finalScore,
                });
                return;
            }

            // Check if player walked to an exit
            if (this.room.triggerRoomTransition) {
                const { nextRoom, entranceDirection } =
                    this.room.triggerRoomTransition;

                // Update score before transitioning
                this.score = this.room.getScore();

                this.playerData = {
                    health: this.room.player.health,
                    maxHealth: this.room.player.maxHealth,
                    damageBoost: this.room.player.damageBoost,
                };

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
