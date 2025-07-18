class LoadingManager {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.assetsLoaded = 0;
    this.assetsToLoad = 0;
    this.loadingComplete = false;
  }

  showLoadingScreen() {
    this.game.gameState = "loading";
    document.getElementById("loadingScreen").classList.remove("hidden");
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("levelSelectScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("htpPopup").classList.add("hidden");

    // Start loading process
    this.startLoading();
  }

  startLoading() {
    // Simulate loading assets
    this.assetsToLoad = 10; // Simulate 10 assets to load
    this.assetsLoaded = 0;
    this.loadingComplete = false;

    const loadingMessages = [
      "Heating up the grill...",
      "Mixing pancake batter...",
      "Preparing plates...",
      "Loading recipes...",
      "Setting up kitchen...",
      "Almost ready to cook!",
    ];

    let messageIndex = 0;
    const loadingTextElement = document.getElementById("loadingText");

    // Update loading messages
    const messageInterval = setInterval(() => {
      if (loadingTextElement && messageIndex < loadingMessages.length) {
        loadingTextElement.textContent = loadingMessages[messageIndex];
        messageIndex++;
      }
    }, 800);

    // Simulate asset loading
    const loadingInterval = setInterval(() => {
      if (this.assetsLoaded < this.assetsToLoad) {
        this.assetsLoaded++;
        this.updateLoadingProgress();
      } else {
        clearInterval(loadingInterval);
        clearInterval(messageInterval);
        setTimeout(() => {
          this.completeLoading();
        }, 500);
      }
    }, 300);
  }

  updateLoadingProgress() {
    const percentage = Math.floor(
      (this.assetsLoaded / this.assetsToLoad) * 100
    );

    const loadingBar = document.getElementById("loadingBar");
    const loadingPercentage = document.getElementById("loadingPercentage");

    if (loadingBar) {
      loadingBar.style.width = percentage + "%";
    }

    if (loadingPercentage) {
      loadingPercentage.textContent = percentage + "%";
    }
  }

  completeLoading() {
    this.loadingComplete = true;

    const loadingText = document.getElementById("loadingText");
    if (loadingText) {
      loadingText.textContent = "Ready to cook!";
    }

    setTimeout(() => {
      this.game.showStartScreen();
    }, 1000);
  }
}
