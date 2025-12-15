import { context } from "../src/globals.js";
import Vector from "./Vector.js";

export default class Particle {
    constructor(
        position,
        velocity,
        color = "#ffffff",
        lifetime = 1.0,
        size = 2
    ) {
        // Always create new Vectors from x and y properties
        this.position = new Vector(position.x || 0, position.y || 0);
        this.velocity = new Vector(velocity.x || 0, velocity.y || 0);

        this.color = color;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.size = size;
        this.alpha = 1.0;
        this.isDead = false;
    }

    update(dt) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        this.velocity.y += 50 * dt;
        this.velocity.x *= 0.95;

        this.lifetime -= dt;
        this.alpha = this.lifetime / this.maxLifetime;

        if (this.lifetime <= 0) {
            this.isDead = true;
        }
    }

    render() {
        if (this.isDead) return;

        context.save();
        context.globalAlpha = this.alpha;
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(
            this.position.x,
            this.position.y,
            this.size,
            0,
            Math.PI * 2
        );
        context.fill();
        context.restore();
    }

    static createExplosion(position, color = "#ffaa00", count = 15) {
        const particles = [];
        const posX = position.x || 0;
        const posY = position.y || 0;

        // Reduced count from 15 to 6 (60% reduction)
        const actualCount = Math.floor(count * 0.4);

        for (let i = 0; i < actualCount; i++) {
            const angle = (Math.PI * 2 * i) / actualCount;
            // Reduced speed: was 50-100, now 20-40 (60% reduction)
            const speed = 20 + Math.random() * 20;

            const vel = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed,
            };

            const lifetime = 0.5 + Math.random() * 0.5;
            const size = 1 + Math.random() * 3;

            particles.push(
                new Particle({ x: posX, y: posY }, vel, color, lifetime, size)
            );
        }

        return particles;
    }

    static createSparkles(position, color = "#ffdd00") {
        const particles = [];
        // Reduced count from 20 to 8 (60% reduction)
        const count = 8;
        const posX = position.x || 0;
        const posY = position.y || 0;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            // Reduced speed: was 30-70, now 12-28 (60% reduction)
            const speed = 12 + Math.random() * 16;

            const vel = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed - 12, // Reduced upward bias
            };

            const lifetime = 0.8 + Math.random() * 0.4;
            const size = 1 + Math.random() * 2;

            particles.push(
                new Particle({ x: posX, y: posY }, vel, color, lifetime, size)
            );
        }

        return particles;
    }

    static createImpact(position, direction = { x: 1, y: 0 }) {
        const particles = [];
        // Reduced count from 8 to 3 (62% reduction)
        const count = 3;
        const posX = position.x || 0;
        const posY = position.y || 0;
        const dirX = direction.x || 1;
        const dirY = direction.y || 0;

        for (let i = 0; i < count; i++) {
            const spreadAngle = (Math.random() - 0.5) * Math.PI;
            const baseAngle = Math.atan2(dirY, dirX);
            const angle = baseAngle + spreadAngle;
            // Reduced speed: was 40-70, now 16-28 (60% reduction)
            const speed = 16 + Math.random() * 12;

            const vel = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed,
            };

            const lifetime = 0.3 + Math.random() * 0.2;
            const size = 2 + Math.random() * 2;
            const color = Math.random() > 0.5 ? "#ff0000" : "#ffaa00";

            particles.push(
                new Particle({ x: posX, y: posY }, vel, color, lifetime, size)
            );
        }

        return particles;
    }

    static createBarrierBreak(x, y, width, height) {
        const particles = [];
        // Reduced count from 30 to 12 (60% reduction)
        const count = 12;

        for (let i = 0; i < count; i++) {
            const posX = x + Math.random() * width;
            const posY = y + Math.random() * height;

            const angle = Math.random() * Math.PI * 2;
            // Reduced speed: was 60-100, now 24-40 (60% reduction)
            const speed = 24 + Math.random() * 16;

            const vel = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed - 8, // Reduced upward bias
            };

            const lifetime = 1.0 + Math.random() * 0.5;
            const size = 2 + Math.random() * 3;
            const color = "#ff0000";

            particles.push(
                new Particle({ x: posX, y: posY }, vel, color, lifetime, size)
            );
        }

        return particles;
    }
}
