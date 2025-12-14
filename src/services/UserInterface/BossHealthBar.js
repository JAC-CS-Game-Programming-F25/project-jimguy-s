import { context } from "../../globals.js";

export default class BossHealthBar {
    /**
     * Special health bar for boss enemy that renders above the boss
     */
    constructor() {
        this.barWidth = 60;
        this.barHeight = 8;
    }

    /**
     * Render the boss health bar above the boss enemy
     * @param {Enemy} boss
     */
    render(boss) {
        if (!boss || boss.isDead) return;

        const x = Math.floor(boss.canvasPosition.x - this.barWidth / 2 + 8); // Center it
        const y = Math.floor(boss.canvasPosition.y - boss.dimensions.y - 20); // Above boss

        context.save();

        // "BOSS" label
        context.fillStyle = "#ff0000";
        context.font = "8px Joystix";
        context.textAlign = "center";
        context.textBaseline = "bottom";
        context.fillText("BOSS", x + this.barWidth / 2, y - 3);

        // Background (dark red)
        context.fillStyle = "#4a0000";
        context.fillRect(x, y, this.barWidth, this.barHeight);

        // Health bar (color based on health percentage)
        const healthPercent = boss.health / boss.maxHealth;
        const healthWidth = healthPercent * this.barWidth;

        if (healthPercent > 0.66) {
            context.fillStyle = "#00ff00"; // Green
        } else if (healthPercent > 0.33) {
            context.fillStyle = "#ffaa00"; // Orange
        } else {
            context.fillStyle = "#ff0000"; // Red
        }

        context.fillRect(x, y, healthWidth, this.barHeight);

        // Outer border (white, thicker for boss)
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.strokeRect(x, y, this.barWidth, this.barHeight);

        // Inner border (black accent)
        context.strokeStyle = "#000000";
        context.lineWidth = 1;
        context.strokeRect(x + 1, y + 1, this.barWidth - 2, this.barHeight - 2);

        context.restore();
    }
}
