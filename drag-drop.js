class DragDrop {
  constructor(levelManager) {
    this.levelManager = levelManager;
    this.isDragging = false;
    this.draggedItemType = null;
    this.draggedItemId = null;
    this.currentMouseMoveHandler = null;
    this.currentMouseUpHandler = null;
    this.currentTouchMoveHandler = null;
    this.currentTouchEndHandler = null;
    this.hoverHandlers = new Map();
  }

  // Get coordinates from mouse or touch event
  getEventCoordinates(e) {
    if (e.touches && e.touches.length > 0) {
      return {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      };
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      return {
        clientX: e.changedTouches[0].clientX,
        clientY: e.changedTouches[0].clientY,
      };
    } else {
      return {
        clientX: e.clientX,
        clientY: e.clientY,
      };
    }
  }

  handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    const pancakeId = e.target.dataset.pancakeId;
    const itemType = e.target.dataset.itemType;

    if (pancakeId) {
      this.startPancakeDrag(e, pancakeId);
    } else if (itemType) {
      this.startItemDrag(e, itemType);
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    e.stopPropagation();

    const pancakeId = e.target.dataset.pancakeId;
    const itemType = e.target.dataset.itemType;

    if (pancakeId) {
      this.startPancakeDrag(e, pancakeId);
    } else if (itemType) {
      this.startItemDrag(e, itemType);
    }
  }

  startPancakeDrag(e, pancakeId) {
    this.isDragging = true;
    this.draggedItemType = "pancake";
    this.draggedItemId = pancakeId;

    e.target.classList.add("dragging");
    e.target.style.cursor = "grabbing";

    const pancakeType =
      this.levelManager.pancakeCooking.getPancakeType(pancakeId);
    const draggedPancake = document.createElement("img");
    draggedPancake.className = "dragged-pancake large-pancake";
    draggedPancake.src = `images/${pancakeType}-pancake-cooked.png`;
    draggedPancake.alt = "Dragged pancake";
    draggedPancake.id = "draggedItemVisual";
    document.body.appendChild(draggedPancake);

    document.querySelectorAll(".cell.plate").forEach((plate) => {
      plate.classList.add("drag-target");
    });

    this.setupDragEventListeners(e);
  }

  startItemDrag(e, itemType) {
    if (itemType === "batter" && this.levelManager.batter <= 0) return;
    if (itemType === "butter" && this.levelManager.butter <= 0) return;
    if (itemType === "banana" && this.levelManager.banana <= 0) return;

    this.isDragging = true;
    this.draggedItemType = itemType;
    this.draggedItemId = null;

    e.target.classList.add("dragging");
    e.target.style.cursor = "grabbing";

    const draggedItem = document.createElement("img");
    draggedItem.className = "dragged-item";
    draggedItem.id = "draggedItemVisual";

    if (itemType === "batter") {
      draggedItem.src = "images/item-batter.png";
      draggedItem.alt = "Dragged batter";
      document.querySelectorAll(".cell.grill").forEach((grill) => {
        const cellIndex = parseInt(grill.dataset.cellIndex);
        if (!this.levelManager.grid[cellIndex].cookingPancake) {
          grill.classList.add("drag-target");
        }
      });
    } else if (itemType === "butter") {
      draggedItem.src = "images/item-butter.png";
      draggedItem.alt = "Dragged butter";
      document
        .querySelectorAll(".cell.grill.ingredient-drop-zone")
        .forEach((grill) => {
          grill.classList.add("drag-target");
        });
    } else if (itemType === "banana") {
      draggedItem.src = "images/item-banana.png";
      draggedItem.alt = "Dragged banana";
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
    const coords = this.getEventCoordinates(e);

    this.currentMouseMoveHandler = (moveEvent) => {
      const moveCoords = this.getEventCoordinates(moveEvent);
      this.updateDraggedElementPosition(moveCoords);
    };

    this.currentTouchMoveHandler = (moveEvent) => {
      moveEvent.preventDefault(); // Prevent scrolling
      const moveCoords = this.getEventCoordinates(moveEvent);
      this.updateDraggedElementPosition(moveCoords);
    };

    this.currentMouseUpHandler = (upEvent) => {
      this.endDrag(upEvent);
    };

    this.currentTouchEndHandler = (upEvent) => {
      this.endDrag(upEvent);
    };

    const rect = e.target.getBoundingClientRect();
    const draggedElement = document.getElementById("draggedItemVisual");
    if (draggedElement) {
      draggedElement.style.position = "fixed";
      draggedElement.style.pointerEvents = "none";
      draggedElement.style.zIndex = "9999";

      if (draggedElement.classList.contains("large-pancake")) {
        draggedElement.style.left = rect.left + rect.width / 2 - 32 + "px";
        draggedElement.style.top = rect.top + rect.height / 2 - 32 + "px";
      } else {
        draggedElement.style.left = rect.left + rect.width / 2 - 24 + "px";
        draggedElement.style.top = rect.top + rect.height / 2 - 24 + "px";
      }
    }

    // Add both mouse and touch event listeners
    document.addEventListener("mousemove", this.currentMouseMoveHandler);
    document.addEventListener("touchmove", this.currentTouchMoveHandler, {
      passive: false,
    });
    document.addEventListener("mouseup", this.currentMouseUpHandler);
    document.addEventListener("touchend", this.currentTouchEndHandler);

    document.querySelectorAll(".drag-target").forEach((target) => {
      const handleMouseEnter = () => target.classList.add("drag-over");
      const handleMouseLeave = () => target.classList.remove("drag-over");

      target.addEventListener("mouseenter", handleMouseEnter);
      target.addEventListener("mouseleave", handleMouseLeave);

      this.hoverHandlers.set(target, { handleMouseEnter, handleMouseLeave });
    });
  }

  updateDraggedElementPosition(coords) {
    const draggedElement = document.getElementById("draggedItemVisual");
    if (draggedElement) {
      if (draggedElement.classList.contains("large-pancake")) {
        draggedElement.style.left = coords.clientX - 32 + "px";
        draggedElement.style.top = coords.clientY - 32 + "px";
      } else {
        draggedElement.style.left = coords.clientX - 24 + "px";
        draggedElement.style.top = coords.clientY - 24 + "px";
      }
    }

    // Handle touch hover effects for mobile
    if (coords.clientX && coords.clientY) {
      this.handleTouchHover(coords);
    }
  }

  handleTouchHover(coords) {
    // Clear previous drag-over states
    document.querySelectorAll(".drag-over").forEach((target) => {
      target.classList.remove("drag-over");
    });

    // Find element under touch point
    const elementUnderTouch = document.elementFromPoint(
      coords.clientX,
      coords.clientY
    );
    const targetCell = elementUnderTouch?.closest(".cell.drag-target");

    if (targetCell) {
      targetCell.classList.add("drag-over");
    }
  }

  endDrag(upEvent) {
    const coords = this.getEventCoordinates(upEvent);
    const elementUnderMouse = document.elementFromPoint(
      coords.clientX,
      coords.clientY
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

    this.cleanupDragState();
  }

  cleanupDragState() {
    this.isDragging = false;

    const draggedElements = document.querySelectorAll(
      "#draggedItemVisual, .dragged-pancake, .dragged-item"
    );
    draggedElements.forEach((element) => {
      if (element.parentNode) {
        element.remove();
      }
    });

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

    document
      .querySelectorAll(".progress-bar.cooking-paused-specific")
      .forEach((bar) => {
        bar.classList.remove("cooking-paused-specific");
      });

    this.draggedItemType = null;
    this.draggedItemId = null;

    // Remove mouse event listeners
    if (this.currentMouseMoveHandler) {
      document.removeEventListener("mousemove", this.currentMouseMoveHandler);
      this.currentMouseMoveHandler = null;
    }
    if (this.currentMouseUpHandler) {
      document.removeEventListener("mouseup", this.currentMouseUpHandler);
      this.currentMouseUpHandler = null;
    }

    // Remove touch event listeners
    if (this.currentTouchMoveHandler) {
      document.removeEventListener("touchmove", this.currentTouchMoveHandler);
      this.currentTouchMoveHandler = null;
    }
    if (this.currentTouchEndHandler) {
      document.removeEventListener("touchend", this.currentTouchEndHandler);
      this.currentTouchEndHandler = null;
    }

    this.hoverHandlers.forEach((handlers, target) => {
      target.removeEventListener("mouseenter", handlers.handleMouseEnter);
      target.removeEventListener("mouseleave", handlers.handleMouseLeave);
    });
    this.hoverHandlers.clear();
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
