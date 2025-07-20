class LevelSelectScreen {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.starManager = new StarManager();
  }

  show() {
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("htpPopup").classList.add("hidden");
    document.getElementById("levelSelectScreen").classList.remove("hidden");

    this.generateLevelCards();
  }

  generateLevelCards() {
    const levelsGrid = document.getElementById("levelsGrid");
    levelsGrid.innerHTML = "";

    // Check if player has won all levels
    const hasWonAllLevels = this.checkAllLevelsCompleted();

    // Add winner display if all levels completed
    if (hasWonAllLevels) {
      const winnerDisplay = this.createWinnerDisplay();
      levelsGrid.appendChild(winnerDisplay);
    }

    // Add level cards
    Object.entries(GAME_CONFIG.levels).forEach(([levelNum, config]) => {
      const levelCard = this.createLevelCard(parseInt(levelNum), config);
      levelsGrid.appendChild(levelCard);
    });
  }

  checkAllLevelsCompleted() {
    const totalLevels = Object.keys(GAME_CONFIG.levels).length;
    let completedLevels = 0;

    for (let i = 1; i <= totalLevels; i++) {
      const stars = this.starManager.getStarsForLevel(i);
      if (stars >= 1) {
        completedLevels++;
      }
    }

    console.log(`Completed levels: ${completedLevels}/${totalLevels}`);
    return completedLevels === totalLevels;
  }

  createWinnerDisplay() {
    const winnerCard = document.createElement("div");
    winnerCard.className = "winner-display";

    // Calculate total stars earned
    const totalStars = this.calculateTotalStars();
    const maxStars = Object.keys(GAME_CONFIG.levels).length * 3;

    winnerCard.innerHTML = `
      <div class="winner-content">
        <img src="images/winner.png" alt="Congratulations!" class="winner-image" />
        <div class="winner-text">
          <h2 class="winner-title">🎉 Congratulations! 🎉</h2>
          <p class="winner-subtitle">You've completed all levels!</p>
          <div class="winner-stats">
            <div class="winner-stat">
              <span class="winner-stat-icon">⭐</span>
              <span class="winner-stat-text">${totalStars}/${maxStars} Stars Earned</span>
            </div>
            <div class="winner-stat">
              <span class="winner-stat-icon">🏆</span>
              <span class="winner-stat-text">Pancake Master!</span>
            </div>
          </div>
          ${
            totalStars === maxStars
              ? '<div class="perfect-completion">✨ Perfect Completion! ✨</div>'
              : '<div class="improvement-hint">💡 Can you get 3 stars on every level?</div>'
          }
        </div>
      </div>
    `;

    return winnerCard;
  }

  calculateTotalStars() {
    let totalStars = 0;
    Object.keys(GAME_CONFIG.levels).forEach((levelNum) => {
      totalStars += this.starManager.getStarsForLevel(parseInt(levelNum));
    });
    return totalStars;
  }

  createLevelCard(levelNum, config) {
    const card = document.createElement("div");
    card.className = "level-card";

    const earnedStars = this.starManager.getStarsForLevel(levelNum);
    const isCompleted = earnedStars > 0;

    card.innerHTML = `
      <div class="level-header">
        <div class="level-number">Level ${levelNum}</div>
        <div class="level-difficulty ${config.difficulty.toLowerCase()}">${
      config.difficulty
    }</div>
      </div>
      
      <div class="level-title">${config.name}</div>
      <div class="level-description">${config.description}</div>
      
      <div class="level-stats">
        <div class="level-stat">
          <span class="level-stat-icon">⏰</span>
          <span class="level-stat-value">${config.timeLimit / 1000}s</span>
          <span class="level-stat-label">Time</span>
        </div>
        <div class="level-stat">
          <span class="level-stat-icon">🥞</span>
          <span class="level-stat-value">${this.getMaxOrderSize(
            config.orders
          )}</span>
          <span class="level-stat-label">Max Order</span>
        </div>
      </div>
      
      <div class="level-stars">
        ${this.generateStarsDisplay(earnedStars)}
      </div>
      
      <button class="level-play-button ${isCompleted ? "completed" : "new"}" 
              data-level="${levelNum}">
        ${isCompleted ? "Replay" : "Start"}
      </button>
    `;

    const playButton = card.querySelector(".level-play-button");
    playButton.addEventListener("click", () => {
      this.game.audioManager.playSfx("buttonClick");
      this.game.startLevel(levelNum);
    });

    playButton.addEventListener("mouseenter", () => {
      this.game.audioManager.playSfx("buttonHover");
    });

    if (isCompleted) {
      card.classList.add("completed");
    }

    return card;
  }

  generateStarsDisplay(earnedStars) {
    let starsHTML = "";
    for (let i = 1; i <= 3; i++) {
      if (i <= earnedStars) {
        starsHTML += '<span class="star earned">⭐</span>';
      } else {
        starsHTML += '<span class="star empty">☆</span>';
      }
    }
    return starsHTML;
  }

  getMaxOrderSize(orders) {
    let maxSize = 0;
    orders.forEach((order) => {
      const orderSize = Object.values(order).reduce(
        (sum, count) => sum + count,
        0
      );
      maxSize = Math.max(maxSize, orderSize);
    });
    return maxSize;
  }
}
