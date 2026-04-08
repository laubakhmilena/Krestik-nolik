const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const startScreen = document.getElementById("startScreen");
const menuScreen = document.getElementById("menuScreen");
const friendModeBtn = document.getElementById("friendModeBtn");
const botModeBtn = document.getElementById("botModeBtn");
const botDifficultyScreen = document.getElementById("botDifficultyScreen");
const easyLevelBtn = document.getElementById("easyLevelBtn");
const mediumLevelBtn = document.getElementById("mediumLevelBtn");
const hardLevelBtn = document.getElementById("hardLevelBtn");
const botDifficultyBackBtn = document.getElementById("botDifficultyBackBtn");
const friendGameScreen = document.getElementById("friendGameScreen");
const board = document.getElementById("board");
const statusText = document.getElementById("statusText");
const statusPanel = document.getElementById("statusPanel");
const statusHint = document.getElementById("statusHint");
const scoreXText = document.getElementById("scoreX");
const scoreOText = document.getElementById("scoreO");
const scoreDrawsText = document.getElementById("scoreDraws");
const restartBtn = document.getElementById("restartBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");
const botGameScreen = document.getElementById("botGameScreen");
const botBoard = document.getElementById("botBoard");
const botDifficultyLabel = document.getElementById("botDifficultyLabel");
const botStatusPanel = document.getElementById("botStatusPanel");
const botStatusText = document.getElementById("botStatusText");
const botStatusHint = document.getElementById("botStatusHint");
const botScoreXText = document.getElementById("botScoreX");
const botScoreOText = document.getElementById("botScoreO");
const botScoreDrawsText = document.getElementById("botScoreDraws");
const botRestartBtn = document.getElementById("botRestartBtn");
const botChangeDifficultyBtn = document.getElementById("botChangeDifficultyBtn");
const botBackToMenuBtn = document.getElementById("botBackToMenuBtn");
const botResetScoreBtn = document.getElementById("botResetScoreBtn");
const orientationOverlay = document.getElementById("orientationOverlay");
const modalOverlay = document.getElementById("modalOverlay");
const exitConfirmModal = document.getElementById("exitConfirmModal");
const confirmExitBtn = document.getElementById("confirmExitBtn");
const cancelExitBtn = document.getElementById("cancelExitBtn");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const BOT_THINK_DELAY_MS = 450;
const difficultyMeta = {
  easy: { label: "Легко" },
  medium: { label: "Средне" },
  hard: { label: "Сложно" },
};

let pendingExitTarget = null;

const friendGame = {
  boardEl: board,
  state: Array(9).fill(""),
  currentPlayer: "X",
  isFinished: false,
  winningLine: null,
  scores: { X: 0, O: 0, draws: 0 },
};

const botGame = {
  boardEl: botBoard,
  state: Array(9).fill(""),
  isFinished: false,
  winningLine: null,
  scores: { player: 0, bot: 0, draws: 0 },
  difficulty: "easy",
  playerSymbol: "X",
  botSymbol: "O",
  turn: "player",
  isBotThinking: false,
  botTurnTimeoutId: null,
};

function disablePageScrollGestures() {
  const preventScroll = (event) => {
    event.preventDefault();
  };

  document.addEventListener("touchmove", preventScroll, { passive: false });
  document.addEventListener("wheel", preventScroll, { passive: false });
}

function isPortraitOrientation() {
  const byMedia = window.matchMedia?.("(orientation: portrait)").matches;
  const byViewport = window.innerHeight >= window.innerWidth;
  return byMedia ?? byViewport;
}

function updateOrientationState() {
  const portrait = isPortraitOrientation();

  if (!orientationOverlay) {
    return;
  }

  orientationOverlay.classList.toggle("hidden", portrait);
  orientationOverlay.setAttribute("aria-hidden", portrait ? "true" : "false");
}

function focusScreenPrimaryAction(screen) {
  if (!screen) {
    return;
  }

  const actionSelectorByScreen = {
    startScreen: "#startBtn",
    menuScreen: "#friendModeBtn",
    friendGameScreen: "#board .cell:not([disabled])",
    botDifficultyScreen: "#easyLevelBtn",
    botGameScreen: "#botBoard .cell:not([disabled])",
  };

  const actionSelector = actionSelectorByScreen[screen.id];

  if (!actionSelector) {
    return;
  }

  const actionElement = screen.querySelector(actionSelector);

  if (actionElement instanceof HTMLElement) {
    actionElement.focus({ preventScroll: true });
  }
}

