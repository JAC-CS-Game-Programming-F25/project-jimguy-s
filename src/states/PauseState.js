import State from "../../lib/State.js";
import Button from "../services/UserInterface/Button.js";
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    input,
    stateMachine,
} from "../globals.js";
import Input from "../../lib/Input.js";
import GameStateName from "../enums/GameStateName.js";

export default class PauseState extends State {
    constructor() {
        super();
        this.buttons = [];
        this.selectedButtonIndex = 0;
    }

    enter(params = {}) {
        const buttonWidth = 140;
        const buttonHeight = 35;
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        const spacing = 45;

        this.buttons = [
            new Button(
                centerX,
                centerY + 20,
                buttonWidth,
                buttonHeight,
                "Resume Game",
                () =>
                    stateMachine.change(GameStateName.Play, { resuming: true })
            ),
            new Button(
                centerX,
                centerY + 20 + spacing,
                buttonWidth,
                buttonHeight,
                "Quit to Menu",
                () => stateMachine.change(GameStateName.TitleScreen)
            ),
        ];

        this.selectedButtonIndex = 0;
        this.buttons[0].isHovered = true;
    }

    update(dt) {
        // ESC to resume
        if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
            stateMachine.change(GameStateName.Play);
            return;
        }

        // Navigate with up/down arrows or W/S
        if (
            input.isKeyPressed(Input.KEYS.ARROW_DOWN) ||
            input.isKeyPressed(Input.KEYS.S)
        ) {
            this.buttons[this.selectedButtonIndex].isHovered = false;
            this.selectedButtonIndex =
                (this.selectedButtonIndex + 1) % this.buttons.length;
            this.buttons[this.selectedButtonIndex].isHovered = true;
        }

        if (
            input.isKeyPressed(Input.KEYS.ARROW_UP) ||
            input.isKeyPressed(Input.KEYS.W)
        ) {
            this.buttons[this.selectedButtonIndex].isHovered = false;
            this.selectedButtonIndex =
                (this.selectedButtonIndex - 1 + this.buttons.length) %
                this.buttons.length;
            this.buttons[this.selectedButtonIndex].isHovered = true;
        }

        // Activate selected button with Enter or Space
        if (
            input.isKeyPressed(Input.KEYS.ENTER) ||
            input.isKeyPressed(Input.KEYS.SPACE)
        ) {
            this.buttons[this.selectedButtonIndex].onClick();
        }

        this.buttons.forEach((button) => button.update());
    }

    render() {
        context.save();

        // Draw semi-transparent dark overlay
        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw PAUSED text
        context.fillStyle = "#f5deb3";
        context.font = "24px gameFont";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

        context.restore();

        // Draw buttons
        this.buttons.forEach((button) => button.render());
    }
}
