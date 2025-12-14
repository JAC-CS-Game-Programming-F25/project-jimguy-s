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
     * @param {string} entranceDirection Direction player entered from ('top', 'bottom', 'left', 'right', or null for first room)
     */
    constructor(
        roomDefinition,
        roomNumber = 1,
        previousScore = 0,
        entranceDirection = null
    ) {
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

        // Define exits for each room
        this.exits = this.defineExits();

        // Define blocked barriers (these block exits until room is cleared)
        this.barriers = this.defineBarriers();

        // Determine player spawn position based on entrance
        const spawnPosition = this.getSpawnPosition(entranceDirection);
        this.player = new Player({ position: spawnPosition }, this);

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

    /**
     * Define exit zones for this room
     * Each exit has a position, size, and leads to a specific room/entrance
     */
    defineExits() {
        // Exit positions vary by room layout
        // Looking at the room JSONs, we need to define where doors/exits are
        const exitDefinitions = {
            1: [
                {
                    x: 6,
                    y: 11,
                    width: 3,
                    height: 1,
                    direction: "bottom",
                    leadsTo: 2,
                },
            ],
            2: [
                {
                    x: 6,
                    y: 0,
                    width: 3,
                    height: 1,
                    direction: "top",
                    leadsTo: 1,
                },
                {
                    x: 6,
                    y: 11,
                    width: 3,
                    height: 1,
                    direction: "bottom",
                    leadsTo: 3,
                },
            ],
            3: [
                {
                    x: 6,
                    y: 0,
                    width: 3,
                    height: 1,
                    direction: "top",
                    leadsTo: 2,
                },
                {
                    x: 6,
                    y: 11,
                    width: 3,
                    height: 1,
                    direction: "bottom",
                    leadsTo: 4,
                },
            ],
            4: [
                {
                    x: 6,
                    y: 0,
                    width: 3,
                    height: 1,
                    direction: "top",
                    leadsTo: 3,
                },
                {
                    x: 6,
                    y: 11,
                    width: 3,
                    height: 1,
                    direction: "bottom",
                    leadsTo: 5,
                },
            ],
            5: [
                {
                    x: 6,
                    y: 0,
                    width: 3,
                    height: 1,
                    direction: "top",
                    leadsTo: 4,
                },
            ],
        };

        return exitDefinitions[this.roomNumber] || [];
    }

    /**
     * Define barriers that block exits until room is cleared
     */
    defineBarriers() {
        // Barriers are positioned at exits and removed when room is cleared
        return this.exits.map((exit) => ({
            ...exit,
            active: true, // Barriers start active
        }));
    }

    /**
     * Get spawn position based on which direction player entered from
     */
    getSpawnPosition(entranceDirection) {
        switch (entranceDirection) {
            case "top":
                return new Vector(7, 1); // Spawn near top
            case "bottom":
                return new Vector(7, 10); // Spawn near bottom
            case "left":
                return new Vector(1, 6); // Spawn near left
            case "right":
                return new Vector(13, 6); // Spawn near right
            default:
                return new Vector(6, 5); // Default center spawn for first room
        }
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

        // Check if player is at an exit
        const exitInfo = this.checkPlayerAtExit();
        if (exitInfo) {
            this.triggerRoomTransition = exitInfo;
        }

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

        // Render barriers (visual indication that exits are blocked)
        this.renderBarriers();

        if (DEBUG) {
            Room.renderGrid();
            Room.renderInstructions();
            this.renderExitDebug();
        }
    }

    /**
     * Render visual barriers at blocked exits
     */
    renderBarriers() {
        this.barriers.forEach((barrier) => {
            if (barrier.active) {
                context.save();

                // Draw a semi-transparent red barrier
                context.fillStyle = "rgba(255, 0, 0, 0.3)";
                context.fillRect(
                    barrier.x * Tile.SIZE,
                    barrier.y * Tile.SIZE,
                    barrier.width * Tile.SIZE,
                    barrier.height * Tile.SIZE
                );

                // Draw barrier border
                context.strokeStyle = "rgba(200, 0, 0, 0.8)";
                context.lineWidth = 2;
                context.strokeRect(
                    barrier.x * Tile.SIZE,
                    barrier.y * Tile.SIZE,
                    barrier.width * Tile.SIZE,
                    barrier.height * Tile.SIZE
                );

                context.restore();
            }
        });
    }

    /**
     * Debug render for exits
     */
    renderExitDebug() {
        this.exits.forEach((exit) => {
            context.save();
            context.strokeStyle = this.isCleared ? "lime" : "yellow";
            context.lineWidth = 2;
            context.strokeRect(
                exit.x * Tile.SIZE,
                exit.y * Tile.SIZE,
                exit.width * Tile.SIZE,
                exit.height * Tile.SIZE
            );
            context.restore();
        });
    }

    /**
     * Check if room is cleared - called every frame
     */
    checkClear() {
        if (this.isCleared) return;

        // Check if all enemies are dead
        const allEnemiesDead = this.enemies.every((enemy) => enemy.isDead);
        const noEnemiesLeft = this.enemies.length === 0;

        if ((allEnemiesDead || noEnemiesLeft) && this.totalEnemiesSpawned > 0) {
            this.isCleared = true;

            // Remove all barriers
            this.barriers.forEach((barrier) => {
                barrier.active = false;
            });

            console.log(`Room ${this.roomNumber} cleared! Exits unlocked!`);

            // Award bonus points for clearing room
            const bonusPoints = 50 + this.roomNumber * 10;
            this.addScore(bonusPoints);
            console.log(`+${bonusPoints} ROOM CLEAR BONUS!`);
        }
    }

    /**
     * Check if player is touching an exit zone
     * @returns {object|null} Exit info if player is at exit, null otherwise
     */
    checkPlayerAtExit() {
        if (!this.isCleared) {
            return null; // Exits only work when room is cleared
        }

        const playerX = this.player.position.x;
        const playerY = this.player.position.y;
        const playerWidth = this.player.dimensions.x / Tile.SIZE;
        const playerHeight = this.player.dimensions.y / Tile.SIZE;

        // Check each exit
        for (const exit of this.exits) {
            // Check if player overlaps with exit zone
            if (
                playerX < exit.x + exit.width &&
                playerX + playerWidth > exit.x &&
                playerY < exit.y + exit.height &&
                playerY + playerHeight > exit.y
            ) {
                return {
                    nextRoom: exit.leadsTo,
                    entranceDirection: this.getOppositeDirection(
                        exit.direction
                    ),
                };
            }
        }

        return null;
    }

    /**
     * Get opposite direction for spawn positioning
     */
    getOppositeDirection(direction) {
        const opposites = {
            top: "bottom",
            bottom: "top",
            left: "right",
            right: "left",
        };
        return opposites[direction];
    }

    /**
     * Check if a position is blocked by an active barrier
     */
    isBlockedByBarrier(x, y) {
        const width = 1; // Assuming 1 tile width for checking
        const height = 1;

        for (const barrier of this.barriers) {
            if (!barrier.active) continue;

            // Check if position overlaps with barrier
            if (
                x < barrier.x + barrier.width &&
                x + width > barrier.x &&
                y < barrier.y + barrier.height &&
                y + height > barrier.y
            ) {
                return true;
            }
        }

        return false;
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
