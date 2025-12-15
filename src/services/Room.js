import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/Player.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import EnemyFactory from "./EnemyFactory.js";
import HUD from "./UserInterface/HUD.js";
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    DEBUG,
    images,
    input,
} from "../globals.js";
import BossHealthBar from "./UserInterface/BossHealthBar.js";

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
        entranceDirection = null,
        playerData = null
    ) {
        this.objects = [];

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

        if (playerData) {
            this.player.health = playerData.health;
            this.player.maxHealth = playerData.maxHealth;
            this.player.damageBoost = playerData.damageBoost;
        }
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

        this.hud = new HUD();
        this.bossHealthBar = new BossHealthBar();
        this.boss = null; // Will be set if room has a boss
    }

    /**
     * Define exit zones for this room
     * Only allows forward progression (no going back)
     */
    defineExits() {
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
                    y: 11,
                    width: 3,
                    height: 1,
                    direction: "bottom",
                    leadsTo: 5,
                },
            ],
            5: [
                // No exit - final room triggers victory when cleared
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
        // Room 1 starts in center
        if (entranceDirection === null) {
            return new Vector(7, 9); // Start near bottom-center
        }

        // All other rooms enter from top (coming from previous room)
        return new Vector(7, 1.5); // Spawn near top exit
    }

    spawnEnemies() {
        // Spawn enemies based on room number
        this.enemies = EnemyFactory.spawnEnemies(this.roomNumber, this);
        this.totalEnemiesSpawned = this.enemies.length;

        // Check if any enemy is a boss
        this.boss = this.enemies.find((enemy) => enemy.isBoss) || null;

        if (this.boss) {
            console.log("Boss detected in room!", this.boss);
            console.log(
                "Boss health:",
                this.boss.health,
                "isDead:",
                this.boss.isDead
            );
        } else {
            console.log("No boss in this room");
        }
    }

    update(dt) {
        this.player.update(dt);

        // Update all enemies
        this.enemies.forEach((enemy) => {
            enemy.update(dt);
        });

        // Clean up dead enemies and drop items
        this.enemies = this.enemies.filter((enemy) => {
            if (enemy.cleanupReady) {
                // Award score
                this.score += enemy.scoreValue;
                console.log(
                    `+${enemy.scoreValue} points! Total score: ${this.score}`
                );

                // Try to drop an item
                const droppedItem = enemy.dropItem();
                if (droppedItem) {
                    this.objects.push(droppedItem);
                }

                return false;
            }
            return true;
        });

        // Update objects and check for player pickup
        this.objects.forEach((object) => {
            object.update(dt);

            // Check if player collides with consumable item
            if (object.isConsumable && !object.wasConsumed) {
                if (object.didCollideWithPlayer(this.player)) {
                    object.onConsume(this.player);
                }
            }
        });

        // Remove consumed objects
        this.objects = this.objects.filter((object) => !object.cleanUp);

        // Check if room is cleared
        this.checkClear();

        // Check if player is at an exit
        const exitInfo = this.checkPlayerAtExit();
        if (exitInfo) {
            this.triggerRoomTransition = exitInfo;
        }
    }

    render() {
        if (this.renderBottomLayer) {
            this.bottomLayer.render();
        }

        if (this.renderCollisionLayer) {
            this.collisionLayer.render();
        }

        // Render all enemies
        this.enemies.forEach((enemy) => {
            enemy.render();
        });

        // Render all objects
        this.objects.forEach((object) => {
            object.render();
        });

        this.player.render();

        if (this.renderTopLayer) {
            this.topLayer.render();
        }

        // Render barriers
        this.renderBarriers();

        // Render HUD on top of everything
        this.hud.render(this.player, this.roomNumber, this.score);

        // Render boss health bar if boss exists
        if (this.boss) {
            console.log(
                "Boss exists - isDead:",
                this.boss.isDead,
                "health:",
                this.boss.health
            );
        }

        if (this.boss && !this.boss.isDead) {
            console.log("Rendering boss health bar!");
            this.bossHealthBar.render(this.boss, "ELITE SAMURAI");
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
                    entranceDirection: "top",
                };
            }
        }

        return null;
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
}
