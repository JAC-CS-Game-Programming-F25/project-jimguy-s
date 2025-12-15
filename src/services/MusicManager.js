import { sounds } from "../globals.js";

export default class MusicManager {
    static currentMusic = null;

    /**
     * Play music only if it's different from what's currently playing
     */
    static play(musicName) {
        // If this music is already playing, don't restart it
        if (this.currentMusic === musicName) {
            return;
        }

        // Stop current music if any
        if (this.currentMusic) {
            sounds.stop(this.currentMusic);
        }

        // Play new music
        sounds.play(musicName);
        this.currentMusic = musicName;
    }

    /**
     * Stop all music
     */
    static stop() {
        if (this.currentMusic) {
            sounds.stop(this.currentMusic);
            this.currentMusic = null;
        }
    }

    /**
     * Check if specific music is currently playing
     */
    static isPlaying(musicName) {
        return this.currentMusic === musicName;
    }
}
