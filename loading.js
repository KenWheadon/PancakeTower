class LoadingManager {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.loadingStartTime = null;
  }

  showLoadingScreen() {
    this.loadingStartTime = Date.now();

    // Show loading screen
    document.getElementById("loadingScreen").classList.remove("hidden");
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("levelSelectScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");

    this.startLoadingAnimation();
  }

  startLoadingAnimation() {
    const loadingBar = document.getElementById("loadingBar");
    const loadingText = document.getElementById("loadingText");
    const loadingPercentage = document.getElementById("loadingPercentage");
    const messages = GAME_CONFIG.screens.loading.messages;

    let progress = 0;
    let messageIndex = 0;

    const updateLoading = () => {
      // Update progress
      progress += Math.random() * 15 + 5; // Random progress between 5-20%
      progress = Math.min(progress, 100);

      // Update UI
      loadingBar.style.width = progress + "%";
      loadingPercentage.textContent = Math.floor(progress) + "%";

      // Update message occasionally
      if (progress > (messageIndex + 1) * (100 / messages.length)) {
        messageIndex = Math.min(messageIndex + 1, messages.length - 1);
        loadingText.textContent = messages[messageIndex];
      }

      // Check if loading is complete
      if (progress >= 100) {
        this.completeLoading();
      } else {
        setTimeout(updateLoading, 200 + Math.random() * 300); // Random delay
      }
    };

    // Start the loading animation
    setTimeout(updateLoading, 500);
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
  }
}
