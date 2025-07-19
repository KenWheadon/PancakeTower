// Star Manager - Handles saving and loading star progress
class StarManager {
  constructor() {
    this.stars = this.loadStars();
  }

  loadStars() {
    const saved = localStorage.getItem("pancakeGameStars");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load stars:", e);
      }
    }
    // Default stars object
    return {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };
  }

  saveStarsForLevel(levelNum, stars) {
    const previousStars = this.stars[levelNum] || 0;
    this.stars[levelNum] = Math.max(previousStars, stars);
    localStorage.setItem("pancakeGameStars", JSON.stringify(this.stars));
    return stars > previousStars; // Return true if new record
  }

  getStarsForLevel(levelNum) {
    return this.stars[levelNum] || 0;
  }
}

// Loading Manager - Handles the loading screen
class LoadingManager {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.loadingProgress = 0;
    this.messageIndex = 0;
  }

  showLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");
    loadingScreen.classList.remove("hidden");

    this.startLoading();
  }

  startLoading() {
    const loadingBar = document.getElementById("loadingBar");
    const loadingPercentage = document.getElementById("loadingPercentage");
    const loadingText = document.getElementById("loadingText");
    const messages = GAME_CONFIG.screens.loading.messages;

    const loadingInterval = setInterval(() => {
      this.loadingProgress += Math.random() * 15 + 5;

      if (this.loadingProgress >= 100) {
        this.loadingProgress = 100;
        clearInterval(loadingInterval);
        setTimeout(() => this.completeLoading(), 500);
      }

      // Update progress bar and percentage
      loadingBar.style.width = this.loadingProgress + "%";
      loadingPercentage.textContent = Math.floor(this.loadingProgress) + "%";

      // Change loading message occasionally
      if (Math.random() < 0.3 && this.messageIndex < messages.length - 1) {
        this.messageIndex++;
        loadingText.textContent = messages[this.messageIndex];
      }
    }, 200);
  }

  completeLoading() {
    document.getElementById("loadingScreen").classList.add("hidden");
    this.game.showStartScreen();
  }
}

// Start Screen Manager
class StartScreen {
  constructor(gameInstance) {
    this.game = gameInstance;
  }

  show() {
    // Hide all other screens
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("levelSelectScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");

    // Show start screen
    document.getElementById("startScreen").classList.remove("hidden");
  }
}

// Level Select Screen Manager
class LevelSelectScreen {
  constructor(gameInstance) {
    this.game = gameInstance;
  }

  show() {
    // Hide all other screens
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");

    // Show level select screen
    document.getElementById("levelSelectScreen").classList.remove("hidden");

    // Generate level cards
    this.generateLevelCards();
  }

  generateLevelCards() {
    const levelsGrid = document.getElementById("levelsGrid");
    levelsGrid.innerHTML = "";

    // Create cards for all 6 levels
    for (let levelNum = 1; levelNum <= 6; levelNum++) {
      const levelConfig = GAME_CONFIG.levels[levelNum];
      const stars = this.game.starManager.getStarsForLevel(levelNum);

      const levelCard = document.createElement("div");
      levelCard.className = "level-card";

      // Special styling for level 6
      if (levelNum === 6) {
        levelCard.classList.add("lightning-level");
      }

      levelCard.innerHTML = `
        <div class="level-header">
          <div class="level-number">Level ${levelNum}</div>
          <div class="level-difficulty ${levelConfig.difficulty.toLowerCase()}">${
        levelConfig.difficulty
      }</div>
        </div>
        <div class="level-title">${levelConfig.name}</div>
        <div class="level-description">${levelConfig.description}</div>
        <div class="level-details">
          <div class="level-detail">
            <div class="detail-icon">⏰</div>
            <div class="detail-text">${Math.floor(
              levelConfig.timeLimit / 1000
            )}s</div>
          </div>
          <div class="level-detail">
            <div class="detail-icon">🎯</div>
            <div class="detail-text">${Math.max(
              ...levelConfig.orders
            )} Max</div>
          </div>
          <div class="level-detail">
            <div class="detail-icon">💰</div>
            <div class="detail-text">${levelConfig.pancakeReward}/🥞</div>
          </div>
          ${
            levelNum === 6
              ? '<div class="level-detail"><div class="detail-icon">⚡</div><div class="detail-text">LIGHTNING</div></div>'
              : ""
          }
        </div>
        <div class="stars-label">Best Performance</div>
        <div class="stars-display">
          ${"★".repeat(stars)}${"☆".repeat(3 - stars)}
        </div>
        <button class="level-play-button ${stars > 0 ? "completed" : "new"} ${
        levelNum === 6 ? "lightning-button" : ""
      }" data-level="${levelNum}">
          ${
            levelNum === 6
              ? "⚡ LIGHTNING RUSH ⚡"
              : stars > 0
              ? "Play Again"
              : "Start Level"
          }
        </button>
      `;

      // Add click event listener
      const playButton = levelCard.querySelector(".level-play-button");
      playButton.addEventListener("click", () => {
        this.game.startLevel(levelNum);
      });

      levelCard.addEventListener("click", (e) => {
        if (e.target !== playButton) {
          this.game.startLevel(levelNum);
        }
      });

      levelsGrid.appendChild(levelCard);
    }
  }
}
