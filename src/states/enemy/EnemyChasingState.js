import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Tile from "../../services/Tile.js";
import Vector from "../../../lib/Vector.js";

export default class EnemyChasingState extends State {
    /**
     * In this state, the enemy chases the player.
     * When in attack range, transition to attacking.
     * When player leaves detection range, return to idle.
     *
     * @param {Enemy} enemy
     */
    constructor(enemy) {
        super();

        this.enemy = enemy;
        this.collisionLayer = this.enemy.room.collisionLayer;

        // Walk animations (same as walking state)
        this.animation = {
            [Direction.Up]: new Animation([1, 5, 9, 13], 0.12), // Slightly faster animation
            [Direction.Down]: new Animation([0, 4, 8, 12], 0.12),
            [Direction.Left]: new Animation([2, 6, 10, 14], 0.12),
            [Direction.Right]: new Animation([3, 7, 11, 15], 0.12),
        };
    }

    enter() {
        // Switch to walk sprites (chasing uses same sprites as walking)
        this.enemy.sprites = this.enemy.walkSprites;
        this.enemy.currentAnimation = this.animation[this.enemy.direction];
    }

    update(dt) {
        // Check if player left detection range
        if (!this.enemy.canSeePlayer()) {
            this.enemy.changeState(EnemyStateName.Idling);
            return;
        }

        // Check if player is in attack range
        if (this.enemy.isPlayerInAttackRange()) {
            this.enemy.changeState(EnemyStateName.Attacking);
            return;
        }

        // Update animation
        if (this.enemy.currentAnimation) {
            this.enemy.currentAnimation.update(dt);
            this.enemy.currentFrame =
                this.enemy.currentAnimation.getCurrentFrame();
        }

        // Chase the player
        this.chasePlayer(dt);
    }

    chasePlayer(dt) {
        const player = this.enemy.room.player;

        // Calculate direction to player
        const dx = player.position.x - this.enemy.position.x;
        const dy = player.position.y - this.enemy.position.y;

        // Determine which axis to prioritize
        const velocity = new Vector(0, 0);

        if (Math.abs(dx) > Math.abs(dy)) {
            // Move horizontally
            velocity.x = dx > 0 ? 1 : -1;
            this.enemy.direction = dx > 0 ? Direction.Right : Direction.Left;
        } else {
            // Move vertically
            velocity.y = dy > 0 ? 1 : -1;
            this.enemy.direction = dy > 0 ? Direction.Down : Direction.Up;
        }

        // Update animation for new direction
        this.enemy.currentAnimation = this.animation[this.enemy.direction];

        // Calculate movement
        const speed = this.enemy.speed * dt;
        const moveX = (velocity.x * speed) / Tile.SIZE;
        const moveY = (velocity.y * speed) / Tile.SIZE;

        const newX = this.enemy.position.x + moveX;
        const newY = this.enemy.position.y + moveY;

        // Try to move toward player
        if (this.isValidMove(newX, newY)) {
            this.enemy.position.x = newX;
            this.enemy.position.y = newY;
            this.enemy.canvasPosition.x = newX * Tile.SIZE;
            this.enemy.canvasPosition.y = newY * Tile.SIZE;
        } else {
            // Try moving only horizontally
            if (
                velocity.x !== 0 &&
                this.isValidMove(newX, this.enemy.position.y)
            ) {
                this.enemy.position.x = newX;
                this.enemy.canvasPosition.x = newX * Tile.SIZE;
            }
            // Try moving only vertically
            else if (
                velocity.y !== 0 &&
                this.isValidMove(this.enemy.position.x, newY)
            ) {
                this.enemy.position.y = newY;
                this.enemy.canvasPosition.y = newY * Tile.SIZE;
            }
        }
    }

    isValidMove(x, y) {
        // Use the enemy's built-in isValidMove which checks both walls and other enemies
        return this.enemy.isValidMove(x, y);
    }
}