function showScreen(screenToShow) {
  const screens = [startScreen, menuScreen, botDifficultyScreen, friendGameScreen, botGameScreen];

  screens.forEach((screen) => {
    if (!screen) {
      return;
    }

    screen.classList.toggle("hidden", screen !== screenToShow);
  });

  closeExitConfirmModal();
  focusScreenPrimaryAction(screenToShow);
}

function closeExitConfirmModal() {
  pendingExitTarget = null;

  if (!modalOverlay) {
    return;
  }

  modalOverlay.classList.add("hidden");
  modalOverlay.setAttribute("aria-hidden", "true");
}

function openExitConfirmModal(targetScreen) {
  pendingExitTarget = targetScreen;

  if (!modalOverlay) {
    return;
  }

  modalOverlay.classList.remove("hidden");
  modalOverlay.setAttribute("aria-hidden", "false");
  cancelExitBtn?.focus({ preventScroll: true });
}

function leaveGameTo(screen) {
  stopBotTurnTimer();
  closeExitConfirmModal();
  showScreen(screen);
}

function getAvailableMoves(state) {
  return state.flatMap((cell, index) => (cell ? [] : [index]));
}

function getWinnerForState(state) {
  const line = winningLines.find((combination) => {
    const [a, b, c] = combination;
    return state[a] && state[a] === state[b] && state[b] === state[c];
  });

  if (!line) {
    return null;
  }

  return {
    winner: state[line[0]],
    line,
  };
}

function highlightWinnerCells(boardEl, line) {
  if (!boardEl || !Array.isArray(line)) {
    return;
  }

  const cells = boardEl.querySelectorAll(".cell");
  line.forEach((index) => {
    const cell = cells[index];

    if (cell) {
      cell.classList.add("winner-cell");
    }
  });
}

function lockBoard(boardEl) {
  if (!boardEl) {
    return;
  }

  boardEl.querySelectorAll(".cell").forEach((cell) => {
    cell.disabled = true;
  });
}

function unlockBoard(boardEl, state) {
  if (!boardEl) {
    return;
  }

  boardEl.querySelectorAll(".cell").forEach((cell) => {
    const index = Number(cell.dataset.index);
    cell.disabled = Boolean(state[index]);
  });
}

function updateStatus(panelEl, textEl, hintEl, message, hint = "Сделайте ход на поле 3×3") {
  if (textEl) {
    textEl.textContent = message;
  }

  if (panelEl) {
    const isWin = message.startsWith("Победил") || message.startsWith("Победили");
    const isDraw = message === "Ничья";
    const isThinking = message === "Бот думает...";

    panelEl.dataset.state = isWin ? "win" : isDraw ? "draw" : isThinking ? "thinking" : "turn";
  }

  if (hintEl) {
    hintEl.textContent = hint;
  }
}

function refreshFriendScores() {
  if (scoreXText) scoreXText.textContent = String(friendGame.scores.X);
  if (scoreOText) scoreOText.textContent = String(friendGame.scores.O);
  if (scoreDrawsText) scoreDrawsText.textContent = String(friendGame.scores.draws);
}

function refreshBotScores() {
  if (botScoreXText) botScoreXText.textContent = String(botGame.scores.player);
  if (botScoreOText) botScoreOText.textContent = String(botGame.scores.bot);
  if (botScoreDrawsText) botScoreDrawsText.textContent = String(botGame.scores.draws);
}

function resetFriendBoard() {
  friendGame.state = Array(9).fill("");
  friendGame.currentPlayer = "X";
  friendGame.isFinished = false;
  friendGame.winningLine = null;

  if (board) {
    board.querySelectorAll(".cell").forEach((cell) => {
      cell.textContent = "";
      cell.disabled = false;
      cell.classList.remove("winner-cell");
    });
  }

  updateStatus(statusPanel, statusText, statusHint, "Ход: X");

  if (friendGameScreen) {
    friendGameScreen.dataset.matchState = "active";
  }

  restartBtn?.classList.remove("game-over");
}

function resetFriendScores() {
  friendGame.scores = { X: 0, O: 0, draws: 0 };
  refreshFriendScores();
}

