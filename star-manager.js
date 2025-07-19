// Star Manager - Handles saving and loading star progress
class StarManager {
  constructor() {
    this.stars = this.loadStars();
  }

  loadStars() {
    const saved = localStorage.getItem("pancakeGameStars");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load stars:", e);
      }
    }
    // Default stars object
    return {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };
  }

  saveStarsForLevel(levelNum, stars) {
    const previousStars = this.stars[levelNum] || 0;
    this.stars[levelNum] = Math.max(previousStars, stars);
    localStorage.setItem("pancakeGameStars", JSON.stringify(this.stars));
    return stars > previousStars; // Return true if new record
  }

  getStarsForLevel(levelNum) {
    return this.stars[levelNum] || 0;
  }
}
