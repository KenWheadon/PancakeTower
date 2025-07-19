// Game Configuration
const GAME_CONFIG = {
  // Loading configuration
  MINIMUM_LOADING_TIME: 3000, // Minimum time in milliseconds for loading screen

  // Audio configuration
  audio: {
    backgroundTracks: {
      main: "audio/main.mp3",
      level1: "audio/level1.mp3",
      level2: "audio/level2.mp3",
      level3: "audio/level3.mp3",
      level4: "audio/level4.mp3",
      level5: "audio/level5.mp3",
      level6: "audio/level6.mp3",
    },
    soundEffects: {
      levelComplete: "audio/level-complete.mp3",
      orderServed: "audio/order-served.mp3",
      batterDropped: "audio/batter-dropped-on-grill.mp3",
      pancakeCooked: "audio/pancake-cooked.mp3",
      startLevel: "audio/start-level.mp3",
      buttonClick: "audio/button-click.mp3",
      buttonHover: "audio/button-hover.mp3",
      placePancake: "audio/place-pancake-on-plate.mp3",
      comboEarned: "audio/combo-earned.mp3",
      earnMoney: "audio/earn-money.mp3",
      timeWarning15: "audio/15-second-time-warning.mp3",
      timeTicking: "audio/last-10-seconds-ticking.mp3",
      burnt1: "audio/burnt-1.mp3",
      burnt2: "audio/burnt-2.mp3",
      burnt3: "audio/burnt-3.mp3",
    },
    defaultVolumes: {
      music: 0.7,
      sfx: 0.8,
    },
  },

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
      starThresholds: [25, 150, 300],
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
      description: "Master level challenge and this time there's butter!",
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
      timeLimit: 120000,
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
      starThresholds: [100, 300, 600], // thresholds for 1, 2, 3 stars
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
      initialBanana: 2,
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
        { plain: 2, butter: 2, banana: 5 },
        { plain: 1, butter: 6, banana: 3 },
        { banana: 2, butter: 5 },
        { plain: 2, butter: 3, banana: 1 },
      ],
      starThresholds: [125, 200, 400],
      initialBatter: 0,
      initialMoney: 50,
      batterCost: 10,
      batterPurchaseAmount: 3,
      pancakeReward: 10,
      pancakePenalty: 0,
      availableIngredients: ["butter", "banana"],
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
