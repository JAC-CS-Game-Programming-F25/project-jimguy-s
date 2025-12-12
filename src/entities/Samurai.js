import Enemy from "./Enemy.js";
import Sprite from "../../lib/Sprite.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";
import Vector from "../../lib/Vector.js";
import Tile from "../services/Tile.js";

export default class Samurai extends Enemy {
    /**
     * Samurai enemy - basic melee enemy
     *
     * @param {object} entityDefinition
     * @param {Room} room
     */
    constructor(entityDefinition = {}, room) {
        // Set Samurai-specific stats
        const samuraiDef = {
            ...entityDefinition,
            health: entityDefinition.health || 30,
            damage: entityDefinition.damage || 10,
            speed: entityDefinition.speed || 40,
            detectionRange: entityDefinition.detectionRange || 6,
            attackRange: entityDefinition.attackRange || 1.5,
            scoreValue: entityDefinition.scoreValue || 15,
        };

        super(samuraiDef, room);

        // Load all Samurai sprite sets
        this.idleSprites = this.initializeIdleSprites();
        this.walkSprites = this.initializeWalkSprites();
        this.attackSprites = this.initializeAttackSprites();
        this.deadSprites = this.initializeDeadSprites();

        // Start with idle sprites
        this.sprites = this.idleSprites;
    }

    initializeIdleSprites() {
        const samuraiImage = images.get(ImageName.SamuraiIdle);
        if (!samuraiImage) {
            console.error(`Samurai idle sprites not found!`);
            return [];
        }
        return Sprite.generateSpritesFromSpriteSheet(samuraiImage, Enemy.WIDTH, Enemy.HEIGHT);
    }

    initializeWalkSprites() {
        const samuraiImage = images.get(ImageName.SamuraiWalk);
        if (!samuraiImage) {
            console.error(`Samurai walk sprites not found!`);
            return [];
        }
        return Sprite.generateSpritesFromSpriteSheet(samuraiImage, 16, 16);
    }

    initializeAttackSprites() {
        const samuraiImage = images.get(ImageName.SamuraiAttack);
        if (!samuraiImage) {
            console.error(`Samurai attack sprites not found!`);
            return [];
        }
        return Sprite.generateSpritesFromSpriteSheet(samuraiImage, 16, 16);
    }

    initializeDeadSprites() {
        const samuraiImage = images.get(ImageName.SamuraiDead);
        if (!samuraiImage) {
            console.error(`Samurai dead sprites not found!`);
            return [];
        }
        return Sprite.generateSpritesFromSpriteSheet(samuraiImage, 16, 16);
    }
}
