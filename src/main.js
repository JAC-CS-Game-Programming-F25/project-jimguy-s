import Game from "../lib/Game.js";
import PlayState from "./states/PlayState.js";
import {
    canvas,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    fonts,
    images,
    stateMachine,
    timer,
} from "./globals.js";

// Set the dimensions of the play area.
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.setAttribute("tabindex", "1"); // Allows the canvas to receive user input.

// Now that the canvas element has been prepared, we can add it to the DOM.
document.body.appendChild(canvas);

const { images: imageDefinitions, fonts: fontDefinitions } = await fetch(
    "../src/config.json"
).then((response) => response.json());

const mapDefinition = await fetch("../assets/maps/room1.json").then(
    (response) => response.json()
);

// Load all the assets from their definitions.
images.load(imageDefinitions);
fonts.load(fontDefinitions);

// Add all the states to the state machine.
stateMachine.add("PlayState", new PlayState(mapDefinition));

const game = new Game(
    stateMachine,
    context,
    timer,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
);

game.start();

// Focus the canvas so that the player doesn't have to click on it.
canvas.focus();
