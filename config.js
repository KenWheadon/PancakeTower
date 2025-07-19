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
      ingredientTime: 1500, // 1.5 seconds - deadline for adding ingredients
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
      availableIngredients: [], // no special ingredients in level 1
    },

    2: {
      name: "Lunch Time Rush",
      description: "Faster cooking, bigger orders, less plates!",
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
      ingredientTime: 1500, // 1.5 seconds - deadline for adding ingredients
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
      availableIngredients: [], // no special ingredients in level 2
    },

    3: {
      name: "Dinner Rush Chaos",
      description: "Master level challenge with butter!",
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
      ingredientTime: 1000, // 1 second - deadline for adding ingredients
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
      availableIngredients: ["butter"], // butter available in level 3
      butterCost: 2,
      butterPurchaseAmount: 5,
      initialButter: 5,
    },

    4: {
      name: "Gourmet Express",
      description: "Premium pancakes with perfect timing!",
      difficulty: "Expert",
      gridLayout: [
        "grill",
        "grill",
        "grill",
        "plate",
        "grill",
        "plate",
        "grill",
        "grill",
        "grill",
      ],
      cookingTime: 1800, // 1.8 seconds to 80%
      ingredientTime: 900, // 0.9 seconds - deadline for adding ingredients
      burntTime: 3600, // 3.6 seconds to 100%
      timeLimit: 150000, // 150 seconds
      orders: [4, 5, 6, 7, 5, 8, 6], // sequence that repeats
      starThresholds: [50, 120, 200], // thresholds for 1, 2, 3 stars
      initialBatter: 25,
      initialMoney: 20,
      batterCost: 4,
      batterPurchaseAmount: 20,
      pancakeReward: 4, // $ per correct pancake
      pancakePenalty: 4, // $ penalty per extra pancake
      availableIngredients: ["butter"], // butter available in level 4
      butterCost: 3,
      butterPurchaseAmount: 8,
      initialButter: 8,
    },

    5: {
      name: "Ultimate Pancake",
      description: "The final challenge with butter AND bananas!",
      difficulty: "Insane",
      gridLayout: [
        "grill",
        "grill",
        "plate",
        "grill",
        "grill",
        "grill",
        "plate",
        "grill",
        "grill",
      ],
      cookingTime: 1500, // 1.5 seconds to 80%
      ingredientTime: 750, // 0.75 seconds - deadline for adding ingredients
      burntTime: 3000, // 3 seconds to 100%
      timeLimit: 180000, // 180 seconds
      orders: [5, 6, 7, 8, 6, 9, 7, 10], // sequence that repeats
      starThresholds: [80, 180, 300], // thresholds for 1, 2, 3 stars
      initialBatter: 30,
      initialMoney: 25,
      batterCost: 5,
      batterPurchaseAmount: 25,
      pancakeReward: 5, // $ per correct pancake
      pancakePenalty: 5, // $ penalty per extra pancake
      availableIngredients: ["butter", "banana"], // both ingredients available in level 5
      butterCost: 4,
      butterPurchaseAmount: 10,
      initialButter: 10,
      bananaCost: 3,
      bananaPurchaseAmount: 8,
      initialBanana: 8,
    },

    6: {
      name: "Lightning Rush",
      description: "The most intense pancake challenge - quick but brutal!",
      difficulty: "Lightning",
      gridLayout: [
        "grill",
        "grill",
        "grill",
        "grill",
        "plate",
        "grill",
        "grill",
        "grill",
        "grill",
      ],
      cookingTime: 800, // 0.8 seconds to 80% - EXTREMELY fast
      ingredientTime: 400, // 0.4 seconds - very tight ingredient window
      burntTime: 1600, // 1.6 seconds to 100% - burns quickly
      timeLimit: 90000, // 90 seconds - shorter time but intense
      orders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], // very large orders that repeat
      starThresholds: [150, 400, 700], // extremely high thresholds for the intensity
      initialBatter: 1,
      initialMoney: 50,
      batterCost: 10,
      batterPurchaseAmount: 6,
      pancakeReward: 10, // High reward per pancake due to difficulty
      pancakePenalty: 10, // High penalty to match
      availableIngredients: ["butter", "banana"], // all ingredients available
      butterCost: 5,
      butterPurchaseAmount: 3,
      initialButter: 1,
      bananaCost: 3,
      bananaPurchaseAmount: 2,
      initialBanana: 1,
    },
  },

  // Ingredient configurations
  ingredients: {
    butter: {
      name: "Butter",
      icon: "🧈",
      image: "images/ingredient-butter.png",
    },
    banana: {
      name: "Banana",
      icon: "🍌",
      image: "images/ingredient-banana.png",
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
    ingredientProgressThreshold: 25, // percentage when ingredients can no longer be added (calculated from ingredientTime/burntTime * 100)
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
