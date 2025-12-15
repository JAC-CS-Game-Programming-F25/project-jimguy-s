export default class ScreenShake {
    constructor() {
        this.shakeAmount = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    shake(intensity = 5, duration = 0.3) {
        this.shakeAmount = intensity;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    update(dt) {
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;

            const intensity =
                (this.shakeTimer / this.shakeDuration) * this.shakeAmount;

            this.offsetX = (Math.random() - 0.5) * intensity * 2;
            this.offsetY = (Math.random() - 0.5) * intensity * 2;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }

    apply(ctx) {
        if (this.shakeTimer > 0) {
            ctx.translate(this.offsetX, this.offsetY);
        }
    }

    reset(ctx) {
        if (this.shakeTimer > 0) {
            ctx.translate(-this.offsetX, -this.offsetY);
        }
    }

    isShaking() {
        return this.shakeTimer > 0;
    }
}
