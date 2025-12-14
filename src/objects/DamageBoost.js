import Item from "./Item.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import Vector from "../../lib/Vector.js";

export default class DamageBoost extends Item {
    static WIDTH = 6;
    static HEIGHT = 15;

    /**
     * A damage boost that increases player attack permanently
     *
     * @param {Vector} dimensions
     * @param {Vector} position
     */
    constructor(dimensions, position) {
        super(dimensions, position);

        this.damageIncrease = 5; // +5 permanent damage

        // Load sprite
        this.sprites = [
            new Sprite(
                images.get(ImageName.DamageBoost),
                0,
                0,
                DamageBoost.WIDTH,
                DamageBoost.HEIGHT
            ),
        ];

        this.currentFrame = 0;
    }

    /**
     * Apply damage boost to player
     * @param {Player} player
     */
    applyEffect(player) {
        player.damageBoost = (player.damageBoost || 0) + this.damageIncrease;

        console.log(
            `Player picked up damage boost! +${this.damageIncrease} damage (Total boost: ${player.damageBoost})`
        );
    }
}
