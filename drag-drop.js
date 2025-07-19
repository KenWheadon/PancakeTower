class DragDrop {
  constructor(levelManager) {
    this.levelManager = levelManager;
    this.isDragging = false;
    this.draggedItemType = null;
    this.draggedItemId = null;
    this.currentMouseMoveHandler = null;
    this.currentMouseUpHandler = null;
    this.hoverHandlers = new Map();
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
    this.currentMouseMoveHandler = (moveEvent) => {
      const draggedElement = document.getElementById("draggedItemVisual");
      if (draggedElement) {
        draggedElement.style.position = "fixed";
        draggedElement.style.pointerEvents = "none";
        draggedElement.style.zIndex = "9999";

        if (draggedElement.classList.contains("large-pancake")) {
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

    document.addEventListener("mousemove", this.currentMouseMoveHandler);
    document.addEventListener("mouseup", this.currentMouseUpHandler);

    document.querySelectorAll(".drag-target").forEach((target) => {
      const handleMouseEnter = () => target.classList.add("drag-over");
      const handleMouseLeave = () => target.classList.remove("drag-over");

      target.addEventListener("mouseenter", handleMouseEnter);
      target.addEventListener("mouseleave", handleMouseLeave);

      this.hoverHandlers.set(target, { handleMouseEnter, handleMouseLeave });
    });
  }

  endDrag(upEvent) {
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

    if (this.currentMouseMoveHandler) {
      document.removeEventListener("mousemove", this.currentMouseMoveHandler);
      this.currentMouseMoveHandler = null;
    }
    if (this.currentMouseUpHandler) {
      document.removeEventListener("mouseup", this.currentMouseUpHandler);
      this.currentMouseUpHandler = null;
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
