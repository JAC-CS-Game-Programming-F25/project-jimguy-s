import GameEntity from "./GameEntity.js";
import { images } from "../globals.js";
import StateMachine from "../../lib/StateMachine.js";
import PlayerWalkingState from "../states/player/PlayerWalkingState.js";
import PlayerIdlingState from "../states/player/PlayerIdlingState.js";
import PlayerStateName from "../enums/PlayerStateName.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import ImageName from "../enums/ImageName.js";
import Room from "../services/Room.js";

export default class Player extends GameEntity {
    constructor(entityDefinition = {}, room) {
        super(entityDefinition);

        this.room = room;
        this.dimensions = new Vector(GameEntity.WIDTH, GameEntity.HEIGHT);

        // Initialize sprites first
        this.sprites = this.initializeSprites();

        // Initialize currentFrame to a valid value BEFORE state machine
        this.currentFrame = 0;

        // Initialize state machine (which will set currentAnimation)
        this.stateMachine = this.initializeStateMachine();

        // Now update currentAnimation from the initial state
        this.currentAnimation =
            this.stateMachine.currentState.animation[this.direction];
    }

    update(dt) {
        super.update(dt);

        if (this.currentAnimation) {
            this.currentAnimation.update(dt);
            this.currentFrame = this.currentAnimation.getCurrentFrame();
        }
    }

    render() {
        const x = Math.floor(this.canvasPosition.x);
        const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

        // Safety check before rendering
        if (this.sprites && this.sprites[this.currentFrame]) {
            super.render(x, y);
        } else {
            console.warn(
                `Player sprite at frame ${
                    this.currentFrame
                } is undefined. Total sprites: ${this.sprites?.length || 0}`
            );
        }
    }

    initializeStateMachine() {
        const stateMachine = new StateMachine();

        stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));
        stateMachine.add(PlayerStateName.Idling, new PlayerIdlingState(this));

        stateMachine.change(PlayerStateName.Idling);

        return stateMachine;
    }

    initializeSprites() {
        // Check if the image exists
        const playerImage = images.get(ImageName.PlayerIdle);

        if (!playerImage) {
            console.error(
                `Player idle image not found! ImageName: ${ImageName.PlayerIdle}`
            );
            return [];
        }

        const sprites = Sprite.generateSpritesFromSpriteSheet(
            playerImage,
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );

        console.log(
            `Generated ${sprites.length} player sprites from image dimensions ${playerImage.width}x${playerImage.height}`
        );

        return sprites;
    }
}
