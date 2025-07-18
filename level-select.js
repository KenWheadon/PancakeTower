class LevelSelectScreen {
  constructor(gameInstance) {
    this.game = gameInstance;
  }

  show() {
    this.game.gameState = "menu";
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("levelSelectScreen").classList.remove("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("htpPopup").classList.add("hidden");

    this.createLevelCards();
  }

  createLevelCards() {
    const levelsGrid = document.getElementById("levelsGrid");
    levelsGrid.innerHTML = "";

    Object.entries(GAME_CONFIG.levels).forEach(([levelNum, levelConfig]) => {
      const levelCard = document.createElement("div");
      levelCard.className = `level-card ${levelConfig.difficulty.toLowerCase()}`;
      levelCard.dataset.levelNum = levelNum;

      const timeInSeconds = Math.ceil(levelConfig.timeLimit / 1000);
      const maxOrder = Math.max(...levelConfig.orders);

      levelCard.innerHTML = `
        <div class="level-number">${levelNum}</div>
        <div class="level-name">${levelConfig.name}</div>
        <div class="level-description">${levelConfig.description}</div>
        <div class="level-difficulty ${levelConfig.difficulty.toLowerCase()}">${
        levelConfig.difficulty
      }</div>
        <div class="level-stats">
          <div class="level-stat">
            <div class="level-stat-value">${timeInSeconds}s</div>
            <div class="level-stat-label">Time</div>
          </div>
          <div class="level-stat">
            <div class="level-stat-value">${maxOrder}</div>
            <div class="level-stat-label">Max Order</div>
          </div>
          <div class="level-stat">
            <div class="level-stat-value">${levelConfig.starThresholds[2]}</div>
            <div class="level-stat-label">3 Stars</div>
          </div>
        </div>
      `;

      levelCard.addEventListener("click", () =>
        this.game.startLevel(parseInt(levelNum))
      );
      levelsGrid.appendChild(levelCard);
    });
  }
}
