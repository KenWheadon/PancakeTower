class LevelManager {
  constructor(gameInstance) {
    this.game = gameInstance;

    // Game state
    this.gameRunning = false;
    this.timeRemaining = 0;
    this.batter = 0;
    this.money = 0;
    this.currentOrderIndex = 0;
    this.totalOrdersCompleted = 0;
    this.isDragging = false;
    this.draggedPancakeId = null;

    // Grid state
    this.grid = [];

    // Pancake tracking
    this.pancakeIdCounter = 0;
    this.cookingPancakes = new Map(); // id -> pancake data

    this.levelConfig = null;
  }

  startLevel(levelNum, levelConfig) {
    this.levelConfig = levelConfig;

    // Hide all screens and show game
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("levelSelectScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");
    document.getElementById("htpPopup").classList.add("hidden");

    // Initialize game for this level
    this.initializeGame();
    this.gameLoop();
  }

  stopGame() {
    this.gameRunning = false;
    if (this.cookingPancakes) {
      this.cookingPancakes.clear();
    }
  }

  initializeGame() {
    // Use configuration from the selected level
    if (!this.levelConfig) {
      console.error("No level configuration found!");
      return;
    }

    // Game state
    this.game.gameState = "playing";
    this.gameRunning = true;
    this.timeRemaining = this.levelConfig.timeLimit;
    this.batter = this.levelConfig.initialBatter;
    this.money = this.levelConfig.initialMoney;
    this.currentOrderIndex = 0;
    this.totalOrdersCompleted = 0;
    this.isDragging = false;
    this.draggedPancakeId = null;

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
    this.setupGameEventListeners();
  }

  createGrid() {
    const gameGrid = document.getElementById("gameGrid");
    gameGrid.innerHTML = "";

    this.grid.forEach((cell, index) => {
      const cellDiv = document.createElement("div");
      cellDiv.className = `cell ${cell.type}`;
      cellDiv.dataset.cellIndex = index;

      if (cell.type === "grill") {
        // Replace emoji with image
        const grillImg = document.createElement("img");
        grillImg.src = "images/item-grill.png";
        grillImg.className = "grill-image";
        grillImg.alt = "Grill";
        cellDiv.appendChild(grillImg);

        cellDiv.addEventListener("click", (e) => {
          this.addClickEffect(e);
          this.startCooking(index);
        });
      } else if (cell.type === "plate") {
        // Replace emoji with image
        const plateImg = document.createElement("img");
        plateImg.src = "images/item-plate-1.png";
        plateImg.className = "plate-image";
        plateImg.alt = "Plate";
        cellDiv.appendChild(plateImg);

        const serveButton = document.createElement("button");
        serveButton.className = "serve-button";
        serveButton.innerHTML = `<span class="stack-count">0</span>Sell`;
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

  setupGameEventListeners() {
    // Game buttons
    document
      .getElementById("buyBatter")
      ?.addEventListener("click", () => this.buyBatter());
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
    if (this.game.gameState !== "playing" || !this.gameRunning) return;

    const cell = this.grid[cellIndex];
    if (cell.type !== "grill" || cell.cookingPancake) return;
    if (this.batter <= 0) return;

    // Consume batter
    this.batter--;

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
        this.isDragging && this.draggedPancakeId === id.toString();

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

        // Center particles around the middle of the cell with small random offset
        const centerX = 50;
        const centerY = 50;
        const offsetRange = 25; // pixels from center

        particleEl.style.left = `calc(${centerX}% + ${
          (Math.random() - 0.5) * offsetRange
        }px)`;
        particleEl.style.top = `calc(${centerY}% + ${
          (Math.random() - 0.5) * offsetRange
        }px)`;

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

      // Hide grill image when cooking
      const grillImg = cellDiv.querySelector(".grill-image");
      if (grillImg) {
        grillImg.style.opacity = "0.3";
      }

      // Calculate the actual cooking threshold from level config
      const cookingThreshold =
        (this.levelConfig.cookingTime / this.levelConfig.burntTime) * 100;

      // Update progress bar
      let progressBar = cellDiv.querySelector(".progress-bar");
      if (!progressBar) {
        progressBar = document.createElement("div");
        progressBar.className = "progress-bar";

        progressBar.innerHTML = `
          <div class="progress-fill"></div>
          <div class="progress-marker done" style="left: ${cookingThreshold}%"></div>
        `;
        cellDiv.appendChild(progressBar);
      }

      const progressFill = progressBar.querySelector(".progress-fill");
      progressFill.style.width = `${progress}%`;

      // Show pancake immediately when batter is placed
      let pancakeImg = cellDiv.querySelector(".pancake");
      if (!pancakeImg) {
        pancakeImg = document.createElement("img");
        pancakeImg.className = "pancake";
        pancakeImg.dataset.pancakeId = pancake.id;
        cellDiv.appendChild(pancakeImg);
      }

      // Update pancake appearance based on progress using the actual cooking threshold
      if (progress < cookingThreshold) {
        pancakeImg.src = "images/plain-pancake-goo.png"; // Uncooked
        pancakeImg.alt = "Uncooked pancake";
        pancakeImg.draggable = false;
        pancakeImg.style.cursor = "not-allowed";
      } else if (progress >= GAME_CONFIG.mechanics.burntThreshold) {
        pancakeImg.src = "images/plain-pancake-burnt.png"; // Burnt
        pancakeImg.alt = "Burnt pancake";
        pancakeImg.draggable = false;
        pancakeImg.style.cursor = "not-allowed";
      } else {
        pancakeImg.src = "images/plain-pancake-cooked.png"; // Cooked
        pancakeImg.alt = "Cooked pancake";
        pancakeImg.draggable = false; // Disable HTML5 drag
        pancakeImg.style.cursor = "grab";

        // Remove any existing event listeners
        pancakeImg.removeEventListener("mousedown", this.handleMouseDown);
        pancakeImg.removeEventListener("dragstart", this.handleDragStart);

        // Add mouse-based drag handling
        pancakeImg.addEventListener(
          "mousedown",
          this.handleMouseDown.bind(this)
        );
        pancakeImg.addEventListener("dragstart", (e) => e.preventDefault());
      }
    } else if (cell.type === "grill") {
      // Clear grill display when no pancake and show grill image
      const grillImg = cellDiv.querySelector(".grill-image");
      if (grillImg) {
        grillImg.style.opacity = "1";
      }

      const progressBar = cellDiv.querySelector(".progress-bar");
      const pancakeImg = cellDiv.querySelector(".pancake");
      if (progressBar) progressBar.remove();
      if (pancakeImg) pancakeImg.remove();
    } else if (cell.type === "plate") {
      // Update serve button with stack count
      const serveButton = cellDiv.querySelector(".serve-button");
      const stackCount = serveButton.querySelector(".stack-count");

      if (stackCount) {
        stackCount.textContent = cell.pancakes.length;
      }

      // Update plate display with stacked pancakes
      const existingStack = cellDiv.querySelector(".pancake-stack");
      if (existingStack) existingStack.remove();

      if (cell.pancakes.length > 0) {
        const stackDiv = document.createElement("div");
        stackDiv.className = "pancake-stack";

        // Create visual stacking effect
        cell.pancakes.forEach((pancake, index) => {
          const pancakeImg = document.createElement("img");
          pancakeImg.className = "pancake stacked-pancake";
          pancakeImg.src = "images/plain-pancake-cooked.png";
          pancakeImg.alt = "Stacked pancake";
          pancakeImg.dataset.pancakeId = pancake.id;

          // Apply stacking transform
          pancakeImg.style.zIndex = index + 10;

          // Only top pancake is draggable
          if (index === cell.pancakes.length - 1) {
            pancakeImg.draggable = false; // Disable HTML5 drag
            pancakeImg.classList.add("top-pancake");

            // Remove any existing event listeners
            pancakeImg.removeEventListener("mousedown", this.handleMouseDown);
            pancakeImg.removeEventListener("dragstart", this.handleDragStart);

            // Add mouse-based drag handling
            pancakeImg.addEventListener(
              "mousedown",
              this.handleMouseDown.bind(this)
            );
            pancakeImg.addEventListener("dragstart", (e) => e.preventDefault());
          } else {
            // Lower pancakes in stack are not interactive
            pancakeImg.style.cursor = "default";
            pancakeImg.style.opacity = "0.9";
          }

          stackDiv.appendChild(pancakeImg);
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
    this.isDragging = true;
    this.draggedPancakeId = pancakeId;

    // Add visual feedback to original pancake
    e.target.classList.add("dragging");
    e.target.style.cursor = "grabbing";

    // Create dragged pancake visual
    const draggedPancake = document.createElement("img");
    draggedPancake.className = "dragged-pancake";
    draggedPancake.src = "images/plain-pancake-cooked.png";
    draggedPancake.alt = "Dragged pancake";
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
      this.isDragging = false;

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

      if (plateCell && this.draggedPancakeId) {
        const targetCellIndex = parseInt(plateCell.dataset.cellIndex);
        this.movePancake(parseInt(this.draggedPancakeId), targetCellIndex);
      }

      this.draggedPancakeId = null;

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

    // Calculate the actual cooking threshold from level config
    const cookingThreshold =
      (this.levelConfig.cookingTime / this.levelConfig.burntTime) * 100;

    // Find source of pancake
    let sourcePancake = null;
    let sourceCell = null;
    let sourceIndex = -1;

    // Check if it's a cooking pancake
    if (this.cookingPancakes.has(pancakeId)) {
      sourcePancake = this.cookingPancakes.get(pancakeId);
      if (sourcePancake.progress < cookingThreshold) {
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

        // Center particles around the middle of the cell with small random offset
        const centerX = 50;
        const centerY = 50;
        const offsetRange = 20; // pixels from center

        particleEl.style.left = `calc(${centerX}% + ${
          (Math.random() - 0.5) * offsetRange
        }px)`;
        particleEl.style.top = `calc(${centerY}% + ${
          (Math.random() - 0.5) * offsetRange
        }px)`;

        cellDiv.appendChild(particleEl);

        setTimeout(
          () => particleEl.remove(),
          GAME_CONFIG.animations.particleEffect
        );
      }, i * 100);
    });
  }

  servePlate(cellIndex) {
    if (this.game.gameState !== "playing" || !this.gameRunning) return;

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
      const extraPancakes = servedPancakes - currentOrder;
      payment -= extraPancakes * this.levelConfig.pancakePenalty;

      // Add penalty animation for each extra pancake
      for (let i = 0; i < extraPancakes; i++) {
        setTimeout(() => {
          this.addPenaltyAnimation();
        }, i * 200);
      }
    }

    // Ensure payment is not negative
    payment = Math.max(0, payment);

    this.money += payment;

    // Add coin animations for correct pancakes
    for (let i = 0; i < correctPancakes; i++) {
      setTimeout(() => {
        this.addCoinAnimation(cellIndex);
      }, i * 150);
    }

    // Add success effects
    this.addSuccessEffect(cellIndex, payment);
    this.screenShake();

    // Clear the plate
    cell.pancakes = [];
    this.updateCellDisplay(cellIndex);

    // Move to next order
    this.currentOrderIndex =
      (this.currentOrderIndex + 1) % this.levelConfig.orders.length;
    this.totalOrdersCompleted++;

    this.updateUI();
  }

  addCoinAnimation(cellIndex) {
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);
    const moneyDisplay = document.getElementById("moneyDisplay");

    if (!cellDiv || !moneyDisplay) return;

    const coin = document.createElement("div");
    coin.className = "coin-animation";
    coin.textContent = "🪙";

    // Get positions
    const cellRect = cellDiv.getBoundingClientRect();
    const moneyRect = moneyDisplay.getBoundingClientRect();

    // Set initial position
    coin.style.position = "fixed";
    coin.style.left = cellRect.left + cellRect.width / 2 + "px";
    coin.style.top = cellRect.top + cellRect.height / 2 + "px";
    coin.style.zIndex = "1000";

    document.body.appendChild(coin);

    // Animate to money display
    setTimeout(() => {
      coin.style.left = moneyRect.left + moneyRect.width / 2 + "px";
      coin.style.top = moneyRect.top + moneyRect.height / 2 + "px";
    }, 10);

    // Remove after animation
    setTimeout(() => {
      if (coin.parentNode) {
        coin.remove();
      }
    }, 1000);
  }

  addPenaltyAnimation() {
    const moneyDisplay = document.getElementById("moneyDisplay");
    if (!moneyDisplay) return;

    // Add red glow to money display
    moneyDisplay.classList.add("penalty-glow");
    setTimeout(() => {
      moneyDisplay.classList.remove("penalty-glow");
    }, 800);

    // Add -1 animation
    const penalty = document.createElement("div");
    penalty.className = "penalty-animation";
    penalty.textContent = "-1";

    const moneyRect = moneyDisplay.getBoundingClientRect();
    penalty.style.left = moneyRect.left + moneyRect.width / 2 + "px";
    penalty.style.top = moneyRect.top + "px";

    moneyDisplay.appendChild(penalty);

    setTimeout(() => {
      if (penalty.parentNode) {
        penalty.remove();
      }
    }, 1500);
  }

  addSuccessEffect(cellIndex, payment) {
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);

    // Score popup
    const scorePopup = document.createElement("div");
    scorePopup.className = "score-popup";
    scorePopup.textContent = `+${payment}`;
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
    return this.levelConfig.orders[this.currentOrderIndex];
  }

  buyBatter() {
    if (this.game.gameState !== "playing" || !this.gameRunning) return;
    if (this.money < this.levelConfig.batterCost) return;

    this.money -= this.levelConfig.batterCost;
    this.batter += this.levelConfig.batterPurchaseAmount;

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
    const timeSeconds = Math.ceil(this.timeRemaining / 1000);
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
    document.getElementById("batterCount").textContent = this.batter;
    document.getElementById("batterCost").textContent =
      this.levelConfig.batterCost;
    document.getElementById("moneyDisplay").textContent = `${this.money}`;

    // Update store section styling based on batter count
    const storeSection = document.getElementById("storeSection");
    const buyButton = document.getElementById("buyBatter");

    if (this.batter === 0) {
      storeSection.classList.add("out-of-stock");
    } else {
      storeSection.classList.remove("out-of-stock");
    }

    // Update buy button availability
    buyButton.disabled = this.money < this.levelConfig.batterCost;
  }

  gameLoop() {
    if (this.game.gameState !== "playing" || !this.gameRunning) return;

    this.updateCooking();
    this.timeRemaining -= GAME_CONFIG.mechanics.gameLoopInterval;

    if (this.timeRemaining <= 0) {
      this.endGame();
      return;
    }

    this.updateUI();

    setTimeout(() => this.gameLoop(), GAME_CONFIG.mechanics.gameLoopInterval);
  }

  endGame() {
    this.gameRunning = false;
    const finalScore = this.money;
    this.game.endGame(finalScore);
  }
}
