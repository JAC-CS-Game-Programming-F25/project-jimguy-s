import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/Player.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import EnemyFactory from "./EnemyFactory.js";
import HUD from "./UserInterface/HUD.js";
import BossHealthBar from "./UserInterface/BossHealthBar.js";
import ScreenShake from "./Juice/ScreenShake.js";
import Particle from "../../lib/Particle.js";
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    DEBUG,
    images,
    input,
    timer,
} from "../globals.js";
import Easing from "../../lib/Easing.js";

export default class Room {
    constructor(
        roomDefinition,
        roomNumber = 1,
        previousScore = 0,
        entranceDirection = null,
        playerData = null
    ) {
        this.objects = [];

        // JUICE: Particle and effect systems
        this.particles = [];
        this.damageNumbers = [];
        this.screenShake = new ScreenShake();

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
        this.exits = this.defineExits();
        this.barriers = this.defineBarriers();

        const spawnPosition = this.getSpawnPosition(entranceDirection);
        this.player = new Player({ position: spawnPosition }, this);

        if (playerData) {
            this.player.health = playerData.health;
            this.player.maxHealth = playerData.maxHealth;
            this.player.damageBoost = playerData.damageBoost;
        }

        this.score = previousScore;
        this.enemies = [];
        this.totalEnemiesSpawned = 0;
        this.spawnEnemies();
        this.isCleared = false;

        this.renderBottomLayer = true;
        this.renderCollisionLayer = true;
        this.renderTopLayer = true;

        this.hud = new HUD();
        this.bossHealthBar = new BossHealthBar();
        this.boss = null;
    }

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
            5: [],
        };

        return exitDefinitions[this.roomNumber] || [];
    }

    defineBarriers() {
        return this.exits.map((exit) => ({
            ...exit,
            active: true,
        }));
    }

    getSpawnPosition(entranceDirection) {
        if (entranceDirection === null) {
            return new Vector(7, 9);
        }
        return new Vector(7, 1.5);
    }

    spawnEnemies() {
        this.enemies = EnemyFactory.spawnEnemies(this.roomNumber, this);
        this.totalEnemiesSpawned = this.enemies.length;
        this.boss = this.enemies.find((enemy) => enemy.isBoss) || null;

        if (this.boss) {
            console.log("Boss detected in room!", this.boss);
        }
    }

    /**
     * JUICE: Add particles to the room
     */
    addParticles(particles) {
        this.particles.push(...particles);
    }

    /**
     * JUICE: Add damage number
     */
    addDamageNumber(damage, position, color = "#ff0000") {
        this.damageNumbers.push(new DamageNumber(damage, position, color));
    }

    update(dt) {
        // JUICE: Update screen shake
        this.screenShake.update(dt);

        // JUICE: Update particles
        this.particles = this.particles.filter((particle) => {
            particle.update(dt);
            return !particle.isDead;
        });

        // JUICE: Update damage numbers
        this.damageNumbers = this.damageNumbers.filter((num) => {
            num.update(dt);
            return !num.isDead;
        });

        this.player.update(dt);

        this.enemies.forEach((enemy) => {
            enemy.update(dt);
        });

        // Clean up dead enemies and drop items
        this.enemies = this.enemies.filter((enemy) => {
            if (enemy.cleanupReady) {
                this.score += enemy.scoreValue;
                console.log(
                    `+${enemy.scoreValue} points! Total score: ${this.score}`
                );

                // JUICE: Spawn explosion particles on enemy death
                const particlePos = new Vector(
                    enemy.canvasPosition.x + enemy.dimensions.x / 2,
                    enemy.canvasPosition.y + enemy.dimensions.y / 2
                );
                this.addParticles(
                    Particle.createExplosion(particlePos, "#ff4444", 20)
                );

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

            if (object.isConsumable && !object.wasConsumed) {
                if (object.didCollideWithPlayer(this.player)) {
                    // JUICE: Spawn sparkle particles on item pickup
                    const particlePos = new Vector(
                        object.position.x + object.dimensions.x / 2,
                        object.position.y + object.dimensions.y / 2
                    );

                    // Different colors for different items
                    const color =
                        object.constructor.name === "HealthPotion"
                            ? "#ff66ff"
                            : "#ffdd00";

                    this.addParticles(
                        Particle.createSparkles(particlePos, color)
                    );

                    object.onConsume(this.player);
                }
            }
        });

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
        context.save();

        // JUICE: Apply screen shake
        this.screenShake.apply(context);

        if (this.renderBottomLayer) {
            this.bottomLayer.render();
        }

        if (this.renderCollisionLayer) {
            this.collisionLayer.render();
        }

        this.enemies.forEach((enemy) => {
            enemy.render();
        });

        this.objects.forEach((object) => {
            object.render();
        });

        this.player.render();

        if (this.renderTopLayer) {
            this.topLayer.render();
        }

        // Render barriers
        this.renderBarriers();

        // JUICE: Render particles
        this.particles.forEach((particle) => {
            particle.render();
        });

        // JUICE: Render damage numbers
        this.damageNumbers.forEach((num) => {
            num.render();
        });

        // JUICE: Reset screen shake
        this.screenShake.reset(context);

        context.restore();

        // Render HUD on top (unaffected by shake)
        this.hud.render(this.player, this.roomNumber, this.score);

        if (this.boss && !this.boss.isDead) {
            this.bossHealthBar.render(this.boss, "ELITE SAMURAI");
        }
    }

    renderBarriers() {
        this.barriers.forEach((barrier) => {
            if (barrier.active) {
                context.save();

                // JUICE: Animated barrier with pulsing effect
                const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.3;
                context.fillStyle = `rgba(255, 0, 0, ${pulse})`;
                context.fillRect(
                    barrier.x * Tile.SIZE,
                    barrier.y * Tile.SIZE,
                    barrier.width * Tile.SIZE,
                    barrier.height * Tile.SIZE
                );

                context.strokeStyle = `rgba(200, 0, 0, ${pulse + 0.3})`;
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

    checkClear() {
        if (this.isCleared) return;

        const allEnemiesDead = this.enemies.every((enemy) => enemy.isDead);
        const noEnemiesLeft = this.enemies.length === 0;

        if ((allEnemiesDead || noEnemiesLeft) && this.totalEnemiesSpawned > 0) {
            this.isCleared = true;

            // JUICE: BARRIER BREAK EFFECT! 🎆
            this.barriers.forEach((barrier) => {
                if (barrier.active) {
                    // Screen shake when barriers drop
                    this.screenShake.shake(8, 0.5);

                    // Spawn barrier break particles
                    const particles = Particle.createBarrierBreak(
                        barrier.x * Tile.SIZE,
                        barrier.y * Tile.SIZE,
                        barrier.width * Tile.SIZE,
                        barrier.height * Tile.SIZE
                    );
                    this.addParticles(particles);

                    // Tween barriers fading out
                    barrier.opacity = 1.0;
                    timer.tween(
                        barrier,
                        { opacity: 0 },
                        0.5,
                        Easing.linear,
                        () => {
                            barrier.active = false;
                        }
                    );
                }
            });

            console.log(`Room ${this.roomNumber} cleared! Exits unlocked!`);

            const bonusPoints = 50 + this.roomNumber * 10;
            this.addScore(bonusPoints);
            console.log(`+${bonusPoints} ROOM CLEAR BONUS!`);
        }
    }

    checkPlayerAtExit() {
        if (!this.isCleared) {
            return null;
        }

        const playerX = this.player.position.x;
        const playerY = this.player.position.y;
        const playerWidth = this.player.dimensions.x / Tile.SIZE;
        const playerHeight = this.player.dimensions.y / Tile.SIZE;

        for (const exit of this.exits) {
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

    isBlockedByBarrier(x, y) {
        const width = 1;
        const height = 1;

        for (const barrier of this.barriers) {
            if (!barrier.active) continue;

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

    getScore() {
        return this.score;
    }

    addScore(points) {
        this.score += points;
        console.log(`+${points} points! Total score: ${this.score}`);
    }
}
