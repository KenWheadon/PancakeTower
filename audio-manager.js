class AudioManager {
  constructor() {
    this.backgroundMusic = new Map();
    this.soundEffects = new Map();
    this.currentBackgroundTrack = null;
    this.currentBackgroundAudio = null;

    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.musicMuted = false;
    this.sfxMuted = false;

    this.isInitialized = false;
    this.loadPromises = [];
    this.settingsVisible = false;

    this.init();
  }

  async init() {
    this.loadAudioFiles();
    this.loadSettings();
    await this.waitForLoad();
    this.isInitialized = true;
  }

  loadAudioFiles() {
    const backgroundTracks = {
      main: "audio/main.mp3",
      level1: "audio/level1.mp3",
      level2: "audio/level2.mp3",
      level3: "audio/level3.mp3",
      level4: "audio/level4.mp3",
      level5: "audio/level5.mp3",
      level6: "audio/level6.mp3",
    };

    const sfxTracks = {
      levelComplete: "audio/level-complete.mp3",
      orderServed: "audio/order-served.mp3",
      batterDropped: "audio/batter-dropped-on-grill.mp3",
      pancakeCooked: "audio/pancake-cooked.mp3",
      startLevel: "audio/start-level.mp3",
      buttonClick: "audio/button-click.mp3",
      buttonHover: "audio/button-hover.mp3",
      placePancake: "audio/place-pancake-on-plate.mp3",
    };

    Object.entries(backgroundTracks).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = this.musicVolume;
      this.backgroundMusic.set(key, audio);
      this.loadPromises.push(this.loadAudio(audio));
    });

    Object.entries(sfxTracks).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.volume = this.sfxVolume;
      this.soundEffects.set(key, audio);
      this.loadPromises.push(this.loadAudio(audio));
    });
  }

  loadAudio(audio) {
    return new Promise((resolve) => {
      audio.addEventListener("canplaythrough", resolve, { once: true });
      audio.addEventListener(
        "error",
        () => {
          resolve();
        },
        { once: true }
      );
      audio.load();
    });
  }

  async waitForLoad() {
    await Promise.all(this.loadPromises);
  }

  loadSettings() {
    const settings = localStorage.getItem("pancakeGameAudioSettings");
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.musicVolume = parsed.musicVolume ?? 0.7;
        this.sfxVolume = parsed.sfxVolume ?? 0.8;
        this.musicMuted = parsed.musicMuted ?? false;
        this.sfxMuted = parsed.sfxMuted ?? false;
      } catch (e) {
        // Use defaults
      }
    }
    this.applyVolumeSettings();
  }

  saveSettings() {
    const settings = {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      musicMuted: this.musicMuted,
      sfxMuted: this.sfxMuted,
    };
    localStorage.setItem("pancakeGameAudioSettings", JSON.stringify(settings));
  }

  applyVolumeSettings() {
    this.backgroundMusic.forEach((audio) => {
      audio.volume = this.musicMuted ? 0 : this.musicVolume;
    });

    this.soundEffects.forEach((audio) => {
      audio.volume = this.sfxMuted ? 0 : this.sfxVolume;
    });
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.backgroundMusic.forEach((audio) => {
      if (!this.musicMuted) {
        audio.volume = this.musicVolume;
      }
    });
    this.saveSettings();
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.soundEffects.forEach((audio) => {
      if (!this.sfxMuted) {
        audio.volume = this.sfxVolume;
      }
    });
    this.saveSettings();
  }

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    this.applyVolumeSettings();
    this.saveSettings();
    return this.musicMuted;
  }

  toggleSfxMute() {
    this.sfxMuted = !this.sfxMuted;
    this.applyVolumeSettings();
    this.saveSettings();
    return this.sfxMuted;
  }

  playBackgroundMusic(trackKey) {
    if (!this.isInitialized) return;

    if (this.currentBackgroundAudio) {
      this.currentBackgroundAudio.pause();
      this.currentBackgroundAudio.currentTime = 0;
    }

    const audio = this.backgroundMusic.get(trackKey);
    if (audio) {
      this.currentBackgroundTrack = trackKey;
      this.currentBackgroundAudio = audio;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  stopBackgroundMusic() {
    if (this.currentBackgroundAudio) {
      this.currentBackgroundAudio.pause();
      this.currentBackgroundAudio.currentTime = 0;
      this.currentBackgroundAudio = null;
      this.currentBackgroundTrack = null;
    }
  }

  playSfx(effectKey) {
    if (!this.isInitialized) return;

    const audio = this.soundEffects.get(effectKey);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  createAudioControls() {
    const audioControlsContainer = document.createElement("div");
    audioControlsContainer.className = "audio-controls-container";

    const audioButton = document.createElement("button");
    audioButton.className = "audio-settings-button";
    audioButton.innerHTML = "🎵";
    audioButton.title = "Audio Settings";

    const audioSettings = document.createElement("div");
    audioSettings.className = "audio-settings-panel";
    audioSettings.style.display = "none";
    audioSettings.innerHTML = `
      <div class="audio-control-group">
        <span class="audio-label">Music</span>
        <button class="audio-mute-btn" id="musicMuteBtn">${
          this.musicMuted ? "🔇" : "🔊"
        }</button>
        <input type="range" class="audio-slider" id="musicVolumeSlider" 
               min="0" max="1" step="0.1" value="${this.musicVolume}">
      </div>
      <div class="audio-control-group">
        <span class="audio-label">Sound Effects</span>
        <button class="audio-mute-btn" id="sfxMuteBtn">${
          this.sfxMuted ? "🔇" : "🔊"
        }</button>
        <input type="range" class="audio-slider" id="sfxVolumeSlider" 
               min="0" max="1" step="0.1" value="${this.sfxVolume}">
      </div>
    `;

    audioControlsContainer.appendChild(audioButton);
    audioControlsContainer.appendChild(audioSettings);

    audioButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.settingsVisible = !this.settingsVisible;
      audioSettings.style.display = this.settingsVisible ? "block" : "none";
      this.playSfx("buttonClick");
    });

    audioButton.addEventListener("mouseenter", () => {
      this.playSfx("buttonHover");
    });

    audioSettings.addEventListener("mouseleave", () => {
      this.settingsVisible = false;
      audioSettings.style.display = "none";
    });

    audioSettings.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    const musicMuteBtn = audioSettings.querySelector("#musicMuteBtn");
    const sfxMuteBtn = audioSettings.querySelector("#sfxMuteBtn");
    const musicSlider = audioSettings.querySelector("#musicVolumeSlider");
    const sfxSlider = audioSettings.querySelector("#sfxVolumeSlider");

    musicMuteBtn.addEventListener("click", () => {
      const muted = this.toggleMusicMute();
      musicMuteBtn.textContent = muted ? "🔇" : "🔊";
      this.playSfx("buttonClick");
    });

    sfxMuteBtn.addEventListener("click", () => {
      const muted = this.toggleSfxMute();
      sfxMuteBtn.textContent = muted ? "🔇" : "🔊";
      this.playSfx("buttonClick");
    });

    musicSlider.addEventListener("input", (e) => {
      this.setMusicVolume(parseFloat(e.target.value));
    });

    sfxSlider.addEventListener("input", (e) => {
      this.setSfxVolume(parseFloat(e.target.value));
    });

    return audioControlsContainer;
  }

  destroy() {
    this.stopBackgroundMusic();
    this.backgroundMusic.clear();
    this.soundEffects.clear();
  }
}
