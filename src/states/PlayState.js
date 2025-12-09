import State from "../../lib/State.js";
import { context, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";

export default class PlayState extends State {
  constructor() {
    super();
  }

  enter() {
    // TODO: Initialize game state
  }

  update(dt) {
    // TODO: Update game logic
  }

  render() {
    // Clear canvas
    context.fillStyle = "#2a1810";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // TODO: Render game objects
  }
}
