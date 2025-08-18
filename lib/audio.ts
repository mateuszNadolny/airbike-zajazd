// Audio utility for timer sound effects
interface IAudioManager {
  play(soundKey: string): void;
  mute(): void;
  unmute(): void;
  toggleMute(): boolean;
  isMutedState(): boolean;
}

class AudioManager implements IAudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    // Only initialize on client side
    if (typeof window !== "undefined") {
      this.loadSounds();
      this.isInitialized = true;
    }
  }

  private loadSounds() {
    // Check if Audio API is available
    if (typeof Audio === "undefined") {
      console.warn("Audio API not available");
      return;
    }

    const soundFiles = [
      { key: "bell_start", path: "/bell_start.mp3" },
      { key: "bell_end", path: "/bell_end.mp3" },
      { key: "acc_start", path: "/acc_start.mp3" },
      { key: "acc_end", path: "/acc_end.mp3" },
    ];

    soundFiles.forEach(({ key, path }) => {
      try {
        const audio = new Audio(path);
        audio.preload = "auto";
        this.sounds.set(key, audio);
      } catch (error) {
        console.warn(`Failed to load sound ${key}:`, error);
      }
    });
  }

  play(soundKey: string) {
    if (this.isMuted || !this.isInitialized) return;

    const sound = this.sounds.get(soundKey);
    if (sound) {
      // Reset and play the sound
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.warn(`Failed to play sound ${soundKey}:`, error);
      });
    }
  }

  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  isMutedState() {
    return this.isMuted;
  }
}

// Create a singleton instance only on client side
let audioManager: IAudioManager;

if (typeof window !== "undefined") {
  audioManager = new AudioManager();
} else {
  // Create a mock audio manager for server side
  audioManager = {
    play: () => {},
    mute: () => {},
    unmute: () => {},
    toggleMute: () => false,
    isMutedState: () => false,
  };
}

export { audioManager };
