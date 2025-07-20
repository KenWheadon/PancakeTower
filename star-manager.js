// Star Manager - Handles saving and loading star progress with fallbacks
class StarManager {
  constructor() {
    this.stars = {};
    this.storageAvailable = this.testStorageAvailable();
    this.loadStars();

    // Add debug logging
    console.log("StarManager initialized:", {
      storageAvailable: this.storageAvailable,
      initialStars: this.stars,
    });
  }

  testStorageAvailable() {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return retrieved === "test";
    } catch (e) {
      console.warn("localStorage not available:", e);
      return false;
    }
  }

  loadStars() {
    // Always try to reload from storage to get latest data
    let loadedStars = null;

    // Try localStorage first
    if (this.storageAvailable) {
      const saved = localStorage.getItem("pancakeGameStars");
      if (saved) {
        try {
          loadedStars = JSON.parse(saved);
          console.log("Loaded stars from localStorage:", loadedStars);
        } catch (e) {
          console.error("Failed to load stars from localStorage:", e);
        }
      }
    }

    // If localStorage failed, try cookies
    if (!loadedStars) {
      loadedStars = this.loadFromCookies();
      if (loadedStars) {
        console.log("Loaded stars from cookies:", loadedStars);
      }
    }

    // Use loaded stars or default
    if (loadedStars) {
      this.stars = loadedStars;
    } else {
      // Default stars object
      this.stars = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      };
      console.log("Using default stars:", this.stars);
    }
  }

  loadFromCookies() {
    try {
      const cookies = document.cookie.split(";");
      const starsCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("pancakeGameStars=")
      );

      if (starsCookie) {
        const value = starsCookie.split("=")[1];
        return JSON.parse(decodeURIComponent(value));
      }
    } catch (e) {
      console.warn("Failed to load from cookies:", e);
    }
    return null;
  }

  saveStarsForLevel(levelNum, stars) {
    // Always reload first to get the latest data from storage
    this.loadStars();

    const previousStars = this.stars[levelNum] || 0;
    this.stars[levelNum] = Math.max(previousStars, stars);

    console.log(`Saving stars for level ${levelNum}:`, {
      previousStars,
      newStars: stars,
      finalStars: this.stars[levelNum],
      allStars: this.stars,
    });

    // Always save to BOTH localStorage AND cookies for redundancy
    let saveSuccess = false;

    // Try localStorage first
    if (this.storageAvailable) {
      try {
        localStorage.setItem("pancakeGameStars", JSON.stringify(this.stars));
        console.log("Successfully saved to localStorage");
        saveSuccess = true;
      } catch (e) {
        console.warn("Failed to save to localStorage:", e);
      }
    }

    // Always try cookies as backup (or primary if localStorage failed)
    try {
      this.saveToCookies();
      console.log("Successfully saved to cookies");
      saveSuccess = true;
    } catch (e) {
      console.error("Failed to save to cookies:", e);
    }

    if (!saveSuccess) {
      console.error("Failed to save stars to both localStorage and cookies!");
    }

    return stars > previousStars; // Return true if new record
  }

  saveToCookies() {
    const cookieValue = encodeURIComponent(JSON.stringify(this.stars));
    // Set cookie to expire in 1 year
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    document.cookie = `pancakeGameStars=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
  }

  getStarsForLevel(levelNum) {
    // Always reload from storage before getting stars to ensure we have the latest data
    this.loadStars();

    const stars = this.stars[levelNum] || 0;
    console.log(`Getting stars for level ${levelNum}:`, stars);
    return stars;
  }

  // Add method to manually trigger a save (useful for testing)
  forceSave() {
    console.log("Force saving stars:", this.stars);
    this.saveStarsForLevel(1, this.stars[1] || 0); // Trigger save mechanism
  }

  // Debug method to clear all data
  clearAllData() {
    this.stars = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    // Clear localStorage
    try {
      localStorage.removeItem("pancakeGameStars");
    } catch (e) {
      console.warn("Could not clear localStorage");
    }

    // Clear cookies
    document.cookie =
      "pancakeGameStars=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    console.log("Cleared all star data");
  }
}
