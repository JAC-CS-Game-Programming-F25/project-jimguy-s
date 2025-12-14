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

export default class InstructionsState extends State {
    constructor() {
        super();
        this.backButton = null;
    }

    enter() {
        this.backButton = new Button(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 15,
            120,
            25,
            "Back to Menu",
            () => stateMachine.change(GameStateName.TitleScreen)
        );
        this.backButton.isHovered = true;
    }

    update(dt) {
        if (
            input.isKeyPressed(Input.KEYS.ENTER) ||
            input.isKeyPressed(Input.KEYS.SPACE) ||
            input.isKeyPressed(Input.KEYS.ESCAPE)
        ) {
            this.backButton.onClick();
        }

        this.backButton.update();
    }

    render() {
        context.save();

        // Desert background
        context.fillStyle = "#d4a574";
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw title
        context.fillStyle = "#5c3a21";
        context.font = "18px gameFont";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText("How to Play", CANVAS_WIDTH / 2, 10);

        // Draw controls section
        context.font = "12px gameFont";
        context.textAlign = "left";
        let y = 35;
        const leftMargin = 15;
        const lineHeight = 15;

        context.fillText("Controls:", leftMargin, y);
        y += lineHeight + 3;

        context.font = "10px gameFont";
        context.fillText("WASD - Move", leftMargin + 10, y);
        y += lineHeight;
        context.fillText("Spacebar - Attack", leftMargin + 10, y);
        y += lineHeight;
        context.fillText("ESC - Pause", leftMargin + 10, y);
        y += lineHeight;

        // Draw objective section
        context.font = "12px gameFont";
        context.fillText("Objective:", leftMargin, y);
        y += lineHeight;

        context.font = "10px gameFont";
        context.fillText("- Fight through 5 rooms", leftMargin + 10, y);
        y += lineHeight;
        context.fillText("- Defeat all enemies", leftMargin + 10, y);
        y += lineHeight;
        context.fillText("- Collect items to survive", leftMargin + 10, y);

        context.restore();

        // Draw back button
        this.backButton.render();
    }
}
