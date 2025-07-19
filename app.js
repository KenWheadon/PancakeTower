class PancakeStackGame {
  constructor() {
    this.gameState = "loading";
    this.currentLevel = null;
    this.levelConfig = null;
    this.activeTimeouts = new Set();
    this.eventListeners = new Map();

    this.loadingManager = null;
    this.startScreen = null;
    this.levelSelectScreen = null;
    this.levelManager = null;
    this.starManager = new StarManager();
    this.creditsGallery = null;
    this.audioManager = new AudioManager();

    this.domElements = {};

    this.init();
  }

  async init() {
    this.injectHTML();
    this.cacheDOMElements();
    await this.initializeComponents();
    this.setupEventListeners();

    // Start the loading process - this will handle both audio and images
    await this.loadingManager.showLoadingScreen();
  }

  injectHTML() {
    document.body.innerHTML = `
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
        
        <div class="audio-controls-container" id="audioControlsContainer">
        </div>
      </div>

      <div id="levelSelectScreen" class="level-select-screen hidden">
        <div class="level-select-content">
          <div class="level-select-buttons">
            <button class="back-button" id="backToStartButton">← Back to Menu</button>  
            <h1 class="level-select-title">Choose Your Challenge</h1>
            <button class="htp-button" id="htpButton">❓ How to Play</button>
          </div>
          
          <div class="levels-grid" id="levelsGrid">
          </div>
        </div>
        
        <div class="audio-controls-container" id="levelSelectAudioControls">
        </div>
      </div>

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
            </div>
          </div>
        </div>
      </div>

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

      <style>
        .audio-controls-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .audio-settings-button {
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 20px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .audio-settings-button:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 1);
        }

        .audio-settings-panel {
          position: absolute;
          bottom: 60px;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          min-width: 200px;
          backdrop-filter: blur(10px);
        }

        .audio-control-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .audio-control-group:last-child {
          margin-bottom: 0;
        }

        .audio-label {
          font-family: 'Fredoka', sans-serif;
          font-size: 14px;
          font-weight: 500;
          width: 60px;
        }

        .audio-mute-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 5px;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }

        .audio-mute-btn:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .audio-slider {
          flex: 1;
          height: 5px;
          border-radius: 5px;
          background: #ddd;
          outline: none;
          -webkit-appearance: none;
        }

        .audio-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #ff6b6b;
          cursor: pointer;
        }

        .audio-slider::-moz-range-thumb {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #ff6b6b;
          cursor: pointer;
          border: none;
        }

        @keyframes comboMoneyFloat {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
      </style>
    `;
  }

  cacheDOMElements() {
    const elementIds = [
      "loadingScreen",
      "startScreen",
      "levelSelectScreen",
      "htpPopup",
      "gameScreen",
      "gameOverScreen",
      "playButton",
      "creditsButton",
      "backToStartButton",
      "htpButton",
      "htpCloseButton",
      "htpGotItButton",
      "restartButton",
      "backToLevelsButton",
      "backToMenuButton",
      "starsDisplay",
      "finalScore",
      "newRecordMessage",
    ];

    elementIds.forEach((id) => {
      this.domElements[id] = document.getElementById(id);
    });
  }

  async initializeComponents() {
    this.loadingManager = new LoadingManager(this);
    this.startScreen = new StartScreen(this);
    this.levelSelectScreen = new LevelSelectScreen(this);
    this.levelManager = new LevelManager(this);

    // Initialize audio manager but don't wait for it here - the loading manager will handle it
    // We still need to call init() to start the loading process
    this.audioManager.init();
    this.setupAudioControls();
  }

  setupAudioControls() {
    const startScreenContainer = document.getElementById(
      "audioControlsContainer"
    );
    const levelSelectContainer = document.getElementById(
      "levelSelectAudioControls"
    );

    if (startScreenContainer) {
      startScreenContainer.appendChild(this.audioManager.createAudioControls());
    }

    if (levelSelectContainer) {
      levelSelectContainer.appendChild(this.audioManager.createAudioControls());
    }
  }

  showStartScreen() {
    this.gameState = "start";
    this.startScreen.show();
    this.audioManager.playBackgroundMusic("main");
  }

  showLevelSelect() {
    this.gameState = "menu";
    this.levelSelectScreen.show();
    this.audioManager.playBackgroundMusic("main");
  }

  startLevel(levelNum) {
    this.currentLevel = levelNum;
    this.levelConfig = GAME_CONFIG.levels[levelNum];
    this.gameState = "playing";
    this.levelManager.startLevel(levelNum, this.levelConfig);
    this.audioManager.playSfx("startLevel");
    this.audioManager.playBackgroundMusic(`level${levelNum}`);
  }

  backToMenu() {
    this.gameState = "menu";
    if (this.levelManager) {
      this.levelManager.stopGame();
    }
    this.levelSelectScreen.show();
    this.audioManager.playBackgroundMusic("main");
  }

  backToStart() {
    this.gameState = "start";
    if (this.levelManager) {
      this.levelManager.stopGame();
    }
    this.startScreen.show();
    this.audioManager.playBackgroundMusic("main");
  }

  showHowToPlay() {
    this.domElements.htpPopup.classList.remove("hidden");
  }

  hideHowToPlay() {
    this.domElements.htpPopup.classList.add("hidden");
  }

  showCredits() {
    if (!this.creditsGallery) {
      this.creditsGallery = new CreditsGallery();
    }
    this.creditsGallery.openGallery();
  }

  endGame(finalScore) {
    this.gameState = "gameOver";

    let stars = 0;
    if (finalScore >= this.levelConfig.starThresholds[2]) stars = 3;
    else if (finalScore >= this.levelConfig.starThresholds[1]) stars = 2;
    else if (finalScore >= this.levelConfig.starThresholds[0]) stars = 1;

    const isNewRecord = this.starManager.saveStarsForLevel(
      this.currentLevel,
      stars
    );

    this.domElements.starsDisplay.textContent =
      "⭐".repeat(stars) + "☆".repeat(3 - stars);
    this.domElements.finalScore.textContent = `Final Score: ${finalScore}`;

    if (isNewRecord && stars > 0) {
      this.domElements.newRecordMessage.classList.remove("hidden");
    } else {
      this.domElements.newRecordMessage.classList.add("hidden");
    }

    this.domElements.gameOverScreen.classList.remove("hidden");
    this.audioManager.playSfx("levelComplete");
    this.audioManager.playBackgroundMusic("main");
  }

  restart() {
    this.domElements.gameOverScreen.classList.add("hidden");
    this.levelManager.startLevel(this.currentLevel, this.levelConfig);
  }

  addTimeout(timeoutId) {
    this.activeTimeouts.add(timeoutId);
  }

  clearTimeout(timeoutId) {
    clearTimeout(timeoutId);
    this.activeTimeouts.delete(timeoutId);
  }

  addEventListener(element, event, handler) {
    const key = `${element}_${event}`;
    if (this.eventListeners.has(key)) {
      element.removeEventListener(event, this.eventListeners.get(key));
    }
    element.addEventListener(event, handler);
    this.eventListeners.set(key, handler);
  }

  setupEventListeners() {
    const buttonHandlers = {
      playButton: () => {
        this.audioManager.playSfx("buttonClick");
        this.showLevelSelect();
      },
      creditsButton: () => {
        this.audioManager.playSfx("buttonClick");
        this.showCredits();
      },
      backToStartButton: () => {
        this.audioManager.playSfx("buttonClick");
        this.backToStart();
      },
      htpButton: () => {
        this.audioManager.playSfx("buttonClick");
        this.showHowToPlay();
      },
      htpCloseButton: () => {
        this.audioManager.playSfx("buttonClick");
        this.hideHowToPlay();
      },
      htpGotItButton: () => {
        this.audioManager.playSfx("buttonClick");
        this.hideHowToPlay();
      },
      restartButton: () => {
        this.audioManager.playSfx("buttonClick");
        this.restart();
      },
      backToLevelsButton: () => {
        this.audioManager.playSfx("buttonClick");
        this.backToMenu();
      },
      backToMenuButton: () => {
        this.audioManager.playSfx("buttonClick");
        this.backToMenu();
      },
    };

    Object.entries(buttonHandlers).forEach(([buttonId, handler]) => {
      const button = this.domElements[buttonId];
      if (button) {
        this.addEventListener(button, "click", handler);
        this.addEventListener(button, "mouseenter", () => {
          this.audioManager.playSfx("buttonHover");
        });
      }
    });

    this.addEventListener(this.domElements.htpPopup, "click", (e) => {
      if (e.target.id === "htpPopup") {
        this.hideHowToPlay();
      }
    });

    this.addEventListener(document, "keydown", (e) => {
      if (
        this.gameState === "loading" &&
        (e.code === "Enter" || e.code === "Space")
      ) {
        this.loadingManager.completeLoading();
      }
    });
  }

  cleanup() {
    this.activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.activeTimeouts.clear();

    this.eventListeners.forEach((handler, key) => {
      const [elementKey, event] = key.split("_");
      const element = this.domElements[elementKey] || document;
      element.removeEventListener(event, handler);
    });
    this.eventListeners.clear();

    if (this.levelManager) {
      this.levelManager.cleanup();
    }
    if (this.creditsGallery) {
      this.creditsGallery.cleanup();
    }
    if (this.audioManager) {
      this.audioManager.destroy();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PancakeStackGame();
});
