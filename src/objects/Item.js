import GameObject from "./GameObject.js";

export default class Item extends GameObject {
    /**
     * Abstract base class for all items (extends GameObject)
     *
     * @param {Vector} dimensions
     * @param {Vector} position
     */
    constructor(dimensions, position) {
        super(dimensions, position);

        this.isConsumable = true;
        this.renderPriority = -1; // Render below player
    }

    /**
     * Apply effect to player - override in child classes
     * @param {Player} player
     */
    applyEffect(player) {
        // Override this in HealthPotion and DamageBoost
    }

    /**
     * Called when player picks up the item
     * @param {Player} consumer
     */
    onConsume(consumer) {
        super.onConsume(consumer);
        this.applyEffect(consumer);
        this.cleanUp = true;
    }
}
