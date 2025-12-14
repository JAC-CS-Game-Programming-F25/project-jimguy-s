import Game from "../lib/Game.js";
import TitleScreenState from "./states/TitleScreenState.js";
import PlayState from "./states/PlayState.js";
import GameStateName from "./enums/GameStateName.js";
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
canvas.setAttribute("tabindex", "1");

// Add to DOM
document.body.appendChild(canvas);

// Load assets
const { images: imageDefinitions, fonts: fontDefinitions } = await fetch(
    "../src/config.json"
).then((response) => response.json());

images.load(imageDefinitions);
fonts.load(fontDefinitions);

// Add states
stateMachine.add(GameStateName.TitleScreen, new TitleScreenState());
stateMachine.add(GameStateName.Play, new PlayState());

const game = new Game(
    stateMachine,
    context,
    timer,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
);

// Start at title screen instead of play
stateMachine.change(GameStateName.TitleScreen);

game.start();

// Focus canvas
canvas.focus();
