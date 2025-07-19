class PancakeCooking {
  constructor(levelManager) {
    this.levelManager = levelManager;
    this.pancakeIdCounter = 0;
    this.cookingPancakes = new Map(); // id -> pancake data
    this.burntPancakes = new Map(); // Track pancakes that are burning out
  }

  initialize() {
    this.pancakeIdCounter = 0;
    this.cookingPancakes = new Map();
    this.burntPancakes = new Map();
  }

  cleanup() {
    if (this.cookingPancakes) {
      this.cookingPancakes.clear();
    }
    if (this.burntPancakes) {
      this.burntPancakes.clear();
    }
  }

  startCooking(cellIndex) {
    if (
      this.levelManager.game.gameState !== "playing" ||
      !this.levelManager.gameRunning
    )
      return;

    const cell = this.levelManager.grid[cellIndex];
    if (cell.type !== "grill" || cell.cookingPancake) return;
    if (this.levelManager.batter <= 0) return;

    // Consume batter
    this.levelManager.batter--;

    // Create pancake
    const pancakeId = this.pancakeIdCounter++;
    const pancake = {
      id: pancakeId,
      type: "plain", // Start as plain, can be changed by ingredients
      progress: 0,
      startTime: Date.now(),
      cellIndex: cellIndex,
      ingredientDeadlinePassed: false,
    };

    cell.cookingPancake = pancake;
    this.cookingPancakes.set(pancakeId, pancake);

    // Add sizzle effect
    this.levelManager.levelUI.addSizzleEffect(cellIndex);

    this.levelManager.levelUI.updateCellDisplay(cellIndex);
    this.levelManager.levelUI.updateUI();
  }

  // Changes pancake type instead of adding ingredients
  addIngredientToPancake(pancakeId, ingredientType) {
    const pancake = this.cookingPancakes.get(pancakeId);
    if (!pancake || pancake.ingredientDeadlinePassed) return false;

    // Check if we have the ingredient
    if (ingredientType === "butter" && this.levelManager.butter <= 0)
      return false;
    if (ingredientType === "banana" && this.levelManager.banana <= 0)
      return false;

    // Can only change to butter or banana type once
    if (pancake.type !== "plain") return false;

    // Consume ingredient
    if (ingredientType === "butter") this.levelManager.butter--;
    if (ingredientType === "banana") this.levelManager.banana--;

    // Change pancake type
    pancake.type = ingredientType;

    // Update display
    this.levelManager.levelUI.updateCellDisplay(pancake.cellIndex);
    this.levelManager.levelUI.updateUI();

    return true;
  }

  updateCooking() {
    const currentTime = Date.now();

    // Handle burning out pancakes
    this.burntPancakes.forEach((burntData, id) => {
      if (currentTime >= burntData.removeTime) {
        // Remove the pancake and clean up
        const cellDiv = document.querySelector(
          `[data-cell-index="${burntData.cellIndex}"]`
        );
        const pancakeImg = cellDiv?.querySelector(
          `.pancake[data-pancake-id="${id}"]`
        );
        if (pancakeImg) {
          pancakeImg.remove();
        }

        const cell = this.levelManager.grid[burntData.cellIndex];
        cell.cookingPancake = null;

        this.burntPancakes.delete(id);
        this.levelManager.levelUI.updateCellDisplay(burntData.cellIndex);
      }
    });

    this.cookingPancakes.forEach((pancake, id) => {
      // Check if this specific item is being dragged
      const isDraggedItem =
        this.levelManager.dragDrop.isDragging &&
        this.levelManager.dragDrop.draggedItemId === id.toString();

      const cellDiv = document.querySelector(
        `[data-cell-index="${pancake.cellIndex}"]`
      );
      const progressBar = cellDiv?.querySelector(".progress-bar");

      if (isDraggedItem) {
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
        (elapsed / this.levelManager.levelConfig.burntTime) * 100
      );

      // Check if ingredient deadline has passed
      const ingredientThreshold =
        (this.levelManager.levelConfig.ingredientTime /
          this.levelManager.levelConfig.burntTime) *
        100;
      if (
        pancake.progress >= ingredientThreshold &&
        !pancake.ingredientDeadlinePassed
      ) {
        pancake.ingredientDeadlinePassed = true;
        this.levelManager.levelUI.updateCellDisplay(pancake.cellIndex);
      }

      // Handle burnt pancakes with fade out effect
      if (pancake.progress >= GAME_CONFIG.mechanics.burntThreshold) {
        const cell = this.levelManager.grid[pancake.cellIndex];

        // Remove from cooking pancakes and add to burnt pancakes
        this.cookingPancakes.delete(id);
        this.burntPancakes.set(id, {
          cellIndex: pancake.cellIndex,
          removeTime: currentTime + 2000, // Remove after 2 seconds
        });

        // Show burnt image and start fade animation
        const cellDiv = document.querySelector(
          `[data-cell-index="${pancake.cellIndex}"]`
        );
        const pancakeImg = cellDiv?.querySelector(".pancake");
        if (pancakeImg) {
          // Use type-specific burnt image
          pancakeImg.src = `images/${pancake.type}-pancake-burnt.png`;
          pancakeImg.classList.add("burnt-fading");
          pancakeImg.draggable = false;
          pancakeImg.style.cursor = "not-allowed";
        }

        // Add burnt particle effect
        this.levelManager.levelUI.addBurntEffect(pancake.cellIndex);

        // Clear progress bar
        const progressBar = cellDiv?.querySelector(".progress-bar");
        if (progressBar) progressBar.remove();

        // Hide grill image
        const grillImg = cellDiv?.querySelector(".grill-image");
        if (grillImg) {
          grillImg.style.opacity = "0.3";
        }

        return;
      }

      this.levelManager.levelUI.updateCellDisplay(pancake.cellIndex);
    });
  }

  // Helper method to get pancake type by ID
  getPancakeType(pancakeId) {
    // Check cooking pancakes first
    const cookingPancake = this.cookingPancakes.get(parseInt(pancakeId));
    if (cookingPancake) {
      return cookingPancake.type;
    }

    // Check plates
    for (let cell of this.levelManager.grid) {
      if (cell.type === "plate" && cell.pancakes.length > 0) {
        const pancake = cell.pancakes.find((p) => p.id === parseInt(pancakeId));
        if (pancake) {
          return pancake.type;
        }
      }
    }

    return "plain"; // fallback
  }

  movePancake(pancakeId, targetCellIndex) {
    const targetCell = this.levelManager.grid[targetCellIndex];
    if (targetCell.type !== "plate") return;

    // Calculate the actual cooking threshold from level config
    const cookingThreshold =
      (this.levelManager.levelConfig.cookingTime /
        this.levelManager.levelConfig.burntTime) *
      100;

    // Find source of pancake
    let sourcePancake = null;
    let sourceCell = null;
    let sourceIndex = -1;

    // Check if it's a cooking pancake
    if (this.cookingPancakes.has(pancakeId)) {
      sourcePancake = this.cookingPancakes.get(pancakeId);
      if (sourcePancake.progress < cookingThreshold) {
        // Discard unfinished pancake
        sourceCell = this.levelManager.grid[sourcePancake.cellIndex];
        sourceCell.cookingPancake = null;
        this.cookingPancakes.delete(pancakeId);
        this.levelManager.levelUI.updateCellDisplay(sourcePancake.cellIndex);
        return;
      }

      // Move finished pancake from grill to plate
      sourceCell = this.levelManager.grid[sourcePancake.cellIndex];
      sourceCell.cookingPancake = null;
      this.cookingPancakes.delete(pancakeId);

      // Add to target plate with type information
      targetCell.pancakes.push({
        id: pancakeId,
        type: sourcePancake.type, // Preserve pancake type
      });

      // Add move effect
      this.levelManager.levelUI.addMoveEffect(targetCellIndex);

      this.levelManager.levelUI.updateCellDisplay(sourcePancake.cellIndex);
      this.levelManager.levelUI.updateCellDisplay(targetCellIndex);
      return;
    }

    // Check if it's on a plate (top pancake only)
    for (let i = 0; i < this.levelManager.grid.length; i++) {
      const cell = this.levelManager.grid[i];
      if (cell.type === "plate" && cell.pancakes.length > 0) {
        const topPancake = cell.pancakes[cell.pancakes.length - 1];
        if (topPancake.id === pancakeId) {
          // Remove from source plate
          cell.pancakes.pop();

          // Add to target plate (already has type information)
          targetCell.pancakes.push(topPancake);

          // Add move effect
          this.levelManager.levelUI.addMoveEffect(targetCellIndex);

          this.levelManager.levelUI.updateCellDisplay(i);
          this.levelManager.levelUI.updateCellDisplay(targetCellIndex);
          return;
        }
      }
    }
  }
}
