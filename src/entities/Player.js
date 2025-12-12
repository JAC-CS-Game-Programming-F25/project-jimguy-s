import GameEntity from "./GameEntity.js";
import { images } from "../globals.js";
import StateMachine from "../../lib/StateMachine.js";
import PlayerWalkingState from "../states/player/PlayerWalkingState.js";
import PlayerIdlingState from "../states/player/PlayerIdlingState.js";
import PlayerAttackingState from "../states/player/PlayerAttackingState.js";
import PlayerDeadState from "../states/player/PlayerDeadState.js";
import PlayerStateName from "../enums/PlayerStateName.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import ImageName from "../enums/ImageName.js";
import Room from "../services/Room.js";

export default class Player extends GameEntity {
    static SPEED = 64;

    constructor(entityDefinition = {}, room) {
        super(entityDefinition);

        this.room = room;
        this.dimensions = new Vector(GameEntity.WIDTH, GameEntity.HEIGHT);

        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damageBoost = 0;

        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 1.0;

        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackCooldownDuration = 0.4;

        this.isDead = false;

        this.idleSprites = this.initializeIdleSprites();
        this.walkSprites = this.initializeWalkSprites();
        this.attackSprites = this.initializeAttackingSprites();
        this.deadSprites = this.initializeDeadSprites();
        this.sprites = this.idleSprites;

        this.currentFrame = 0;

        this.stateMachine = this.initializeStateMachine();

        this.currentAnimation =
            this.stateMachine.currentState.animation[this.direction];
    }

    update(dt) {
        super.update(dt);

        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
            if (this.attackCooldown < 0) {
                this.attackCooldown = 0;
            }
        }

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
        return !this.isAttacking && this.attackCooldown <= 0 && !this.isDead;
    }

    render() {
        const x = Math.floor(this.canvasPosition.x);
        const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

        if (
            this.isInvulnerable &&
            Math.floor(this.invulnerabilityTimer * 8) % 2 === 0
        ) {
            return;
        }

        if (this.sprites && this.sprites[this.currentFrame]) {
            super.render(x, y);
        }
    }

    takeDamage(amount) {
        if (this.isInvulnerable || this.isDead) {
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
        if (this.isDead) return;

        this.health = Math.min(this.health + amount, this.maxHealth);
        console.log(
            `Player healed ${amount} HP. Health: ${this.health}/${this.maxHealth}`
        );
    }

    increaseDamage(amount) {
        if (this.isDead) return;

        this.damageBoost += amount;
        console.log(
            `Player damage increased by ${amount}. Total boost: ${this.damageBoost}`
        );
    }

    die() {
        this.isDead = true;
        console.log("Player died!");
        this.changeState(PlayerStateName.Dead);
    }

    initializeStateMachine() {
        const stateMachine = new StateMachine();

        stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));
        stateMachine.add(PlayerStateName.Idling, new PlayerIdlingState(this));
        stateMachine.add(
            PlayerStateName.Attacking,
            new PlayerAttackingState(this)
        );
        stateMachine.add(PlayerStateName.Dead, new PlayerDeadState(this));

        stateMachine.change(PlayerStateName.Idling);

        this.isAttacking = false;

        return stateMachine;
    }

    initializeIdleSprites() {
        const playerImage = images.get(ImageName.PlayerIdle);

        if (!playerImage) {
            console.error(`Player idle image not found!`);
            return [];
        }

        return Sprite.generateSpritesFromSpriteSheet(
            playerImage,
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );
    }

    initializeWalkSprites() {
        const playerImage = images.get(ImageName.PlayerWalk);

        if (!playerImage) {
            console.error(`Player walk image not found!`);
            return [];
        }

        return Sprite.generateSpritesFromSpriteSheet(
            playerImage,
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );
    }

    initializeAttackingSprites() {
        const playerImage = images.get(ImageName.PlayerAttack);

        if (!playerImage) {
            console.error(`Player attack image not found!`);
            return [];
        }

        return Sprite.generateSpritesFromSpriteSheet(
            playerImage,
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );
    }

    initializeDeadSprites() {
        const playerImage = images.get(ImageName.PlayerDead);

        if (!playerImage) {
            console.error(`Player dead image not found!`);
            return [];
        }

        return Sprite.generateSpritesFromSpriteSheet(
            playerImage,
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );
    }
}
