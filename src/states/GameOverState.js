import State from "../../lib/State.js";
import Button from "../services/UserInterface/Button.js";
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    input,
    stateMachine,
    sounds,
} from "../globals.js";
import Input from "../../lib/Input.js";
import GameStateName from "../enums/GameStateName.js";
import HighScoresState from "./HighScoresState.js";
import SoundName from "../enums/SoundName.js";
import MusicManager from "../services/MusicManager.js";

export default class GameOverState extends State {
    constructor() {
        super();
        this.buttons = [];
        this.selectedButtonIndex = 0;
        this.finalScore = 0;
        this.isNewHighScore = false;
    }

    enter(params = {}) {
        MusicManager.play(SoundName.GameOverMusic, { loop: true, volume: 0.2 });
        this.finalScore = params.score || 0;

        // Check if this is a high score
        this.isNewHighScore = HighScoresState.saveScore(this.finalScore);

        const buttonWidth = 140;
        const buttonHeight = 35;
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2 + 30;
        const spacing = 45;

        this.buttons = [
            new Button(
                centerX,
                centerY,
                buttonWidth,
                buttonHeight,
                "Try Again",
                () => stateMachine.change(GameStateName.Play)
            ),
            new Button(
                centerX,
                centerY + spacing,
                buttonWidth,
                buttonHeight,
                "Main Menu",
                () => stateMachine.change(GameStateName.TitleScreen)
            ),
        ];

        this.selectedButtonIndex = 0;
        this.buttons[0].isHovered = true;
    }

    exit() {
        sounds.stop(SoundName.GameOverMusic);
        if (GameStateName.Play) {
            MusicManager.play(SoundName.PlayStateMusic, {
                loop: true,
                volume: 0.25,
            });
        }
        else {
            MusicManager.play(SoundName.MainMenuMusic, {
                loop: true,
                volume: 0.25,
            });
        }
    }

    update(dt) {
        // Navigate with up/down arrows or W/S
        if (
            input.isKeyPressed(Input.KEYS.ARROW_DOWN) ||
            input.isKeyPressed(Input.KEYS.S)
        ) {
            sounds.play(SoundName.Select);
            this.buttons[this.selectedButtonIndex].isHovered = false;
            this.selectedButtonIndex =
                (this.selectedButtonIndex + 1) % this.buttons.length;
            this.buttons[this.selectedButtonIndex].isHovered = true;
        }

        if (
            input.isKeyPressed(Input.KEYS.ARROW_UP) ||
            input.isKeyPressed(Input.KEYS.W)
        ) {
            sounds.play(SoundName.Select);
            this.buttons[this.selectedButtonIndex].isHovered = false;
            this.selectedButtonIndex =
                (this.selectedButtonIndex - 1 + this.buttons.length) %
                this.buttons.length;
            this.buttons[this.selectedButtonIndex].isHovered = true;
        }

        // Activate selected button with Enter
        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            sounds.play(SoundName.Select);
            this.buttons[this.selectedButtonIndex].onClick();
        }

        this.buttons.forEach((button) => button.update());
    }

    render() {
        context.save();

        // Dark desert background
        context.fillStyle = "#3d2817";
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw GAME OVER text
        context.fillStyle = "#cc0000";
        context.font = "28px gameFont";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);

        // Draw final score
        context.fillStyle = "#f5deb3";
        context.font = "16px gameFont";
        context.fillText(
            `Final Score: ${this.finalScore}`,
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 - 50
        );

        // Draw new high score message if applicable
        if (this.isNewHighScore) {
            context.fillStyle = "#ffdd00";
            context.font = "14px gameFont";
            context.fillText(
                "NEW HIGH SCORE!",
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2 - 25
            );
        }

        context.restore();

        // Draw buttons
        this.buttons.forEach((button) => button.render());
    }
}
