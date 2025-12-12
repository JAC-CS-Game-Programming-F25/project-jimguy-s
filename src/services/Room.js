import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/Player.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import EnemyFactory from "./EnemyFactory.js";
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    DEBUG,
    images,
    input,
} from "../globals.js";
import Input from "../../lib/Input.js";

export default class Room {
    /**
     * The collection of layers, sprites,
     * and characters that comprises the world.
     *
     * @param {object} roomDefinition JSON from Tiled room editor.
     * @param {number} roomNumber The current room number
     * @param {number} previousScore Score carried from previous room
     */
    constructor(roomDefinition, roomNumber = 1, previousScore = 0) {
        // Generate sprites from both tilesets
        const tilesSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Tiles),
            Tile.SIZE,
            Tile.SIZE
        );

        const buildingsSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Buildings),
            Tile.SIZE,
            Tile.SIZE
        );

        // Combine sprites arrays
        const sprites = [...tilesSprites, ...buildingsSprites];

        this.bottomLayer = new Layer(
            roomDefinition.layers[Layer.BOTTOM],
            sprites
        );
        this.collisionLayer = new Layer(
            roomDefinition.layers[Layer.COLLISION],
            sprites
        );
        this.topLayer = new Layer(roomDefinition.layers[Layer.TOP], sprites);

        this.roomNumber = roomNumber;
        this.player = new Player({ position: new Vector(6, 5) }, this);

        // Score tracking
        this.score = previousScore;

        // Enemy management
        this.enemies = [];
        this.totalEnemiesSpawned = 0;
        this.spawnEnemies();
        this.isCleared = false;

        // Debug toggles
        this.renderBottomLayer = true;
        this.renderCollisionLayer = true;
        this.renderTopLayer = true;
    }

    spawnEnemies() {
        // Use factory to spawn enemies based on room number
        this.enemies = EnemyFactory.spawnEnemies(this.roomNumber, this);
        this.totalEnemiesSpawned = this.enemies.length;
    }

    update(dt) {
        this.player.update(dt);

        // Update all enemies
        this.enemies.forEach((enemy) => {
            enemy.update(dt);
        });

        // Clean up dead enemies after their death animation
        this.enemies = this.enemies.filter((enemy) => {
            if (enemy.cleanupReady) {
                // Award score when enemy is cleaned up
                this.score += enemy.scoreValue;
                console.log(
                    `+${enemy.scoreValue} points! Total score: ${this.score}`
                );
                return false;
            }
            return true;
        });

        // Check if room is cleared
        this.checkClear();

        // Debug layer toggles
        if (input.isKeyPressed(Input.KEYS.NUMROW_1)) {
            this.renderBottomLayer = !this.renderBottomLayer;
        } else if (input.isKeyPressed(Input.KEYS.NUMROW_2)) {
            this.renderCollisionLayer = !this.renderCollisionLayer;
        } else if (input.isKeyPressed(Input.KEYS.NUMROW_3)) {
            this.renderTopLayer = !this.renderTopLayer;
        }
    }

    render() {
        if (this.renderBottomLayer) {
            this.bottomLayer.render();
        }

        if (this.renderCollisionLayer) {
            this.collisionLayer.render();
        }

        // Render all enemies (including dead ones playing death animation)
        this.enemies.forEach((enemy) => {
            enemy.render();
        });

        this.player.render();

        if (this.renderTopLayer) {
            this.topLayer.render();
        }

        if (DEBUG) {
            Room.renderGrid();
            Room.renderInstructions();
        }
    }

    /**
     * Check if room is cleared - called every frame
     */
    checkClear() {
        if (this.isCleared) return;

        // Check if all enemies are cleaned up (not just dead)
        const allCleanedUp = this.enemies.every(
            (enemy) => enemy.cleanupReady || enemy.isDead
        );
        const noEnemiesLeft = this.enemies.length === 0;

        if ((allCleanedUp || noEnemiesLeft) && this.totalEnemiesSpawned > 0) {
            this.isCleared = true;
            this.transitionDelayStarted = false;
            this.transitionTimer = 0;

            console.log(`Room ${this.roomNumber} cleared!`);

            // Award bonus points for clearing room
            const bonusPoints = 50 + this.roomNumber * 10;
            this.addScore(bonusPoints);
            console.log(`+${bonusPoints} ROOM CLEAR BONUS!`);
        }
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }

    /**
     * Get the current score
     * @returns {number}
     */
    getScore() {
        return this.score;
    }

    /**
     * Add points to the score
     * @param {number} points
     */
    addScore(points) {
        this.score += points;
        console.log(`+${points} points! Total score: ${this.score}`);
    }

    /**
     * Draws a grid of squares on the screen to help with debugging.
     */
    static renderGrid() {
        context.save();
        context.strokeStyle = "white";

        for (let y = 1; y < CANVAS_HEIGHT / Tile.SIZE; y++) {
            context.beginPath();
            context.moveTo(0, y * Tile.SIZE);
            context.lineTo(CANVAS_WIDTH, y * Tile.SIZE);
            context.closePath();
            context.stroke();

            for (let x = 1; x < CANVAS_WIDTH / Tile.SIZE; x++) {
                context.beginPath();
                context.moveTo(x * Tile.SIZE, 0);
                context.lineTo(x * Tile.SIZE, CANVAS_HEIGHT);
                context.closePath();
                context.stroke();
            }
        }

        context.restore();
    }

    static renderInstructions() {
        context.save();
        context.translate(0, Tile.SIZE * 9);
        context.fillStyle = "rgba(0, 0, 0, 0.75)";
        context.fillRect(0, 0, Tile.SIZE * 5, Tile.SIZE * 2);
        context.font = `12px PowerRed`;
        context.textBaseline = "alphabetic";
        context.fillStyle = "white";
        [
            `[1] Toggle Bottom Layer`,
            `[2] Toggle Collision Layer`,
            `[3] Toggle Top Layer`,
        ].forEach((text, index) => context.fillText(text, 15, index * 16 + 22));
        context.restore();
    }
}
