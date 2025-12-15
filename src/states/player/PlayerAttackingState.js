import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Player from "../../entities/Player.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Tile from "../../services/Tile.js";
import SoundName from "../../enums/SoundName.js";
import MusicManager from "../../services/MusicManager.js";
import { sounds } from "../../globals.js";

export default class PlayerAttackingState extends State {
    /**
     * In this state, the player performs an attack animation.
     * The player cannot move during the attack.
     *
     * @param {Player} player
     */
    constructor(player) {
        super();

        this.player = player;

        // Attack animations - single frame per direction
        this.animation = {
            [Direction.Down]: new Animation([0], 0.3),
            [Direction.Up]: new Animation([1], 0.3),
            [Direction.Left]: new Animation([2], 0.3),
            [Direction.Right]: new Animation([3], 0.3),
        };

        this.attackTimer = 0;
        this.attackDuration = 0.3; // Duration of attack
        this.damageDealt = false; // Track if damage was dealt THIS attack
        this.attackDamage = 15; // Base attack damage
    }

    enter() {
        console.log("=== ENTERING ATTACK STATE ===");
        sounds.play(SoundName.Attack);

        // Switch to attack sprites
        this.player.sprites = this.player.attackSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
        this.player.currentAnimation.refresh();
        this.player.currentFrame =
            this.player.currentAnimation.getCurrentFrame();

        // Set attacking flag
        this.player.isAttacking = true;

        // Reset timers and flags
        this.attackTimer = 0;
        this.damageDealt = false;

        console.log(
            "Attack state entered. isAttacking =",
            this.player.isAttacking
        );
    }

    update(dt) {
        this.attackTimer += dt;

        // Damage window: ONLY between 0.1 and 0.11 seconds (very narrow window)
        if (
            !this.damageDealt &&
            this.attackTimer >= 0.1 &&
            this.attackTimer < 0.11
        ) {
            console.log("=== DAMAGE WINDOW - Checking for hits ===");
            this.dealDamage();
            this.damageDealt = true; // Mark as done - NEVER check again this attack
        }

        // Check if attack is complete
        if (this.attackTimer >= this.attackDuration) {
            console.log("=== Attack complete, returning to idle ===");
            this.player.changeState(PlayerStateName.Idling);
        }
    }

    dealDamage() {
        // Create hitbox based on direction
        const hitbox = this.createHitbox();

        console.log("Attack hitbox:", hitbox);
        console.log("Player position:", this.player.position);

        // Get all living enemies
        const enemies = this.player.room.enemies.filter((e) => !e.isDead);

        console.log(`Checking ${enemies.length} enemies for hits...`);

        let hitCount = 0;

        // Check each enemy
        enemies.forEach((enemy, index) => {
            const inHitbox = this.isInHitbox(enemy, hitbox);

            console.log(
                `Enemy ${index}: pos=(${enemy.position.x.toFixed(
                    2
                )}, ${enemy.position.y.toFixed(2)}), inHitbox=${inHitbox}`
            );

            if (inHitbox) {
                const damage =
                    this.attackDamage + (this.player.damageBoost || 0);
                const success = enemy.takeDamage(damage);

                if (success) {
                    console.log(`✓ HIT! Dealt ${damage} damage to enemy`);
                    hitCount++;
                } else {
                    console.log(`✗ Enemy was invulnerable`);
                }
            }
        });

        if (hitCount === 0) {
            console.log("Attack missed - no enemies hit");
        } else {
            console.log(`Attack hit ${hitCount} enemy/enemies`);
        }
    }

    createHitbox() {
        const size = 1.5;
        const reach = 1.0;

        let x = this.player.position.x;
        let y = this.player.position.y;

        // Offset hitbox based on direction
        switch (this.player.direction) {
            case Direction.Up:
                y -= reach;
                break;
            case Direction.Down:
                y += reach;
                break;
            case Direction.Left:
                x -= reach;
                break;
            case Direction.Right:
                x += reach;
                break;
        }

        return { x, y, width: size, height: size };
    }

    isInHitbox(enemy, hitbox) {
        const ex = enemy.position.x;
        const ey = enemy.position.y;
        const ew = enemy.dimensions.x / Tile.SIZE;
        const eh = enemy.dimensions.y / Tile.SIZE;

        // AABB collision
        return (
            ex < hitbox.x + hitbox.width &&
            ex + ew > hitbox.x &&
            ey < hitbox.y + hitbox.height &&
            ey + eh > hitbox.y
        );
    }

    exit() {
        console.log("=== EXITING ATTACK STATE ===");
        this.player.isAttacking = false;
        this.damageDealt = false;
        console.log(
            "Attack state exited. isAttacking =",
            this.player.isAttacking
        );
    }
}
