class LoadingManager {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.loadingStartTime = null;
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.imagePromises = [];
  }

  getAllGameImages() {
    // Return array of all image paths used in the game
    return [
      // Logo
      "images/logo.png",

      // Grid items
      "images/item-grill.png",
      "images/item-plate-1.png",
      "images/item-batter.png",
      "images/item-butter.png",
      "images/item-banana.png",

      // Plain pancake states
      "images/plain-pancake-goo.png",
      "images/plain-pancake-solid.png",
      "images/plain-pancake-cooked.png",
      "images/plain-pancake-burnt.png",

      // Butter pancake states
      "images/butter-pancake-goo.png",
      "images/butter-pancake-solid.png",
      "images/butter-pancake-cooked.png",
      "images/butter-pancake-burnt.png",

      // Banana pancake states
      "images/banana-pancake-goo.png",
      "images/banana-pancake-solid.png",
      "images/banana-pancake-cooked.png",
      "images/banana-pancake-burnt.png",
    ];
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.loadedAssets++;
        this.updateLoadingProgress();
        resolve(img);
      };

      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        this.loadedAssets++;
        this.updateLoadingProgress();
        resolve(null); // Don't reject, just resolve with null to continue loading
      };

      img.src = src;
    });
  }

  updateLoadingProgress() {
    const progress = Math.floor((this.loadedAssets / this.totalAssets) * 100);
    const loadingBar = document.getElementById("loadingBar");
    const loadingPercentage = document.getElementById("loadingPercentage");
    const loadingText = document.getElementById("loadingText");
    const messages = GAME_CONFIG.screens.loading.messages;

    if (loadingBar && loadingPercentage) {
      loadingBar.style.width = progress + "%";
      loadingPercentage.textContent = progress + "%";
    }

    // Update loading message based on progress
    if (loadingText && messages) {
      const messageIndex = Math.floor((progress / 100) * (messages.length - 1));
      loadingText.textContent =
        messages[Math.min(messageIndex, messages.length - 1)];
    }

    // Check if loading is complete
    if (this.loadedAssets >= this.totalAssets) {
      this.completeLoading();
    }
  }

  async showLoadingScreen() {
    this.loadingStartTime = Date.now();

    // Show loading screen
    document.getElementById("loadingScreen").classList.remove("hidden");
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("levelSelectScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");

    // Start loading all assets
    await this.startAssetLoading();
  }

  async startAssetLoading() {
    const loadingText = document.getElementById("loadingText");

    // Get all images to preload
    const imagePaths = this.getAllGameImages();

    // Only count images for now - we'll handle audio separately
    this.totalAssets = imagePaths.length;
    this.loadedAssets = 0;

    // Initial loading message
    if (loadingText) {
      loadingText.textContent = GAME_CONFIG.screens.loading.messages[0];
    }

    console.log(`Starting to preload ${imagePaths.length} images...`);

    // Start preloading images and let audio load independently
    const imageLoadingPromise = this.startImageLoading(imagePaths);

    // Wait for AudioManager to finish loading (but don't track individual files)
    const audioLoadingPromise = this.waitForAudioManager();

    // Wait for both image and audio loading to complete
    await Promise.all([imageLoadingPromise, audioLoadingPromise]);

    console.log(`Finished preloading all assets`);
  }

  async startImageLoading(imagePaths) {
    // Start preloading all images
    const imagePromises = imagePaths.map((imagePath) =>
      this.preloadImage(imagePath)
    );
    await Promise.all(imagePromises);
    console.log(`Finished preloading ${imagePaths.length} images`);
  }

  async waitForAudioManager() {
    // Simply wait for the AudioManager to finish its loading
    try {
      await this.game.audioManager.waitForLoad();
      console.log(`AudioManager finished loading`);
    } catch (error) {
      console.warn("AudioManager loading error:", error);
    }
  }

  completeLoading() {
    // Ensure minimum loading time has passed
    const elapsed = Date.now() - this.loadingStartTime;
    const remaining = GAME_CONFIG.MINIMUM_LOADING_TIME - elapsed;

    if (remaining > 0) {
      setTimeout(() => {
        this.finishLoading();
      }, remaining);
    } else {
      this.finishLoading();
    }
  }

  finishLoading() {
    // Hide loading screen and show start screen
    document.getElementById("loadingScreen").classList.add("hidden");
    this.game.showStartScreen();
    console.log("Loading complete! All assets preloaded.");
  }
}
