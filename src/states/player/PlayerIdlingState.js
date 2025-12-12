import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Player from "../../entities/Player.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import { input } from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class PlayerIdlingState extends State {
    /**
     * In this state, the player is stationary unless
     * a directional key or the spacebar is pressed.
     *
     * @param {Player} player
     */
    constructor(player) {
        super();

        this.player = player;
        this.animation = {
            [Direction.Up]: new Animation([1], 1),
            [Direction.Down]: new Animation([0], 1),
            [Direction.Left]: new Animation([2], 1),
            [Direction.Right]: new Animation([3], 1),
        };
    }

    enter() {
        // Switch to idle sprites
        this.player.sprites = this.player.idleSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
    }

    update() {
        if (input.isKeyPressed(Input.KEYS.SPACE)) {
            this.player.changeState(PlayerStateName.Attacking);
            return;
        }

        // Check for any movement input
        if (
            input.isKeyHeld(Input.KEYS.W) ||
            input.isKeyHeld(Input.KEYS.A) ||
            input.isKeyHeld(Input.KEYS.S) ||
            input.isKeyHeld(Input.KEYS.D)
        ) {
            this.player.changeState(PlayerStateName.Walking);
        }
    }
}
