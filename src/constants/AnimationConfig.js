/**
 * Animation configuration for all sprites
 * Each animation defines frame count and duration
 */

export const PLAYER_ANIMATION_CONFIG = {
  idle: {
    frames: 4,
    frameWidth: 16,
    frameHeight: 16,
    frameDuration: 0.2,
  },
  walk: {
    frames: 4, // per direction
    frameWidth: 16,
    frameHeight: 16,
    frameDuration: 0.15,
    rows: 4, // 4 directions (down, left, right, up)
  },
  attack: {
    frames: 4,
    frameWidth: 16,
    frameHeight: 16,
    frameDuration: 0.1, // Fast attack
  },
  dead: {
    frames: 1,
    frameWidth: 16,
    frameHeight: 16,
    frameDuration: 1.0,
  },
};

export const ENEMY_ANIMATION_CONFIG = {
  idle: {
    frames: 4,
    frameWidth: 16,
    frameHeight: 16,
    frameDuration: 0.2,
  },
  walk: {
    frames: 4,
    frameWidth: 16,
    frameHeight: 16,
    frameDuration: 0.15,
    rows: 4,
  },
  attack: {
    frames: 4,
    frameWidth: 16,
    frameHeight: 16,
    frameDuration: 0.12,
  },
  dead: {
    frames: 1,
    frameWidth: 16,
    frameHeight: 16,
    frameDuration: 1.0,
  },
};

export const BOSS_ANIMATION_CONFIG = {
  idle: {
    frames: 6,
    frameWidth: 96,
    frameHeight: 48,
    frameDuration: 0.25,
  },
  walk: {
    frames: 4,
    frameWidth: 96,
    frameHeight: 48,
    frameDuration: 0.2,
  },
  charge: {
    frames: 4,
    frameWidth: 96,
    frameHeight: 48,
    frameDuration: 0.15,
  },
  attack: {
    frames: 4,
    frameWidth: 96,
    frameHeight: 48,
    frameDuration: 0.12,
  },
  hit: {
    frames: 4,
    frameWidth: 96,
    frameHeight: 48,
    frameDuration: 0.3,
  },
};
