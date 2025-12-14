import Sprite from "../../../lib/Sprite.js";
import { CANVAS_WIDTH, context, images } from "../../globals.js";
import ImageName from "../../enums/ImageName.js";

export default class HUD {
    /**
     * Heads-Up Display for showing player stats during gameplay
     */
    constructor() {
        // Load heart sprites (5 hearts total: empty, quarter, half, three-quarter, full)
        const heartsImage = images.get(ImageName.Hearts);

        if (!heartsImage) {
            console.error("Hearts image not found! Check config.json path.");
            this.heartSprites = [];
            return;
        }

        this.heartSprites = Sprite.generateSpritesFromSpriteSheet(
            heartsImage,
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

        // Draw left panel (hearts)
        this.renderPanel(3, 3, 90, 24);
        this.renderHealth(player.health, player.maxHealth);

        // Draw right panel (score and room)
        this.renderPanel(CANVAS_WIDTH - 68, 3, 65, 38);
        this.renderScore(score);
        this.renderRoomNumber(roomNumber);

        context.restore();
    }

    /**
     * Render a decorative panel background
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    renderPanel(x, y, width, height) {
        // Panel background (dark brown/tan)
        context.fillStyle = "rgba(92, 58, 33, 0.85)";
        context.fillRect(x, y, width, height);

        // Panel border (lighter brown)
        context.strokeStyle = "#8b6f47";
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);

        // Inner border (darker accent)
        context.strokeStyle = "#3d2817";
        context.lineWidth = 1;
        context.strokeRect(x + 2, y + 2, width - 4, height - 4);
    }

    /**
     * Render player health as hearts
     * @param {number} currentHealth
     * @param {number} maxHealth
     */
    renderHealth(currentHealth, maxHealth) {
        // If hearts didn't load, draw simple text instead
        if (!this.heartSprites || this.heartSprites.length === 0) {
            context.fillStyle = "#f5deb3";
            context.font = "12px gameFont";
            context.textAlign = "left";
            context.textBaseline = "top";
            context.fillText(
                `HP: ${Math.ceil(currentHealth)}/${maxHealth}`,
                8,
                8
            );
            return;
        }

        const heartsToShow = 5; // Show 5 hearts max
        const healthPerHeart = maxHealth / heartsToShow; // 100 / 5 = 20 HP per heart
        const startX = 8;
        const startY = 8;
        const heartSpacing = 16;

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
        context.fillStyle = "#f5deb3";
        context.font = "10px gameFont";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText(`Room ${roomNumber}/5`, CANVAS_WIDTH - 35, 28);
    }

    /**
     * Render current score
     * @param {number} score
     */
    renderScore(score) {
        context.fillStyle = "#f5deb3";
        context.font = "12px gameFont";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText(`Score:`, CANVAS_WIDTH - 35, 8);
        context.fillText(`${score}`, CANVAS_WIDTH - 35, 18);
    }
}
