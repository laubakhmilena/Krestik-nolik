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
  playerModeText: document.getElementById("player-mode-text"),
  gameTypeText: document.getElementById("game-type-text"),
  playerSymbolText: document.getElementById("player-symbol-text"),
  botSymbolText: document.getElementById("bot-symbol-text"),
  turnText: document.getElementById("turn-text"),
  resultText: document.getElementById("result-text"),
  winsCount: document.getElementById("wins-count"),
  lossesCount: document.getElementById("losses-count"),
  drawsCount: document.getElementById("draws-count")
};

const boardElement = document.getElementById("game-board");

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
  stats: {
    wins: 0,
    losses: 0,
    draws: 0
  }
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
  textFields.playerModeText.textContent = getPlayerModeLabel(gameState.playerMode);
  textFields.gameTypeText.textContent = getGameTypeLabel(gameState.gameType);

  if (gameState.gameType === "classic") {
    textFields.gameTitle.textContent = "Обычные крестики-нолики";
  } else if (gameState.gameType === "super") {
    textFields.gameTitle.textContent = "Супер крестики-нолики";
  } else {
    textFields.gameTitle.textContent = "Крестики-нолики";
  }

  if (isSingleClassicMode()) {
    textFields.playerSymbolText.textContent = gameState.playerSymbol;
    textFields.botSymbolText.textContent = gameState.botSymbol;
    textFields.turnText.textContent = gameState.isGameOver
      ? "Ход: партия завершена"
      : `Ход: ${gameState.currentTurn}`;
  } else {
    textFields.playerSymbolText.textContent = "—";
    textFields.botSymbolText.textContent = "—";
    textFields.turnText.textContent = `Ход: ${gameState.currentTurn}`;
  }

  textFields.winsCount.textContent = String(gameState.stats.wins);
  textFields.lossesCount.textContent = String(gameState.stats.losses);
  textFields.drawsCount.textContent = String(gameState.stats.draws);
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
    textFields.resultText.textContent = `Результат: победил ${result.winner}`;

    if (isSingleClassicMode()) {
      if (result.winner === gameState.playerSymbol) {
        gameState.stats.wins += 1;
      } else if (result.winner === gameState.botSymbol) {
        gameState.stats.losses += 1;
      }
    }
  } else {
    textFields.resultText.textContent = "Результат: ничья";
    if (isSingleClassicMode()) {
      gameState.stats.draws += 1;
    }
  }

  updateGameInfo();
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

  const bestMove = getBestBotMove(gameState.board);
  if (bestMove === null || bestMove === undefined) {
    return;
  }

  makeMove(bestMove, gameState.botSymbol);
  processRoundStateAfterMove();
}

function handlePlayerMove(index) {
  if (!isSingleClassicMode() || gameState.isGameOver || gameState.currentTurn !== gameState.playerSymbol) {
    return;
  }

  const moved = makeMove(index, gameState.playerSymbol);
  if (!moved) return;

  const isFinished = processRoundStateAfterMove();
  if (!isFinished) {
    setTimeout(botMove, 250);
  }
}

function setupClassicSingleRound() {
  gameState.board = Array(9).fill(null);
  gameState.isGameOver = false;
  gameState.winLine = null;

  gameState.playerSymbol = gameState.startingPlayerToggle;
  gameState.botSymbol = gameState.playerSymbol === "X" ? "O" : "X";
  gameState.currentTurn = "X";

  gameState.startingPlayerToggle = gameState.startingPlayerToggle === "X" ? "O" : "X";

  textFields.resultText.textContent = "Статус: Игра продолжается";
  updateGameInfo();
  renderBoard();

  if (gameState.currentTurn === gameState.botSymbol) {
    setTimeout(botMove, 250);
  }
}

function setupUnsupportedModeRound() {
  gameState.board = Array(9).fill(null);
  gameState.currentTurn = "X";
  gameState.isGameOver = true;
  gameState.winLine = null;
  textFields.resultText.textContent = "Статус: режим в разработке";
  updateGameInfo();
  renderBoard();
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
  showScreen(screens.mainMenu);
});

buttons.backToTypes.addEventListener("click", () => {
  showScreen(screens.gameTypeMenu);
});

buttons.restartGame.addEventListener("click", () => {
  startNewGame();
});

updateGameInfo();
renderBoard();
