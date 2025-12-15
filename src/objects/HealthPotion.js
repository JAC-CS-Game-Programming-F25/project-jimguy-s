import Item from "./Item.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images, sounds } from "../globals.js";
import Vector from "../../lib/Vector.js";
import SoundName from "../enums/SoundName.js";

export default class HealthPotion extends Item {
    static WIDTH = 9;
    static HEIGHT = 8;

    /**
     * A health potion that heals the player
     *
     * @param {Vector} dimensions
     * @param {Vector} position
     */
    constructor(dimensions, position) {
        super(dimensions, position);

        this.healAmount = 20; // Heals 1 heart (20 HP)

        // Load sprite
        this.sprites = [
            new Sprite(
                images.get(ImageName.HealthBoost),
                0,
                0,
                HealthPotion.WIDTH,
                HealthPotion.HEIGHT
            ),
        ];

        this.currentFrame = 0;
    }

    /**
     * Apply healing effect to player
     * @param {Player} player
     */
    applyEffect(player) {
        sounds.play(SoundName.HealthPickup);
        player.health = Math.min(
            player.health + this.healAmount,
            player.maxHealth
        );

        console.log(
            `Player picked up health potion! +${this.healAmount} HP (${player.health}/${player.maxHealth})`
        );
    }
}
