import Samurai from "../entities/Samurai.js";
import Tengu from "../entities/Tengu.js";
import Tile from "./Tile.js";

export default class EnemyFactory {
    /**
     * Factory for creating different enemy types
     */
    static createEnemy(type, roomNumber, room, position) {
        switch (type) {
            case "samurai":
                return this.createSamurai(roomNumber, position, room);
            case "tengu":
                return this.createTengu(roomNumber, position, room);
            default:
                console.error(`Unknown enemy type: ${type}`);
                return null;
        }
    }

    /**
     * Create a Samurai enemy
     * @param {number} roomNumber
     * @param {Vector} position
     * @param {Room} room
     * @returns {Samurai}
     */
    static createSamurai(roomNumber, position, room) {
        const entityDef = {
            position: position,
            health: 30 + roomNumber * 5, // Scale with room number
            damage: 10 + roomNumber * 2,
            speed: 40,
        };

        return new Samurai(entityDef, room);
    }

    /**
     * Create a Tengu enemy
     * @param {number} roomNumber
     * @param {Vector} position
     * @param {Room} room
     * @returns {Tengu}
     */
    static createTengu(roomNumber, position, room) {
        const entityDef = {
            position: position,
            health: 20 + roomNumber * 3, // Scale with room number
            damage: 7 + roomNumber * 2,
            speed: 50,
        };

        return new Tengu(entityDef, room);
    }

    /**
     * Get a valid spawn position that avoids walls and other enemies
     * @param {Room} room
     * @param {Array} existingEnemies - Already spawned enemies to avoid
     * @returns {Vector}
     */
    static getValidSpawnPosition(room, existingEnemies) {
        const collisionLayer = room.collisionLayer;
        const maxAttempts = 100;
        let attempts = 0;

        while (attempts < maxAttempts) {
            // Random position within room bounds (avoiding edges)
            const x =
                Math.floor(Math.random() * (room.bottomLayer.width - 4)) + 2;
            const y =
                Math.floor(Math.random() * (room.bottomLayer.height - 4)) + 2;

            // Check if this position is valid (not on collision tiles)
            if (
                this.isValidSpawnPosition(x, y, collisionLayer, existingEnemies)
            ) {
                return { x, y };
            }

            attempts++;
        }

        // Fallback to center if no valid position found
        console.warn("Could not find valid spawn position, using center");
        return {
            x: Math.floor(room.bottomLayer.width / 2),
            y: Math.floor(room.bottomLayer.height / 2),
        };
    }

    /**
     * Check if a spawn position is valid (no collisions, not too close to other enemies)
     * @param {number} x
     * @param {number} y
     * @param {Layer} collisionLayer
     * @param {Array} existingEnemies
     * @returns {boolean}
     */
    static isValidSpawnPosition(x, y, collisionLayer, existingEnemies) {
        // Check if tile is collidable
        const tile = collisionLayer.getTile(x, y);
        if (tile !== null) {
            return false; // There's a collision tile here
        }

        // Check surrounding tiles (2x2 area for enemy size)
        const topRightTile = collisionLayer.getTile(x + 1, y);
        const bottomLeftTile = collisionLayer.getTile(x, y + 1);
        const bottomRightTile = collisionLayer.getTile(x + 1, y + 1);

        if (
            topRightTile !== null ||
            bottomLeftTile !== null ||
            bottomRightTile !== null
        ) {
            return false;
        }

        // Check distance from other enemies (minimum 3 tiles apart)
        const minDistance = 3;
        for (const enemy of existingEnemies) {
            const dx = enemy.position.x - x;
            const dy = enemy.position.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                return false; // Too close to another enemy
            }
        }

        return true;
    }

    /**
     * Get predefined spawn positions for specific rooms
     * @param {number} roomNumber
     * @param {Room} room
     * @returns {Array<Vector>} Array of spawn positions
     */
    static getPredefinedSpawnPositions(roomNumber, room) {
        // For Room 1, use these specific spawn positions
        // You can customize this for each room
        const roomSpawns = {
            1: [
                { x: 4, y: 10 },
                { x: 7, y: 10 },
                { x: 10, y: 10 },
            ],
            2: [
                { x: 3, y: 3 },
                { x: 11, y: 3 },
                { x: 3, y: 8 },
                { x: 11, y: 8 },
            ],
            3: [
                { x: 4, y: 4 },
                { x: 10, y: 4 },
                { x: 4, y: 8 },
                { x: 10, y: 8 },
                { x: 7, y: 6 },
            ],
            4: [
                { x: 3, y: 3 },
                { x: 11, y: 3 },
                { x: 3, y: 8 },
                { x: 11, y: 8 },
                { x: 7, y: 5 },
                { x: 7, y: 7 },
            ],
            5: [
                // Boss room - fewer regular enemies
                { x: 4, y: 4 },
                { x: 10, y: 4 },
            ],
        };

        return roomSpawns[roomNumber] || [];
    }

    /**
     * Spawn enemies for a room based on room number
     * @param {number} roomNumber
     * @param {Room} room
     * @returns {Array<Enemy>}
     */
    static spawnEnemies(roomNumber, room) {
        const enemies = [];

        // Get predefined positions or generate valid ones
        let spawnPositions = this.getPredefinedSpawnPositions(roomNumber, room);

        // Calculate enemy count based on room number
        const enemyCount = Math.min(2 + roomNumber, 6); // 3-6 enemies

        // If we don't have predefined positions, generate them
        if (spawnPositions.length === 0) {
            for (let i = 0; i < enemyCount; i++) {
                const position = this.getValidSpawnPosition(room, enemies);
                spawnPositions.push(position);
            }
        }

        // Create enemies at spawn positions
        for (let i = 0; i < Math.min(enemyCount, spawnPositions.length); i++) {
            const position = spawnPositions[i];

            // Mix of enemy types (60% samurai, 40% tengu)
            const type = Math.random() < 0.6 ? "samurai" : "tengu";
            const enemy = this.createEnemy(type, roomNumber, room, position);

            if (enemy) {
                enemies.push(enemy);
            }
        }

        console.log(`Spawned ${enemies.length} enemies for room ${roomNumber}`);
        return enemies;
    }
}
