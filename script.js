const screens = {
  mainMenu: document.getElementById("main-menu"),
  gameTypeMenu: document.getElementById("game-type-menu"),
  gameScreen: document.getElementById("game-screen")
};

const buttons = {
  modeButtons: document.querySelectorAll("[data-mode]"),
  gameButtons: document.querySelectorAll("[data-game]"),
  backToMain: document.getElementById("back-to-main"),
  backToTypes: document.getElementById("back-to-types"),
  restartGame: document.getElementById("restart-game")
};

const textFields = {
  gameTitle: document.getElementById("game-title"),
  playerModeText: document.getElementById("player-mode-text"),
  gameTypeText: document.getElementById("game-type-text"),
  turnText: document.getElementById("turn-text")
};

const gameState = {
  playerMode: null, // single | friend
  gameType: null,   // classic | super
  currentTurn: "X"
};

function showScreen(screenElement) {
  Object.values(screens).forEach(screen => {
    screen.classList.remove("active");
  });

  screenElement.classList.add("active");
}

function getPlayerModeLabel(mode) {
  if (mode === "single") return "Играть одному";
  if (mode === "friend") return "Играть с другом";
  return "—";
}

function getGameTypeLabel(type) {
  if (type === "classic") return "Обычные крестики-нолики";
  if (type === "super") return "Супер крестики-нолики";
  return "—";
}

function updateGameInfo() {
  textFields.playerModeText.textContent = `Режим: ${getPlayerModeLabel(gameState.playerMode)}`;
  textFields.gameTypeText.textContent = `Тип игры: ${getGameTypeLabel(gameState.gameType)}`;
  textFields.turnText.textContent = `Ход: ${gameState.currentTurn}`;

  if (gameState.gameType === "classic") {
    textFields.gameTitle.textContent = "Обычные крестики-нолики";
  } else if (gameState.gameType === "super") {
    textFields.gameTitle.textContent = "Супер крестики-нолики";
  } else {
    textFields.gameTitle.textContent = "Крестики-нолики";
  }
}

function resetGameState() {
  gameState.currentTurn = "X";
  updateGameInfo();
}

buttons.modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    gameState.playerMode = button.dataset.mode;
    showScreen(screens.gameTypeMenu);
  });
});

buttons.gameButtons.forEach(button => {
  button.addEventListener("click", () => {
    gameState.gameType = button.dataset.game;
    resetGameState();
    showScreen(screens.gameScreen);
  });
});

buttons.backToMain.addEventListener("click", () => {
  showScreen(screens.mainMenu);
});

buttons.backToTypes.addEventListener("click", () => {
  showScreen(screens.gameTypeMenu);
});

buttons.restartGame.addEventListener("click", () => {
  resetGameState();
});

updateGameInfo();