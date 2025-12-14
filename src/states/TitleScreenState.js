import State from "../../lib/State.js";
import Button from "../services/UserInterface/Button.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, input, stateMachine } from "../globals.js";
import Input from "../../lib/Input.js";
import GameStateName from "../enums/GameStateName.js";

export default class TitleScreenState extends State {
    constructor() {
        super();
        
        this.buttons = [];
        this.selectedButtonIndex = 0;
    }

    enter() {
        // Create buttons
        const buttonWidth = 120;
        const buttonHeight = 30;
        const centerX = CANVAS_WIDTH / 2;
        const startY = CANVAS_HEIGHT / 3;
        const spacing = 40;

        this.buttons = [
            new Button(
                centerX,
                startY,
                buttonWidth,
                buttonHeight,
                "Start Game",
                () => stateMachine.change(GameStateName.Play)
            ),
            new Button(
                centerX,
                startY + spacing,
                buttonWidth,
                buttonHeight,
                "Instructions",
                () => stateMachine.change(GameStateName.Instructions)
            ),
            new Button(
                centerX,
                startY + spacing * 2,
                buttonWidth,
                buttonHeight,
                "High Scores",
                () => stateMachine.change(GameStateName.HighScores)
            )
        ];

        this.selectedButtonIndex = 0;
        this.buttons[0].isHovered = true;
    }

    update(dt) {
        // Navigate with up/down arrows or W/S
        if (input.isKeyPressed(Input.KEYS.ARROW_DOWN) || input.isKeyPressed(Input.KEYS.S)) {
            this.buttons[this.selectedButtonIndex].isHovered = false;
            this.selectedButtonIndex = (this.selectedButtonIndex + 1) % this.buttons.length;
            this.buttons[this.selectedButtonIndex].isHovered = true;
        }
        
        if (input.isKeyPressed(Input.KEYS.ARROW_UP) || input.isKeyPressed(Input.KEYS.W)) {
            this.buttons[this.selectedButtonIndex].isHovered = false;
            this.selectedButtonIndex = (this.selectedButtonIndex - 1 + this.buttons.length) % this.buttons.length;
            this.buttons[this.selectedButtonIndex].isHovered = true;
        }

        // Activate selected button with Enter
        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.buttons[this.selectedButtonIndex].onClick();
        }

        this.buttons.forEach(button => button.update());
    }

    render() {
        context.save();

        // Draw background (simple dark background)
        context.fillStyle = '#1a1a2e';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw title
        context.fillStyle = 'white';
        context.font = '24px gameFont';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Blades of the Dune', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 8);

        // Draw subtitle or version
        context.font = '12px gameFont';
        context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        context.fillText('Press ENTER to select', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);

        context.restore();

        // Draw buttons
        this.buttons.forEach(button => button.render());
    }
}