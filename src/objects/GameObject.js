import Vector from "../../lib/Vector.js";
import { context, DEBUG } from "../globals.js";

export default class GameObject {
    /**
     * The base class to be extended by all game objects in the game.
     *
     * @param {Vector} dimensions The height and width of the game object.
     * @param {Vector} position The x and y coordinates of the game object.
     */
    constructor(dimensions, position) {
        this.dimensions = dimensions;
        this.position = position;
        this.sprites = [];
        this.currentFrame = 0;
        this.cleanUp = false;
        this.renderPriority = 0;

        // If the game object should disappear when collided with.
        this.isConsumable = false;

        // If the game object was consumed already.
        this.wasConsumed = false;
    }

    update(dt) {
        // Override in child classes
    }

    render(offset = { x: 0, y: 0 }) {
        const x = this.position.x + offset.x;
        const y = this.position.y + offset.y;

        if (this.sprites[this.currentFrame]) {
            this.sprites[this.currentFrame].render(
                Math.floor(x),
                Math.floor(y)
            );
        }

        if (DEBUG) {
            // Draw simple debug rectangle
            context.save();
            context.strokeStyle = "yellow";
            context.lineWidth = 2;
            context.strokeRect(
                Math.floor(x),
                Math.floor(y),
                this.dimensions.x,
                this.dimensions.y
            );
            context.restore();
        }
    }

    /**
     * Called when the player collides with and consumes this object
     * @param {Player} consumer
     */
    onConsume(consumer) {
        this.wasConsumed = true;
    }

    /**
     * Simple AABB collision detection with player
     * @param {Player} player
     * @returns {boolean}
     */
    didCollideWithPlayer(player) {
        const playerX = player.canvasPosition.x;
        const playerY = player.canvasPosition.y;
        const playerWidth = player.dimensions.x;
        const playerHeight = player.dimensions.y;

        return (
            this.position.x < playerX + playerWidth &&
            this.position.x + this.dimensions.x > playerX &&
            this.position.y < playerY + playerHeight &&
            this.position.y + this.dimensions.y > playerY
        );
    }
}
