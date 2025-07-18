// Game Configuration
const GAME_CONFIG = {
  // Level 1 configuration
  level1: {
    gridLayout: [
      "plate",
      "grill",
      "plate",
      "grill",
      "plate",
      "grill",
      "plate",
      "grill",
      "plate",
    ],
    cookingTime: 3000, // 3 seconds to 80%
    burntTime: 6000, // 6 seconds to 100%
    timeLimit: 60000, // 60 seconds
    orders: [1, 2, 1, 3], // sequence that repeats
    starThresholds: [3, 10, 30], // thresholds for 1, 2, 3 stars
    initialBatter: 10,
    initialMoney: 0,
    batterCost: 1,
    batterPurchaseAmount: 10,
    pancakeReward: 1, // $ per correct pancake
    pancakePenalty: 1, // $ penalty per extra pancake
  },

  // Game mechanics constants
  mechanics: {
    gameLoopInterval: 100, // milliseconds
    cookingProgressThreshold: 80, // percentage when pancake is ready
    burntThreshold: 100, // percentage when pancake is burnt
    urgentTimerThreshold: 10, // seconds when timer becomes urgent
  },

  // UI Configuration
  ui: {
    gridSize: 650, // pixels
    gridColumns: 3,
    gridRows: 3,
    cellGap: 8, // pixels
    sidebarWidth: 250, // pixels
  },

  // Animation timings
  animations: {
    rippleEffect: 600, // milliseconds
    sizzleEffect: 500, // milliseconds
    particleEffect: 1000, // milliseconds
    scorePopup: 1000, // milliseconds
    screenShake: 500, // milliseconds
    successGlow: 500, // milliseconds
  },
};
