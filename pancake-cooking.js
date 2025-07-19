class PancakeCooking {
  constructor(levelManager) {
    this.levelManager = levelManager;
    this.pancakeIdCounter = 0;
    this.cookingPancakes = new Map();
    this.burntPancakes = new Map();
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

    this.levelManager.batter--;

    const pancakeId = this.pancakeIdCounter++;
    const pancake = {
      id: pancakeId,
      type: "plain",
      progress: 0,
      startTime: Date.now(),
      cellIndex: cellIndex,
      ingredientDeadlinePassed: false,
    };

    cell.cookingPancake = pancake;
    this.cookingPancakes.set(pancakeId, pancake);

    this.levelManager.game.audioManager.playSfx("batterDropped");
    this.levelManager.levelUI.addSizzleEffect(cellIndex);

    this.levelManager.levelUI.updateCellDisplay(cellIndex);
    this.levelManager.levelUI.updateUI();
  }

  addIngredientToPancake(pancakeId, ingredientType) {
    const pancake = this.cookingPancakes.get(pancakeId);
    if (!pancake || pancake.ingredientDeadlinePassed) return false;

    if (ingredientType === "butter" && this.levelManager.butter <= 0)
      return false;
    if (ingredientType === "banana" && this.levelManager.banana <= 0)
      return false;

    if (pancake.type !== "plain") return false;

    if (ingredientType === "butter") this.levelManager.butter--;
    if (ingredientType === "banana") this.levelManager.banana--;

    pancake.type = ingredientType;

    // Play sound when ingredient is successfully added
    this.levelManager.game.audioManager.playSfx("buttonClick");

    this.levelManager.levelUI.updateCellDisplay(pancake.cellIndex);
    this.levelManager.levelUI.updateUI();

    return true;
  }

  getBurntSoundForPancakeType(pancakeType) {
    switch (pancakeType) {
      case "plain":
        return "burnt1";
      case "butter":
        return "burnt2";
      case "banana":
        return "burnt3";
      default:
        return "burnt1"; // fallback to plain pancake sound
    }
  }

  updateCooking() {
    const currentTime = Date.now();

    this.burntPancakes.forEach((burntData, id) => {
      if (currentTime >= burntData.removeTime) {
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
      const isDraggedItem =
        this.levelManager.dragDrop.isDragging &&
        this.levelManager.dragDrop.draggedItemId === id.toString();

      const cellDiv = document.querySelector(
        `[data-cell-index="${pancake.cellIndex}"]`
      );
      const progressBar = cellDiv?.querySelector(".progress-bar");

      if (isDraggedItem) {
        if (progressBar) {
          progressBar.classList.add("cooking-paused-specific");
        }

        if (!pancake.pausedTime) {
          pancake.pausedTime = currentTime;
        }
        return;
      } else {
        if (progressBar) {
          progressBar.classList.remove("cooking-paused-specific");
        }

        if (pancake.pausedTime) {
          pancake.startTime += currentTime - pancake.pausedTime;
          delete pancake.pausedTime;
        }
      }

      const elapsed = currentTime - pancake.startTime;
      const previousProgress = pancake.progress;
      pancake.progress = Math.min(
        GAME_CONFIG.mechanics.burntThreshold,
        (elapsed / this.levelManager.levelConfig.burntTime) * 100
      );

      const cookingThreshold =
        (this.levelManager.levelConfig.cookingTime /
          this.levelManager.levelConfig.burntTime) *
        100;

      if (
        previousProgress < cookingThreshold &&
        pancake.progress >= cookingThreshold
      ) {
        this.levelManager.game.audioManager.playSfx("pancakeCooked");
      }

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

      if (pancake.progress >= GAME_CONFIG.mechanics.burntThreshold) {
        const cell = this.levelManager.grid[pancake.cellIndex];

        // Play the appropriate burnt sound based on pancake type
        const burntSound = this.getBurntSoundForPancakeType(pancake.type);
        this.levelManager.game.audioManager.playSfx(burntSound);

        this.cookingPancakes.delete(id);
        this.burntPancakes.set(id, {
          cellIndex: pancake.cellIndex,
          removeTime: currentTime + 2000,
        });

        const cellDiv = document.querySelector(
          `[data-cell-index="${pancake.cellIndex}"]`
        );
        const pancakeImg = cellDiv?.querySelector(".pancake");
        if (pancakeImg) {
          pancakeImg.src = `images/${pancake.type}-pancake-burnt.png`;
          pancakeImg.classList.add("burnt-fading");
          pancakeImg.draggable = false;
          pancakeImg.style.cursor = "not-allowed";
        }

        this.levelManager.levelUI.addBurntEffect(pancake.cellIndex);

        const progressBar = cellDiv?.querySelector(".progress-bar");
        if (progressBar) progressBar.remove();

        const grillImg = cellDiv?.querySelector(".grill-image");
        if (grillImg) {
          grillImg.style.opacity = "0.3";
        }

        return;
      }

      this.levelManager.levelUI.updateCellDisplay(pancake.cellIndex);
    });
  }

  getPancakeType(pancakeId) {
    const cookingPancake = this.cookingPancakes.get(parseInt(pancakeId));
    if (cookingPancake) {
      return cookingPancake.type;
    }

    for (let cell of this.levelManager.grid) {
      if (cell.type === "plate" && cell.pancakes.length > 0) {
        const pancake = cell.pancakes.find((p) => p.id === parseInt(pancakeId));
        if (pancake) {
          return pancake.type;
        }
      }
    }

    return "plain";
  }

  movePancake(pancakeId, targetCellIndex) {
    const targetCell = this.levelManager.grid[targetCellIndex];
    if (targetCell.type !== "plate") return;

    const cookingThreshold =
      (this.levelManager.levelConfig.cookingTime /
        this.levelManager.levelConfig.burntTime) *
      100;

    let sourcePancake = null;
    let sourceCell = null;
    let sourceIndex = -1;

    if (this.cookingPancakes.has(pancakeId)) {
      sourcePancake = this.cookingPancakes.get(pancakeId);
      if (sourcePancake.progress < cookingThreshold) {
        sourceCell = this.levelManager.grid[sourcePancake.cellIndex];
        sourceCell.cookingPancake = null;
        this.cookingPancakes.delete(pancakeId);
        this.levelManager.levelUI.updateCellDisplay(sourcePancake.cellIndex);
        return;
      }

      sourceCell = this.levelManager.grid[sourcePancake.cellIndex];
      sourceCell.cookingPancake = null;
      this.cookingPancakes.delete(pancakeId);

      targetCell.pancakes.push({
        id: pancakeId,
        type: sourcePancake.type,
      });

      this.levelManager.game.audioManager.playSfx("placePancake");
      this.levelManager.levelUI.addMoveEffect(targetCellIndex);

      this.levelManager.levelUI.updateCellDisplay(sourcePancake.cellIndex);
      this.levelManager.levelUI.updateCellDisplay(targetCellIndex);
      return;
    }

    for (let i = 0; i < this.levelManager.grid.length; i++) {
      const cell = this.levelManager.grid[i];
      if (cell.type === "plate" && cell.pancakes.length > 0) {
        const topPancake = cell.pancakes[cell.pancakes.length - 1];
        if (topPancake.id === pancakeId) {
          cell.pancakes.pop();

          targetCell.pancakes.push(topPancake);

          this.levelManager.game.audioManager.playSfx("placePancake");
          this.levelManager.levelUI.addMoveEffect(targetCellIndex);

          this.levelManager.levelUI.updateCellDisplay(i);
          this.levelManager.levelUI.updateCellDisplay(targetCellIndex);
          return;
        }
      }
    }
  }
}
