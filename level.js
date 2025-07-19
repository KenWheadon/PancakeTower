class LevelManager {
  constructor(gameInstance) {
    this.game = gameInstance;

    // Game state
    this.gameRunning = false;
    this.timeRemaining = 0;
    this.batter = 0;
    this.butter = 0;
    this.banana = 0;
    this.money = 0;
    this.currentOrderIndex = 0;
    this.totalOrdersCompleted = 0;
    this.combo = 0; // NEW: Track combo counter

    // Grid state
    this.grid = [];
    this.levelConfig = null;

    // Initialize sub-managers
    this.pancakeCooking = new PancakeCooking(this);
    this.levelUI = new LevelUI(this);
    this.dragDrop = new DragDrop(this);
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
    this.pancakeCooking.cleanup();
    this.levelUI.stopTutorialCycling();
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
    this.butter = this.levelConfig.initialButter || 0;
    this.banana = this.levelConfig.initialBanana || 0;
    this.money = this.levelConfig.initialMoney;
    this.currentOrderIndex = 0;
    this.totalOrdersCompleted = 0;
    this.combo = 0; // NEW: Initialize combo

    // Grid state
    this.grid = new Array(9).fill(null).map((_, index) => ({
      type: this.levelConfig.gridLayout[index],
      pancakes: [], // stack of pancakes
      cookingPancake: null, // pancake being cooked (for grills)
    }));

    // Initialize sub-managers
    this.pancakeCooking.initialize();
    this.levelUI.createGrid();
    this.levelUI.updateUI();
    this.setupGameEventListeners();
  }

  setupGameEventListeners() {
    // Game buttons
    document
      .getElementById("buyBatter")
      ?.addEventListener("click", () => this.buyBatter());

    // Add event listeners for ingredient purchases if they exist
    document
      .getElementById("buyButter")
      ?.addEventListener("click", () => this.buyButter());

    document
      .getElementById("buyBanana")
      ?.addEventListener("click", () => this.buyBanana());
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

    this.levelUI.updateUI();
  }

  buyButter() {
    if (this.game.gameState !== "playing" || !this.gameRunning) return;
    if (this.money < this.levelConfig.butterCost) return;

    this.money -= this.levelConfig.butterCost;
    this.butter += this.levelConfig.butterPurchaseAmount;

    // Add purchase effect
    const buyButton = document.getElementById("buyButter");
    buyButton?.classList.add("success-glow");
    setTimeout(
      () => buyButton?.classList.remove("success-glow"),
      GAME_CONFIG.animations.successGlow
    );

    this.levelUI.updateUI();
  }

  buyBanana() {
    if (this.game.gameState !== "playing" || !this.gameRunning) return;
    if (this.money < this.levelConfig.bananaCost) return;

    this.money -= this.levelConfig.bananaCost;
    this.banana += this.levelConfig.bananaPurchaseAmount;

    // Add purchase effect
    const buyButton = document.getElementById("buyBanana");
    buyButton?.classList.add("success-glow");
    setTimeout(
      () => buyButton?.classList.remove("success-glow"),
      GAME_CONFIG.animations.successGlow
    );

    this.levelUI.updateUI();
  }

  // Helper method to count served pancakes by type
  getServedPancakesByType(pancakes) {
    const counts = {};
    pancakes.forEach((pancake) => {
      counts[pancake.type] = (counts[pancake.type] || 0) + 1;
    });
    return counts;
  }

  // NEW: Check if order is perfectly fulfilled (exactly what's required, no more, no less)
  isOrderPerfectlyFulfilled(servedPancakes, currentOrder) {
    // Check if served pancakes exactly match the order
    const orderTypes = Object.keys(currentOrder);
    const servedTypes = Object.keys(servedPancakes);

    // Must have same number of types
    if (orderTypes.length !== servedTypes.length) {
      return false;
    }

    // Check each type matches exactly
    for (const [type, required] of Object.entries(currentOrder)) {
      const served = servedPancakes[type] || 0;
      if (served !== required) {
        return false;
      }
    }

    // Check no extra types
    for (const type of servedTypes) {
      if (!(type in currentOrder)) {
        return false;
      }
    }

    return true;
  }

  servePlate(cellIndex) {
    if (this.game.gameState !== "playing" || !this.gameRunning) return;

    const cell = this.grid[cellIndex];
    if (cell.type !== "plate" || cell.pancakes.length === 0) return;

    const currentOrder = this.getCurrentOrder();
    const servedPancakes = this.getServedPancakesByType(cell.pancakes);

    // Check if order is perfectly fulfilled
    const isPerfectOrder = this.isOrderPerfectlyFulfilled(
      servedPancakes,
      currentOrder
    );

    // Calculate payment based on type matching
    let payment = 0;
    let correctPancakes = 0;
    let extraPancakes = 0;
    let orderFulfillmentBonus = 0;
    let comboBonus = 0;

    // Count correct pancakes by type
    Object.keys(currentOrder).forEach((type) => {
      const required = currentOrder[type];
      const served = servedPancakes[type] || 0;
      const correct = Math.min(served, required);
      correctPancakes += correct;
      payment += correct * this.levelConfig.pancakeReward;
    });

    // Count extra pancakes (any served beyond what's required)
    Object.keys(servedPancakes).forEach((type) => {
      const required = currentOrder[type] || 0;
      const served = servedPancakes[type];
      if (served > required) {
        const extra = served - required;
        extraPancakes += extra;
        payment -= extra * this.levelConfig.pancakePenalty;
      }
    });

    // NEW: Add order fulfillment bonus if order is perfectly fulfilled
    if (isPerfectOrder) {
      // $1 bonus per pancake in the order
      const totalPancakesInOrder = Object.values(currentOrder).reduce(
        (sum, count) => sum + count,
        0
      );
      orderFulfillmentBonus = totalPancakesInOrder;
      payment += orderFulfillmentBonus;

      // NEW: Add combo and combo bonus
      this.combo++;
      comboBonus = this.combo * 5; // $5 per combo level
      payment += comboBonus;

      // Add combo effect and money animation
      this.levelUI.addComboEffect(cellIndex, this.combo, comboBonus);
      this.levelUI.addComboMoneyAnimation(comboBonus);
    } else {
      // Reset combo if order is not perfectly fulfilled
      this.combo = 0;
    }

    // Penalty animations for extra pancakes
    if (extraPancakes > 0) {
      for (let i = 0; i < extraPancakes; i++) {
        setTimeout(() => {
          this.levelUI.addPenaltyAnimation();
        }, i * 200);
      }
    }

    // Ensure payment is not negative
    payment = Math.max(0, payment);
    this.money += payment;

    // Add coin animations for correct pancakes
    for (let i = 0; i < correctPancakes; i++) {
      setTimeout(() => {
        this.levelUI.addCoinAnimation(cellIndex);
      }, i * 150);
    }

    // Add success effects with bonus information
    this.levelUI.addSuccessEffect(
      cellIndex,
      payment,
      orderFulfillmentBonus,
      comboBonus
    );
    this.levelUI.screenShake();

    // Clear the plate
    cell.pancakes = [];
    this.levelUI.updateCellDisplay(cellIndex);

    // Move to next order
    this.currentOrderIndex =
      (this.currentOrderIndex + 1) % this.levelConfig.orders.length;
    this.totalOrdersCompleted++;

    this.levelUI.updateUI();
  }

  gameLoop() {
    if (this.game.gameState !== "playing" || !this.gameRunning) return;

    this.pancakeCooking.updateCooking();
    this.timeRemaining -= GAME_CONFIG.mechanics.gameLoopInterval;

    if (this.timeRemaining <= 0) {
      this.endGame();
      return;
    }

    this.levelUI.updateUI();

    setTimeout(() => this.gameLoop(), GAME_CONFIG.mechanics.gameLoopInterval);
  }

  endGame() {
    this.gameRunning = false;
    const finalScore = this.money;
    this.game.endGame(finalScore);
  }
}
