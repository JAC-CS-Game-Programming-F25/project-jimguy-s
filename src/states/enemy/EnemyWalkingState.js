import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Tile from "../../services/Tile.js";
import Vector from "../../../lib/Vector.js";

export default class EnemyWalkingState extends State {
    /**
     * In this state, the enemy wanders around randomly.
     * If player comes in range, transition to chasing.
     *
     * @param {Enemy} enemy
     */
    constructor(enemy) {
        super();

        this.enemy = enemy;
        this.collisionLayer = this.enemy.room.collisionLayer;

        // Walk animations matching sprite sheet layout
        this.animation = {
            [Direction.Up]: new Animation([1, 5, 9, 13], 0.15),
            [Direction.Down]: new Animation([0, 4, 8, 12], 0.15),
            [Direction.Left]: new Animation([2, 6, 10, 14], 0.15),
            [Direction.Right]: new Animation([3, 7, 11, 15], 0.15),
        };

        this.walkTimer = 0;
        this.walkDuration = Math.random() * 3 + 2; // Walk for 2-5 seconds
        this.chooseNewDirection();
    }

    enter() {
        // Switch to walk sprites
        this.enemy.sprites = this.enemy.walkSprites;
        this.enemy.currentAnimation = this.animation[this.enemy.direction];
        this.walkTimer = 0;
        this.chooseNewDirection();
    }

    update(dt) {
        // Check if player is in detection range
        if (this.enemy.canSeePlayer()) {
            this.enemy.changeState(EnemyStateName.Chasing);
            return;
        }

        // Update animation
        if (this.enemy.currentAnimation) {
            this.enemy.currentAnimation.update(dt);
            this.enemy.currentFrame =
                this.enemy.currentAnimation.getCurrentFrame();
        }

        this.walkTimer += dt;

        // Move in current direction
        this.move(dt);

        // After walking duration, go back to idle
        if (this.walkTimer >= this.walkDuration) {
            this.enemy.changeState(EnemyStateName.Idling);
        }
    }

    move(dt) {
        const velocity = new Vector(0, 0);

        // Set velocity based on direction
        switch (this.enemy.direction) {
            case Direction.Up:
                velocity.y = -1;
                break;
            case Direction.Down:
                velocity.y = 1;
                break;
            case Direction.Left:
                velocity.x = -1;
                break;
            case Direction.Right:
                velocity.x = 1;
                break;
        }

        // Calculate movement
        const speed = this.enemy.speed * dt;
        const moveX = (velocity.x * speed) / Tile.SIZE;
        const moveY = (velocity.y * speed) / Tile.SIZE;

        const newX = this.enemy.position.x + moveX;
        const newY = this.enemy.position.y + moveY;

        // Try to move
        if (this.isValidMove(newX, newY)) {
            this.enemy.position.x = newX;
            this.enemy.position.y = newY;
            this.enemy.canvasPosition.x = newX * Tile.SIZE;
            this.enemy.canvasPosition.y = newY * Tile.SIZE;
        } else {
            // Hit a wall, choose new direction
            this.chooseNewDirection();
        }
    }

    chooseNewDirection() {
        // Pick a random direction
        const directions = [
            Direction.Up,
            Direction.Down,
            Direction.Left,
            Direction.Right,
        ];
        this.enemy.direction =
            directions[Math.floor(Math.random() * directions.length)];
        this.enemy.currentAnimation = this.animation[this.enemy.direction];
    }

    isValidMove(x, y) {
        // Use the enemy's built-in isValidMove which checks both walls and other enemies
        return this.enemy.isValidMove(x, y);
    }
}
