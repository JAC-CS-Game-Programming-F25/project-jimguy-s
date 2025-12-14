import Enemy from "./Enemy.js";
import Sprite from "../../lib/Sprite.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";
import Vector from "../../lib/Vector.js";
import Tile from "../services/Tile.js";

export default class Tengu extends Enemy {
    /**
     * Tengu enemy - faster, weaker enemy
     *
     * @param {object} entityDefinition
     * @param {Room} room
     */
    constructor(entityDefinition = {}, room) {
        // Set Tengu-specific stats
        const tenguDef = {
            ...entityDefinition,
            health: entityDefinition.health || 35,
            damage: entityDefinition.damage || 7,
            speed: entityDefinition.speed || 40,
            detectionRange: entityDefinition.detectionRange || 5,
            attackRange: entityDefinition.attackRange || 1,
            scoreValue: entityDefinition.scoreValue || 25,
        };

        super(tenguDef, room);

        // Load all Samurai sprite sets
        this.idleSprites = this.initializeIdleSprites();
        this.walkSprites = this.initializeWalkSprites();
        this.attackSprites = this.initializeAttackSprites();
        this.deadSprites = this.initializeDeadSprites();

        // Start with idle sprites
        this.sprites = this.idleSprites;
    }

    initializeIdleSprites() {
        const tenguImage = images.get(ImageName.TenguIdle);
        if (!tenguImage) {
            console.error(`Tengu idle sprites not found!`);
            return [];
        }
        return Sprite.generateSpritesFromSpriteSheet(tenguImage, 16, 16);
    }

    initializeWalkSprites() {
        const tenguImage = images.get(ImageName.TenguWalk);
        if (!tenguImage) {
            console.error(`Tengu walk sprites not found!`);
            return [];
        }
        return Sprite.generateSpritesFromSpriteSheet(tenguImage, 16, 16);
    }

    initializeAttackSprites() {
        const tenguImage = images.get(ImageName.TenguAttack);
        if (!tenguImage) {
            console.error(`Tengu attack sprites not found!`);
            return [];
        }
        return Sprite.generateSpritesFromSpriteSheet(tenguImage, 16, 16);
    }

    initializeDeadSprites() {
        const tenguImage = images.get(ImageName.TenguDead);
        if (!tenguImage) {
            console.error(`Tengu dead sprites not found!`);
            return [];
        }
        return Sprite.generateSpritesFromSpriteSheet(tenguImage, 16, 16);
    }
}
