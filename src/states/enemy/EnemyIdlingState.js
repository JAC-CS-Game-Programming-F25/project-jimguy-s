import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class EnemyIdlingState extends State {
    /**
     * In this state, the enemy stands still and waits.
     * If the player comes within detection range, transition to chasing.
     *
     * @param {Enemy} enemy
     */
    constructor(enemy) {
        super();

        this.enemy = enemy;

        // Idle animations for all directions
        this.animation = {
            [Direction.Up]: new Animation([1], 1),
            [Direction.Down]: new Animation([0], 1),
            [Direction.Left]: new Animation([2], 1),
            [Direction.Right]: new Animation([3], 1),
        };

        this.waitTimer = 0;
        this.waitDuration = Math.random() * 2 + 1; // Random 1-3 seconds
    }

    enter() {
        // Switch to idle sprites
        this.enemy.sprites = this.enemy.idleSprites;
        this.enemy.currentAnimation = this.animation[this.enemy.direction];
        this.waitTimer = 0;
    }

    update(dt) {
        this.waitTimer += dt;

        // Check if player is in detection range
        if (this.enemy.canSeePlayer()) {
            this.enemy.changeState(EnemyStateName.Chasing);
            return;
        }

        // After waiting, randomly start walking
        if (this.waitTimer >= this.waitDuration) {
            this.enemy.changeState(EnemyStateName.Walking);
        }
    }
}
