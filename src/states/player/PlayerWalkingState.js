import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Player from "../../entities/Player.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Input from "../../../lib/Input.js";
import { input } from "../../globals.js";
import Tile from "../../services/Tile.js";
import Vector from "../../../lib/Vector.js";

export default class PlayerWalkingState extends State {
    /**
     * In this state, the player can move freely around the map
     * using the directional keys. From here, the player can go idle
     * if no keys are being pressed.
     *
     * @param {Player} player
     */
    constructor(player) {
        super();

        this.player = player;
        this.bottomLayer = this.player.room.bottomLayer;
        this.collisionLayer = this.player.room.collisionLayer;

        // Walk animations matching your sprite sheet layout
        this.animation = {
            [Direction.Up]: new Animation([1, 5, 9, 13], 0.15),
            [Direction.Down]: new Animation([0, 4, 8, 12], 0.15),
            [Direction.Left]: new Animation([2, 6, 10, 14], 0.15),
            [Direction.Right]: new Animation([3, 7, 11, 15], 0.15),
        };
    }

    enter() {
        // Switch to walking sprites
        this.player.sprites = this.player.walkSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
    }

    update(dt) {
        if (input.isKeyPressed(Input.KEYS.SPACE)) {
            this.player.changeState(PlayerStateName.Attacking);
            return;
        }

        this.player.currentAnimation = this.animation[this.player.direction];

        if (this.player.currentAnimation) {
            this.player.currentAnimation.update(dt);
            this.player.currentFrame =
                this.player.currentAnimation.getCurrentFrame();
        }

        this.handleMovement(dt);
    }

    handleMovement(dt) {
        let isMoving = false;
        const velocity = new Vector(0, 0);

        // Check vertical input
        if (input.isKeyHeld(Input.KEYS.W)) {
            velocity.y = -1;
            this.player.direction = Direction.Up;
            isMoving = true;
        } else if (input.isKeyHeld(Input.KEYS.S)) {
            velocity.y = 1;
            this.player.direction = Direction.Down;
            isMoving = true;
        }

        // Check horizontal input
        if (input.isKeyHeld(Input.KEYS.A)) {
            velocity.x = -1;
            this.player.direction = Direction.Left;
            isMoving = true;
        } else if (input.isKeyHeld(Input.KEYS.D)) {
            velocity.x = 1;
            this.player.direction = Direction.Right;
            isMoving = true;
        }

        // If no movement input, go to idle state
        if (!isMoving) {
            this.player.changeState(PlayerStateName.Idling);
            return;
        }

        // Normalize diagonal movement (so it's not faster)
        if (velocity.x !== 0 && velocity.y !== 0) {
            velocity.x *= Math.sqrt(2) / 2;
            velocity.y *= Math.sqrt(2) / 2;
        }

        // Calculate movement distance this frame
        const speed = Player.SPEED * dt;
        const moveX = (velocity.x * speed) / Tile.SIZE;
        const moveY = (velocity.y * speed) / Tile.SIZE;

        // Calculate new position
        const newX = this.player.position.x + moveX;
        const newY = this.player.position.y + moveY;

        // Try to move to the new position
        if (this.isValidMove(newX, newY)) {
            this.player.position.x = newX;
            this.player.position.y = newY;
            this.player.canvasPosition.x = newX * Tile.SIZE;
            this.player.canvasPosition.y = newY * Tile.SIZE;
        } else {
            // Try sliding along walls - move horizontally if blocked diagonally
            if (moveX !== 0 && this.isValidMove(newX, this.player.position.y)) {
                this.player.position.x = newX;
                this.player.canvasPosition.x = newX * Tile.SIZE;
            }
            // Try moving vertically if blocked diagonally
            if (moveY !== 0 && this.isValidMove(this.player.position.x, newY)) {
                this.player.position.y = newY;
                this.player.canvasPosition.y = newY * Tile.SIZE;
            }
        }
    }

    /**
     * @param {number} x Grid position (not pixels)
     * @param {number} y Grid position (not pixels)
     * @returns Whether the player can move to this position
     */
    isValidMove(x, y) {
        // Calculate the player's bounding box in grid coordinates
        const width = this.player.dimensions.x / Tile.SIZE;
        const height = this.player.dimensions.y / Tile.SIZE;

        // Check canvas boundaries (room dimensions)
        if (x < 0 || y < 0) {
            return false;
        }
        if (
            x + width > this.bottomLayer.width ||
            y + height > this.bottomLayer.height
        ) {
            return false;
        }

        // Check if blocked by barrier
        if (this.player.room.isBlockedByBarrier(x, y)) {
            return false;
        }

        // Check all four corners of the player's hitbox
        const topLeftTile = this.collisionLayer.getTile(
            Math.floor(x),
            Math.floor(y)
        );
        const topRightTile = this.collisionLayer.getTile(
            Math.floor(x + width - 0.01),
            Math.floor(y)
        );
        const bottomLeftTile = this.collisionLayer.getTile(
            Math.floor(x),
            Math.floor(y + height - 0.01)
        );
        const bottomRightTile = this.collisionLayer.getTile(
            Math.floor(x + width - 0.01),
            Math.floor(y + height - 0.01)
        );

        // Return true only if all corners are on non-collidable tiles
        return (
            topLeftTile === null &&
            topRightTile === null &&
            bottomLeftTile === null &&
            bottomRightTile === null
        );
    }
}
