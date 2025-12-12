import GameEntity from "./GameEntity.js";
import Vector from "../../lib/Vector.js";
import StateMachine from "../../lib/StateMachine.js";
import Direction from "../enums/Direction.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import EnemyIdlingState from "../states/enemy/EnemyIdlingState.js";
import EnemyWalkingState from "../states/enemy/EnemyWalkingState.js";
import EnemyChasingState from "../states/enemy/EnemyChasingState.js";
import EnemyAttackingState from "../states/enemy/EnemyAttackingState.js";
import Tile from "../services/Tile.js";
import { context } from "../globals.js";

export default class Enemy extends GameEntity {
    /**
     * Base enemy class that all enemy types will extend.
     *
     * @param {object} entityDefinition
     * @param {Room} room
     */
    constructor(entityDefinition = {}, room) {
        super(entityDefinition);

        this.room = room;
        this.dimensions = new Vector(GameEntity.WIDTH, GameEntity.HEIGHT);

        // Enemy stats
        this.health = entityDefinition.health || 30;
        this.maxHealth = this.health;
        this.damage = entityDefinition.damage || 5;
        this.speed = entityDefinition.speed || 32; // pixels per second
        this.detectionRange = entityDefinition.detectionRange || 5; // tiles
        this.attackRange = entityDefinition.attackRange || 1.5; // tiles
        this.scoreValue = entityDefinition.scoreValue || 10;

        // State tracking
        this.isDead = false;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 0.5; // seconds

        // Initialize state machine
        this.stateMachine = this.initializeStateMachine();
    }

    initializeStateMachine() {
        const stateMachine = new StateMachine();

        stateMachine.add(EnemyStateName.Idling, new EnemyIdlingState(this));
        stateMachine.add(EnemyStateName.Walking, new EnemyWalkingState(this));
        stateMachine.add(EnemyStateName.Chasing, new EnemyChasingState(this));
        stateMachine.add(
            EnemyStateName.Attacking,
            new EnemyAttackingState(this)
        );

        // Start in idle state
        stateMachine.change(EnemyStateName.Idling);

        return stateMachine;
    }

    update(dt) {
        if (this.isDead) return;

        super.update(dt);

        // Update invulnerability timer
        if (this.isInvulnerable) {
            this.invulnerabilityTimer += dt;
            if (this.invulnerabilityTimer >= this.invulnerabilityDuration) {
                this.isInvulnerable = false;
                this.invulnerabilityTimer = 0;
            }
        }

        if (this.currentAnimation) {
            this.currentAnimation.update(dt);
            this.currentFrame = this.currentAnimation.getCurrentFrame();
        }
    }

    render() {
        if (this.isDead) return;

        const x = Math.floor(this.canvasPosition.x);
        const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

        // Flash red if invulnerable (hit feedback)
        if (
            this.isInvulnerable &&
            Math.floor(this.invulnerabilityTimer * 10) % 2 === 0
        ) {
            // Skip rendering every other frame for flashing effect
            return;
        }

        if (this.sprites && this.sprites[this.currentFrame]) {
            super.render(x, y);
        }

        // Render health bar
        this.renderHealthBar();
    }

    renderHealthBar() {
        const barWidth = 16;
        const barHeight = 3;
        const x = Math.floor(this.canvasPosition.x);
        const y = Math.floor(this.canvasPosition.y - this.dimensions.y);

        // Background (red)
        context.fillStyle = "rgb(255, 0, 0)";
        context.fillRect(x, y, barWidth, barHeight);

        // Health (green)
        const healthWidth = (this.health / this.maxHealth) * barWidth;
        context.fillStyle = "rgb(0, 255, 0)";
        context.fillRect(x, y, healthWidth, barHeight);

        // Border
        context.strokeStyle = "rgb(0, 0, 0)";
        context.strokeRect(x, y, barWidth, barHeight);
    }

    takeDamage(amount) {
        if (this.isDead || this.isInvulnerable) {
            return false;
        }

        this.health -= amount;
        this.isInvulnerable = true;
        this.invulnerabilityTimer = 0;

        console.log(
            `Enemy took ${amount} damage. Health: ${this.health}/${this.maxHealth}`
        );

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }

        return true;
    }

    die() {
        this.isDead = true;
        console.log(`Enemy died! Score value: ${this.scoreValue}`);
        // TODO: Drop items, award score, play death animation
    }

    getDistanceToPlayer() {
        const player = this.room.player;
        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getDirectionToPlayer() {
        const player = this.room.player;
        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;

        // Determine primary direction
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? Direction.Right : Direction.Left;
        } else {
            return dy > 0 ? Direction.Down : Direction.Up;
        }
    }

    canSeePlayer() {
        return this.getDistanceToPlayer() <= this.detectionRange;
    }

    isPlayerInAttackRange() {
        return this.getDistanceToPlayer() <= this.attackRange;
    }

    /**
     * Check if moving to a position would collide with another enemy
     * @param {number} x - New X position in tiles
     * @param {number} y - New Y position in tiles
     * @returns {boolean} - True if would collide with another enemy
     */
    wouldCollideWithEnemy(x, y) {
        const minDistance = 1.2; // Minimum distance between enemies in tiles (increased)

        for (const enemy of this.room.enemies) {
            // Skip self and dead enemies
            if (enemy === this || enemy.isDead) continue;

            // Calculate center-to-center distance
            const dx = enemy.position.x - x;
            const dy = enemy.position.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                return true; // Would collide
            }
        }

        return false; // No collision
    }

    /**
     * Check if moving to a position is valid (no walls, no enemies)
     * @param {number} x - New X position in tiles
     * @param {number} y - New Y position in tiles
     * @returns {boolean} - True if position is valid
     */
    isValidMove(x, y) {
        const collisionLayer = this.room.collisionLayer;
        const width = this.dimensions.x / Tile.SIZE;
        const height = this.dimensions.y / Tile.SIZE;

        // Check collision tiles
        const topLeftTile = collisionLayer.getTile(
            Math.floor(x),
            Math.floor(y)
        );
        const topRightTile = collisionLayer.getTile(
            Math.floor(x + width - 0.01),
            Math.floor(y)
        );
        const bottomLeftTile = collisionLayer.getTile(
            Math.floor(x),
            Math.floor(y + height - 0.01)
        );
        const bottomRightTile = collisionLayer.getTile(
            Math.floor(x + width - 0.01),
            Math.floor(y + height - 0.01)
        );

        const noWallCollision =
            topLeftTile === null &&
            topRightTile === null &&
            bottomLeftTile === null &&
            bottomRightTile === null;

        // Check enemy collision
        const noEnemyCollision = !this.wouldCollideWithEnemy(x, y);

        return noWallCollision && noEnemyCollision;
    }
}
