class PancakeStackGame {
  constructor() {
    this.gameState = "loading"; // 'loading', 'start', 'menu', 'playing', 'gameOver'
    this.currentLevel = null;
    this.levelConfig = null;

    // Initialize components
    this.loadingManager = null;
    this.startScreen = null;
    this.levelSelectScreen = null;
    this.levelManager = null;
    this.starManager = new StarManager();
    this.creditsGallery = null;

    // First inject HTML to create DOM structure
    this.injectHTML();

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeComponents();
      this.setupEventListeners();
      this.loadingManager.showLoadingScreen();
    }, 10);
  }

  injectHTML() {
    document.body.innerHTML = `
      <!-- Loading Screen -->
      <div id="loadingScreen" class="loading-screen">
        <div class="loading-content">
          <img class="game-logo" src="images/logo.png" alt="Pancake Tower Logo">
          <div class="loading-text" id="loadingText">Loading pancakes...</div>
          <div class="loading-bar-container">
            <div class="loading-bar" id="loadingBar"></div>
          </div>
          <div class="loading-percentage" id="loadingPercentage">0%</div>
        </div>
      </div>

      <!-- Start Screen -->
      <div id="startScreen" class="start-screen hidden">
        <div class="start-content">
          <div class="game-logo-section">
            <img class="game-logo" src="images/logo.png" alt="Pancake Tower Logo">
            <p class="game-subtitle">Master the art of pancake cooking!</p>
          </div>
          
        <div class="game-start-right">

            <div class="game-instructions">
                <div class="instruction-item">
                <span class="instruction-icon">🔥</span>
                <span class="instruction-text">Drag batter to grill to cook pancakes</span>
                </div>
                <div class="instruction-item">
                <span class="instruction-icon">🧈</span>
                <span class="instruction-text">Add ingredients before the deadline</span>
                </div>
                <div class="instruction-item">
                <span class="instruction-icon">🥞</span>
                <span class="instruction-text">Plate them before they burn</span>
                </div>
                <div class="instruction-item">
                <span class="instruction-icon">💰</span>
                <span class="instruction-text">Complete orders for money</span>
                </div>
            </div>
            
            <div class="start-buttons">
                <button class="start-button primary" id="playButton">
                <span class="button-text">🍳 Start Cooking</span>
                </button>
                <button class="start-button secondary" id="creditsButton">
                <span class="button-text">👥 Credits</span>
                </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Level Selection Screen -->
      <div id="levelSelectScreen" class="level-select-screen hidden">
        <div class="level-select-content">
          <div class="level-select-buttons">
            <button class="back-button" id="backToStartButton">← Back to Menu</button>  
            <h1 class="level-select-title">Choose Your Challenge</h1>
            <button class="htp-button" id="htpButton">❓ How to Play</button>
          </div>
          
          <div class="levels-grid" id="levelsGrid">
            <!-- Level cards will be injected here -->
          </div>
        </div>
      </div>

      <!-- How to Play Popup -->
      <div id="htpPopup" class="htp-popup hidden">
        <div class="htp-content">
          <button class="htp-close-button" id="htpCloseButton">×</button>
          <h2 class="htp-title">🥞 How to Play</h2>
          <div class="htp-instructions">
            <div class="htp-instruction">
              <div class="htp-instruction-number">1</div>
              <div class="htp-instruction-text">BUY BATTER TO COOK PANCAKES</div>
            </div>
            <div class="htp-instruction">
              <div class="htp-instruction-number">2</div>
              <div class="htp-instruction-text">Drag batter from the store to an empty grill to start cooking</div>
            </div>
            <div class="htp-instruction">
              <div class="htp-instruction-number">3</div>
              <div class="htp-instruction-text">Add ingredients (butter, banana) by dragging them to the pancake BEFORE the first marker</div>
            </div>
            <div class="htp-instruction">
              <div class="htp-instruction-number">4</div>
              <div class="htp-instruction-text">Wait for the pancake to become cooked (second marker) and then drag it to a plate</div>
            </div>
            <div class="htp-instruction">
              <div class="htp-instruction-number">5</div>
              <div class="htp-instruction-text">Don't let the bar fill completely or your pancake will get burnt and be thrown away</div>
            </div>
            <div class="htp-instruction">
              <div class="htp-instruction-number">6</div>
              <div class="htp-instruction-text">Drag pancakes between plates to create different sized stacks</div>
            </div>
            <div class="htp-instruction">
              <div class="htp-instruction-number">7</div>
              <div class="htp-instruction-text">Complete orders perfectly to earn money</div>
            </div>
            <div class="htp-instruction">
              <div class="htp-instruction-number">8</div>
              <div class="htp-instruction-text">Lose money for each incorrect pancake in an order</div>
            </div>
            <div class="htp-instruction">
              <div class="htp-instruction-number">9</div>
              <div class="htp-instruction-text">Make as much money as you can in the time limit and aim for 3 stars!</div>
            </div>
          </div>
          <button class="htp-got-it-button" id="htpGotItButton">Got it!</button>
        </div>
      </div>

      <!-- Game Screen -->
      <div id="gameScreen" class="hidden">
        <button class="back-to-menu-button" id="backToMenuButton">← Back to Menu</button>
        
        <div id="topBar">
          <div>
            <div class="top-stat">
              <h3>⏰ Time Left</h3>
              <div class="top-stat-value timer" id="timer">60</div>
            </div>

            <div class="top-stat">
              <h3>🎯 Current Order</h3>
              <div class="top-stat-value current-order" id="currentOrder">
                <div class="order-text" id="orderText">1 Pancake</div>
                <div class="combo-box" id="comboBox">
                  <span class="combo-text" id="comboText">Combo: 0x (+$0)</span>
                </div>
              </div>
            </div>

             <div class="top-stat">
              <h3>💰 Earnings</h3>
              <div class="top-stat-value money-display" id="moneyDisplay">$0</div>
            </div>
          </div>
        </div>

        <div id="gameContainer">
          <div id="gameGrid"></div>
          <div id="sidebar">
            <div class="sidebar-section store-section" id="storeSection">
              <!-- Store content will be dynamically generated -->
            </div>
          </div>
        </div>
      </div>

      <!-- Game Over Screen -->
      <div id="gameOverScreen" class="game-over-screen hidden">
        <div class="game-over-content">
          <h2>Level Complete!</h2>
          <div class="stars" id="starsDisplay">⭐⭐⭐</div>
          <div id="finalScore">Final Score: $0</div>
          <div id="newRecordMessage" class="new-record hidden">🎉 New Best Score!</div>
          <button class="restart-button" id="restartButton">Play Again</button>
          <button class="restart-button" id="backToLevelsButton" style="margin-left: 10px;">Choose Level</button>
        </div>
      </div>
    `;
  }

  initializeComponents() {
    this.loadingManager = new LoadingManager(this);
    this.startScreen = new StartScreen(this);
    this.levelSelectScreen = new LevelSelectScreen(this);
    this.levelManager = new LevelManager(this);
    this.creditsGallery = null; // Initialize as null, create when needed
  }

  // Navigation methods
  showStartScreen() {
    this.gameState = "start";
    this.startScreen.show();
  }

  showLevelSelect() {
    this.gameState = "menu";
    this.levelSelectScreen.show();
  }

  startLevel(levelNum) {
    this.currentLevel = levelNum;
    this.levelConfig = GAME_CONFIG.levels[levelNum];
    this.gameState = "playing";
    this.levelManager.startLevel(levelNum, this.levelConfig);
  }

  backToMenu() {
    this.gameState = "menu";
    if (this.levelManager) {
      this.levelManager.stopGame();
    }
    this.levelSelectScreen.show();
  }

  backToStart() {
    this.gameState = "start";
    if (this.levelManager) {
      this.levelManager.stopGame();
    }
    this.startScreen.show();
  }

  showHowToPlay() {
    document.getElementById("htpPopup").classList.remove("hidden");
  }

  hideHowToPlay() {
    document.getElementById("htpPopup").classList.add("hidden");
  }

  showCredits() {
    // Lazy-load the credits gallery when first needed
    if (!this.creditsGallery) {
      this.creditsGallery = new CreditsGallery();
    }
    this.creditsGallery.openGallery();
  }

  endGame(finalScore) {
    this.gameState = "gameOver";

    // Calculate stars
    let stars = 0;
    if (finalScore >= this.levelConfig.starThresholds[2]) stars = 3;
    else if (finalScore >= this.levelConfig.starThresholds[1]) stars = 2;
    else if (finalScore >= this.levelConfig.starThresholds[0]) stars = 1;

    // Save stars and check if it's a new record
    const isNewRecord = this.starManager.saveStarsForLevel(
      this.currentLevel,
      stars
    );

    // Show game over screen
    const gameOverScreen = document.getElementById("gameOverScreen");
    const starsDisplay = document.getElementById("starsDisplay");
    const finalScoreDisplay = document.getElementById("finalScore");
    const newRecordMessage = document.getElementById("newRecordMessage");

    starsDisplay.textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
    finalScoreDisplay.textContent = `Final Score: ${finalScore}`;

    // Show new record message if applicable
    if (isNewRecord && stars > 0) {
      newRecordMessage.classList.remove("hidden");
    } else {
      newRecordMessage.classList.add("hidden");
    }

    gameOverScreen.classList.remove("hidden");
  }

  restart() {
    document.getElementById("gameOverScreen").classList.add("hidden");
    this.levelManager.startLevel(this.currentLevel, this.levelConfig);
  }

  setupEventListeners() {
    // Start screen buttons
    document
      .getElementById("playButton")
      ?.addEventListener("click", () => this.showLevelSelect());
    document
      .getElementById("creditsButton")
      ?.addEventListener("click", () => this.showCredits());
    document
      .getElementById("backToStartButton")
      ?.addEventListener("click", () => this.backToStart());

    // HTP popup buttons
    document
      .getElementById("htpButton")
      ?.addEventListener("click", () => this.showHowToPlay());
    document
      .getElementById("htpCloseButton")
      ?.addEventListener("click", () => this.hideHowToPlay());
    document
      .getElementById("htpGotItButton")
      ?.addEventListener("click", () => this.hideHowToPlay());

    // Game buttons
    document
      .getElementById("restartButton")
      ?.addEventListener("click", () => this.restart());
    document
      .getElementById("backToLevelsButton")
      ?.addEventListener("click", () => this.backToMenu());
    document
      .getElementById("backToMenuButton")
      ?.addEventListener("click", () => this.backToMenu());

    // Close HTP popup when clicking outside
    document.getElementById("htpPopup")?.addEventListener("click", (e) => {
      if (e.target.id === "htpPopup") {
        this.hideHowToPlay();
      }
    });

    // Loading screen skip (for testing)
    document.addEventListener("keydown", (e) => {
      if (
        this.gameState === "loading" &&
        (e.code === "Enter" || e.code === "Space")
      ) {
        this.loadingManager.completeLoading();
      }
    });
  }
}

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure everything is ready
  setTimeout(() => {
    new PancakeStackGame();
  }, 10);
});
