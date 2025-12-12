import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";

export default class PlayerDeadState extends State {
    constructor(player) {
        super();

        this.player = player;

        // Death animations - single frame (16x16)
        this.animation = {
            [Direction.Down]: new Animation([0], 1),
            [Direction.Up]: new Animation([0], 1),
            [Direction.Left]: new Animation([0], 1),
            [Direction.Right]: new Animation([0], 1),
        };

        this.deathTimer = 0;
        this.deathDuration = 1.0;
        this.transitionDelay = 1.0;
    }

    enter() {
        this.player.sprites = this.player.deadSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
        this.player.currentAnimation.refresh();
        this.player.currentFrame = 0;

        this.deathTimer = 0;

        console.log("Player died! Death animation playing...");
    }

    update(dt) {
        this.deathTimer += dt;

        if (this.deathTimer >= this.deathDuration + this.transitionDelay) {
            console.log("Transitioning to Game Over...");
            // TODO: Transition to Game Over state
        }
    }

    exit() {
        console.log("Player death state exit");
    }
}
