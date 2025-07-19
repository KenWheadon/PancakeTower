// Star tracking and management system
class StarManager {
  constructor() {
    this.STORAGE_KEY = "pancakeGame_levelStars";
  }

  // Get stars earned for a specific level
  getStarsForLevel(levelNum) {
    const starData = this.getAllStars();
    return starData[levelNum] || 0;
  }

  // Save stars for a specific level (only if better than current)
  saveStarsForLevel(levelNum, stars) {
    const starData = this.getAllStars();
    const currentStars = starData[levelNum] || 0;

    if (stars > currentStars) {
      starData[levelNum] = stars;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(starData));
      return true; // New record
    }
    return false; // No improvement
  }

  // Get all star data
  getAllStars() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error loading star data:", error);
      return {};
    }
  }

  // Clear all star data (for testing/reset)
  clearAllStars() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get total stars earned across all levels
  getTotalStars() {
    const starData = this.getAllStars();
    return Object.values(starData).reduce((total, stars) => total + stars, 0);
  }

  // Check if a level has been completed (has at least 1 star)
  isLevelCompleted(levelNum) {
    return this.getStarsForLevel(levelNum) > 0;
  }
}
