class StartScreen {
  constructor(gameInstance) {
    this.game = gameInstance;
  }

  show() {
    // Hide all screens and show start screen
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("levelSelectScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("htpPopup").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
  }
}
