class DragDrop {
  constructor(levelManager) {
    this.levelManager = levelManager;
    this.isDragging = false;
    this.draggedItemType = null;
    this.draggedItemId = null;

    // Store mouse event handlers for proper cleanup
    this.currentMouseMoveHandler = null;
    this.currentMouseUpHandler = null;
  }

  handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    const pancakeId = e.target.dataset.pancakeId;
    const itemType = e.target.dataset.itemType; // for ingredients

    if (pancakeId) {
      // Dragging a pancake
      this.startPancakeDrag(e, pancakeId);
    } else if (itemType) {
      // Dragging an ingredient or batter
      this.startItemDrag(e, itemType);
    }
  }

  startPancakeDrag(e, pancakeId) {
    // Set dragging state
    this.isDragging = true;
    this.draggedItemType = "pancake";
    this.draggedItemId = pancakeId;

    // Add visual feedback to original pancake
    e.target.classList.add("dragging");
    e.target.style.cursor = "grabbing";

    // Create dragged pancake visual - need to get the pancake type for correct image
    const pancakeType =
      this.levelManager.pancakeCooking.getPancakeType(pancakeId);
    const draggedPancake = document.createElement("img");
    draggedPancake.className = "dragged-pancake large-pancake";
    draggedPancake.src = `images/${pancakeType}-pancake-cooked.png`;
    draggedPancake.alt = "Dragged pancake";
    draggedPancake.id = "draggedItemVisual";
    document.body.appendChild(draggedPancake);

    // Add drag effect to valid drop zones (plates)
    document.querySelectorAll(".cell.plate").forEach((plate) => {
      plate.classList.add("drag-target");
    });

    this.setupDragEventListeners(e);
  }

  startItemDrag(e, itemType) {
    // Check if we have the item
    if (itemType === "batter" && this.levelManager.batter <= 0) return;
    if (itemType === "butter" && this.levelManager.butter <= 0) return;
    if (itemType === "banana" && this.levelManager.banana <= 0) return;

    // Set dragging state
    this.isDragging = true;
    this.draggedItemType = itemType;
    this.draggedItemId = null;

    // Add visual feedback
    e.target.classList.add("dragging");
    e.target.style.cursor = "grabbing";

    // Create dragged item visual
    const draggedItem = document.createElement("img");
    draggedItem.className = "dragged-item";
    draggedItem.id = "draggedItemVisual";

    if (itemType === "batter") {
      draggedItem.src = "images/item-batter.png";
      draggedItem.alt = "Dragged batter";
      // Add drag effect to empty grills
      document.querySelectorAll(".cell.grill").forEach((grill) => {
        const cellIndex = parseInt(grill.dataset.cellIndex);
        if (!this.levelManager.grid[cellIndex].cookingPancake) {
          grill.classList.add("drag-target");
        }
      });
    } else if (itemType === "butter") {
      draggedItem.src = "images/item-butter.png";
      draggedItem.alt = "Dragged butter";
      // Add drag effect to cooking pancakes that can still accept ingredients
      document
        .querySelectorAll(".cell.grill.ingredient-drop-zone")
        .forEach((grill) => {
          grill.classList.add("drag-target");
        });
    } else if (itemType === "banana") {
      draggedItem.src = "images/item-banana.png";
      draggedItem.alt = "Dragged banana";
      // Add drag effect to cooking pancakes that can still accept ingredients
      document
        .querySelectorAll(".cell.grill.ingredient-drop-zone")
        .forEach((grill) => {
          grill.classList.add("drag-target");
        });
    }

    document.body.appendChild(draggedItem);
    this.setupDragEventListeners(e);
  }

  setupDragEventListeners(e) {
    // Create the event handlers as methods so they can be properly removed
    this.currentMouseMoveHandler = (moveEvent) => {
      // Update dragged item position
      const draggedElement = document.getElementById("draggedItemVisual");
      if (draggedElement) {
        if (draggedElement.classList.contains("large-pancake")) {
          // For large pancakes, center them properly
          draggedElement.style.left = moveEvent.clientX - 32 + "px";
          draggedElement.style.top = moveEvent.clientY - 32 + "px";
        } else {
          draggedElement.style.left = moveEvent.clientX - 24 + "px";
          draggedElement.style.top = moveEvent.clientY - 24 + "px";
        }
      }
    };

    this.currentMouseUpHandler = (upEvent) => {
      this.endDrag(upEvent);
    };

    // Set initial position of dragged item
    const rect = e.target.getBoundingClientRect();
    const draggedElement = document.getElementById("draggedItemVisual");
    if (draggedElement) {
      if (draggedElement.classList.contains("large-pancake")) {
        draggedElement.style.left = rect.left + rect.width / 2 - 32 + "px";
        draggedElement.style.top = rect.top + rect.height / 2 - 32 + "px";
      } else {
        draggedElement.style.left = rect.left + rect.width / 2 - 24 + "px";
        draggedElement.style.top = rect.top + rect.height / 2 - 24 + "px";
      }
    }

    // Add event listeners
    document.addEventListener("mousemove", this.currentMouseMoveHandler);
    document.addEventListener("mouseup", this.currentMouseUpHandler);

    // Add hover effects for drop targets
    document.querySelectorAll(".drag-target").forEach((target) => {
      const handleMouseEnter = () => target.classList.add("drag-over");
      const handleMouseLeave = () => target.classList.remove("drag-over");

      target.addEventListener("mouseenter", handleMouseEnter);
      target.addEventListener("mouseleave", handleMouseLeave);

      // Clean up these listeners when drag ends
      document.addEventListener(
        "mouseup",
        () => {
          target.removeEventListener("mouseenter", handleMouseEnter);
          target.removeEventListener("mouseleave", handleMouseLeave);
        },
        { once: true }
      );
    });
  }

  endDrag(upEvent) {
    // Find the drop target
    const elementUnderMouse = document.elementFromPoint(
      upEvent.clientX,
      upEvent.clientY
    );
    const targetCell = elementUnderMouse?.closest(".cell");

    if (targetCell && this.draggedItemType) {
      const targetCellIndex = parseInt(targetCell.dataset.cellIndex);

      if (this.draggedItemType === "pancake" && this.draggedItemId) {
        if (targetCell.classList.contains("plate")) {
          this.levelManager.pancakeCooking.movePancake(
            parseInt(this.draggedItemId),
            targetCellIndex
          );
        }
      } else if (this.draggedItemType === "batter") {
        if (
          targetCell.classList.contains("grill") &&
          !this.levelManager.grid[targetCellIndex].cookingPancake
        ) {
          this.levelManager.pancakeCooking.startCooking(targetCellIndex);
        }
      } else if (
        this.draggedItemType === "butter" ||
        this.draggedItemType === "banana"
      ) {
        if (targetCell.classList.contains("grill")) {
          const cell = this.levelManager.grid[targetCellIndex];
          if (
            cell.cookingPancake &&
            !cell.cookingPancake.ingredientDeadlinePassed
          ) {
            this.levelManager.pancakeCooking.addIngredientToPancake(
              cell.cookingPancake.id,
              this.draggedItemType
            );
          }
        }
      }
    }

    // Reset dragging state
    this.isDragging = false;

    // Remove dragged item visual
    const draggedElement = document.getElementById("draggedItemVisual");
    if (draggedElement) {
      draggedElement.remove();
    }

    // Clean up drag effects
    document.querySelectorAll(".dragging").forEach((item) => {
      item.classList.remove("dragging");
      item.style.cursor = "grab";
    });
    document.querySelectorAll(".drag-target").forEach((target) => {
      target.classList.remove("drag-target");
    });
    document.querySelectorAll(".drag-over").forEach((target) => {
      target.classList.remove("drag-over");
    });

    // Clean up any remaining paused indicators
    document
      .querySelectorAll(".progress-bar.cooking-paused-specific")
      .forEach((bar) => {
        bar.classList.remove("cooking-paused-specific");
      });

    this.draggedItemType = null;
    this.draggedItemId = null;

    // Remove event listeners using the stored references
    if (this.currentMouseMoveHandler) {
      document.removeEventListener("mousemove", this.currentMouseMoveHandler);
      this.currentMouseMoveHandler = null;
    }
    if (this.currentMouseUpHandler) {
      document.removeEventListener("mouseup", this.currentMouseUpHandler);
      this.currentMouseUpHandler = null;
    }
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
}
