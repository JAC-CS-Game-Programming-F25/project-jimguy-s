import HealthPotion from "../objects/HealthPotion.js";
import DamageBoost from "../objects/DamageBoost.js";
import Vector from "../../lib/Vector.js";

export default class ItemFactory {
    /**
     * Factory for creating items
     */

    /**
     * Create a health potion
     * @param {Vector} position
     * @returns {HealthPotion}
     */
    static createHealthPotion(position) {
        return new HealthPotion(
            new Vector(HealthPotion.WIDTH, HealthPotion.HEIGHT),
            position
        );
    }

    /**
     * Create a damage boost
     * @param {Vector} position
     * @returns {DamageBoost}
     */
    static createDamageBoost(position) {
        return new DamageBoost(
            new Vector(DamageBoost.WIDTH, DamageBoost.HEIGHT),
            position
        );
    }

    /**
     * Try to drop an item from an enemy
     * @param {Enemy} enemy
     * @returns {Item|null}
     */
    static tryDropItem(enemy) {
        // Calculate drop position (center of enemy)
        const dropX = enemy.canvasPosition.x + enemy.dimensions.x / 2;
        const dropY = enemy.canvasPosition.y + enemy.dimensions.y / 2;

        // 45% chance for health potion
        const healthRoll = Math.random();
        if (healthRoll < 0.45) {
            const position = new Vector(
                dropX - HealthPotion.WIDTH / 2,
                dropY - HealthPotion.HEIGHT / 2
            );
            console.log("Enemy dropped health potion!");
            return this.createHealthPotion(position);
        }

        // 25% chance for damage boost (separate roll)
        const damageRoll = Math.random();
        if (damageRoll < 0.25) {
            const position = new Vector(
                dropX - DamageBoost.WIDTH / 2,
                dropY - DamageBoost.HEIGHT / 2
            );
            console.log("Enemy dropped damage boost!");
            return this.createDamageBoost(position);
        }

        // No drop
        return null;
    }
}
