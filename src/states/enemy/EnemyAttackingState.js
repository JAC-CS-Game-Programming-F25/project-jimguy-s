import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class EnemyAttackingState extends State {
    /**
     * In this state, the enemy performs an attack animation.
     * After the attack completes, return to chasing if player is still in range,
     * otherwise return to idle.
     *
     * @param {Enemy} enemy
     */
    constructor(enemy) {
        super();

        this.enemy = enemy;

        // Attack animations - single frame per direction
        this.animation = {
            [Direction.Down]: new Animation([0], 0.3),
            [Direction.Up]: new Animation([1], 0.3),
            [Direction.Left]: new Animation([2], 0.3),
            [Direction.Right]: new Animation([3], 0.3),
        };

        this.attackTimer = 0;
        this.attackDuration = 0.3; // Duration of attack animation
        this.hasHit = false;
        this.attackCooldown = 1.0; // Time before can attack again
    }

    enter() {
        // Switch to attack sprites
        this.enemy.sprites = this.enemy.attackSprites;

        // Face the player
        this.enemy.direction = this.enemy.getDirectionToPlayer();
        this.enemy.currentAnimation = this.animation[this.enemy.direction];
        this.enemy.currentAnimation.refresh();
        this.enemy.currentFrame = this.enemy.currentAnimation.getCurrentFrame();

        this.attackTimer = 0;
        this.hasHit = false;
    }

    update(dt) {
        this.attackTimer += dt;

        // Deal damage during the attack (only once per attack)
        if (
            !this.hasHit &&
            this.attackTimer >= 0.1 &&
            this.attackTimer <= 0.2
        ) {
            this.checkForHit();
        }

        // Check if attack animation is complete
        if (this.attackTimer >= this.attackDuration) {
            // After attacking, return to chasing if player is still in range
            if (this.enemy.canSeePlayer()) {
                this.enemy.changeState(EnemyStateName.Chasing);
            } else {
                this.enemy.changeState(EnemyStateName.Idling);
            }
        }
    }

    checkForHit() {
        this.hasHit = true;

        const player = this.enemy.room.player;
        const distance = this.enemy.getDistanceToPlayer();

        // If player is still in attack range, deal damage
        if (distance <= this.enemy.attackRange) {
            // Check if player has a takeDamage method
            if (player.takeDamage) {
                player.takeDamage(this.enemy.damage);
                console.log(
                    `Enemy hit player for ${this.enemy.damage} damage!`
                );
            } else {
                console.log("Player hit! (takeDamage not implemented yet)");
            }
        }
    }

    exit() {
        this.hasHit = false;
    }
}
