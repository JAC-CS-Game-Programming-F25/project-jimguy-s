import SoundPool from "./SoundPool.js";

export default class Sounds {
    constructor() {
        this.sounds = {};
    }

    load(soundDefinitions) {
        soundDefinitions.forEach((soundDefinition) => {
            this.sounds[soundDefinition.name] = new SoundPool(
                soundDefinition.path,
                soundDefinition.size || 1,
                soundDefinition.volume || 1.0,
                soundDefinition.loop || false
            );
        });
    }

    get(name) {
        return this.sounds[name];
    }

    play(name, options = {}) {
        const sound = this.get(name);

        // If volume is specified in options, temporarily adjust it
        if (options.volume !== undefined) {
            const originalVolume = sound.volume;
            sound.pool.forEach((audio) => (audio.volume = options.volume));
        }

        sound.play();
    }

    pause(name) {
        this.get(name).pause();
    }

    stop(name) {
        this.get(name).stop();
    }
}
