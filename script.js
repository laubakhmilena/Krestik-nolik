const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const CORNERS = [0, 2, 6, 8];
const SIDES = [1, 3, 5, 7];

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
  playerScoreText: document.getElementById("player-score-text"),
  botScoreText: document.getElementById("bot-score-text"),
  turnText: document.getElementById("turn-text"),
  resultText: document.getElementById("result-text")
};

const boardElement = document.getElementById("game-board");
const toastElement = document.getElementById("game-toast");

const gameState = {
  playerMode: null, // single | friend
  gameType: null, // classic | super
  board: Array(9).fill(null),
  currentTurn: "X",
  isGameOver: false,
  playerSymbol: "X",
  botSymbol: "O",
  startingPlayerToggle: "X", // Человек чередуется X -> O между партиями
  winLine: null,
  score: {
    player: 0,
    bot: 0
  },
  toastHideTimer: null,
  botMoveTimer: null
};

function showScreen(screenElement) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
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

function isSingleClassicMode() {
  return gameState.playerMode === "single" && gameState.gameType === "classic";
}

function updateGameInfo() {
  textFields.gameTitle.textContent = "Крестики-нолики";

  if (isSingleClassicMode()) {
    textFields.playerScoreText.textContent = String(gameState.score.player);
    textFields.botScoreText.textContent = String(gameState.score.bot);
    if (gameState.isGameOver) {
      textFields.turnText.textContent = "Ход: партия завершена";
    } else if (gameState.currentTurn === gameState.botSymbol) {
      textFields.turnText.textContent = `Ход: ${gameState.currentTurn}`;
    } else {
      textFields.turnText.textContent = `Ход: ${gameState.currentTurn} (твой)`;
    }
  } else {
    textFields.playerScoreText.textContent = "0";
    textFields.botScoreText.textContent = "0";
    textFields.turnText.textContent = `Ход: ${gameState.currentTurn}`;
  }
}

function renderBoard() {
  boardElement.innerHTML = "";

  gameState.board.forEach((cellValue, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.textContent = cellValue || "";
    cell.disabled = gameState.isGameOver || Boolean(cellValue) || !isSingleClassicMode();
    cell.setAttribute("aria-label", `Клетка ${index + 1}`);
    cell.addEventListener("click", () => handlePlayerMove(index));

    if (gameState.winLine && gameState.winLine.includes(index)) {
      cell.classList.add("win-cell");
    }

    boardElement.appendChild(cell);
  });
}

function makeMove(index, symbol) {
  if (gameState.board[index] || gameState.isGameOver) {
    return false;
  }

  gameState.board[index] = symbol;
  renderBoard();
  return true;
}

function switchTurn() {
  gameState.currentTurn = gameState.currentTurn === "X" ? "O" : "X";
}

function checkWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        line
      };
    }
  }

  return null;
}

function checkDraw(board) {
  return board.every((cell) => cell !== null);
}

function finishGame(result) {
  gameState.isGameOver = true;
  gameState.winLine = result.line || null;
  renderBoard();

  if (result.type === "win") {
    textFields.resultText.textContent = "Статус: партия завершена";

    if (isSingleClassicMode()) {
      if (result.winner === gameState.playerSymbol) {
        gameState.score.player += 1;
      } else if (result.winner === gameState.botSymbol) {
        gameState.score.bot += 1;
      }
    }
  } else {
    textFields.resultText.textContent = "Статус: партия завершена";
    if (isSingleClassicMode()) {
      gameState.score.player += 1;
      gameState.score.bot += 1;
    }
  }

  updateGameInfo();
  showResultNotification(result);
}

function processRoundStateAfterMove() {
  const winnerInfo = checkWinner(gameState.board);
  if (winnerInfo) {
    finishGame({
      type: "win",
      winner: winnerInfo.winner,
      line: winnerInfo.line
    });
    return true;
  }

  if (checkDraw(gameState.board)) {
    finishGame({ type: "draw" });
    return true;
  }

  switchTurn();
  updateGameInfo();
  return false;
}

function getRandomMoveFrom(candidates) {
  if (!candidates.length) return null;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

function getWinningMoveForSymbol(board, symbol) {
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue;

    const testBoard = [...board];
    testBoard[i] = symbol;
    const winnerInfo = checkWinner(testBoard);
    if (winnerInfo && winnerInfo.winner === symbol) {
      return i;
    }
  }

  return null;
}

function getBestBotMove(board) {
  const winningMove = getWinningMoveForSymbol(board, gameState.botSymbol);
  if (winningMove !== null) return winningMove;

  const blockingMove = getWinningMoveForSymbol(board, gameState.playerSymbol);
  if (blockingMove !== null) return blockingMove;

  if (!board[4]) return 4;

  const freeCorners = CORNERS.filter((index) => !board[index]);
  if (freeCorners.length) return getRandomMoveFrom(freeCorners);

  const freeSides = SIDES.filter((index) => !board[index]);
  return getRandomMoveFrom(freeSides);
}

function botMove() {
  if (!isSingleClassicMode() || gameState.isGameOver || gameState.currentTurn !== gameState.botSymbol) {
    return;
  }

  updateGameInfo();
  const bestMove = getBestBotMove(gameState.board);
  if (bestMove === null || bestMove === undefined) {
    return;
  }

  makeMove(bestMove, gameState.botSymbol);
  processRoundStateAfterMove();
}

