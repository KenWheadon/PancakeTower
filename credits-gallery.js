class CreditsGallery {
  constructor() {
    this.modal = null;
    this.container = null;
    this.content = null;
    this.detailView = null;
    this.currentFilter = "all";
    this.currentPerson = null;
    this.creditsList = [];
    this.filteredCredits = [];
    this.currentIndex = 0;

    this.init();
  }

  init() {
    // Check if DOM is ready before proceeding
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.initializeGallery();
      });
    } else {
      this.initializeGallery();
    }
  }

  initializeGallery() {
    this.createModalStructure();
    this.setupEventListeners();
    this.loadCredits();
  }

  createModalStructure() {
    // Create modal overlay
    this.modal = document.createElement("div");
    this.modal.className = "credits-gallery-modal";

    // Create container
    this.container = document.createElement("div");
    this.container.className = "credits-gallery-container";

    // Create header
    const header = document.createElement("div");
    header.className = "credits-gallery-header";
    header.innerHTML = `
      <h2 class="credits-gallery-title">Game Credits</h2>
      <button class="credits-gallery-close">×</button>
    `;

    // Create content area
    this.content = document.createElement("div");
    this.content.className = "credits-gallery-content";

    // Create detail view
    this.detailView = document.createElement("div");
    this.detailView.className = "credits-detail-view";

    // Assemble structure
    this.container.appendChild(header);
    this.container.appendChild(this.content);
    this.container.appendChild(this.detailView);
    this.modal.appendChild(this.container);
    document.body.appendChild(this.modal);
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector(".credits-gallery-close");
    closeBtn.addEventListener("click", () => this.closeGallery());

    // Click outside to close
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeGallery();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!this.modal.classList.contains("active")) return;

      switch (e.key) {
        case "Escape":
          if (this.detailView.classList.contains("active")) {
            this.closeDetailView();
          } else {
            this.closeGallery();
          }
          break;
        case "ArrowLeft":
          if (this.detailView.classList.contains("active")) {
            this.previousPerson();
          }
          break;
        case "ArrowRight":
          if (this.detailView.classList.contains("active")) {
            this.nextPerson();
          }
          break;
      }
    });
  }

  loadCredits() {
    if (typeof CREDITS === "undefined") {
      console.error("CREDITS data not loaded");
      return;
    }

    this.creditsList = Object.entries(CREDITS).map(([key, data]) => ({
      id: key,
      ...data,
    }));

    this.filteredCredits = [...this.creditsList];
  }

  openGallery() {
    this.renderGallery();
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeGallery() {
    this.modal.classList.remove("active");
    this.closeDetailView();
    document.body.style.overflow = "";
  }

  renderGallery() {
    const departments = ["all", ...getAllDepartments()];

    this.content.innerHTML = `
      <div class="credits-gallery-filters">
        ${departments
          .map(
            (dept) => `
          <button class="credits-filter-btn ${
            dept === this.currentFilter ? "active" : ""
          }" 
                  data-filter="${dept}">
            ${dept === "all" ? "All Team Members" : dept}
          </button>
        `
          )
          .join("")}
      </div>
      <div class="credits-grid" id="credits-grid">
        ${this.renderCreditsGrid()}
      </div>
    `;

    this.setupFilterListeners();
    this.setupCreditsListeners();
  }

  renderCreditsGrid() {
    return this.filteredCredits
      .map(
        (person) => `
      <div class="credits-card" data-person="${person.id}">
        <img src="${person.previewImage}" alt="${person.name}" class="credits-card-image" />
        <h3 class="credits-card-name">${person.name}</h3>
        <p class="credits-card-title">${person.jobTitle}</p>
        <p class="credits-card-department">${person.department}</p>
      </div>
    `
      )
      .join("");
  }

  setupFilterListeners() {
    const filterBtns = this.content.querySelectorAll(".credits-filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const filter = e.target.dataset.filter;
        this.setFilter(filter);
      });
    });
  }

  setupCreditsListeners() {
    const creditsCards = this.content.querySelectorAll(".credits-card");
    creditsCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        const personId = e.currentTarget.dataset.person;
        this.showPersonDetail(personId);
      });
    });
  }

  setFilter(filter) {
    this.currentFilter = filter;

    if (filter === "all") {
      this.filteredCredits = [...this.creditsList];
    } else {
      this.filteredCredits = this.creditsList.filter(
        (person) => person.department === filter
      );
    }

    this.renderGallery();
  }

  showPersonDetail(personId) {
    const person = this.creditsList.find((p) => p.id === personId);
    if (!person) return;

    this.currentPerson = person;
    this.currentIndex = this.filteredCredits.findIndex(
      (p) => p.id === personId
    );

    this.detailView.innerHTML = `
      <button class="credits-detail-back">←</button>
      <div class="credits-detail-left">
        <img src="${person.fullImage}" alt="${
      person.name
    }" class="credits-detail-image" />
      </div>
      <div class="credits-detail-right">
        <h2 class="credits-detail-name">${person.name}</h2>
        <p class="credits-detail-title">${person.jobTitle}</p>
        <p class="credits-detail-department">${person.department}</p>
        <p class="credits-detail-description">${person.description}</p>
      </div>
      <div class="credits-navigation">
        <button class="credits-nav-btn" id="prev-person" ${
          this.currentIndex === 0 ? "disabled" : ""
        }>
          ← Previous
        </button>
        <button class="credits-nav-btn" id="next-person" ${
          this.currentIndex === this.filteredCredits.length - 1
            ? "disabled"
            : ""
        }>
          Next →
        </button>
      </div>
    `;

    this.setupDetailListeners();
    this.detailView.classList.add("active");
  }

  setupDetailListeners() {
    const backBtn = this.detailView.querySelector(".credits-detail-back");
    const prevBtn = this.detailView.querySelector("#prev-person");
    const nextBtn = this.detailView.querySelector("#next-person");

    // Add event listeners with proper event handling
    if (backBtn) {
      backBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeDetailView();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.previousPerson();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.nextPerson();
      });
    }
  }

  closeDetailView() {
    this.detailView.classList.remove("active");
    this.currentPerson = null;
  }

  previousPerson() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const prevPerson = this.filteredCredits[this.currentIndex];
      this.showPersonDetail(prevPerson.id);
    }
  }

  nextPerson() {
    if (this.currentIndex < this.filteredCredits.length - 1) {
      this.currentIndex++;
      const nextPerson = this.filteredCredits[this.currentIndex];
      this.showPersonDetail(nextPerson.id);
    }
  }

  // Preload images for smoother experience
  preloadCreditsImages() {
    this.creditsList.forEach((person) => {
      const previewImg = new Image();
      const fullImg = new Image();
      previewImg.src = person.previewImage;
      fullImg.src = person.fullImage;
    });
  }

  // Public method to refresh gallery if credits are updated
  refresh() {
    this.loadCredits();
    if (this.modal.classList.contains("active")) {
      this.renderGallery();
    }
  }

  // Destroy method for cleanup
  destroy() {
    if (this.modal) {
      this.modal.remove();
    }
    const creditsBtn = document.querySelector(".credits-gallery-button");
    if (creditsBtn) {
      creditsBtn.remove();
    }
    document.body.style.overflow = "";
  }
}
