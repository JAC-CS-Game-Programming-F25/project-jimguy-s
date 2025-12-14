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

    static createSamurai(roomNumber, position, room) {
        // Scale health and damage slightly with room number
        const entityDef = {
            position: position,
            health: 25 + (roomNumber - 1) * 3, // Room 1: 25 HP, Room 5: 37 HP
            damage: 8 + (roomNumber - 1) * 1, // Room 1: 8 dmg, Room 5: 12 dmg
            speed: 35,
        };

        return new Samurai(entityDef, room);
    }

    static createTengu(roomNumber, position, room) {
        const entityDef = {
            position: position,
            health: 15 + (roomNumber - 1) * 2, // Room 1: 15 HP, Room 5: 23 HP
            damage: 5 + (roomNumber - 1) * 1, // Room 1: 5 dmg, Room 5: 9 dmg
            speed: 55,
        };

        return new Tengu(entityDef, room);
    }

    /**
     * Main spawn function - creates enemies for a room
     * Uses Zelda-style logic: pick ONE enemy type, spawn multiple
     */
    static spawnEnemies(roomNumber, room) {
        const enemies = [];

        // Determine enemy count (increases with room number)
        const enemyCount = this.getEnemyCountForRoom(roomNumber);

        // Pick ONE enemy type for this entire room (Zelda-style)
        const enemyType = this.pickEnemyTypeForRoom(roomNumber);

        console.log(`Room ${roomNumber}: Spawning ${enemyCount} ${enemyType}s`);

        // Spawn all enemies of the chosen type
        for (let i = 0; i < enemyCount; i++) {
            const position = this.getValidSpawnPosition(room, enemies);
            const enemy = this.createEnemy(
                enemyType,
                roomNumber,
                room,
                position
            );

            if (enemy) {
                enemies.push(enemy);
            }
        }

        return enemies;
    }

    /**
     * Determine how many enemies to spawn based on room number
     */
    static getEnemyCountForRoom(roomNumber) {
        switch (roomNumber) {
            case 1:
                return 3; // Easy start
            case 2:
                return 4;
            case 3:
                return 5;
            case 4:
                return 6;
            case 5:
                return 7; // Challenging final room
            default:
                return 4;
        }
    }

    /**
     * Pick which enemy type to spawn in this room
     * Earlier rooms favor Samurai, later rooms can be either
     */
    static pickEnemyTypeForRoom(roomNumber) {
        if (roomNumber === 1) {
            return "samurai"; // Always samurai for first room (easier)
        } else if (roomNumber === 2) {
            return Math.random() < 0.7 ? "samurai" : "tengu"; // 70% samurai
        } else {
            return Math.random() < 0.5 ? "samurai" : "tengu"; // 50/50 mix
        }
    }

    /**
     * Get a valid spawn position that avoids walls and other enemies
     */
    static getValidSpawnPosition(room, existingEnemies) {
        const collisionLayer = room.collisionLayer;
        const maxAttempts = 50;
        let attempts = 0;

        while (attempts < maxAttempts) {
            // Random position within safe room bounds
            const x =
                Math.floor(Math.random() * (room.bottomLayer.width - 4)) + 2;
            const y =
                Math.floor(Math.random() * (room.bottomLayer.height - 4)) + 2;

            if (
                this.isValidSpawnPosition(
                    x,
                    y,
                    collisionLayer,
                    existingEnemies,
                    room
                )
            ) {
                return { x, y };
            }

            attempts++;
        }

        // Fallback to center if no valid position found
        console.warn("Could not find valid spawn position, using fallback");
        return {
            x: Math.floor(room.bottomLayer.width / 2),
            y: Math.floor(room.bottomLayer.height / 2),
        };
    }

    /**
     * Check if a spawn position is valid
     */
    static isValidSpawnPosition(x, y, collisionLayer, existingEnemies, room) {
        // Check if tile is collidable
        const tile = collisionLayer.getTile(x, y);
        if (tile !== null) {
            return false;
        }

        // Check surrounding tiles (2x2 area)
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

        // Don't spawn too close to player start position
        const playerSpawn = room.player ? room.player.position : { x: 7, y: 5 };
        const distToPlayer = Math.sqrt(
            Math.pow(x - playerSpawn.x, 2) + Math.pow(y - playerSpawn.y, 2)
        );

        if (distToPlayer < 3) {
            return false; // Too close to player
        }

        // Check distance from other enemies (minimum 2.5 tiles apart)
        const minDistance = 2.5;
        for (const enemy of existingEnemies) {
            const dx = enemy.position.x - x;
            const dy = enemy.position.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                return false;
            }
        }

        return true;
    }
}
