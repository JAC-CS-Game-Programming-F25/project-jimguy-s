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

export default class HighScoresState extends State {
    static MAX_SCORES = 5;
    static STORAGE_KEY = "bladesOfDune_highScores";

    constructor() {
        super();
        this.backButton = null;
        this.highScores = [];
    }

    enter() {
        this.loadHighScores();

        this.backButton = new Button(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 30,
            140,
            35,
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
        context.fillText("High Scores", CANVAS_WIDTH / 2, 10);

        // Draw scores
        context.font = "14px gameFont";
        const startY = 50;
        const lineHeight = 22;

        if (this.highScores.length === 0) {
            context.fillStyle = "#8b6f47";
            context.fillText("No scores yet!", CANVAS_WIDTH / 2, startY + 30);
        } else {
            this.highScores.forEach((score, index) => {
                const y = startY + index * lineHeight;

                // Draw rank
                context.textAlign = "right";
                context.fillStyle = "#5c3a21";
                context.fillText(`${index + 1}.`, CANVAS_WIDTH / 2 - 40, y);

                // Draw score
                context.textAlign = "left";
                context.fillText(score.toString(), CANVAS_WIDTH / 2 - 20, y);
            });
        }

        context.restore();

        // Draw back button
        this.backButton.render();
    }

    loadHighScores() {
        try {
            const stored = localStorage.getItem(HighScoresState.STORAGE_KEY);
            if (stored) {
                this.highScores = JSON.parse(stored);
            } else {
                this.highScores = [];
            }
        } catch (e) {
            console.error("Failed to load high scores:", e);
            this.highScores = [];
        }
    }

    static saveScore(score) {
        try {
            // Load existing scores
            let scores = [];
            const stored = localStorage.getItem(HighScoresState.STORAGE_KEY);
            if (stored) {
                scores = JSON.parse(stored);
            }

            // Add new score
            scores.push(score);

            // Sort descending and keep top MAX_SCORES
            scores.sort((a, b) => b - a);
            scores = scores.slice(0, HighScoresState.MAX_SCORES);

            // Save back
            localStorage.setItem(
                HighScoresState.STORAGE_KEY,
                JSON.stringify(scores)
            );

            return scores.indexOf(score) !== -1; // Return true if score made the list
        } catch (e) {
            console.error("Failed to save high score:", e);
            return false;
        }
    }
}