function finishFriendGame(message, line = null) {
  friendGame.isFinished = true;
  friendGame.winningLine = line;

  if (line) {
    highlightWinnerCells(board, line);
  }

  lockBoard(board);
  updateStatus(
    statusPanel,
    statusText,
    statusHint,
    message,
    message === "Ничья"
      ? "Ничья. Попробуйте ещё раз в новой партии."
      : "Партия завершена. Нажмите «Играть снова», чтобы начать новую."
  );

  if (friendGameScreen) {
    friendGameScreen.dataset.matchState = "finished";
  }

  restartBtn?.classList.add("game-over");
}

function handleFriendCellClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLButtonElement) || !target.classList.contains("cell")) {
    return;
  }

  const index = Number(target.dataset.index);

  if (friendGame.isFinished || friendGame.state[index]) {
    return;
  }

  friendGame.state[index] = friendGame.currentPlayer;
  target.textContent = friendGame.currentPlayer;
  target.disabled = true;

  const winnerResult = getWinnerForState(friendGame.state);
  if (winnerResult) {
    friendGame.scores[winnerResult.winner] += 1;
    refreshFriendScores();
    finishFriendGame(`Победил ${winnerResult.winner}`, winnerResult.line);
    return;
  }

  if (getAvailableMoves(friendGame.state).length === 0) {
    friendGame.scores.draws += 1;
    refreshFriendScores();
    finishFriendGame("Ничья");
    return;
  }

  friendGame.currentPlayer = friendGame.currentPlayer === "X" ? "O" : "X";
  updateStatus(statusPanel, statusText, statusHint, `Ход: ${friendGame.currentPlayer}`);
}

function stopBotTurnTimer() {
  if (botGame.botTurnTimeoutId) {
    clearTimeout(botGame.botTurnTimeoutId);
    botGame.botTurnTimeoutId = null;
  }

  botGame.isBotThinking = false;
}

function updateDifficultyLabel() {
  const level = botGame.difficulty;
  const label = difficultyMeta[level].label;

  if (botDifficultyLabel) {
    botDifficultyLabel.textContent = `Сложность: ${label}`;
    botDifficultyLabel.dataset.level = level;
  }
}

function getWinningMove(state, player) {
  const availableMoves = getAvailableMoves(state);

  for (const move of availableMoves) {
    const nextState = [...state];
    nextState[move] = player;

    if (getWinnerForState(nextState)?.winner === player) {
      return move;
    }
  }

  return null;
}

function getBlockingMove(state, botSymbol, playerSymbol) {
  const winningPlayerMove = getWinningMove(state, playerSymbol);

  if (winningPlayerMove === null) {
    return null;
  }

  const forcedState = [...state];
  forcedState[winningPlayerMove] = botSymbol;
  return forcedState[winningPlayerMove] === botSymbol ? winningPlayerMove : null;
}

function pickRandomMove(moves) {
  if (!moves.length) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex];
}

function getPrioritizedMove(state) {
  const availableMoves = getAvailableMoves(state);

  if (availableMoves.includes(4)) {
    return 4;
  }

  const corners = [0, 2, 6, 8].filter((move) => availableMoves.includes(move));
  if (corners.length > 0) {
    return pickRandomMove(corners);
  }

  return pickRandomMove(availableMoves);
}

function minimax(state, currentSymbol, botSymbol, playerSymbol, depth = 0) {
  const winner = getWinnerForState(state)?.winner;

  if (winner === botSymbol) {
    return { score: 10 - depth, move: null };
  }

  if (winner === playerSymbol) {
    return { score: depth - 10, move: null };
  }

  const availableMoves = getAvailableMoves(state);

  if (availableMoves.length === 0) {
    return { score: 0, move: null };
  }

  const isMaximizing = currentSymbol === botSymbol;
  let bestResult = {
    score: isMaximizing ? -Infinity : Infinity,
    move: availableMoves[0],
  };

  for (const move of availableMoves) {
    const nextState = [...state];
    nextState[move] = currentSymbol;

    const result = minimax(
      nextState,
      currentSymbol === botSymbol ? playerSymbol : botSymbol,
      botSymbol,
      playerSymbol,
      depth + 1
    );

    if (isMaximizing && result.score > bestResult.score) {
      bestResult = { score: result.score, move };
    }

    if (!isMaximizing && result.score < bestResult.score) {
      bestResult = { score: result.score, move };
    }
  }

  return bestResult;
}

function getBestMove(state, botSymbol, playerSymbol) {
  return minimax(state, botSymbol, botSymbol, playerSymbol).move;
}

