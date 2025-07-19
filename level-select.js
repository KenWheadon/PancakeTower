class LevelSelectScreen {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.starManager = new StarManager();
  }

  show() {
    // Hide all screens and show level select
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

    Object.entries(GAME_CONFIG.levels).forEach(([levelNum, config]) => {
      const levelCard = this.createLevelCard(parseInt(levelNum), config);
      levelsGrid.appendChild(levelCard);
    });
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
          <span class="level-stat-value">${Math.max(...config.orders)}</span>
          <span class="level-stat-label">Max Stack</span>
        </div>
      </div>
      
      <div class="level-stars">
        ${this.generateStarsDisplay(earnedStars)}
      </div>
      
      <button class="level-play-button ${isCompleted ? "completed" : "new"}" 
              data-level="${levelNum}">
        ${isCompleted ? "▶️ Replay" : "▶️ Start"}
      </button>
    `;

    // Add click handler
    const playButton = card.querySelector(".level-play-button");
    playButton.addEventListener("click", () => {
      this.game.startLevel(levelNum);
    });

    // Add completed styling if level has been played
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
}
