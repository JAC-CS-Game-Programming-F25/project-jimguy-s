import GameEntity from "./GameEntity.js";
import { images } from "../globals.js";
import StateMachine from "../../lib/StateMachine.js";
import PlayerWalkingState from "../states/player/PlayerWalkingState.js";
import PlayerIdlingState from "../states/player/PlayerIdlingState.js";
import PlayerAttackingState from "../states/player/PlayerAttackingState.js";
import PlayerStateName from "../enums/PlayerStateName.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import ImageName from "../enums/ImageName.js";
import Room from "../services/Room.js";

export default class Player extends GameEntity {
    static SPEED = 64; // pixels per second (4 tiles per second)

    constructor(entityDefinition = {}, room) {
        super(entityDefinition);

        this.room = room;
        this.dimensions = new Vector(GameEntity.WIDTH, GameEntity.HEIGHT);

        // Player stats
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damageBoost = 0; // Increased by collecting damage boost items

        // Damage state
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 1.0; // Longer invulnerability for player

        // Attack state - MUST be false by default
        this.isAttacking = false;

        // Attack cooldown to prevent spam
        this.attackCooldown = 0;
        this.attackCooldownDuration = 0.4; // 0.4 seconds between attacks

        // Initialize both sprite sets
        this.idleSprites = this.initializeIdleSprites();
        this.walkSprites = this.initializeWalkSprites();
        this.attackSprites = this.initializeAttackingSprites();
        this.sprites = this.idleSprites; // Start with idle

        // Initialize currentFrame to a valid value BEFORE state machine
        this.currentFrame = 0;

        // Initialize state machine (which will set currentAnimation)
        this.stateMachine = this.initializeStateMachine();

        // Now update currentAnimation from the initial state
        this.currentAnimation =
            this.stateMachine.currentState.animation[this.direction];
    }

    update(dt) {
        super.update(dt);

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
            if (this.attackCooldown < 0) {
                this.attackCooldown = 0;
            }
        }

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

    canAttack() {
        return !this.isAttacking && this.attackCooldown <= 0;
    }

    render() {
        const x = Math.floor(this.canvasPosition.x);
        const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

        // Flash when invulnerable
        if (
            this.isInvulnerable &&
            Math.floor(this.invulnerabilityTimer * 8) % 2 === 0
        ) {
            // Skip rendering every other frame for flashing effect
            return;
        }

        // Safety check before rendering
        if (this.sprites && this.sprites[this.currentFrame]) {
            super.render(x, y);
        } else {
            console.warn(
                `Player sprite at frame ${
                    this.currentFrame
                } is undefined. Total sprites: ${this.sprites?.length || 0}`
            );
        }
    }

    takeDamage(amount) {
        if (this.isInvulnerable || this.health <= 0) {
            return false;
        }

        this.health -= amount;
        this.isInvulnerable = true;
        this.invulnerabilityTimer = 0;

        console.log(
            `Player took ${amount} damage. Health: ${this.health}/${this.maxHealth}`
        );

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }

        return true;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        console.log(
            `Player healed ${amount} HP. Health: ${this.health}/${this.maxHealth}`
        );
    }

    increaseDamage(amount) {
        this.damageBoost += amount;
        console.log(
            `Player damage increased by ${amount}. Total boost: ${this.damageBoost}`
        );
    }

    die() {
        console.log("Player died! Game Over");
        // TODO: Transition to game over state
    }

    initializeStateMachine() {
        const stateMachine = new StateMachine();

        stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));
        stateMachine.add(PlayerStateName.Idling, new PlayerIdlingState(this));
        stateMachine.add(
            PlayerStateName.Attacking,
            new PlayerAttackingState(this)
        );

        // Start in idling state
        stateMachine.change(PlayerStateName.Idling);

        // Ensure isAttacking is false when not attacking
        this.isAttacking = false;

        return stateMachine;
    }

    initializeIdleSprites() {
        const playerImage = images.get(ImageName.PlayerIdle);

        if (!playerImage) {
            console.error(
                `Player idle image not found! ImageName: ${ImageName.PlayerIdle}`
            );
            return [];
        }

        const sprites = Sprite.generateSpritesFromSpriteSheet(
            playerImage,
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );

        console.log(`Generated ${sprites.length} idle sprites`);

        return sprites;
    }

    initializeWalkSprites() {
        const playerImage = images.get(ImageName.PlayerWalk);

        if (!playerImage) {
            console.error(
                `Player walk image not found! ImageName: ${ImageName.PlayerWalk}`
            );
            return [];
        }

        const sprites = Sprite.generateSpritesFromSpriteSheet(
            playerImage,
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );

        console.log(`Generated ${sprites.length} walk sprites`);

        return sprites;
    }

    initializeAttackingSprites() {
        const playerImage = images.get(ImageName.PlayerAttack);

        if (!playerImage) {
            console.error(
                `Player attack image not found! ImageName: ${ImageName.PlayerAttack}`
            );
            return [];
        }

        const sprites = Sprite.generateSpritesFromSpriteSheet(
            playerImage,
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );

        console.log(`Generated ${sprites.length} attack sprites`);

        return sprites;
    }
}
