import Sprite from "../../../lib/Sprite.js";
import { CANVAS_WIDTH, context, images } from "../../globals.js";
import ImageName from "../../enums/ImageName.js";

export default class HUD {
    /**
     * Heads-Up Display for showing player stats during gameplay
     */
    constructor() {
        // Load heart sprites (5 hearts total: empty, quarter, half, three-quarter, full)
        this.heartSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Hearts),
            16,
            16
        );
    }

    /**
     * Render the HUD
     * @param {Player} player
     * @param {number} roomNumber
     * @param {number} score
     */
    render(player, roomNumber, score) {
        context.save();

        // Draw hearts for health
        this.renderHealth(player.health, player.maxHealth);

        // Draw room number
        this.renderRoomNumber(roomNumber);

        // Draw score
        this.renderScore(score);

        context.restore();
    }

    /**
     * Render player health as hearts
     * @param {number} currentHealth
     * @param {number} maxHealth
     */
    renderHealth(currentHealth, maxHealth) {
        const heartsToShow = 5; // Show 5 hearts max
        const healthPerHeart = maxHealth / heartsToShow; // 100 / 5 = 20 HP per heart
        const startX = 5;
        const startY = 5;
        const heartSpacing = 17; // 16px heart + 1px spacing

        for (let i = 0; i < heartsToShow; i++) {
            const heartHealth = currentHealth - i * healthPerHeart;
            let spriteIndex;

            if (heartHealth <= 0) {
                spriteIndex = 0; // Empty heart
            } else if (heartHealth <= healthPerHeart * 0.25) {
                spriteIndex = 1; // Quarter heart
            } else if (heartHealth <= healthPerHeart * 0.5) {
                spriteIndex = 2; // Half heart
            } else if (heartHealth <= healthPerHeart * 0.75) {
                spriteIndex = 3; // Three-quarter heart
            } else {
                spriteIndex = 4; // Full heart
            }

            const x = startX + i * heartSpacing;
            this.heartSprites[spriteIndex].render(x, startY);
        }
    }

    /**
     * Render current room number
     * @param {number} roomNumber
     */
    renderRoomNumber(roomNumber) {
        context.fillStyle = "#5c3a21";
        context.font = "12px gameFont";
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillText(`Room: ${roomNumber}/5`, 5, 25);
    }

    /**
     * Render current score
     * @param {number} score
     */
    renderScore(score) {
        context.fillStyle = "#5c3a21";
        context.font = "12px gameFont";
        context.textAlign = "right";
        context.textBaseline = "top";
        context.fillText(`Score: ${score}`, CANVAS_WIDTH - 5, 5);
    }
}