function getSmartMoveByDifficulty(level, state, botSymbol, playerSymbol) {
  const winningMove = getWinningMove(state, botSymbol);
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = getBlockingMove(state, botSymbol, playerSymbol);

  if (level === "easy") {
    if (blockingMove !== null && Math.random() < 0.7) {
      return blockingMove;
    }

    const availableMoves = getAvailableMoves(state);
    const centerOrCorner = [4, 0, 2, 6, 8].filter((index) => availableMoves.includes(index));

    return Math.random() < 0.45 && centerOrCorner.length > 0
      ? pickRandomMove(centerOrCorner)
      : pickRandomMove(availableMoves);
  }

  if (level === "medium") {
    if (blockingMove !== null) {
      return blockingMove;
    }

    return getPrioritizedMove(state);
  }

  if (blockingMove !== null) {
    return blockingMove;
  }

  return getBestMove(state, botSymbol, playerSymbol);
}

function setBotBoardInteractive(isInteractive) {
  if (!botBoard) {
    return;
  }

  if (!isInteractive) {
    lockBoard(botBoard);
    return;
  }

  unlockBoard(botBoard, botGame.state);
}

function finishBotGame(resultMessage, line = null) {
  botGame.isFinished = true;
  botGame.winningLine = line;
  stopBotTurnTimer();

  if (line) {
    highlightWinnerCells(botBoard, line);
  }

  lockBoard(botBoard);
  updateStatus(
    botStatusPanel,
    botStatusText,
    botStatusHint,
    resultMessage,
    resultMessage === "Ничья"
      ? "Ничья. Попробуйте другую стратегию."
      : "Партия завершена. Нажмите «Играть снова», чтобы начать новую."
  );

  if (botGameScreen) {
    botGameScreen.dataset.matchState = "finished";
  }

  botRestartBtn?.classList.add("game-over");
}

function applyBotMove() {
  if (botGame.isFinished || botGame.turn !== "bot" || botGame.isBotThinking) {
    return;
  }

  botGame.isBotThinking = true;
  updateStatus(botStatusPanel, botStatusText, botStatusHint, "Бот думает...", "Подождите, бот выбирает ход");
  setBotBoardInteractive(false);

  botGame.botTurnTimeoutId = window.setTimeout(() => {
    botGame.botTurnTimeoutId = null;

    if (botGame.isFinished || botGame.turn !== "bot") {
      botGame.isBotThinking = false;
      return;
    }

    const move = getSmartMoveByDifficulty(
      botGame.difficulty,
      botGame.state,
      botGame.botSymbol,
      botGame.playerSymbol
    );

    if (move === null || botGame.state[move]) {
      botGame.isBotThinking = false;
      return;
    }

    botGame.state[move] = botGame.botSymbol;

    const cell = botBoard?.querySelector(`.cell[data-index="${move}"]`);
    if (cell) {
      cell.textContent = botGame.botSymbol;
      cell.disabled = true;
    }

    const winner = getWinnerForState(botGame.state);
    if (winner) {
      botGame.scores.bot += 1;
      refreshBotScores();
      finishBotGame("Победил бот", winner.line);
      return;
    }

    if (getAvailableMoves(botGame.state).length === 0) {
      botGame.scores.draws += 1;
      refreshBotScores();
      finishBotGame("Ничья");
      return;
    }

    botGame.isBotThinking = false;
    botGame.turn = "player";
    setBotBoardInteractive(true);
    updateStatus(
      botStatusPanel,
      botStatusText,
      botStatusHint,
      `Ваш ход: ${botGame.playerSymbol}`,
      "Сделайте ход на поле 3×3"
    );
  }, BOT_THINK_DELAY_MS);
}

function resetBotBoard({ keepStarter = false } = {}) {
  stopBotTurnTimer();

  botGame.state = Array(9).fill("");
  botGame.isFinished = false;
  botGame.winningLine = null;

  if (!keepStarter) {
    const botStarts = Math.random() < 0.5;
    botGame.turn = botStarts ? "bot" : "player";
  }

  if (botBoard) {
    botBoard.querySelectorAll(".cell").forEach((cell) => {
      cell.textContent = "";
      cell.disabled = false;
      cell.classList.remove("winner-cell");
    });
  }

  if (botGameScreen) {
    botGameScreen.dataset.matchState = "active";
  }

  botRestartBtn?.classList.remove("game-over");
  updateDifficultyLabel();

  if (botGame.turn === "player") {
    setBotBoardInteractive(true);
    updateStatus(
      botStatusPanel,
      botStatusText,
      botStatusHint,
      `Ваш ход: ${botGame.playerSymbol}`,
      "Сделайте ход на поле 3×3"
    );
  } else {
    setBotBoardInteractive(false);
    updateStatus(botStatusPanel, botStatusText, botStatusHint, "Бот думает...", "Бот начинает партию");
    applyBotMove();
  }
}

