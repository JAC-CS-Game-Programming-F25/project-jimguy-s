import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import { context } from "../../globals.js";

export default class EnemyDeadState extends State {
    constructor(enemy) {
        super();

        this.enemy = enemy;

        this.animation = {
            [Direction.Down]: new Animation([0], 1),
            [Direction.Up]: new Animation([0], 1),
            [Direction.Left]: new Animation([0], 1),
            [Direction.Right]: new Animation([0], 1),
        };

        this.deathTimer = 0;
        this.deathDuration = 0.8;
        this.fadeTimer = 0;
        this.fadeDuration = 0.5;
    }

    enter() {
        this.enemy.sprites = this.enemy.deadSprites;
        this.enemy.currentAnimation = this.animation[this.enemy.direction];
        this.enemy.currentAnimation.refresh();
        this.enemy.currentFrame = 0;

        this.deathTimer = 0;
        this.fadeTimer = 0;

        console.log("Enemy entering death state");
    }

    update(dt) {
        this.deathTimer += dt;

        if (this.deathTimer >= 0.3) {
            this.fadeTimer += dt;
        }

        if (this.deathTimer >= this.deathDuration) {
            this.enemy.cleanupReady = true;
            console.log("Enemy cleanup ready");
        }
    }

    render() {
        let opacity = 1.0;
        if (this.fadeTimer > 0) {
            opacity = 1.0 - this.fadeTimer / this.fadeDuration;
            opacity = Math.max(0, Math.min(1, opacity));
        }

        if (opacity <= 0) {
            return;
        }

        const x = Math.floor(this.enemy.canvasPosition.x);
        const y = Math.floor(
            this.enemy.canvasPosition.y - this.enemy.dimensions.y / 2
        );

        const ctx = context;
        ctx.save();
        ctx.globalAlpha = opacity;

        if (this.enemy.sprites && this.enemy.sprites[0]) {
            this.enemy.sprites[0].render(x, y);
        }

        ctx.restore();
    }

    exit() {}
}
