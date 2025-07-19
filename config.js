// Game Configuration
const GAME_CONFIG = {
  // Loading configuration
  MINIMUM_LOADING_TIME: 3000, // Minimum time in milliseconds for loading screen

  // Level configurations
  levels: {
    1: {
      name: "Learning the Ropes",
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
      cookingTime: 7000,
      ingredientTime: 5000,
      burntTime: 10000,
      timeLimit: 60000,
      orders: [{ plain: 1 }, { plain: 2 }, { plain: 1 }, { plain: 3 }],
      starThresholds: [10, 100, 250],
      initialBatter: 0,
      initialMoney: 0,
      batterCost: 0,
      batterPurchaseAmount: 1,
      pancakeReward: 1,
      pancakePenalty: 0,
      availableIngredients: [],
    },

    2: {
      name: "Lunch Time Rush",
      description: "Faster cooking, bigger orders, less plates!",
      difficulty: "Medium",
      gridLayout: [
        "grill",
        "grill",
        "grill",
        "plate",
        "plate",
        "plate",
        "grill",
        "grill",
        "grill",
      ],
      cookingTime: 6500,
      ingredientTime: 4500,
      burntTime: 9500,
      timeLimit: 60000,
      orders: [
        { plain: 2 },
        { plain: 3 },
        { plain: 1 },
        { plain: 2 },
        { plain: 4 },
        { plain: 5 },
        { plain: 3 },
        { plain: 1 },
        { plain: 2 },
        { plain: 1 },
      ],
      starThresholds: [5, 10, 20],
      initialBatter: 2,
      initialMoney: 0,
      batterCost: 1,
      batterPurchaseAmount: 2,
      pancakeReward: 1,
      pancakePenalty: 0,
      availableIngredients: [],
    },

    3: {
      name: "Dinner Rush Chaos",
      description: "Master level challenge with butter!",
      difficulty: "Hard",
      gridLayout: [
        "plate",
        "grill",
        "plate",
        "grill",
        "grill",
        "grill",
        "plate",
        "grill",
        "plate",
      ],
      cookingTime: 6000,
      ingredientTime: 4500,
      burntTime: 8500,
      timeLimit: 90000,
      // UPDATED: Mixed orders with butter pancakes
      orders: [
        { plain: 2 },
        { butter: 2 },
        { plain: 1, butter: 1 },
        { butter: 3, plain: 1 },
        { plain: 2, butter: 2 },
        { butter: 3, plain: 4 },
      ],
      starThresholds: [8, 20, 42],
      initialBatter: 4,
      initialMoney: 0,
      batterCost: 3,
      batterPurchaseAmount: 4,
      pancakeReward: 2,
      pancakePenalty: 0,
      availableIngredients: ["butter"],
      butterCost: 2,
      butterPurchaseAmount: 3,
      initialButter: 0,
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
      cookingTime: 5500,
      ingredientTime: 4250,
      burntTime: 8000,
      timeLimit: 120000,
      orders: [
        { plain: 2, butter: 2 },
        { butter: 3, plain: 2 },
        { plain: 2 },
        { plain: 3, butter: 3 },
        { butter: 4 },
        { plain: 2, butter: 3 },
        { butter: 5, plain: 3 },
        { plain: 1, butter: 6 },
      ],
      starThresholds: [20, 50, 80],
      initialBatter: 4,
      initialMoney: 0,
      batterCost: 4,
      batterPurchaseAmount: 8,
      pancakeReward: 3,
      pancakePenalty: 0,
      availableIngredients: ["butter"],
      butterCost: 2,
      butterPurchaseAmount: 6,
      initialButter: 2,
    },

    5: {
      name: "Ultimate Pancake",
      description: "The final challenge with butter AND bananas!",
      difficulty: "Insane",
      gridLayout: [
        "grill",
        "plate",
        "grill",
        "grill",
        "grill",
        "grill",
        "plate",
        "grill",
        "plate",
      ],
      cookingTime: 5000,
      ingredientTime: 4000,
      burntTime: 7500,
      timeLimit: 180000,
      orders: [
        { banana: 2 },
        { banana: 3, butter: 1 },
        { plain: 1, butter: 2, banana: 1 },
        { banana: 4, butter: 2, plain: 2 },
        { plain: 3, butter: 1, banana: 2 },
        { banana: 2, butter: 4, plain: 3 },
        { plain: 3, butter: 2, banana: 2 },
        { banana: 5, butter: 2, plain: 3 },
      ],
      starThresholds: [30, 60, 120], // thresholds for 1, 2, 3 stars
      initialBatter: 6,
      initialMoney: 0,
      batterCost: 5,
      batterPurchaseAmount: 10,
      pancakeReward: 5,
      pancakePenalty: 0,
      availableIngredients: ["butter", "banana"],
      butterCost: 5,
      butterPurchaseAmount: 3,
      initialButter: 1,
      bananaCost: 1,
      bananaPurchaseAmount: 2,
      initialBanana: 0,
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
      cookingTime: 3750,
      ingredientTime: 3500,
      burntTime: 5250,
      timeLimit: 60000,
      orders: [
        { banana: 1, butter: 1, plain: 1 },
        { plain: 3, butter: 2, banana: 1 },
        { plain: 7, butter: 4, banana: 4 },
        { banana: 7, butter: 5, plain: 4 },
        { plain: 8, butter: 5, banana: 5 },
      ],
      starThresholds: [150, 400, 700], // extremely high thresholds for the intensity
      initialBatter: 0,
      initialMoney: 50,
      batterCost: 10,
      batterPurchaseAmount: 3,
      pancakeReward: 20, // High reward per pancake due to difficulty
      pancakePenalty: 0, // High penalty to match
      availableIngredients: ["butter", "banana"], // all ingredients available
      butterCost: 10,
      butterPurchaseAmount: 2,
      initialButter: 0,
      bananaCost: 20,
      bananaPurchaseAmount: 2,
      initialBanana: 0,
    },
  },

  // Ingredient configurations
  ingredients: {
    butter: {
      name: "Butter",
      icon: "🧈",
      image: "images/item-butter.png",
    },
    banana: {
      name: "Banana",
      icon: "🍌",
      image: "images/item-banana.png",
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
