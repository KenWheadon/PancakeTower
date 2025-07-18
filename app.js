class PancakeStackGame {
  constructor() {
    // First inject HTML to create DOM structure
    this.injectHTML();

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeGame();
      this.setupEventListeners();
      this.gameLoop();
    }, 10);
  }

  injectHTML() {
    document.body.innerHTML = `
      <div id="topBar">
        <div>
          <div class="top-stat">
            <h3>⏰ Time Left</h3>
            <div class="top-stat-value timer" id="timer">60</div>
          </div>

          <div class="top-stat">
            <h3>🎯 Current Order</h3>
            <div class="top-stat-value current-order" id="currentOrder">
              1 Pancake
            </div>
          </div>
        </div>

        <div>
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
            <h3>🏪 Batter Store</h3>
            <div class="resource-item">
              <div class="resource-display">
                🥞 Batter: <span id="batterCount">10</span>
              </div>
              <button class="buy-button" id="buyBatter">Buy More ($1)</button>
            </div>
          </div>
        </div>
      </div>

      <div id="gameOverScreen" class="game-over-screen hidden">
        <div class="game-over-content">
          <h2>Level Complete!</h2>
          <div class="stars" id="starsDisplay">⭐⭐⭐</div>
          <div id="finalScore">Final Score: $0</div>
          <button class="restart-button" id="restartButton">Play Again</button>
        </div>
      </div>
    `;
  }

  initializeGame() {
    // Use configuration from config.js
    this.levelConfig = GAME_CONFIG.level1;

    // Game state
    this.gameState = {
      timeRemaining: this.levelConfig.timeLimit,
      gameRunning: true,
      batter: this.levelConfig.initialBatter,
      money: this.levelConfig.initialMoney,
      currentOrderIndex: 0,
      totalOrdersCompleted: 0,
      isDragging: false,
      draggedPancakeId: null,
    };

    // Grid state
    this.grid = new Array(9).fill(null).map((_, index) => ({
      type: this.levelConfig.gridLayout[index],
      pancakes: [], // stack of pancakes
      cookingPancake: null, // pancake being cooked (for grills)
    }));

    // Pancake tracking
    this.pancakeIdCounter = 0;
    this.cookingPancakes = new Map(); // id -> pancake data

    this.createGrid();
    this.updateUI();
  }

  createGrid() {
    const gameGrid = document.getElementById("gameGrid");
    gameGrid.innerHTML = "";

    this.grid.forEach((cell, index) => {
      const cellDiv = document.createElement("div");
      cellDiv.className = `cell ${cell.type}`;
      cellDiv.dataset.cellIndex = index;

      if (cell.type === "grill") {
        cellDiv.innerHTML = "🔥";
        cellDiv.addEventListener("click", (e) => {
          this.addClickEffect(e);
          this.startCooking(index);
        });
      } else if (cell.type === "plate") {
        cellDiv.innerHTML = "🍽️";
        const serveButton = document.createElement("button");
        serveButton.className = "serve-button";
        serveButton.textContent = "Serve Order";
        serveButton.addEventListener("click", (e) => {
          e.stopPropagation();
          this.servePlate(index);
        });
        cellDiv.appendChild(serveButton);
      }

      // Add drop zone functionality for plates
      if (cell.type === "plate") {
        cellDiv.addEventListener("dragover", this.handleDragOver.bind(this));
        cellDiv.addEventListener("drop", this.handleDrop.bind(this));
        cellDiv.addEventListener("dragenter", this.handleDragEnter.bind(this));
        cellDiv.addEventListener("dragleave", this.handleDragLeave.bind(this));
      }

      gameGrid.appendChild(cellDiv);
    });
  }

  addClickEffect(e) {
    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";

    e.currentTarget.appendChild(ripple);

    setTimeout(() => ripple.remove(), GAME_CONFIG.animations.rippleEffect);
  }

  startCooking(cellIndex) {
    if (!this.gameState.gameRunning) return;

    const cell = this.grid[cellIndex];
    if (cell.type !== "grill" || cell.cookingPancake) return;
    if (this.gameState.batter <= 0) return;

    // Consume batter
    this.gameState.batter--;

    // Create pancake
    const pancakeId = this.pancakeIdCounter++;
    const pancake = {
      id: pancakeId,
      type: "plain",
      progress: 0,
      startTime: Date.now(),
      cellIndex: cellIndex,
    };

    cell.cookingPancake = pancake;
    this.cookingPancakes.set(pancakeId, pancake);

    // Add sizzle effect
    this.addSizzleEffect(cellIndex);

    this.updateCellDisplay(cellIndex);
    this.updateUI();
  }

  addSizzleEffect(cellIndex) {
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);
    cellDiv.classList.add("success-glow");
    setTimeout(
      () => cellDiv.classList.remove("success-glow"),
      GAME_CONFIG.animations.sizzleEffect
    );
  }

  updateCooking() {
    const currentTime = Date.now();

    this.cookingPancakes.forEach((pancake, id) => {
      // Check if this specific pancake is being dragged
      const isDraggedPancake =
        this.gameState.isDragging &&
        this.gameState.draggedPancakeId === id.toString();

      const cellDiv = document.querySelector(
        `[data-cell-index="${pancake.cellIndex}"]`
      );
      const progressBar = cellDiv?.querySelector(".progress-bar");

      if (isDraggedPancake) {
        // Pause only this pancake's cooking
        if (progressBar) {
          progressBar.classList.add("cooking-paused-specific");
        }

        // Store pause time if not already stored
        if (!pancake.pausedTime) {
          pancake.pausedTime = currentTime;
        }
        return; // Skip cooking progress for this pancake
      } else {
        // Remove paused indicator for this pancake
        if (progressBar) {
          progressBar.classList.remove("cooking-paused-specific");
        }

        // Resume cooking if it was paused
        if (pancake.pausedTime) {
          pancake.startTime += currentTime - pancake.pausedTime;
          delete pancake.pausedTime;
        }
      }

      // Continue normal cooking progress
      const elapsed = currentTime - pancake.startTime;
      pancake.progress = Math.min(
        GAME_CONFIG.mechanics.burntThreshold,
        (elapsed / this.levelConfig.burntTime) * 100
      );

      // Auto-remove burnt pancakes
      if (pancake.progress >= GAME_CONFIG.mechanics.burntThreshold) {
        const cell = this.grid[pancake.cellIndex];
        cell.cookingPancake = null;
        this.cookingPancakes.delete(id);
        this.updateCellDisplay(pancake.cellIndex);
        this.addBurntEffect(pancake.cellIndex);
        return;
      }

      this.updateCellDisplay(pancake.cellIndex);
    });
  }

  addBurntEffect(cellIndex) {
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);
    const particles = ["💨", "🔥", "💨"];

    particles.forEach((particle, i) => {
      setTimeout(() => {
        const particleEl = document.createElement("div");
        particleEl.className = "particle";
        particleEl.textContent = particle;
        particleEl.style.left = Math.random() * 100 + "%";
        particleEl.style.top = Math.random() * 100 + "%";
        cellDiv.appendChild(particleEl);

        setTimeout(
          () => particleEl.remove(),
          GAME_CONFIG.animations.particleEffect
        );
      }, i * 100);
    });
  }

  updateCellDisplay(cellIndex) {
    const cell = this.grid[cellIndex];
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);

    if (cell.type === "grill" && cell.cookingPancake) {
      const pancake = cell.cookingPancake;
      const progress = pancake.progress;

      // Update progress bar
      let progressBar = cellDiv.querySelector(".progress-bar");
      if (!progressBar) {
        progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressBar.innerHTML = `
          <div class="progress-fill"></div>
          <div class="progress-marker done"></div>
        `;
        cellDiv.appendChild(progressBar);
      }

      const progressFill = progressBar.querySelector(".progress-fill");
      progressFill.style.width = `${progress}%`;

      // Show pancake immediately when batter is placed
      let pancakeEmoji = cellDiv.querySelector(".pancake");
      if (!pancakeEmoji) {
        pancakeEmoji = document.createElement("div");
        pancakeEmoji.className = "pancake";
        pancakeEmoji.dataset.pancakeId = pancake.id;
        cellDiv.appendChild(pancakeEmoji);
      }

      // Update pancake appearance based on progress
      if (progress < GAME_CONFIG.mechanics.cookingProgressThreshold) {
        pancakeEmoji.innerHTML = "🍞"; // Uncooked bread
        pancakeEmoji.draggable = false;
        pancakeEmoji.style.cursor = "not-allowed";
      } else {
        pancakeEmoji.innerHTML = "🥞"; // Cooked pancake
        pancakeEmoji.draggable = false; // Disable HTML5 drag
        pancakeEmoji.style.cursor = "grab";

        // Remove any existing event listeners
        pancakeEmoji.removeEventListener("mousedown", this.handleMouseDown);
        pancakeEmoji.removeEventListener("dragstart", this.handleDragStart);

        // Add mouse-based drag handling
        pancakeEmoji.addEventListener(
          "mousedown",
          this.handleMouseDown.bind(this)
        );
        pancakeEmoji.addEventListener("dragstart", (e) => e.preventDefault());
      }
    } else if (cell.type === "grill") {
      // Clear grill display when no pancake
      const progressBar = cellDiv.querySelector(".progress-bar");
      const pancakeEmoji = cellDiv.querySelector(".pancake");
      if (progressBar) progressBar.remove();
      if (pancakeEmoji) pancakeEmoji.remove();
    } else if (cell.type === "plate") {
      // Update plate display with stacked pancakes
      const existingStack = cellDiv.querySelector(".pancake-stack");
      const existingCount = cellDiv.querySelector(".stack-count");
      if (existingStack) existingStack.remove();
      if (existingCount) existingCount.remove();

      if (cell.pancakes.length > 0) {
        // Add stack count
        const countDiv = document.createElement("div");
        countDiv.className = "stack-count";
        countDiv.textContent = cell.pancakes.length;
        cellDiv.appendChild(countDiv);

        const stackDiv = document.createElement("div");
        stackDiv.className = "pancake-stack";

        cell.pancakes.forEach((pancake, index) => {
          const pancakeDiv = document.createElement("div");
          pancakeDiv.className = "pancake";
          pancakeDiv.innerHTML = "🥞";
          pancakeDiv.dataset.pancakeId = pancake.id;

          // Only top pancake is draggable
          if (index === cell.pancakes.length - 1) {
            pancakeDiv.draggable = false; // Disable HTML5 drag

            // Remove any existing event listeners
            pancakeDiv.removeEventListener("mousedown", this.handleMouseDown);
            pancakeDiv.removeEventListener("dragstart", this.handleDragStart);

            // Add mouse-based drag handling
            pancakeDiv.addEventListener(
              "mousedown",
              this.handleMouseDown.bind(this)
            );
            pancakeDiv.addEventListener("dragstart", (e) => e.preventDefault());
          }

          stackDiv.appendChild(pancakeDiv);
        });

        cellDiv.appendChild(stackDiv);
      }
    }
  }

  handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    const pancakeId = e.target.dataset.pancakeId;
    if (!pancakeId) return;

    // Set dragging state
    this.gameState.isDragging = true;
    this.gameState.draggedPancakeId = pancakeId;

    // Add visual feedback to original pancake
    e.target.classList.add("dragging");
    e.target.style.cursor = "grabbing";

    // Create dragged pancake visual
    const draggedPancake = document.createElement("div");
    draggedPancake.className = "dragged-pancake";
    draggedPancake.textContent = "🥞";
    draggedPancake.id = "draggedPancakeVisual";
    document.body.appendChild(draggedPancake);

    // Add drag effect to valid drop zones
    document.querySelectorAll(".cell.plate").forEach((plate) => {
      plate.classList.add("drag-target");
    });

    // Add mouse move and up listeners
    const handleMouseMove = (moveEvent) => {
      // Update dragged pancake position
      const draggedElement = document.getElementById("draggedPancakeVisual");
      if (draggedElement) {
        draggedElement.style.left = moveEvent.clientX - 24 + "px";
        draggedElement.style.top = moveEvent.clientY - 24 + "px";
      }
    };

    const handleMouseUp = (upEvent) => {
      // Reset dragging state
      this.gameState.isDragging = false;

      // Remove dragged pancake visual
      const draggedElement = document.getElementById("draggedPancakeVisual");
      if (draggedElement) {
        draggedElement.remove();
      }

      // Clean up drag effects
      document.querySelectorAll(".pancake.dragging").forEach((pancake) => {
        pancake.classList.remove("dragging");
        pancake.style.cursor = "grab";
      });
      document.querySelectorAll(".cell.plate.drag-target").forEach((plate) => {
        plate.classList.remove("drag-target");
      });
      document.querySelectorAll(".cell.plate.drag-over").forEach((plate) => {
        plate.classList.remove("drag-over");
      });

      // Clean up any remaining paused indicators
      document
        .querySelectorAll(".progress-bar.cooking-paused-specific")
        .forEach((bar) => {
          bar.classList.remove("cooking-paused-specific");
        });

      // Find the drop target
      const elementUnderMouse = document.elementFromPoint(
        upEvent.clientX,
        upEvent.clientY
      );
      const plateCell = elementUnderMouse?.closest(".cell.plate");

      if (plateCell && this.gameState.draggedPancakeId) {
        const targetCellIndex = parseInt(plateCell.dataset.cellIndex);
        this.movePancake(
          parseInt(this.gameState.draggedPancakeId),
          targetCellIndex
        );
      }

      this.gameState.draggedPancakeId = null;

      // Remove event listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    // Set initial position of dragged pancake
    const rect = e.target.getBoundingClientRect();
    const draggedElement = document.getElementById("draggedPancakeVisual");
    if (draggedElement) {
      draggedElement.style.left = rect.left + rect.width / 2 - 24 + "px";
      draggedElement.style.top = rect.top + rect.height / 2 - 24 + "px";
    }

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Add hover effects for drop targets
    document.querySelectorAll(".cell.plate").forEach((plate) => {
      const handleMouseEnter = () => plate.classList.add("drag-over");
      const handleMouseLeave = () => plate.classList.remove("drag-over");

      plate.addEventListener("mouseenter", handleMouseEnter);
      plate.addEventListener("mouseleave", handleMouseLeave);

      // Clean up these listeners when drag ends
      document.addEventListener(
        "mouseup",
        () => {
          plate.removeEventListener("mouseenter", handleMouseEnter);
          plate.removeEventListener("mouseleave", handleMouseLeave);
        },
        { once: true }
      );
    });
  }

  handleDragStart(e) {
    e.preventDefault();
    return false;
  }

  handleDragOver(e) {
    e.preventDefault();
    return false;
  }

  handleDragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  }

  handleDragLeave(e) {
    e.currentTarget.classList.remove("drag-over");
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    return false;
  }

  movePancake(pancakeId, targetCellIndex) {
    const targetCell = this.grid[targetCellIndex];
    if (targetCell.type !== "plate") return;

    // Find source of pancake
    let sourcePancake = null;
    let sourceCell = null;
    let sourceIndex = -1;

    // Check if it's a cooking pancake
    if (this.cookingPancakes.has(pancakeId)) {
      sourcePancake = this.cookingPancakes.get(pancakeId);
      if (
        sourcePancake.progress < GAME_CONFIG.mechanics.cookingProgressThreshold
      ) {
        // Discard unfinished pancake
        sourceCell = this.grid[sourcePancake.cellIndex];
        sourceCell.cookingPancake = null;
        this.cookingPancakes.delete(pancakeId);
        this.updateCellDisplay(sourcePancake.cellIndex);
        return;
      }

      // Move finished pancake from grill to plate
      sourceCell = this.grid[sourcePancake.cellIndex];
      sourceCell.cookingPancake = null;
      this.cookingPancakes.delete(pancakeId);

      // Add to target plate
      targetCell.pancakes.push({
        id: pancakeId,
        type: "plain",
      });

      // Add move effect
      this.addMoveEffect(targetCellIndex);

      this.updateCellDisplay(sourcePancake.cellIndex);
      this.updateCellDisplay(targetCellIndex);
      return;
    }

    // Check if it's on a plate (top pancake only)
    for (let i = 0; i < this.grid.length; i++) {
      const cell = this.grid[i];
      if (cell.type === "plate" && cell.pancakes.length > 0) {
        const topPancake = cell.pancakes[cell.pancakes.length - 1];
        if (topPancake.id === pancakeId) {
          // Remove from source plate
          cell.pancakes.pop();

          // Add to target plate
          targetCell.pancakes.push(topPancake);

          // Add move effect
          this.addMoveEffect(targetCellIndex);

          this.updateCellDisplay(i);
          this.updateCellDisplay(targetCellIndex);
          return;
        }
      }
    }
  }

  addMoveEffect(cellIndex) {
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);
    const particles = ["✨", "⭐", "✨"];

    particles.forEach((particle, i) => {
      setTimeout(() => {
        const particleEl = document.createElement("div");
        particleEl.className = "particle";
        particleEl.textContent = particle;
        particleEl.style.left = Math.random() * 100 + "%";
        particleEl.style.top = Math.random() * 100 + "%";
        cellDiv.appendChild(particleEl);

        setTimeout(
          () => particleEl.remove(),
          GAME_CONFIG.animations.particleEffect
        );
      }, i * 100);
    });
  }

  servePlate(cellIndex) {
    if (!this.gameState.gameRunning) return;

    const cell = this.grid[cellIndex];
    if (cell.type !== "plate" || cell.pancakes.length === 0) return;

    const currentOrder = this.getCurrentOrder();
    const servedPancakes = cell.pancakes.length;

    // Calculate payment
    let payment = 0;
    const correctPancakes = Math.min(servedPancakes, currentOrder);
    payment += correctPancakes * this.levelConfig.pancakeReward;

    // Penalty for extra pancakes
    if (servedPancakes > currentOrder) {
      payment -=
        (servedPancakes - currentOrder) * this.levelConfig.pancakePenalty;
    }

    // Ensure payment is not negative
    payment = Math.max(0, payment);

    this.gameState.money += payment;

    // Add success effects
    this.addSuccessEffect(cellIndex, payment);
    this.screenShake();

    // Clear the plate
    cell.pancakes = [];
    this.updateCellDisplay(cellIndex);

    // Move to next order
    this.gameState.currentOrderIndex =
      (this.gameState.currentOrderIndex + 1) % this.levelConfig.orders.length;
    this.gameState.totalOrdersCompleted++;

    this.updateUI();
  }

  addSuccessEffect(cellIndex, payment) {
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);

    // Score popup
    const scorePopup = document.createElement("div");
    scorePopup.className = "score-popup";
    scorePopup.textContent = `+$${payment}`;
    cellDiv.appendChild(scorePopup);

    setTimeout(() => scorePopup.remove(), GAME_CONFIG.animations.scorePopup);

    // Confetti particles
    const confetti = ["🎉", "🎊", "✨", "⭐", "🌟"];
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const particleEl = document.createElement("div");
        particleEl.className = "particle";
        particleEl.textContent =
          confetti[Math.floor(Math.random() * confetti.length)];
        particleEl.style.left = Math.random() * 100 + "%";
        particleEl.style.top = Math.random() * 100 + "%";
        cellDiv.appendChild(particleEl);

        setTimeout(
          () => particleEl.remove(),
          GAME_CONFIG.animations.particleEffect
        );
      }, i * 50);
    }

    // Glow effect
    cellDiv.classList.add("success-glow");
    setTimeout(
      () => cellDiv.classList.remove("success-glow"),
      GAME_CONFIG.animations.successGlow
    );
  }

  screenShake() {
    document.body.classList.add("shake");
    setTimeout(
      () => document.body.classList.remove("shake"),
      GAME_CONFIG.animations.screenShake
    );
  }

  getCurrentOrder() {
    return this.levelConfig.orders[this.gameState.currentOrderIndex];
  }

  buyBatter() {
    if (!this.gameState.gameRunning) return;

    this.gameState.money -= this.levelConfig.batterCost;
    this.gameState.batter += this.levelConfig.batterPurchaseAmount;

    // Add purchase effect
    const buyButton = document.getElementById("buyBatter");
    buyButton.classList.add("success-glow");
    setTimeout(
      () => buyButton.classList.remove("success-glow"),
      GAME_CONFIG.animations.successGlow
    );

    this.updateUI();
  }

  updateUI() {
    const timeSeconds = Math.ceil(this.gameState.timeRemaining / 1000);
    const timerEl = document.getElementById("timer");
    timerEl.textContent = timeSeconds;

    // Add urgent styling when time is low
    if (timeSeconds <= GAME_CONFIG.mechanics.urgentTimerThreshold) {
      timerEl.classList.add("urgent");
    } else {
      timerEl.classList.remove("urgent");
    }

    document.getElementById(
      "currentOrder"
    ).textContent = `${this.getCurrentOrder()} Pancake${
      this.getCurrentOrder() > 1 ? "s" : ""
    }`;
    document.getElementById("batterCount").textContent = this.gameState.batter;
    document.getElementById(
      "moneyDisplay"
    ).textContent = `${this.gameState.money}`;

    // Update store section styling based on batter count
    const storeSection = document.getElementById("storeSection");
    const buyButton = document.getElementById("buyBatter");

    if (this.gameState.batter === 0) {
      storeSection.classList.add("out-of-stock");
    } else {
      storeSection.classList.remove("out-of-stock");
    }

    // Update buy button (allow going into debt)
    buyButton.disabled = false;
  }

  gameLoop() {
    if (!this.gameState.gameRunning) return;

    this.updateCooking();
    this.gameState.timeRemaining -= GAME_CONFIG.mechanics.gameLoopInterval;

    if (this.gameState.timeRemaining <= 0) {
      this.endGame();
      return;
    }

    this.updateUI();

    setTimeout(() => this.gameLoop(), GAME_CONFIG.mechanics.gameLoopInterval);
  }

  endGame() {
    this.gameState.gameRunning = false;

    // Calculate stars
    const finalScore = this.gameState.money;
    let stars = 0;

    if (finalScore >= this.levelConfig.starThresholds[2]) stars = 3;
    else if (finalScore >= this.levelConfig.starThresholds[1]) stars = 2;
    else if (finalScore >= this.levelConfig.starThresholds[0]) stars = 1;

    // Show game over screen
    const gameOverScreen = document.getElementById("gameOverScreen");
    const starsDisplay = document.getElementById("starsDisplay");
    const finalScoreDisplay = document.getElementById("finalScore");

    starsDisplay.textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
    finalScoreDisplay.textContent = `Final Score: $${finalScore}`;

    gameOverScreen.classList.remove("hidden");
  }

  restart() {
    document.getElementById("gameOverScreen").classList.add("hidden");
    this.initializeGame();
  }

  setupEventListeners() {
    document
      .getElementById("buyBatter")
      .addEventListener("click", () => this.buyBatter());
    document
      .getElementById("restartButton")
      .addEventListener("click", () => this.restart());
  }
}

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure everything is ready
  setTimeout(() => {
    new PancakeStackGame();
  }, 10);
});
