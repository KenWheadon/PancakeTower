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
  }

  createGrid() {
    const gameGrid = document.getElementById("gameGrid");
    gameGrid.innerHTML = "";

    this.levelManager.grid.forEach((cell, index) => {
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

        // Add drop zone functionality for grills (for batter)
        cellDiv.addEventListener(
          "dragover",
          this.levelManager.dragDrop.handleDragOver.bind(
            this.levelManager.dragDrop
          )
        );
        cellDiv.addEventListener(
          "drop",
          this.levelManager.dragDrop.handleDrop.bind(this.levelManager.dragDrop)
        );
        cellDiv.addEventListener(
          "dragenter",
          this.levelManager.dragDrop.handleDragEnter.bind(
            this.levelManager.dragDrop
          )
        );
        cellDiv.addEventListener(
          "dragleave",
          this.levelManager.dragDrop.handleDragLeave.bind(
            this.levelManager.dragDrop
          )
        );
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
          this.levelManager.servePlate(index);
        });
        cellDiv.appendChild(serveButton);

        // Add drop zone functionality for plates
        cellDiv.addEventListener(
          "dragover",
          this.levelManager.dragDrop.handleDragOver.bind(
            this.levelManager.dragDrop
          )
        );
        cellDiv.addEventListener(
          "drop",
          this.levelManager.dragDrop.handleDrop.bind(this.levelManager.dragDrop)
        );
        cellDiv.addEventListener(
          "dragenter",
          this.levelManager.dragDrop.handleDragEnter.bind(
            this.levelManager.dragDrop
          )
        );
        cellDiv.addEventListener(
          "dragleave",
          this.levelManager.dragDrop.handleDragLeave.bind(
            this.levelManager.dragDrop
          )
        );
      }

      gameGrid.appendChild(cellDiv);
    });

    // Create sidebar with ingredients
    this.createSidebar();

    // Start tutorial messages cycling
    this.startTutorialCycling();
  }

  createSidebar() {
    const sidebar = document.getElementById("sidebar");

    // Create store section with batter and available ingredients
    const storeSection = document.getElementById("storeSection");
    storeSection.innerHTML = `
      <h3>Store - Drag Items to Grill</h3>
      
      <!-- Batter Resource -->
      <div class="resource-item" id="batterResourceItem">
        <div class="resource-left">
            <div class="draggable-item" data-item-type="batter" id="batterDraggable">
                <img src="images/item-batter.png" alt="Batter" class="draggable-item-image">
            </div>
        </div>
    
        <div class="resource-right">
            <span class="resource-amount">Have: <span id="batterCount">10</span></span>
            <button class="buy-button" id="buyBatter">Buy More $<span id="batterCost">1</span></button>
        </div>
    </div>
    `;

    // Add ingredients based on level config
    if (this.levelManager.levelConfig.availableIngredients) {
      this.levelManager.levelConfig.availableIngredients.forEach(
        (ingredient) => {
          if (ingredient === "butter") {
            const butterItem = document.createElement("div");
            butterItem.className = "resource-item";
            butterItem.id = "butterResourceItem";
            butterItem.innerHTML = `
            <div class="resource-left">
            <div class="draggable-item" data-item-type="butter">
              <img src="images/item-butter.png" alt="Butter" class="draggable-item-image">
            </div>
            </div>
            <div class="resource-right">
            <span class="resource-amount">Have: <span id="butterCount">${this.levelManager.butter}</span></span>
            <button class="buy-button" id="buyButter">Buy More $<span id="butterCost">${this.levelManager.levelConfig.butterCost}</span></button>
            </div>
          `;
            storeSection.appendChild(butterItem);
          } else if (ingredient === "banana") {
            const bananaItem = document.createElement("div");
            bananaItem.className = "resource-item";
            bananaItem.id = "bananaResourceItem";
            bananaItem.innerHTML = `
          <div class="resource-left">
            <div class="draggable-item" data-item-type="banana">
              <img src="images/item-banana.png" alt="Banana" class="draggable-item-image">
            </div>
            </div>
            <div class="resource-right">
              <span class="resource-amount">Have: <span id="bananaCount">${this.levelManager.banana}</span></span>
            <button class="buy-button" id="buyBanana">Buy More $<span id="bananaCost">${this.levelManager.levelConfig.bananaCost}</span></button>
            </div>
          `;
            storeSection.appendChild(bananaItem);
          }
        }
      );
    }

    // Add drag event listeners to all draggable items
    document.querySelectorAll(".draggable-item").forEach((item) => {
      item.addEventListener(
        "mousedown",
        this.levelManager.dragDrop.handleMouseDown.bind(
          this.levelManager.dragDrop
        )
      );
      item.addEventListener("dragstart", (e) => e.preventDefault());
    });
  }

  // Helper method to check if a plate contains at least the required pancakes for an order
  plateContainsOrder(platePancakes, order) {
    const plateCounts = {};
    platePancakes.forEach((pancake) => {
      plateCounts[pancake.type] = (plateCounts[pancake.type] || 0) + 1;
    });

    // Check if plate has at least the required amount of each pancake type
    for (const [type, required] of Object.entries(order)) {
      const available = plateCounts[type] || 0;
      if (available < required) {
        return false;
      }
    }
    return true;
  }

  // Helper method to check if a plate contains exactly the required pancakes for an order
  plateExactlyMatchesOrder(platePancakes, order) {
    const plateCounts = {};
    platePancakes.forEach((pancake) => {
      plateCounts[pancake.type] = (plateCounts[pancake.type] || 0) + 1;
    });

    // Check if plate has exactly the required amount of each pancake type
    const orderTypes = Object.keys(order);
    const plateTypes = Object.keys(plateCounts);

    // Must have same number of types
    if (orderTypes.length !== plateTypes.length) {
      return false;
    }

    // Check each type matches exactly
    for (const [type, required] of Object.entries(order)) {
      const available = plateCounts[type] || 0;
      if (available !== required) {
        return false;
      }
    }

    // Check no extra types
    for (const type of plateTypes) {
      if (!(type in order)) {
        return false;
      }
    }

    return true;
  }

  // NEW: Check if we have enough ingredients to fulfill the current order
  checkInsufficientIngredients() {
    const currentOrder = this.levelManager.getCurrentOrder();
    const insufficientItems = [];

    // Calculate total pancakes needed
    const totalPancakesNeeded = Object.values(currentOrder).reduce(
      (sum, count) => sum + count,
      0
    );

    // Check if we have enough batter for total pancakes needed
    if (this.levelManager.batter < totalPancakesNeeded) {
      insufficientItems.push("batter");
    }

    // Check specific ingredient requirements
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

  // NEW: Check if there are no pancakes cooking and we have batter
  shouldBatterWiggle() {
    // Check if no pancakes are cooking
    const hasCookingPancakes = this.levelManager.grid.some(
      (cell) => cell.type === "grill" && cell.cookingPancake !== null
    );

    // Return true if no cooking pancakes AND we have batter
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
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);
    cellDiv.classList.add("success-glow");
    setTimeout(
      () => cellDiv.classList.remove("success-glow"),
      GAME_CONFIG.animations.sizzleEffect
    );
  }

  // Use type-specific images based on pancake type and progress
  updateCellDisplay(cellIndex) {
    const cell = this.levelManager.grid[cellIndex];
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);

    if (cell.type === "grill" && cell.cookingPancake) {
      const pancake = cell.cookingPancake;
      const progress = pancake.progress;

      // Hide grill image when cooking
      const grillImg = cellDiv.querySelector(".grill-image");
      if (grillImg) {
        grillImg.style.opacity = "0.3";
      }

      // Calculate thresholds from level config
      const ingredientThreshold =
        (this.levelManager.levelConfig.ingredientTime /
          this.levelManager.levelConfig.burntTime) *
        100;
      const cookingThreshold =
        (this.levelManager.levelConfig.cookingTime /
          this.levelManager.levelConfig.burntTime) *
        100;

      // Update progress bar
      let progressBar = cellDiv.querySelector(".progress-bar");
      if (!progressBar) {
        progressBar = document.createElement("div");
        progressBar.className = "progress-bar";

        progressBar.innerHTML = `
          <div class="progress-fill"></div>
          <div class="progress-marker ingredient" style="left: ${ingredientThreshold}%"></div>
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
        pancakeImg.className = "pancake large-pancake";
        pancakeImg.dataset.pancakeId = pancake.id;
        cellDiv.appendChild(pancakeImg);
      }

      // Update pancake appearance based on type and progress
      if (progress < ingredientThreshold) {
        pancakeImg.src = `images/${pancake.type}-pancake-goo.png`; // Uncooked - can add ingredients
        pancakeImg.alt = `Uncooked ${pancake.type} pancake`;
        pancakeImg.draggable = false;
        pancakeImg.style.cursor = "not-allowed";
        pancakeImg.classList.remove("cooked-pancake-ready"); // Remove cooked effect
      } else if (progress < cookingThreshold) {
        pancakeImg.src = `images/${pancake.type}-pancake-solid.png`; // Solid - no more ingredients, still cooking
        pancakeImg.alt = `Solid ${pancake.type} pancake`;
        pancakeImg.draggable = false;
        pancakeImg.style.cursor = "not-allowed";
        pancakeImg.classList.remove("cooked-pancake-ready"); // Remove cooked effect
      } else if (progress >= GAME_CONFIG.mechanics.burntThreshold) {
        pancakeImg.src = `images/${pancake.type}-pancake-burnt.png`; // Burnt
        pancakeImg.alt = `Burnt ${pancake.type} pancake`;
        pancakeImg.draggable = false;
        pancakeImg.style.cursor = "not-allowed";
        pancakeImg.classList.remove("cooked-pancake-ready"); // Remove cooked effect
      } else {
        pancakeImg.src = `images/${pancake.type}-pancake-cooked.png`; // Cooked
        pancakeImg.alt = `Cooked ${pancake.type} pancake`;
        pancakeImg.draggable = false; // Disable HTML5 drag
        pancakeImg.style.cursor = "grab";

        // Add cooked pancake wiggle and glow effect
        pancakeImg.classList.add("cooked-pancake-ready");

        // Remove any existing event listeners
        pancakeImg.removeEventListener(
          "mousedown",
          this.levelManager.dragDrop.handleMouseDown
        );
        pancakeImg.removeEventListener(
          "dragstart",
          this.levelManager.dragDrop.handleDragStart
        );

        // Add mouse-based drag handling
        pancakeImg.addEventListener(
          "mousedown",
          this.levelManager.dragDrop.handleMouseDown.bind(
            this.levelManager.dragDrop
          )
        );
        pancakeImg.addEventListener("dragstart", (e) => e.preventDefault());
      }

      // Add ingredient drop zone functionality to cooking pancakes that haven't passed ingredient deadline
      if (!pancake.ingredientDeadlinePassed) {
        cellDiv.classList.add("ingredient-drop-zone");
      } else {
        cellDiv.classList.remove("ingredient-drop-zone");
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
      cellDiv.classList.remove("ingredient-drop-zone");
    } else if (cell.type === "plate") {
      // Update serve button with type breakdown and total count
      const serveButton = cellDiv.querySelector(".serve-button");
      const stackCount = serveButton.querySelector(".stack-count");

      if (stackCount) {
        stackCount.textContent = cell.pancakes.length;
      }

      // Check if this plate matches the current order
      const currentOrder = this.levelManager.getCurrentOrder();
      const containsOrder = this.plateContainsOrder(
        cell.pancakes,
        currentOrder
      );
      const exactMatch = this.plateExactlyMatchesOrder(
        cell.pancakes,
        currentOrder
      );

      // Remove previous order-related classes
      cellDiv.classList.remove("order-exact-match", "order-contains-match");

      if (exactMatch) {
        // Exact match: glow + wiggle + visible button
        cellDiv.classList.add("order-exact-match");
        serveButton.classList.add("order-match-visible");
      } else if (containsOrder) {
        // Contains required: just glow + visible button
        cellDiv.classList.add("order-contains-match");
        serveButton.classList.add("order-match-visible");
      } else {
        // No match: remove visible button class
        serveButton.classList.remove("order-match-visible");
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
          pancakeImg.className = "pancake stacked-pancake large-pancake";
          // Use type-specific image for cooked pancakes
          pancakeImg.src = `images/${pancake.type}-pancake-cooked.png`;
          pancakeImg.alt = `Stacked ${pancake.type} pancake`;
          pancakeImg.dataset.pancakeId = pancake.id;

          // Apply stacking transform - make pancakes visible with slight offset
          pancakeImg.style.zIndex = (index + 10).toString();
          pancakeImg.style.position = "absolute";
          pancakeImg.style.top = `${-index * 8}px`; // Stack them with 8px offset
          pancakeImg.style.left = "50%";
          pancakeImg.style.transform = "translateX(-50%)";
          pancakeImg.style.visibility = "visible";
          pancakeImg.style.display = "block";

          // Only top pancake is draggable
          if (index === cell.pancakes.length - 1) {
            pancakeImg.draggable = false; // Disable HTML5 drag
            pancakeImg.classList.add("top-pancake");
            pancakeImg.style.cursor = "grab";

            // Remove any existing event listeners
            pancakeImg.removeEventListener(
              "mousedown",
              this.levelManager.dragDrop.handleMouseDown
            );
            pancakeImg.removeEventListener(
              "dragstart",
              this.levelManager.dragDrop.handleDragStart
            );

            // Add mouse-based drag handling
            pancakeImg.addEventListener(
              "mousedown",
              this.levelManager.dragDrop.handleMouseDown.bind(
                this.levelManager.dragDrop
              )
            );
            pancakeImg.addEventListener("dragstart", (e) => e.preventDefault());
          } else {
            // Lower pancakes in stack are not interactive
            pancakeImg.style.cursor = "default";
            pancakeImg.style.opacity = "0.9";
          }

          stackDiv.appendChild(pancakeImg);
        });

        // Ensure the stack div itself is visible and positioned correctly
        stackDiv.style.position = "relative";
        stackDiv.style.width = "100%";
        stackDiv.style.height = "80px";
        stackDiv.style.display = "block";
        stackDiv.style.visibility = "visible";

        cellDiv.appendChild(stackDiv);
      }
    }
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

  // NEW: Add combo effect
  addComboEffect(cellIndex, combo, comboBonus) {
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);

    // Combo popup
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

    cellDiv.appendChild(comboPopup);

    setTimeout(() => {
      if (comboPopup.parentNode) {
        comboPopup.remove();
      }
    }, 2000);
  }

  addSuccessEffect(
    cellIndex,
    payment,
    orderFulfillmentBonus = 0,
    comboBonus = 0
  ) {
    const cellDiv = document.querySelector(`[data-cell-index="${cellIndex}"]`);

    // Enhanced score popup with bonus information
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

  updateUI() {
    const timeSeconds = Math.ceil(this.levelManager.timeRemaining / 1000);
    const timerEl = document.getElementById("timer");
    timerEl.textContent = timeSeconds;

    // Add urgent styling when time is low
    if (timeSeconds <= GAME_CONFIG.mechanics.urgentTimerThreshold) {
      timerEl.classList.add("urgent");
    } else {
      timerEl.classList.remove("urgent");
    }

    // Show typed order requirements in human-readable format
    const currentOrder = this.levelManager.getCurrentOrder();
    const orderParts = [];

    Object.entries(currentOrder).forEach(([type, count]) => {
      if (count > 0) {
        const typeName = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
        orderParts.push(`${count}x ${typeName}`);
      }
    });

    // Update the order text (not the whole current order div)
    const orderText = document.getElementById("orderText");
    if (orderText) {
      orderText.textContent = orderParts.join(" ");
    }

    // UPDATED: Always show combo display and update content
    const comboBox = document.getElementById("comboBox");
    const comboText = document.getElementById("comboText");
    if (comboBox && comboText) {
      // Always display the combo box
      comboBox.style.display = "block";

      if (this.levelManager.combo > 0) {
        const nextComboBonus = (this.levelManager.combo + 1) * 5; // Show what next combo would earn
        comboText.textContent = `Combo: ${this.levelManager.combo}x (Next: +${nextComboBonus})`;
      } else {
        comboText.textContent = `Combo: 0x (Next: +5)`;
      }
    }

    document.getElementById("batterCount").textContent =
      this.levelManager.batter;
    document.getElementById("batterCost").textContent =
      this.levelManager.levelConfig.batterCost;
    document.getElementById(
      "moneyDisplay"
    ).textContent = `${this.levelManager.money}`;

    // Update ingredient counts if they exist
    const butterCount = document.getElementById("butterCount");
    const butterCost = document.getElementById("butterCost");
    if (butterCount && butterCost) {
      butterCount.textContent = this.levelManager.butter;
      butterCost.textContent = this.levelManager.levelConfig.butterCost || 0;
    }

    const bananaCount = document.getElementById("bananaCount");
    const bananaCost = document.getElementById("bananaCost");
    if (bananaCount && bananaCost) {
      bananaCount.textContent = this.levelManager.banana;
      bananaCost.textContent = this.levelManager.levelConfig.bananaCost || 0;
    }

    // UPDATED: Update batter wiggle animation and add left arrow
    const batterDraggable = document.getElementById("batterDraggable");
    const batterResourceItem = document.getElementById("batterResourceItem");
    if (batterDraggable && batterResourceItem) {
      if (this.shouldBatterWiggle()) {
        batterDraggable.classList.add("batter-wiggle");
        batterResourceItem.classList.add("batter-has-left-arrow");
      } else {
        batterDraggable.classList.remove("batter-wiggle");
        batterResourceItem.classList.remove("batter-has-left-arrow");
      }
    }

    // UPDATED: Check for insufficient ingredients and highlight individual items
    const insufficientItems = this.checkInsufficientIngredients();

    // Remove previous highlighting from all resource items
    document.querySelectorAll(".resource-item").forEach((item) => {
      item.classList.remove("insufficient-ingredient");
    });

    // Add highlighting for insufficient items (individual items only)
    insufficientItems.forEach((itemType) => {
      const resourceItem = document.getElementById(`${itemType}ResourceItem`);
      if (resourceItem) {
        resourceItem.classList.add("insufficient-ingredient");
      }
    });

    // REMOVED: Store section styling based on batter count (no longer needed)
    // const storeSection = document.getElementById("storeSection");
    // if (this.levelManager.batter === 0) {
    //   storeSection.classList.add("out-of-stock");
    // } else {
    //   storeSection.classList.remove("out-of-stock");
    // }

    // Update buy button availability
    const buyButton = document.getElementById("buyBatter");
    buyButton.disabled =
      this.levelManager.money < this.levelManager.levelConfig.batterCost;

    const buyButterButton = document.getElementById("buyButter");
    if (buyButterButton) {
      buyButterButton.disabled =
        this.levelManager.money <
        (this.levelManager.levelConfig.butterCost || 0);
    }

    const buyBananaButton = document.getElementById("buyBanana");
    if (buyBananaButton) {
      buyBananaButton.disabled =
        this.levelManager.money <
        (this.levelManager.levelConfig.bananaCost || 0);
    }

    // Update all plate displays to check for order matches
    this.levelManager.grid.forEach((cell, index) => {
      if (cell.type === "plate") {
        this.updateCellDisplay(index);
      }
    });
  }

  startTutorialCycling() {
    // Create tutorial container if it doesn't exist
    let tutorialContainer = document.getElementById("tutorialContainer");
    if (!tutorialContainer) {
      tutorialContainer = document.createElement("div");
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

      // Insert after game container
      const gameContainer = document.getElementById("gameContainer");
      gameContainer.parentNode.insertBefore(
        tutorialContainer,
        gameContainer.nextSibling
      );
    }

    // Start cycling every 3 seconds
    this.tutorialInterval = setInterval(() => {
      this.cycleTutorialMessage();
    }, 3000);
  }

  cycleTutorialMessage() {
    const tutorialText = document.getElementById("tutorialText");
    if (!tutorialText) return;

    this.currentTutorialIndex =
      (this.currentTutorialIndex + 1) % this.tutorialMessages.length;

    // Add fade effect
    tutorialText.style.opacity = "0.5";

    setTimeout(() => {
      tutorialText.textContent =
        this.tutorialMessages[this.currentTutorialIndex];
      tutorialText.style.opacity = "1";
    }, 300);
  }

  stopTutorialCycling() {
    if (this.tutorialInterval) {
      clearInterval(this.tutorialInterval);
      this.tutorialInterval = null;
    }
  }
}
