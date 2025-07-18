class StartScreen {
  constructor(gameInstance) {
    this.game = gameInstance;
  }

  show() {
    this.game.gameState = "start";
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
    document.getElementById("levelSelectScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("htpPopup").classList.add("hidden");
  }
}
