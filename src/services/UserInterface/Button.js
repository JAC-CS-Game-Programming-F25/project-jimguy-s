import { context, input } from '../../globals.js';
import Input from '../../../lib/Input.js';

export default class Button {
    /**
     * A reusable button class for UI screens
     * 
     * @param {number} x - X position (center of button)
     * @param {number} y - Y position (center of button)
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {string} text - Button text
     * @param {Function} onClick - Callback when clicked
     */
    constructor(x, y, width, height, text, onClick) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.onClick = onClick;
        
        this.isHovered = false;
        this.wasPressed = false;
    }

    update() {
        // Check if mouse/cursor is over button (we'll use keyboard for now)
        // For keyboard navigation, we can extend this later
    }

    /**
     * Check if this button should be activated by keyboard
     * @param {string} key - The key to check (e.g., Input.KEYS.ENTER)
     * @returns {boolean}
     */
    checkKeyPress(key) {
        if (input.isKeyPressed(key)) {
            this.onClick();
            return true;
        }
        return false;
    }

    render() {
        context.save();

        context.fillStyle = this.isHovered ? '#8b6f47' : '#6b5333';
        context.fillRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );

        context.strokeStyle = '#3d2817';
        context.lineWidth = 2;
        context.strokeRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );

        // Button text (light tan)
        context.fillStyle = '#f5deb3';
        context.font = '16px gameFont';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.text, this.x, this.y);

        context.restore();
    }
}