function resetBotScores() {
  botGame.scores = { player: 0, bot: 0, draws: 0 };
  refreshBotScores();
}

function handleBotCellClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLButtonElement) || !target.classList.contains("cell")) {
    return;
  }

  const index = Number(target.dataset.index);

  if (botGame.isFinished || botGame.isBotThinking || botGame.turn !== "player" || botGame.state[index]) {
    return;
  }

  botGame.state[index] = botGame.playerSymbol;
  target.textContent = botGame.playerSymbol;
  target.disabled = true;

  const winner = getWinnerForState(botGame.state);
  if (winner) {
    botGame.scores.player += 1;
    refreshBotScores();
    finishBotGame("Победили вы", winner.line);
    return;
  }

  if (getAvailableMoves(botGame.state).length === 0) {
    botGame.scores.draws += 1;
    refreshBotScores();
    finishBotGame("Ничья");
    return;
  }

  botGame.turn = "bot";
  applyBotMove();
}

function isFriendMatchInProgress() {
  return !friendGame.isFinished && friendGame.state.some((cell) => cell !== "");
}

function isBotMatchInProgress() {
  return !botGame.isFinished && botGame.state.some((cell) => cell !== "");
}

function openBotGameWithDifficulty(level) {
  botGame.difficulty = level;
  resetBotBoard();
  showScreen(botGameScreen);
}

if (startBtn && backBtn) {
  startBtn.addEventListener("click", () => {
    showScreen(menuScreen);
  });

  backBtn.addEventListener("click", () => {
    showScreen(startScreen);
  });
}

friendModeBtn?.addEventListener("click", () => {
  resetFriendBoard();
  showScreen(friendGameScreen);
});

botModeBtn?.addEventListener("click", () => {
  showScreen(botDifficultyScreen);
});

easyLevelBtn?.addEventListener("click", () => openBotGameWithDifficulty("easy"));
mediumLevelBtn?.addEventListener("click", () => openBotGameWithDifficulty("medium"));
hardLevelBtn?.addEventListener("click", () => openBotGameWithDifficulty("hard"));

botDifficultyBackBtn?.addEventListener("click", () => {
  showScreen(menuScreen);
});

backToMenuBtn?.addEventListener("click", () => {
  if (isFriendMatchInProgress()) {
    openExitConfirmModal(menuScreen);
    return;
  }

  leaveGameTo(menuScreen);
});

botBackToMenuBtn?.addEventListener("click", () => {
  if (isBotMatchInProgress()) {
    openExitConfirmModal(menuScreen);
    return;
  }

  leaveGameTo(menuScreen);
});

botChangeDifficultyBtn?.addEventListener("click", () => {
  if (isBotMatchInProgress()) {
    openExitConfirmModal(botDifficultyScreen);
    return;
  }

  leaveGameTo(botDifficultyScreen);
});

restartBtn?.addEventListener("click", resetFriendBoard);
botRestartBtn?.addEventListener("click", () => resetBotBoard({ keepStarter: false }));

resetScoreBtn?.addEventListener("click", resetFriendScores);
botResetScoreBtn?.addEventListener("click", resetBotScores);

board?.addEventListener("click", handleFriendCellClick);
botBoard?.addEventListener("click", handleBotCellClick);

cancelExitBtn?.addEventListener("click", closeExitConfirmModal);

confirmExitBtn?.addEventListener("click", () => {
  leaveGameTo(pendingExitTarget ?? menuScreen);
});

modalOverlay?.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeExitConfirmModal();
  }
});

exitConfirmModal?.addEventListener("click", (event) => {
  event.stopPropagation();
});

window.addEventListener("resize", updateOrientationState);
window.addEventListener("orientationchange", updateOrientationState);
window.addEventListener("DOMContentLoaded", updateOrientationState);

disablePageScrollGestures();
updateOrientationState();
resetFriendBoard();
resetFriendScores();
resetBotScores();
updateDifficultyLabel();
showScreen(startScreen);
