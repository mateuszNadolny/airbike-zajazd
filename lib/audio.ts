interface IAudioManager {
  play(soundKey: string): void;
  mute(): void;
  unmute(): void;
  toggleMute(): boolean;
  isMutedState(): boolean;
  isAudioReady(): boolean;
}

class AudioManager implements IAudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private hasUserInteracted: boolean = false;
  private isIOS: boolean = false;
  private audioFiles = [
    { key: "bell_start", path: "/bell_start.mp3" },
    { key: "bell_end", path: "/bell_end.mp3" },
    { key: "acc_start", path: "/acc_start.mp3" },
    { key: "acc_end", path: "/acc_end.mp3" },
  ];

  constructor() {
    if (typeof window !== "undefined") {
      this.detectIOS();
      this.initializeAudio();
      this.setupUserInteractionListeners();
    }
  }

  private detectIOS() {
    this.isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (this.isIOS) {
      console.log("🍎 iOS device detected - using enhanced audio handling");
    }
  }

  private async initializeAudio() {
    try {
      // Create AudioContext with fallback for older browsers
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioContext = new AudioContextClass({
        // iOS-specific options for better compatibility
        sampleRate: this.isIOS ? 44100 : undefined,
        latencyHint: this.isIOS ? "interactive" : "balanced",
      });

      // Load all audio files
      await this.loadAudioFiles();

      this.isInitialized = true;
      console.log("🎵 Audio initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }

  private setupUserInteractionListeners() {
    // Listen for any user interaction to enable audio
    const enableAudio = async () => {
      if (this.audioContext && this.audioContext.state === "suspended") {
        try {
          await this.audioContext.resume();
          console.log("🎵 Audio context resumed");
        } catch (error) {
          console.error("Failed to resume audio context:", error);
        }
      }
      this.hasUserInteracted = true;

      // Remove listeners after first interaction
      document.removeEventListener("touchstart", enableAudio);
      document.removeEventListener("mousedown", enableAudio);
      document.removeEventListener("keydown", enableAudio);
      document.removeEventListener("touchend", enableAudio);
      document.removeEventListener("click", enableAudio);
    };

    // iOS Safari needs multiple event types
    document.addEventListener("touchstart", enableAudio, {
      once: true,
      passive: true,
    });
    document.addEventListener("mousedown", enableAudio, { once: true });
    document.addEventListener("keydown", enableAudio, { once: true });
    document.addEventListener("touchend", enableAudio, {
      once: true,
      passive: true,
    });
    document.addEventListener("click", enableAudio, { once: true });
  }

  private async loadAudioFiles() {
    const loadPromises = this.audioFiles.map(async ({ key, path }) => {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(
          arrayBuffer
        );
        this.audioBuffers.set(key, audioBuffer);
        console.log(`🎵 Loaded audio: ${key}`);
      } catch (error) {
        console.error(`Failed to load audio ${key}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      await this.initializeAudio();
      return;
    }

    // Resume suspended audio context (common on iOS)
    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
        console.log("🎵 Audio context resumed from suspended state");
      } catch (error) {
        console.error("Failed to resume audio context:", error);
      }
    }

    // Additional iOS handling
    if (this.isIOS && this.audioContext.state === "running") {
      // Ensure iOS audio context is fully ready
      try {
        // Create a silent buffer to "wake up" the audio context
        const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
        const silentSource = this.audioContext.createBufferSource();
        silentSource.buffer = silentBuffer;
        silentSource.connect(this.audioContext.destination);
        silentSource.start(0);
        silentSource.stop(0.001);
      } catch (error) {
        console.warn("iOS audio context wake-up failed:", error);
      }
    }
  }

  async play(soundKey: string) {
    if (this.isMuted || !this.isInitialized) {
      console.log(`🔇 Audio muted or not initialized, skipping: ${soundKey}`);
      return;
    }

    try {
      await this.ensureAudioContext();

      const audioBuffer = this.audioBuffers.get(soundKey);
      if (!audioBuffer) {
        console.warn(`Audio buffer not found for: ${soundKey}`);
        return;
      }

      // Create audio source and connect to destination
      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext!.destination);

      // iOS-specific volume adjustment
      if (this.isIOS) {
        const gainNode = this.audioContext!.createGain();
        gainNode.gain.setValueAtTime(0.8, this.audioContext!.currentTime); // Slightly lower volume for iOS
        source.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
      }

      // Play the sound
      source.start(0);
      console.log(`🔊 Playing sound: ${soundKey}`);

      // Clean up source after playback
      source.onended = () => {
        source.disconnect();
        if (this.isIOS) {
          // Additional cleanup for iOS
          try {
            source.stop();
          } catch (error) {
            // Ignore errors when stopping already stopped source
          }
        }
      };
    } catch (error) {
      console.error(`Failed to play sound ${soundKey}:`, error);
    }
  }

  mute() {
    this.isMuted = true;
    console.log("🔇 Audio muted");
  }

  unmute() {
    this.isMuted = false;
    console.log("🔊 Audio unmuted");
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    console.log(this.isMuted ? "🔇 Audio muted" : "🔊 Audio unmuted");
    return this.isMuted;
  }

  isMutedState() {
    return this.isMuted;
  }

  isAudioReady() {
    return this.isInitialized && this.audioBuffers.size > 0;
  }

  // Method to check if audio context is running (useful for debugging)
  getAudioContextState() {
    return this.audioContext?.state || "not_initialized";
  }

  // Method to get iOS detection status
  getIOSStatus() {
    return this.isIOS;
  }
}

let audioManager: IAudioManager;

if (typeof window !== "undefined") {
  audioManager = new AudioManager();
} else {
  audioManager = {
    play: () => {},
    mute: () => {},
    unmute: () => {},
    toggleMute: () => false,
    isMutedState: () => false,
    isAudioReady: () => false,
  };
}

export { audioManager };
