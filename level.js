class LevelManager {
  constructor(gameInstance) {
    this.game = gameInstance;

    this.gameRunning = false;
    this.timeRemaining = 0;
    this.batter = 0;
    this.butter = 0;
    this.banana = 0;
    this.money = 0;
    this.currentOrderIndex = 0;
    this.totalOrdersCompleted = 0;
    this.combo = 0;

    this.grid = [];
    this.levelConfig = null;

    this.activeTimeouts = new Set();
    this.eventListeners = [];
    this.cachedElements = {};

    this.timeWarning15Played = false;
    this.lastTickSecond = null;

    this.pancakeCooking = new PancakeCooking(this);
    this.levelUI = new LevelUI(this);
    this.dragDrop = new DragDrop(this);
  }

  cacheElement(id) {
    if (!this.cachedElements[id]) {
      this.cachedElements[id] = document.getElementById(id);
    }
    return this.cachedElements[id];
  }

  addTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
      callback();
      this.activeTimeouts.delete(timeoutId);
    }, delay);
    this.activeTimeouts.add(timeoutId);
    return timeoutId;
  }

  addEventListener(element, event, handler) {
    const listener = { element, event, handler };
    element.addEventListener(event, handler);
    this.eventListeners.push(listener);
  }

  startLevel(levelNum, levelConfig) {
    console.log(`Starting level ${levelNum}`);

    this.levelConfig = levelConfig;

    // Show game screen and hide others
    this.cacheElement("loadingScreen").classList.add("hidden");
    this.cacheElement("startScreen").classList.add("hidden");
    this.cacheElement("levelSelectScreen").classList.add("hidden");
    this.cacheElement("gameScreen").classList.remove("hidden");
    this.cacheElement("htpPopup").classList.add("hidden");

    // Initialize the game with fresh state
    this.initializeGame();

    // Start the game loop
    this.gameLoop();

    console.log(`Level ${levelNum} started successfully`);
  }

  stopGame() {
    console.log("Stopping game and cleaning up");
    this.gameRunning = false;
    this.cleanup();
  }

  cleanup() {
    console.log("Cleaning up level manager");

    // Clear all timeouts
    this.activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.activeTimeouts.clear();

    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Cleanup sub-components
    if (this.pancakeCooking) {
      this.pancakeCooking.cleanup();
    }
    if (this.levelUI) {
      this.levelUI.stopTutorialCycling();
      this.levelUI.removeAllEventListeners();
    }
    if (this.dragDrop) {
      this.dragDrop.cleanupDragState();
    }

    // Clear cached elements
    this.cachedElements = {};

    console.log("Level manager cleanup complete");
  }

  initializeGame() {
    console.log("Initializing game state");

    // Set game state
    this.game.gameState = "playing";
    this.gameRunning = true;

    // Reset all game variables to initial state
    this.timeRemaining = this.levelConfig.timeLimit;
    this.batter = this.levelConfig.initialBatter;
    this.butter = this.levelConfig.initialButter;
    this.banana = this.levelConfig.initialBanana;
    this.money = this.levelConfig.initialMoney;
    this.currentOrderIndex = 0;
    this.totalOrdersCompleted = 0;
    this.combo = 0;

    // Reset timing flags
    this.timeWarning15Played = false;
    this.lastTickSecond = null;

    // Create fresh grid
    this.grid = new Array(9).fill(null).map((_, index) => ({
      type: this.levelConfig.gridLayout[index],
      pancakes: [],
      cookingPancake: null,
    }));

    // Reinitialize all components with fresh state
    this.pancakeCooking.initialize();

    // Recreate the UI completely
    this.levelUI.createGrid();
    this.levelUI.updateUI();

    // Setup fresh event listeners for game interactions
    this.setupGameEventListeners();

    console.log("Game initialization complete", {
      batter: this.batter,
      butter: this.butter,
      banana: this.banana,
      money: this.money,
      timeRemaining: this.timeRemaining,
    });
  }

  setupGameEventListeners() {
    console.log("Setting up game event listeners");

    // Get button elements fresh each time
    const buyBatterBtn = document.getElementById("buyBatter");
    const buyButterBtn = document.getElementById("buyButter");
    const buyBananaBtn = document.getElementById("buyBanana");

    if (buyBatterBtn) {
      this.addEventListener(buyBatterBtn, "click", () => {
        console.log("Buy batter clicked");
        this.buyIngredient("batter");
      });
      this.addEventListener(buyBatterBtn, "mouseenter", () =>
        this.game.audioManager.playSfx("buttonHover")
      );
    }

    if (buyButterBtn) {
      this.addEventListener(buyButterBtn, "click", () => {
        console.log("Buy butter clicked");
        this.buyIngredient("butter");
      });
      this.addEventListener(buyButterBtn, "mouseenter", () =>
        this.game.audioManager.playSfx("buttonHover")
      );
    }

    if (buyBananaBtn) {
      this.addEventListener(buyBananaBtn, "click", () => {
        console.log("Buy banana clicked");
        this.buyIngredient("banana");
      });
      this.addEventListener(buyBananaBtn, "mouseenter", () =>
        this.game.audioManager.playSfx("buttonHover")
      );
    }

    console.log("Event listeners setup complete");
  }

  buyIngredient(type) {
    if (this.game.gameState !== "playing" || !this.gameRunning) {
      console.log("Cannot buy ingredient - game not running");
      return;
    }

    console.log(`Attempting to buy ${type}`, {
      currentMoney: this.money,
      currentAmount: this[type],
    });

    const config = this.getIngredientConfig(type);
    if (this.money < config.cost) {
      console.log(
        `Not enough money to buy ${type}. Need ${config.cost}, have ${this.money}`
      );
      return;
    }

    // Deduct money and add ingredient
    this.money -= config.cost;
    this[type] += config.purchaseAmount;

    console.log(`Successfully bought ${type}`, {
      newMoney: this.money,
      newAmount: this[type],
      cost: config.cost,
      purchased: config.purchaseAmount,
    });

    // Play sound and visual effects
    this.game.audioManager.playSfx("buttonClick");
    this.addPurchaseEffect(config.buttonId);

    // Update UI to reflect changes
    this.levelUI.updateUI();
  }

  getIngredientConfig(type) {
    const configs = {
      batter: {
        cost: this.levelConfig.batterCost,
        purchaseAmount: this.levelConfig.batterPurchaseAmount,
        buttonId: "buyBatter",
      },
      butter: {
        cost: this.levelConfig.butterCost,
        purchaseAmount: this.levelConfig.butterPurchaseAmount,
        buttonId: "buyButter",
      },
      banana: {
        cost: this.levelConfig.bananaCost,
        purchaseAmount: this.levelConfig.bananaPurchaseAmount,
        buttonId: "buyBanana",
      },
    };
    return configs[type];
  }

  addPurchaseEffect(buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.classList.add("success-glow");
    this.addTimeout(
      () => button.classList.remove("success-glow"),
      GAME_CONFIG.animations.successGlow
    );
  }

  getCurrentOrder() {
    return this.levelConfig.orders[this.currentOrderIndex];
  }

  buyBatter() {
    this.buyIngredient("batter");
  }

  buyButter() {
    this.buyIngredient("butter");
  }

  buyBanana() {
    this.buyIngredient("banana");
  }

  getServedPancakesByType(pancakes) {
    const counts = {};
    pancakes.forEach((pancake) => {
      counts[pancake.type] = counts[pancake.type] + 1 || 1;
    });
    return counts;
  }

  isOrderPerfectlyFulfilled(servedPancakes, currentOrder) {
    const orderTypes = Object.keys(currentOrder);
    const servedTypes = Object.keys(servedPancakes);

    if (orderTypes.length !== servedTypes.length) {
      return false;
    }

    for (const [type, required] of Object.entries(currentOrder)) {
      const served = servedPancakes[type];
      if (!served || served !== required) {
        return false;
      }
    }

    for (const type of servedTypes) {
      if (!(type in currentOrder)) {
        return false;
      }
    }

    return true;
  }

  calculatePayment(servedPancakes, currentOrder) {
    let payment = 0;
    let correctPancakes = 0;
    let extraPancakes = 0;

    Object.keys(currentOrder).forEach((type) => {
      const required = currentOrder[type];
      const served = servedPancakes[type];
      if (served) {
        const correct = Math.min(served, required);
        correctPancakes += correct;
        payment += correct * this.levelConfig.pancakeReward;
      }
    });

    Object.keys(servedPancakes).forEach((type) => {
      const required = currentOrder[type];
      const served = servedPancakes[type];
      if (served > (required || 0)) {
        const extra = served - (required || 0);
        extraPancakes += extra;
        payment -= extra * this.levelConfig.pancakePenalty;
      }
    });

    return { payment, correctPancakes, extraPancakes };
  }

  calculateBonuses(isPerfectOrder, currentOrder) {
    let orderFulfillmentBonus = 0;
    let comboBonus = 0;

    if (isPerfectOrder) {
      const totalPancakesInOrder = Object.values(currentOrder).reduce(
        (sum, count) => sum + count,
        0
      );
      orderFulfillmentBonus = totalPancakesInOrder;
      this.combo++;
      comboBonus = this.combo * 5;
    } else {
      this.combo = 0;
    }

    return { orderFulfillmentBonus, comboBonus };
  }

  addPaymentAnimations(correctPancakes, extraPancakes, cellIndex, comboBonus) {
    for (let i = 0; i < correctPancakes; i++) {
      this.addTimeout(() => {
        this.levelUI.addCoinAnimation(cellIndex);
      }, i * 150);
    }

    if (extraPancakes > 0) {
      for (let i = 0; i < extraPancakes; i++) {
        this.addTimeout(() => {
          this.levelUI.addPenaltyAnimation();
        }, i * 200);
      }
    }

    if (comboBonus > 0) {
      this.game.audioManager.playSfx("comboEarned");
      this.levelUI.addComboEffect(cellIndex, this.combo, comboBonus);
      this.levelUI.addComboMoneyAnimation(comboBonus);
    }
  }

  servePlate(cellIndex) {
    if (this.game.gameState !== "playing" || !this.gameRunning) return;

    const cell = this.grid[cellIndex];
    if (cell.type !== "plate" || cell.pancakes.length === 0) return;

    const currentOrder = this.getCurrentOrder();
    const servedPancakes = this.getServedPancakesByType(cell.pancakes);
    const isPerfectOrder = this.isOrderPerfectlyFulfilled(
      servedPancakes,
      currentOrder
    );

    const {
      payment: basePayment,
      correctPancakes,
      extraPancakes,
    } = this.calculatePayment(servedPancakes, currentOrder);

    const { orderFulfillmentBonus, comboBonus } = this.calculateBonuses(
      isPerfectOrder,
      currentOrder
    );

    const totalPayment = Math.max(
      0,
      basePayment + orderFulfillmentBonus + comboBonus
    );
    this.money += totalPayment;

    this.game.audioManager.playSfx("orderServed");

    // Play earnMoney sound for ANY positive payment (including bonuses)
    if (totalPayment > 0) {
      this.game.audioManager.playSfx("earnMoney");
    }

    this.addPaymentAnimations(
      correctPancakes,
      extraPancakes,
      cellIndex,
      comboBonus
    );

    this.levelUI.addSuccessEffect(
      cellIndex,
      totalPayment,
      orderFulfillmentBonus,
      comboBonus
    );
    this.levelUI.screenShake();

    cell.pancakes = [];
    this.levelUI.updateCellDisplay(cellIndex);

    this.currentOrderIndex =
      (this.currentOrderIndex + 1) % this.levelConfig.orders.length;
    this.totalOrdersCompleted++;

    this.levelUI.updateUI();
  }

  handleTimeWarnings() {
    const timeInSeconds = Math.ceil(this.timeRemaining / 1000);

    if (timeInSeconds <= 15 && !this.timeWarning15Played) {
      this.timeWarning15Played = true;
      this.game.audioManager.playSfx("timeWarning15");
    }

    // Play tick sound each second from 10 seconds down to 1
    if (timeInSeconds <= 10 && timeInSeconds > 0) {
      if (!this.lastTickSecond || this.lastTickSecond !== timeInSeconds) {
        this.lastTickSecond = timeInSeconds;
        this.game.audioManager.playSfx("timeTicking");
      }
    }
  }

  gameLoop() {
    if (this.game.gameState !== "playing" || !this.gameRunning) return;

    this.pancakeCooking.updateCooking();
    this.timeRemaining -= GAME_CONFIG.mechanics.gameLoopInterval;

    this.handleTimeWarnings();

    if (this.timeRemaining <= 0) {
      this.endGame();
      return;
    }

    this.levelUI.updateUI();

    this.addTimeout(
      () => this.gameLoop(),
      GAME_CONFIG.mechanics.gameLoopInterval
    );
  }

  endGame() {
    this.gameRunning = false;
    const finalScore = this.money;
    this.game.endGame(finalScore);
  }
}