function scheduleBotMove(delay = 250) {
  if (gameState.botMoveTimer) {
    clearTimeout(gameState.botMoveTimer);
  }

  gameState.botMoveTimer = setTimeout(() => {
    gameState.botMoveTimer = null;
    botMove();
  }, delay);
}

function clearBotMoveTimer() {
  if (gameState.botMoveTimer) {
    clearTimeout(gameState.botMoveTimer);
    gameState.botMoveTimer = null;
  }
}

function handlePlayerMove(index) {
  if (!isSingleClassicMode() || gameState.isGameOver || gameState.currentTurn !== gameState.playerSymbol) {
    return;
  }

  const moved = makeMove(index, gameState.playerSymbol);
  if (!moved) return;

  const isFinished = processRoundStateAfterMove();
  if (!isFinished) {
    scheduleBotMove();
  }
}

function resetSessionScoreAndRound() {
  gameState.score.player = 0;
  gameState.score.bot = 0;
  gameState.board = Array(9).fill(null);
  gameState.currentTurn = "X";
  gameState.isGameOver = false;
  gameState.winLine = null;
  gameState.playerSymbol = "X";
  gameState.botSymbol = "O";
  gameState.startingPlayerToggle = "X";
  textFields.resultText.textContent = "Статус: Игра продолжается";
  clearBotMoveTimer();
  hideGameToast();
  updateGameInfo();
  renderBoard();
}

function setupClassicSingleRound() {
  clearBotMoveTimer();
  gameState.board = Array(9).fill(null);
  gameState.isGameOver = false;
  gameState.winLine = null;

  gameState.playerSymbol = gameState.startingPlayerToggle;
  gameState.botSymbol = gameState.playerSymbol === "X" ? "O" : "X";
  gameState.currentTurn = "X";

  gameState.startingPlayerToggle = gameState.startingPlayerToggle === "X" ? "O" : "X";

  textFields.resultText.textContent = "Статус: Игра продолжается";
  hideGameToast();
  updateGameInfo();
  renderBoard();
  showTurnNotification();

  if (gameState.currentTurn === gameState.botSymbol) {
    scheduleBotMove();
  }
}

function setupUnsupportedModeRound() {
  clearBotMoveTimer();
  gameState.board = Array(9).fill(null);
  gameState.currentTurn = "X";
  gameState.isGameOver = true;
  gameState.winLine = null;
  textFields.resultText.textContent = "Статус: режим в разработке";
  hideGameToast();
  updateGameInfo();
  renderBoard();
}

function hideGameToast() {
  if (gameState.toastHideTimer) {
    clearTimeout(gameState.toastHideTimer);
    gameState.toastHideTimer = null;
  }

  toastElement.classList.remove("show", "toast-turn", "toast-win", "toast-loss", "toast-draw");
  toastElement.textContent = "";
}

function showGameToast(message, type = "turn", autoHide = true) {
  if (!toastElement) return;

  if (gameState.toastHideTimer) {
    clearTimeout(gameState.toastHideTimer);
    gameState.toastHideTimer = null;
  }

  toastElement.textContent = message;
  toastElement.classList.remove("toast-turn", "toast-win", "toast-loss", "toast-draw");
  toastElement.classList.add("show", `toast-${type}`);

  if (autoHide) {
    gameState.toastHideTimer = setTimeout(() => {
      toastElement.classList.remove("show");
      gameState.toastHideTimer = null;
    }, 1500);
  }
}

function showTurnNotification() {
  if (!isSingleClassicMode()) return;

  if (gameState.currentTurn === gameState.playerSymbol) {
    showGameToast("Твой ход", "turn", true);
  } else {
    showGameToast("Первым ходит бот", "turn", true);
  }
}

function showResultNotification(result) {
  if (result.type === "draw") {
    showGameToast("Ничья. Игра завершена", "draw", false);
    return;
  }

  if (isSingleClassicMode() && result.winner === gameState.playerSymbol) {
    showGameToast("Ты победил", "win", false);
  } else if (isSingleClassicMode() && result.winner === gameState.botSymbol) {
    showGameToast("Победил бот", "loss", false);
  } else {
    showGameToast(`Победил ${result.winner}`, "turn", false);
  }
}

function startNewGame() {
  if (isSingleClassicMode()) {
    setupClassicSingleRound();
    return;
  }

  setupUnsupportedModeRound();
}

buttons.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    gameState.playerMode = button.dataset.mode;
    showScreen(screens.gameTypeMenu);
    updateGameInfo();
  });
});

buttons.gameButtons.forEach((button) => {
  button.addEventListener("click", () => {
    gameState.gameType = button.dataset.game;
    showScreen(screens.gameScreen);
    startNewGame();
  });
});

buttons.backToMain.addEventListener("click", () => {
  hideGameToast();
  showScreen(screens.mainMenu);
});

buttons.backToTypes.addEventListener("click", () => {
  resetSessionScoreAndRound();
  showScreen(screens.gameTypeMenu);
});

buttons.restartGame.addEventListener("click", () => {
  startNewGame();
});

updateGameInfo();
renderBoard();
