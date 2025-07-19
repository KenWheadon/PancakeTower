class LevelUI {
  constructor(levelManager) {
    this.levelManager = levelManager;
    this.tutorialMessages = [
      "🔥 Drag batter to grill to cook pancakes",
      "🧈 Add ingredients before the deadline",
      "🥞 Plate them before they burn",
      "💰 Complete orders for money",
    ];
    this.currentTutorialIndex = 0;
    this.tutorialInterval = null;
    this.eventListeners = new Map();

    this.constants = {
      SELECTORS: {
        gameGrid: "#gameGrid",
        sidebar: "#sidebar",
        storeSection: "#storeSection",
        batterCount: "#batterCount",
        batterCost: "#batterCost",
        moneyDisplay: "#moneyDisplay",
        timer: "#timer",
        orderText: "#orderText",
        comboBox: "#comboBox",
        comboText: "#comboText",
        tutorialContainer: "#tutorialContainer",
        tutorialText: "#tutorialText",
      },
      CLASSES: {
        cell: "cell",
        draggableItem: "draggable-item",
        resourceItem: "resource-item",
        progressBar: "progress-bar",
        progressFill: "progress-fill",
        progressMarker: "progress-marker",
        pancake: "pancake",
        largePancake: "large-pancake",
        stackedPancake: "stacked-pancake",
        pancakeStack: "pancake-stack",
        grillImage: "grill-image",
        plateImage: "plate-image",
        serveButton: "serve-button",
        stackCount: "stack-count",
        buyButton: "buy-button",
        resourceAmount: "resource-amount",
        resourceLeft: "resource-left",
        resourceRight: "resource-right",
        cookedPancakeReady: "cooked-pancake-ready",
        ingredientDropZone: "ingredient-drop-zone",
        orderExactMatch: "order-exact-match",
        orderContainsMatch: "order-contains-match",
        orderMatchVisible: "order-match-visible",
        successGlow: "success-glow",
        urgent: "urgent",
        batterWiggle: "batter-wiggle",
        batterHasLeftArrow: "batter-has-left-arrow",
        insufficientIngredient: "insufficient-ingredient",
        penaltyGlow: "penalty-glow",
        shake: "shake",
        topPancake: "top-pancake",
      },
      VALUES: {
        tutorialCycleInterval: 3000,
        fadeTransitionDelay: 300,
        stackOffsetPx: 8,
        centerOffset: 50,
        particleOffsetRange: 25,
        moveParticleOffsetRange: 20,
        confettiCount: 8,
        confettiDelay: 50,
        particleDelay: 100,
        coinAnimationDelay: 10,
        coinRemovalDelay: 1000,
        penaltyRemovalDelay: 1500,
        comboRemovalDelay: 2000,
        nextComboMultiplier: 5,
      },
      IMAGES: {
        grill: "images/item-grill.png",
        plate: "images/item-plate-1.png",
        batter: "images/item-batter.png",
        butter: "images/item-butter.png",
        banana: "images/item-banana.png",
      },
      PARTICLES: {
        burnt: ["💨", "🔥", "💨"],
        move: ["✨", "⭐", "✨"],
        confetti: ["🎉", "🎊", "✨", "⭐", "🌟"],
        coin: "🪙",
      },
    };
  }

  addEventListener(element, event, handler) {
    const boundHandler = handler.bind(this.levelManager.dragDrop);
    element.addEventListener(event, boundHandler);

    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ event, handler: boundHandler });
  }

  removeAllEventListeners() {
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();
  }

  createGrid() {
    const gameGrid = document.querySelector(this.constants.SELECTORS.gameGrid);
    gameGrid.innerHTML = "";

    this.levelManager.grid.forEach((cell, index) => {
      const cellDiv = this.createCellElement(cell, index);
      gameGrid.appendChild(cellDiv);
    });

    this.createSidebar();
    this.startTutorialCycling();
  }

  createCellElement(cell, index) {
    const cellDiv = document.createElement("div");
    cellDiv.className = `${this.constants.CLASSES.cell} ${cell.type}`;
    cellDiv.dataset.cellIndex = index;

    if (cell.type === "grill") {
      this.setupGrillCell(cellDiv);
    } else if (cell.type === "plate") {
      this.setupPlateCell(cellDiv, index);
    }

    return cellDiv;
  }

  setupGrillCell(cellDiv) {
    const grillImg = this.createImage(
      this.constants.IMAGES.grill,
      this.constants.CLASSES.grillImage,
      "Grill"
    );
    cellDiv.appendChild(grillImg);
    this.addDropZoneListeners(cellDiv);
  }

  setupPlateCell(cellDiv, index) {
    const plateImg = this.createImage(
      this.constants.IMAGES.plate,
      this.constants.CLASSES.plateImage,
      "Plate"
    );
    cellDiv.appendChild(plateImg);

    const serveButton = this.createServeButton(index);
    cellDiv.appendChild(serveButton);
    this.addDropZoneListeners(cellDiv);
  }

  createImage(src, className, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.className = className;
    img.alt = alt;
    return img;
  }

  createServeButton(index) {
    const serveButton = document.createElement("button");
    serveButton.className = this.constants.CLASSES.serveButton;
    serveButton.innerHTML = `<span class="${this.constants.CLASSES.stackCount}">0</span>Sell`;
    serveButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.levelManager.servePlate(index);
    });
    return serveButton;
  }

  addDropZoneListeners(cellDiv) {
    const dragDrop = this.levelManager.dragDrop;
    this.addEventListener(cellDiv, "dragover", dragDrop.handleDragOver);
    this.addEventListener(cellDiv, "drop", dragDrop.handleDrop);
    this.addEventListener(cellDiv, "dragenter", dragDrop.handleDragEnter);
    this.addEventListener(cellDiv, "dragleave", dragDrop.handleDragLeave);
  }

  createSidebar() {
    const storeSection = document.querySelector(
      this.constants.SELECTORS.storeSection
    );
    storeSection.innerHTML = this.getBatterSectionHTML();

    if (this.levelManager.levelConfig.availableIngredients) {
      this.levelManager.levelConfig.availableIngredients.forEach(
        (ingredient) => {
          const ingredientElement = this.createIngredientElement(ingredient);
          if (ingredientElement) {
            storeSection.appendChild(ingredientElement);
          }
        }
      );
    }

    this.addDragListenersToItems();
  }

  getBatterSectionHTML() {
    return `
      <h3>Store - Drag Items to Grill</h3>
      
      <div class="${this.constants.CLASSES.resourceItem}" id="batterResourceItem">
        <div class="${this.constants.CLASSES.resourceLeft}">
            <div class="${this.constants.CLASSES.draggableItem}" data-item-type="batter" id="batterDraggable">
                <img src="${this.constants.IMAGES.batter}" alt="Batter" class="draggable-item-image">
            </div>
        </div>
    
        <div class="${this.constants.CLASSES.resourceRight}">
            <span class="${this.constants.CLASSES.resourceAmount}">Have: <span id="batterCount">10</span></span>
            <button class="${this.constants.CLASSES.buyButton}" id="buyBatter">Buy More $<span id="batterCost">1</span></button>
        </div>
    </div>
    `;
  }

  createIngredientElement(ingredient) {
    const ingredientConfigs = {
      butter: {
        id: "butterResourceItem",
        image: this.constants.IMAGES.butter,
        count: this.levelManager.butter,
        cost: this.levelManager.levelConfig.butterCost,
      },
      banana: {
        id: "bananaResourceItem",
        image: this.constants.IMAGES.banana,
        count: this.levelManager.banana,
        cost: this.levelManager.levelConfig.bananaCost,
      },
    };

    const config = ingredientConfigs[ingredient];
    if (!config) return null;

    const element = document.createElement("div");
    element.className = this.constants.CLASSES.resourceItem;
    element.id = config.id;

    const capitalizedName =
      ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
    element.innerHTML = `
      <div class="${this.constants.CLASSES.resourceLeft}">
        <div class="${this.constants.CLASSES.draggableItem}" data-item-type="${ingredient}">
          <img src="${config.image}" alt="${capitalizedName}" class="draggable-item-image">
        </div>
      </div>
      <div class="${this.constants.CLASSES.resourceRight}">
        <span class="${this.constants.CLASSES.resourceAmount}">Have: <span id="${ingredient}Count">${config.count}</span></span>
        <button class="${this.constants.CLASSES.buyButton}" id="buy${capitalizedName}">Buy More $<span id="${ingredient}Cost">${config.cost}</span></button>
      </div>
    `;

    return element;
  }

  addDragListenersToItems() {
    document
      .querySelectorAll(`.${this.constants.CLASSES.draggableItem}`)
      .forEach((item) => {
        item.addEventListener(
          "mousedown",
          this.levelManager.dragDrop.handleMouseDown.bind(
            this.levelManager.dragDrop
          )
        );
        item.addEventListener("dragstart", (e) => e.preventDefault());
      });
  }

  plateContainsOrder(platePancakes, order) {
    const plateCounts = this.getPancakeCounts(platePancakes);
    return Object.entries(order).every(([type, required]) => {
      const available = plateCounts[type] || 0;
      return available >= required;
    });
  }

  plateExactlyMatchesOrder(platePancakes, order) {
    const plateCounts = this.getPancakeCounts(platePancakes);
    const orderTypes = Object.keys(order);
    const plateTypes = Object.keys(plateCounts);

    if (orderTypes.length !== plateTypes.length) return false;

    return (
      Object.entries(order).every(([type, required]) => {
        const available = plateCounts[type] || 0;
        return available === required;
      }) && plateTypes.every((type) => type in order)
    );
  }

  getPancakeCounts(platePancakes) {
    const counts = {};
    platePancakes.forEach((pancake) => {
      counts[pancake.type] = (counts[pancake.type] || 0) + 1;
    });
    return counts;
  }

  checkInsufficientIngredients() {
    const currentOrder = this.levelManager.getCurrentOrder();
    const insufficientItems = [];

    const totalPancakesNeeded = Object.values(currentOrder).reduce(
      (sum, count) => sum + count,
      0
    );

    if (this.levelManager.batter < totalPancakesNeeded) {
      insufficientItems.push("batter");
    }

    Object.entries(currentOrder).forEach(([type, count]) => {
      if (type === "butter" && this.levelManager.butter < count) {
        insufficientItems.push("butter");
      }
      if (type === "banana" && this.levelManager.banana < count) {
        insufficientItems.push("banana");
      }
    });

    return insufficientItems;
  }

  shouldBatterWiggle() {
    const hasCookingPancakes = this.levelManager.grid.some(
      (cell) => cell.type === "grill" && cell.cookingPancake !== null
    );
    return !hasCookingPancakes && this.levelManager.batter > 0;
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

  addSizzleEffect(cellIndex) {
    const cellDiv = this.getCellDiv(cellIndex);
    cellDiv.classList.add(this.constants.CLASSES.successGlow);
    setTimeout(
      () => cellDiv.classList.remove(this.constants.CLASSES.successGlow),
      GAME_CONFIG.animations.sizzleEffect
    );
  }

  updateCellDisplay(cellIndex) {
    const cell = this.levelManager.grid[cellIndex];
    const cellDiv = this.getCellDiv(cellIndex);

    if (cell.type === "grill" && cell.cookingPancake) {
      this.updateGrillDisplay(cellDiv, cell.cookingPancake);
    } else if (cell.type === "grill") {
      this.clearGrillDisplay(cellDiv);
    } else if (cell.type === "plate") {
      this.updatePlateDisplay(cellDiv, cell, cellIndex);
    }
  }

  getCellDiv(cellIndex) {
    return document.querySelector(`[data-cell-index="${cellIndex}"]`);
  }

  updateGrillDisplay(cellDiv, pancake) {
    const grillImg = cellDiv.querySelector(
      `.${this.constants.CLASSES.grillImage}`
    );
    if (grillImg) grillImg.style.opacity = "0.3";

    this.updateProgressBar(cellDiv, pancake.progress);
    this.updatePancakeImage(cellDiv, pancake);

    if (!pancake.ingredientDeadlinePassed) {
      cellDiv.classList.add(this.constants.CLASSES.ingredientDropZone);
    } else {
      cellDiv.classList.remove(this.constants.CLASSES.ingredientDropZone);
    }
  }

  updateProgressBar(cellDiv, progress) {
    const ingredientThreshold =
      (this.levelManager.levelConfig.ingredientTime /
        this.levelManager.levelConfig.burntTime) *
      100;
    const cookingThreshold =
      (this.levelManager.levelConfig.cookingTime /
        this.levelManager.levelConfig.burntTime) *
      100;

    let progressBar = cellDiv.querySelector(
      `.${this.constants.CLASSES.progressBar}`
    );
    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.className = this.constants.CLASSES.progressBar;
      progressBar.innerHTML = `
        <div class="${this.constants.CLASSES.progressFill}"></div>
        <div class="${this.constants.CLASSES.progressMarker} ingredient" style="left: ${ingredientThreshold}%"></div>
        <div class="${this.constants.CLASSES.progressMarker} done" style="left: ${cookingThreshold}%"></div>
      `;
      cellDiv.appendChild(progressBar);
    }

    const progressFill = progressBar.querySelector(
      `.${this.constants.CLASSES.progressFill}`
    );
    progressFill.style.width = `${progress}%`;
  }

  updatePancakeImage(cellDiv, pancake) {
    let pancakeImg = cellDiv.querySelector(
      `.${this.constants.CLASSES.pancake}`
    );
    if (!pancakeImg) {
      pancakeImg = document.createElement("img");
      pancakeImg.className = `${this.constants.CLASSES.pancake} ${this.constants.CLASSES.largePancake}`;
      pancakeImg.dataset.pancakeId = pancake.id;
      cellDiv.appendChild(pancakeImg);
    }

    const ingredientThreshold =
      (this.levelManager.levelConfig.ingredientTime /
        this.levelManager.levelConfig.burntTime) *
      100;
    const cookingThreshold =
      (this.levelManager.levelConfig.cookingTime /
        this.levelManager.levelConfig.burntTime) *
      100;
    const progress = pancake.progress;

    const imageStates = this.getPancakeImageState(
      pancake.type,
      progress,
      ingredientThreshold,
      cookingThreshold
    );

    pancakeImg.src = imageStates.src;
    pancakeImg.alt = imageStates.alt;
    pancakeImg.draggable = imageStates.draggable;
    pancakeImg.style.cursor = imageStates.cursor;

    if (imageStates.isCooked) {
      this.setupCookedPancakeDrag(pancakeImg);
      pancakeImg.classList.add(this.constants.CLASSES.cookedPancakeReady);
    } else {
      pancakeImg.classList.remove(this.constants.CLASSES.cookedPancakeReady);
    }
  }

  getPancakeImageState(type, progress, ingredientThreshold, cookingThreshold) {
    if (progress < ingredientThreshold) {
      return {
        src: `images/${type}-pancake-goo.png`,
        alt: `Uncooked ${type} pancake`,
        draggable: false,
        cursor: "not-allowed",
        isCooked: false,
      };
    } else if (progress < cookingThreshold) {
      return {
        src: `images/${type}-pancake-solid.png`,
        alt: `Solid ${type} pancake`,
        draggable: false,
        cursor: "not-allowed",
        isCooked: false,
      };
    } else if (progress >= GAME_CONFIG.mechanics.burntThreshold) {
      return {
        src: `images/${type}-pancake-burnt.png`,
        alt: `Burnt ${type} pancake`,
        draggable: false,
        cursor: "not-allowed",
        isCooked: false,
      };
    } else {
      return {
        src: `images/${type}-pancake-cooked.png`,
        alt: `Cooked ${type} pancake`,
        draggable: false,
        cursor: "grab",
        isCooked: true,
      };
    }
  }

  setupCookedPancakeDrag(pancakeImg) {
    pancakeImg.removeEventListener(
      "mousedown",
      this.levelManager.dragDrop.handleMouseDown
    );
    pancakeImg.removeEventListener(
      "dragstart",
      this.levelManager.dragDrop.handleDragStart
    );

    pancakeImg.addEventListener(
      "mousedown",
      this.levelManager.dragDrop.handleMouseDown.bind(
        this.levelManager.dragDrop
      )
    );
    pancakeImg.addEventListener("dragstart", (e) => e.preventDefault());
  }

  clearGrillDisplay(cellDiv) {
    const grillImg = cellDiv.querySelector(
      `.${this.constants.CLASSES.grillImage}`
    );
    if (grillImg) grillImg.style.opacity = "1";

    const progressBar = cellDiv.querySelector(
      `.${this.constants.CLASSES.progressBar}`
    );
    const pancakeImg = cellDiv.querySelector(
      `.${this.constants.CLASSES.pancake}`
    );

    if (progressBar) progressBar.remove();
    if (pancakeImg) pancakeImg.remove();

    cellDiv.classList.remove(this.constants.CLASSES.ingredientDropZone);
  }

  updatePlateDisplay(cellDiv, cell, cellIndex) {
    this.updateServeButton(cellDiv, cell);
    this.updatePlateOrderMatch(cellDiv, cell);
    this.updatePancakeStack(cellDiv, cell);
  }

  updateServeButton(cellDiv, cell) {
    const serveButton = cellDiv.querySelector(
      `.${this.constants.CLASSES.serveButton}`
    );
    const stackCount = serveButton.querySelector(
      `.${this.constants.CLASSES.stackCount}`
    );
    if (stackCount) {
      stackCount.textContent = cell.pancakes.length;
    }
  }

  updatePlateOrderMatch(cellDiv, cell) {
    const currentOrder = this.levelManager.getCurrentOrder();
    const containsOrder = this.plateContainsOrder(cell.pancakes, currentOrder);
    const exactMatch = this.plateExactlyMatchesOrder(
      cell.pancakes,
      currentOrder
    );

    cellDiv.classList.remove(
      this.constants.CLASSES.orderExactMatch,
      this.constants.CLASSES.orderContainsMatch
    );

    const serveButton = cellDiv.querySelector(
      `.${this.constants.CLASSES.serveButton}`
    );

    if (exactMatch) {
      cellDiv.classList.add(this.constants.CLASSES.orderExactMatch);
      serveButton.classList.add(this.constants.CLASSES.orderMatchVisible);
    } else if (containsOrder) {
      cellDiv.classList.add(this.constants.CLASSES.orderContainsMatch);
      serveButton.classList.add(this.constants.CLASSES.orderMatchVisible);
    } else {
      serveButton.classList.remove(this.constants.CLASSES.orderMatchVisible);
    }
  }

  updatePancakeStack(cellDiv, cell) {
    const existingStack = cellDiv.querySelector(
      `.${this.constants.CLASSES.pancakeStack}`
    );
    if (existingStack) existingStack.remove();

    if (cell.pancakes.length > 0) {
      const stackDiv = this.createPancakeStack(cell.pancakes);
      cellDiv.appendChild(stackDiv);
    }
  }

  createPancakeStack(pancakes) {
    const stackDiv = document.createElement("div");
    stackDiv.className = this.constants.CLASSES.pancakeStack;
    stackDiv.style.cssText = `
      position: relative;
      width: 100%;
      height: 80px;
      display: block;
      visibility: visible;
    `;

    pancakes.forEach((pancake, index) => {
      const pancakeImg = this.createStackedPancakeImage(
        pancake,
        index,
        index === pancakes.length - 1
      );
      stackDiv.appendChild(pancakeImg);
    });

    return stackDiv;
  }

  createStackedPancakeImage(pancake, index, isTop) {
    const pancakeImg = document.createElement("img");
    pancakeImg.className = `${this.constants.CLASSES.pancake} ${this.constants.CLASSES.stackedPancake} ${this.constants.CLASSES.largePancake}`;
    pancakeImg.src = `images/${pancake.type}-pancake-cooked.png`;
    pancakeImg.alt = `Stacked ${pancake.type} pancake`;
    pancakeImg.dataset.pancakeId = pancake.id;

    pancakeImg.style.cssText = `
      z-index: ${index + 10};
      position: absolute;
      top: ${-index * this.constants.VALUES.stackOffsetPx}px;
      left: 50%;
      transform: translateX(-50%);
      visibility: visible;
      display: block;
    `;

    if (isTop) {
      pancakeImg.classList.add(this.constants.CLASSES.topPancake);
      pancakeImg.style.cursor = "grab";
      pancakeImg.draggable = false;
      this.setupCookedPancakeDrag(pancakeImg);
    } else {
      pancakeImg.style.cursor = "default";
      pancakeImg.style.opacity = "0.9";
    }

    return pancakeImg;
  }

  addBurntEffect(cellIndex) {
    this.addParticleEffect(
      cellIndex,
      this.constants.PARTICLES.burnt,
      this.constants.VALUES.particleOffsetRange
    );
  }

  addMoveEffect(cellIndex) {
    this.addParticleEffect(
      cellIndex,
      this.constants.PARTICLES.move,
      this.constants.VALUES.moveParticleOffsetRange
    );
  }

  addParticleEffect(cellIndex, particles, offsetRange) {
    const cellDiv = this.getCellDiv(cellIndex);

    particles.forEach((particle, i) => {
      setTimeout(() => {
        const particleEl = this.createParticleElement(particle, offsetRange);
        cellDiv.appendChild(particleEl);
        setTimeout(
          () => particleEl.remove(),
          GAME_CONFIG.animations.particleEffect
        );
      }, i * this.constants.VALUES.particleDelay);
    });
  }

  createParticleElement(particle, offsetRange) {
    const particleEl = document.createElement("div");
    particleEl.className = "particle";
    particleEl.textContent = particle;

    const centerX = this.constants.VALUES.centerOffset;
    const centerY = this.constants.VALUES.centerOffset;

    particleEl.style.left = `calc(${centerX}% + ${
      (Math.random() - 0.5) * offsetRange
    }px)`;
    particleEl.style.top = `calc(${centerY}% + ${
      (Math.random() - 0.5) * offsetRange
    }px)`;

    return particleEl;
  }

  addCoinAnimation(cellIndex) {
    const cellDiv = this.getCellDiv(cellIndex);
    const moneyDisplay = document.querySelector(
      this.constants.SELECTORS.moneyDisplay
    );

    if (!cellDiv || !moneyDisplay) return;

    const coin = document.createElement("div");
    coin.className = "coin-animation";
    coin.textContent = this.constants.PARTICLES.coin;

    const { cellRect, moneyRect } = this.getElementRects(cellDiv, moneyDisplay);
    this.setupCoinPosition(coin, cellRect);

    document.body.appendChild(coin);
    this.animateCoinToTarget(coin, moneyRect);
  }

  getElementRects(cellDiv, moneyDisplay) {
    return {
      cellRect: cellDiv.getBoundingClientRect(),
      moneyRect: moneyDisplay.getBoundingClientRect(),
    };
  }

  setupCoinPosition(coin, cellRect) {
    coin.style.cssText = `
      position: fixed;
      left: ${cellRect.left + cellRect.width / 2}px;
      top: ${cellRect.top + cellRect.height / 2}px;
      z-index: 1000;
    `;
  }

  animateCoinToTarget(coin, moneyRect) {
    setTimeout(() => {
      coin.style.left = moneyRect.left + moneyRect.width / 2 + "px";
      coin.style.top = moneyRect.top + moneyRect.height / 2 + "px";
    }, this.constants.VALUES.coinAnimationDelay);

    setTimeout(() => {
      if (coin.parentNode) coin.remove();
    }, this.constants.VALUES.coinRemovalDelay);
  }

  addPenaltyAnimation() {
    const moneyDisplay = document.querySelector(
      this.constants.SELECTORS.moneyDisplay
    );
    if (!moneyDisplay) return;

    moneyDisplay.classList.add(this.constants.CLASSES.penaltyGlow);
    setTimeout(() => {
      moneyDisplay.classList.remove(this.constants.CLASSES.penaltyGlow);
    }, 800);

    const penalty = this.createPenaltyElement(moneyDisplay);
    moneyDisplay.appendChild(penalty);

    setTimeout(() => {
      if (penalty.parentNode) penalty.remove();
    }, this.constants.VALUES.penaltyRemovalDelay);
  }

  createPenaltyElement(moneyDisplay) {
    const penalty = document.createElement("div");
    penalty.className = "penalty-animation";
    penalty.textContent = "-1";

    const moneyRect = moneyDisplay.getBoundingClientRect();
    penalty.style.left = moneyRect.left + moneyRect.width / 2 + "px";
    penalty.style.top = moneyRect.top + "px";

    return penalty;
  }

  addComboEffect(cellIndex, combo, comboBonus) {
    const cellDiv = this.getCellDiv(cellIndex);
    const comboPopup = this.createComboPopup(combo, comboBonus);
    cellDiv.appendChild(comboPopup);

    setTimeout(() => {
      if (comboPopup.parentNode) comboPopup.remove();
    }, this.constants.VALUES.comboRemovalDelay);
  }

  addComboMoneyAnimation(comboBonus) {
    const moneyDisplay = document.querySelector(
      this.constants.SELECTORS.moneyDisplay
    );
    if (!moneyDisplay) return;

    const comboMoney = document.createElement("div");
    comboMoney.className = "combo-money-animation";
    comboMoney.textContent = `+${comboBonus}`;
    comboMoney.style.cssText = `
      position: fixed;
      color: #4caf50;
      font-weight: bold;
      font-size: 18px;
      pointer-events: none;
      z-index: 1000;
      animation: comboMoneyFloat 2s ease-out forwards;
    `;

    const moneyRect = moneyDisplay.getBoundingClientRect();
    comboMoney.style.left = moneyRect.left + moneyRect.width + 10 + "px";
    comboMoney.style.top = moneyRect.top + "px";

    document.body.appendChild(comboMoney);

    setTimeout(() => {
      if (comboMoney.parentNode) comboMoney.remove();
    }, this.constants.VALUES.comboRemovalDelay);
  }

  createComboPopup(combo, comboBonus) {
    const comboPopup = document.createElement("div");
    comboPopup.className = "combo-popup";
    comboPopup.innerHTML = `
      <div style="color: #4caf50; font-weight: bold; font-size: 18px;">COMBO x${combo}!</div>
      <div style="color: #ff6b6b; font-size: 14px;">+${comboBonus} bonus</div>
    `;
    comboPopup.style.cssText = `
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.95);
      border-radius: 10px;
      padding: 10px 15px;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      pointer-events: none;
      z-index: 200;
      text-align: center;
      animation: comboPopupAnimation 2s ease-out forwards;
    `;
    return comboPopup;
  }

  addSuccessEffect(
    cellIndex,
    payment,
    orderFulfillmentBonus = 0,
    comboBonus = 0
  ) {
    const cellDiv = this.getCellDiv(cellIndex);

    this.addScorePopup(cellDiv, payment, orderFulfillmentBonus, comboBonus);
    this.addConfettiParticles(cellDiv);
    this.addSuccessGlow(cellDiv);
  }

  addScorePopup(cellDiv, payment, orderFulfillmentBonus, comboBonus) {
    const scorePopup = document.createElement("div");
    scorePopup.className = "score-popup";

    let popupContent = `+${payment}`;
    if (orderFulfillmentBonus > 0) {
      popupContent += `<br><small style="color: #2196f3;">Order Bonus: +${orderFulfillmentBonus}</small>`;
    }
    if (comboBonus > 0) {
      popupContent += `<br><small style="color: #4caf50;">Combo Bonus: +${comboBonus}</small>`;
    }

    scorePopup.innerHTML = popupContent;
    cellDiv.appendChild(scorePopup);
    setTimeout(() => scorePopup.remove(), GAME_CONFIG.animations.scorePopup);
  }

  addConfettiParticles(cellDiv) {
    for (let i = 0; i < this.constants.VALUES.confettiCount; i++) {
      setTimeout(() => {
        const particleEl = document.createElement("div");
        particleEl.className = "particle";
        particleEl.textContent =
          this.constants.PARTICLES.confetti[
            Math.floor(Math.random() * this.constants.PARTICLES.confetti.length)
          ];
        particleEl.style.left = Math.random() * 100 + "%";
        particleEl.style.top = Math.random() * 100 + "%";
        cellDiv.appendChild(particleEl);

        setTimeout(
          () => particleEl.remove(),
          GAME_CONFIG.animations.particleEffect
        );
      }, i * this.constants.VALUES.confettiDelay);
    }
  }

  addSuccessGlow(cellDiv) {
    cellDiv.classList.add(this.constants.CLASSES.successGlow);
    setTimeout(() => {
      cellDiv.classList.remove(this.constants.CLASSES.successGlow);
    }, GAME_CONFIG.animations.successGlow);
  }

  screenShake() {
    document.body.classList.add(this.constants.CLASSES.shake);
    setTimeout(() => {
      document.body.classList.remove(this.constants.CLASSES.shake);
    }, GAME_CONFIG.animations.screenShake);
  }

  updateUI() {
    this.updateTimer();
    this.updateOrder();
    this.updateCombo();
    this.updateResourceCounts();
    this.updateBatterState();
    this.updateIngredientsHighlight();
    this.updateBuyButtons();
    this.updateAllPlateDisplays();
  }

  updateTimer() {
    const timeSeconds = Math.ceil(this.levelManager.timeRemaining / 1000);
    const timerEl = document.querySelector(this.constants.SELECTORS.timer);
    timerEl.textContent = timeSeconds;

    if (timeSeconds <= GAME_CONFIG.mechanics.urgentTimerThreshold) {
      timerEl.classList.add(this.constants.CLASSES.urgent);
    } else {
      timerEl.classList.remove(this.constants.CLASSES.urgent);
    }
  }

  updateOrder() {
    const currentOrder = this.levelManager.getCurrentOrder();
    const orderParts = Object.entries(currentOrder)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => {
        const typeName = type.charAt(0).toUpperCase() + type.slice(1);
        return `${count}x ${typeName}`;
      });

    const orderText = document.querySelector(
      this.constants.SELECTORS.orderText
    );
    if (orderText) {
      orderText.textContent = orderParts.join(" ");
    }
  }

  updateCombo() {
    const comboBox = document.querySelector(this.constants.SELECTORS.comboBox);
    const comboText = document.querySelector(
      this.constants.SELECTORS.comboText
    );

    if (comboBox && comboText) {
      comboBox.style.display = "block";

      if (this.levelManager.combo > 0) {
        const nextComboBonus =
          (this.levelManager.combo + 1) *
          this.constants.VALUES.nextComboMultiplier;
        comboText.textContent = `Combo: ${this.levelManager.combo}x (Next: +${nextComboBonus})`;
      } else {
        comboText.textContent = `Combo: 0x (Next: +${this.constants.VALUES.nextComboMultiplier})`;
      }
    }
  }

  updateResourceCounts() {
    document.querySelector(this.constants.SELECTORS.batterCount).textContent =
      this.levelManager.batter;
    document.querySelector(this.constants.SELECTORS.batterCost).textContent =
      this.levelManager.levelConfig.batterCost;
    document.querySelector(
      this.constants.SELECTORS.moneyDisplay
    ).textContent = `${this.levelManager.money}`;

    this.updateIngredientCounts("butter");
    this.updateIngredientCounts("banana");
  }

  updateIngredientCounts(ingredient) {
    const countEl = document.getElementById(`${ingredient}Count`);
    const costEl = document.getElementById(`${ingredient}Cost`);

    if (countEl && costEl) {
      countEl.textContent = this.levelManager[ingredient];
      costEl.textContent =
        this.levelManager.levelConfig[`${ingredient}Cost`] || 0;
    }
  }

  updateBatterState() {
    const batterDraggable = document.getElementById("batterDraggable");
    const batterResourceItem = document.getElementById("batterResourceItem");

    if (batterDraggable && batterResourceItem) {
      if (this.shouldBatterWiggle()) {
        batterDraggable.classList.add(this.constants.CLASSES.batterWiggle);
        batterResourceItem.classList.add(
          this.constants.CLASSES.batterHasLeftArrow
        );
      } else {
        batterDraggable.classList.remove(this.constants.CLASSES.batterWiggle);
        batterResourceItem.classList.remove(
          this.constants.CLASSES.batterHasLeftArrow
        );
      }
    }
  }

  updateIngredientsHighlight() {
    const insufficientItems = this.checkInsufficientIngredients();

    document
      .querySelectorAll(`.${this.constants.CLASSES.resourceItem}`)
      .forEach((item) => {
        item.classList.remove(this.constants.CLASSES.insufficientIngredient);
      });

    insufficientItems.forEach((itemType) => {
      const resourceItem = document.getElementById(`${itemType}ResourceItem`);
      if (resourceItem) {
        resourceItem.classList.add(
          this.constants.CLASSES.insufficientIngredient
        );
      }
    });
  }

  updateBuyButtons() {
    const buyButton = document.getElementById("buyBatter");
    buyButton.disabled =
      this.levelManager.money < this.levelManager.levelConfig.batterCost;

    this.updateIngredientBuyButton("butter");
    this.updateIngredientBuyButton("banana");
  }

  updateIngredientBuyButton(ingredient) {
    const capitalizedName =
      ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
    const buyButton = document.getElementById(`buy${capitalizedName}`);

    if (buyButton) {
      const cost = this.levelManager.levelConfig[`${ingredient}Cost`] || 0;
      buyButton.disabled = this.levelManager.money < cost;
    }
  }

  updateAllPlateDisplays() {
    this.levelManager.grid.forEach((cell, index) => {
      if (cell.type === "plate") {
        this.updateCellDisplay(index);
      }
    });
  }

  startTutorialCycling() {
    let tutorialContainer = document.querySelector(
      this.constants.SELECTORS.tutorialContainer
    );
    if (!tutorialContainer) {
      tutorialContainer = this.createTutorialContainer();
    }

    this.tutorialInterval = setInterval(() => {
      this.cycleTutorialMessage();
    }, this.constants.VALUES.tutorialCycleInterval);
  }

  createTutorialContainer() {
    const tutorialContainer = document.createElement("div");
    tutorialContainer.id = "tutorialContainer";
    tutorialContainer.style.cssText = `
      margin-top: 10px;
      padding: 10px 15px;
      background: linear-gradient(145deg, #ffffff, #f8f8f8);
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    `;

    const tutorialText = document.createElement("div");
    tutorialText.id = "tutorialText";
    tutorialText.style.cssText = `
      font-family: 'Fredoka', sans-serif;
      font-size: 16px;
      font-weight: 500;
      color: #333;
      transition: opacity 0.3s ease;
      opacity: 1;
    `;
    tutorialText.textContent = this.tutorialMessages[0];

    tutorialContainer.appendChild(tutorialText);

    const gameContainer = document.getElementById("gameContainer");
    gameContainer.parentNode.insertBefore(
      tutorialContainer,
      gameContainer.nextSibling
    );

    return tutorialContainer;
  }

  cycleTutorialMessage() {
    const tutorialText = document.querySelector(
      this.constants.SELECTORS.tutorialText
    );
    if (!tutorialText) return;

    this.currentTutorialIndex =
      (this.currentTutorialIndex + 1) % this.tutorialMessages.length;

    tutorialText.style.opacity = "0.5";

    setTimeout(() => {
      tutorialText.textContent =
        this.tutorialMessages[this.currentTutorialIndex];
      tutorialText.style.opacity = "1";
    }, this.constants.VALUES.fadeTransitionDelay);
  }

  stopTutorialCycling() {
    if (this.tutorialInterval) {
      clearInterval(this.tutorialInterval);
      this.tutorialInterval = null;
    }
  }

  destroy() {
    this.stopTutorialCycling();
    this.removeAllEventListeners();
  }
}
