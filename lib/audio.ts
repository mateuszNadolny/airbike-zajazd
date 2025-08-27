interface IAudioManager {
  play(soundKey: string): Promise<void>;
  mute(): void;
  unmute(): void;
  toggleMute(): boolean;
  isMutedState(): boolean;
  isAudioReady(): boolean;
  requestAudioPermission(): Promise<boolean>;
  getAudioStatus(): string;
}

class AudioManager implements IAudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private hasUserInteracted: boolean = false;
  private isIOS: boolean = false;
  private isPWA: boolean = false;
  private audioPermissionRequested: boolean = false;
  private audioFiles = [
    { key: "bell_start", path: "/bell_start.mp3" },
    { key: "bell_end", path: "/bell_end.mp3" },
    { key: "acc_start", path: "/acc_start.mp3" },
    { key: "acc_end", path: "/acc_end.mp3" },
  ];

  constructor() {
    if (typeof window !== "undefined") {
      this.detectIOS();
      // Initialize audio differently based on iOS and PWA status
      if (!this.isIOS || this.isPWA) {
        // Initialize immediately for non-iOS or PWA mode
        this.initializeAudio();
      }
      this.setupUserInteractionListeners();
    }
  }

  private detectIOS() {
    this.isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Check if running in PWA mode
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as typeof window.navigator & { standalone?: boolean })
        .standalone === true;

    if (this.isIOS) {
      if (isPWA) {
        console.log(
          "🍎 iOS PWA detected - using enhanced audio handling for standalone mode"
        );
      } else {
        console.log(
          "🍎 iOS browser detected - audio will be initialized on first user interaction"
        );
      }
    }

    // Store PWA status for later use
    this.isPWA = isPWA;
  }

  // New method: Request audio permission explicitly
  async requestAudioPermission(): Promise<boolean> {
    if (this.isAudioReady()) {
      return true;
    }

    if (this.isIOS && !this.hasUserInteracted) {
      console.log(
        "🍎 iOS: Audio permission requested but no user interaction yet"
      );
      return false;
    }

    try {
      await this.initializeAudio();
      this.audioPermissionRequested = true;
      return this.isAudioReady();
    } catch (error) {
      console.error("Failed to request audio permission:", error);
      return false;
    }
  }

  private async initializeAudio() {
    if (this.isInitialized) return;

    try {
      // Create AudioContext with iOS-specific options
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      this.audioContext = new AudioContextClass({
        sampleRate: this.isIOS ? 44100 : undefined,
        latencyHint: this.isIOS ? "interactive" : "balanced",
      });

      // For iOS, we need to resume the context immediately after creation
      if (this.isIOS && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
        console.log("🍎 iOS Audio context resumed after creation");
      }

      // Load all audio files
      await this.loadAudioFiles();

      this.isInitialized = true;
      console.log("🎵 Audio initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      throw error;
    }
  }

  private enableAudioHandler: ((event: Event) => Promise<void>) | null = null;

  private setupUserInteractionListeners() {
    // iOS Safari needs this to be more aggressive about user interaction
    this.enableAudioHandler = async (event: Event) => {
      // Prevent multiple calls
      if (this.hasUserInteracted) return;

      console.log("👆 User interaction detected, enabling audio...");
      this.hasUserInteracted = true;

      try {
        // For iOS, this is the critical moment to initialize audio
        if (this.isIOS && !this.isInitialized) {
          await this.initializeAudio();
        }

        // Resume audio context if it's suspended
        if (this.audioContext && this.audioContext.state === "suspended") {
          await this.audioContext.resume();
          console.log("🎵 Audio context resumed from user interaction");
        }

        // Remove all listeners after successful initialization
        this.removeUserInteractionListeners();

        console.log("✅ Audio successfully enabled through user interaction");
      } catch (error) {
        console.error(
          "Failed to enable audio through user interaction:",
          error
        );
        // Keep listeners active if initialization failed
        this.hasUserInteracted = false;
      }
    };

    // iOS Safari needs multiple event types to be sure
    const events = ["touchstart", "mousedown", "keydown", "click"] as const;

    events.forEach((eventType) => {
      if (this.enableAudioHandler) {
        document.addEventListener(eventType, this.enableAudioHandler, {
          passive: eventType === "touchstart", // touchstart should be passive for performance
          once: false, // We'll remove manually after success
        });
      }
    });
  }

  private removeUserInteractionListeners() {
    if (!this.enableAudioHandler) return;

    const events = ["touchstart", "mousedown", "keydown", "click"] as const;
    events.forEach((eventType) => {
      document.removeEventListener(eventType, this.enableAudioHandler!);
    });
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
      if (this.isIOS && !this.hasUserInteracted) {
        console.log(
          "🍎 iOS: Cannot ensure audio context without user interaction"
        );
        return false;
      }
      await this.initializeAudio();
      return true;
    }

    // Handle suspended audio context (very common on iOS)
    if (this.audioContext.state === "suspended") {
      try {
        console.log("🎵 Audio context suspended, attempting to resume...");
        await this.audioContext.resume();
        console.log("✅ Audio context resumed successfully");
      } catch (error) {
        console.error("Failed to resume audio context:", error);
        return false;
      }
    }

    // iOS-specific audio context health check
    if (this.isIOS && this.audioContext.state === "running") {
      try {
        // Create a silent buffer to "wake up" the audio context
        const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
        const silentSource = this.audioContext.createBufferSource();
        silentSource.buffer = silentBuffer;
        silentSource.connect(this.audioContext.destination);
        silentSource.start(0);
        silentSource.stop(0.001);
        console.log("🍎 iOS audio context health check completed");
      } catch (error) {
        console.warn("iOS audio context health check failed:", error);
      }
    }

    return this.audioContext.state === "running";
  }

  async play(soundKey: string): Promise<void> {
    console.log(`🎵 Attempting to play: ${soundKey}`);
    console.log(`🔍 Current audio state:`, {
      isMuted: this.isMuted,
      isInitialized: this.isInitialized,
      hasUserInteracted: this.hasUserInteracted,
      isIOS: this.isIOS,
      audioContextState: this.audioContext?.state || "null",
      audioBuffersCount: this.audioBuffers.size,
      hasBuffer: this.audioBuffers.has(soundKey),
    });

    if (this.isMuted) {
      console.log(`🔇 Audio muted, skipping: ${soundKey}`);
      return;
    }

    try {
      // Ensure audio context is ready before playing
      console.log(`🔄 Ensuring audio context is ready...`);
      const audioReady = await this.ensureAudioContext();
      console.log(`✅ Audio context ready: ${audioReady}`);

      if (!audioReady) {
        console.log(`⚠️ Audio not ready, skipping: ${soundKey}`);
        return;
      }

      const audioBuffer = this.audioBuffers.get(soundKey);
      if (!audioBuffer) {
        console.warn(`❌ Audio buffer not found for: ${soundKey}`);
        console.log(
          `📋 Available buffers:`,
          Array.from(this.audioBuffers.keys())
        );
        return;
      }

      console.log(`🎵 Creating audio source for: ${soundKey}`);
      // Create audio source and connect to destination
      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;

      // iOS-specific volume and connection handling
      if (this.isIOS) {
        console.log(`🍎 iOS: Setting up gain node`);
        const gainNode = this.audioContext!.createGain();
        gainNode.gain.setValueAtTime(0.8, this.audioContext!.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
      } else {
        source.connect(this.audioContext!.destination);
      }

      // Play the sound
      console.log(`▶️ Starting audio playback for: ${soundKey}`);
      source.start(0);
      console.log(`🔊 Successfully started sound: ${soundKey}`);

      // Clean up source after playback
      source.onended = () => {
        console.log(`🏁 Audio playback ended for: ${soundKey}`);
        source.disconnect();
        if (this.isIOS) {
          try {
            source.stop();
          } catch (error) {
            // Ignore errors when stopping already stopped source
          }
        }
      };
    } catch (error) {
      console.error(`❌ Failed to play sound ${soundKey}:`, error);
      console.error(`🔍 Error details:`, {
        error: error,
        soundKey: soundKey,
        audioContextState: this.audioContext?.state,
        isInitialized: this.isInitialized,
      });
    }
  }

  // New method: Get detailed audio status for debugging
  getAudioStatus(): string {
    if (!this.audioContext) {
      return "No audio context";
    }

    return `Context: ${this.audioContext.state}, Initialized: ${this.isInitialized}, User interacted: ${this.hasUserInteracted}, iOS: ${this.isIOS}`;
  }

  // Enhanced mute/unmute with audio context handling
  mute() {
    this.isMuted = true;
    console.log("🔇 Audio muted");
  }

  unmute() {
    this.isMuted = false;
    console.log("🔊 Audio unmuted");

    // Try to resume audio context when unmuting
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().catch((error) => {
        console.warn("Failed to resume audio context on unmute:", error);
      });
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    console.log(this.isMuted ? "🔇 Audio muted" : "🔊 Audio unmuted");

    if (!this.isMuted && this.audioContext?.state === "suspended") {
      this.audioContext.resume().catch((error) => {
        console.warn("Failed to resume audio context on unmute:", error);
      });
    }

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
    play: async () => {},
    mute: () => {},
    unmute: () => {},
    toggleMute: () => false,
    isMutedState: () => false,
    isAudioReady: () => false,
    requestAudioPermission: async () => false,
    getAudioStatus: () => "Server side",
  };
}

export { audioManager };
