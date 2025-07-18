// Game Configuration
const GAME_CONFIG = {
  // Loading configuration
  MINIMUM_LOADING_TIME: 3000, // Minimum time in milliseconds for loading screen

  // Level configurations
  levels: {
    1: {
      name: "Breakfast Rush",
      description: "Learn the basics of pancake cooking!",
      difficulty: "Easy",
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
      starThresholds: [3, 8, 12], // thresholds for 1, 2, 3 stars
      initialBatter: 0,
      initialMoney: 5,
      batterCost: 1,
      batterPurchaseAmount: 3,
      pancakeReward: 1, // $ per correct pancake
      pancakePenalty: 1, // $ penalty per extra pancake
    },

    2: {
      name: "Lunch Time Madness",
      description: "Faster cooking, bigger orders!",
      difficulty: "Medium",
      gridLayout: [
        "grill",
        "grill",
        "plate",
        "grill",
        "plate",
        "grill",
        "plate",
        "grill",
        "grill",
      ],
      cookingTime: 3000, // 2.5 seconds to 80%
      burntTime: 5500, // 5 seconds to 100%
      timeLimit: 90000, // 90 seconds
      orders: [2, 3, 4, 2, 5], // sequence that repeats
      starThresholds: [15, 40, 80], // thresholds for 1, 2, 3 stars
      initialBatter: 15,
      initialMoney: 10,
      batterCost: 2,
      batterPurchaseAmount: 10,
      pancakeReward: 2, // $ per correct pancake
      pancakePenalty: 2, // $ penalty per extra pancake
    },

    3: {
      name: "Dinner Rush Chaos",
      description: "Master level challenge!",
      difficulty: "Hard",
      gridLayout: [
        "grill",
        "plate",
        "grill",
        "grill",
        "grill",
        "grill",
        "grill",
        "plate",
        "grill",
      ],
      cookingTime: 2000, // 2 seconds to 80%
      burntTime: 4000, // 4 seconds to 100%
      timeLimit: 120000, // 120 seconds
      orders: [3, 4, 5, 6, 4, 7], // sequence that repeats
      starThresholds: [30, 80, 150], // thresholds for 1, 2, 3 stars
      initialBatter: 20,
      initialMoney: 15,
      batterCost: 3,
      batterPurchaseAmount: 15,
      pancakeReward: 3, // $ per correct pancake
      pancakePenalty: 3, // $ penalty per extra pancake
    },
  },

  // Screen configurations
  screens: {
    loading: {
      messages: [
        "Heating up the grill...",
        "Mixing pancake batter...",
        "Preparing plates...",
        "Loading recipes...",
        "Setting up kitchen...",
        "Almost ready to cook!",
      ],
    },
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
