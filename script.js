const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const startScreen = document.getElementById("startScreen");
const menuScreen = document.getElementById("menuScreen");
const friendModeBtn = document.getElementById("friendModeBtn");
const botModeBtn = document.getElementById("botModeBtn");
const friendGameScreen = document.getElementById("friendGameScreen");
const botGameScreen = document.getElementById("botGameScreen");
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

const gameModes = {
  friend: {
    key: "friend",
    screen: friendGameScreen,
    board: document.getElementById("board"),
    statusPanel: document.getElementById("statusPanel"),
    statusText: document.getElementById("statusText"),
    statusHint: document.getElementById("statusHint"),
    restartBtn: document.getElementById("restartBtn"),
    backToMenuBtn: document.getElementById("backToMenuBtn"),
    resetScoreBtn: document.getElementById("resetScoreBtn"),
    scoreXText: document.getElementById("scoreX"),
    scoreOText: document.getElementById("scoreO"),
    scoreDrawsText: document.getElementById("scoreDraws"),
    initialStatus: "Ход: X",
    initialHint: "Сделайте ход на поле 3×3",
    boardState: Array(9).fill(""),
    currentPlayer: "X",
    isGameFinished: false,
    isBotThinking: false,
    botMoveTimerId: null,
    scores: { X: 0, O: 0, draws: 0 },
  },
  bot: {
    key: "bot",
    screen: botGameScreen,
    board: document.getElementById("botBoard"),
    statusPanel: document.getElementById("botStatusPanel"),
    statusText: document.getElementById("botStatusText"),
    statusHint: document.getElementById("botStatusHint"),
    restartBtn: document.getElementById("botRestartBtn"),
    backToMenuBtn: document.getElementById("botBackToMenuBtn"),
    resetScoreBtn: document.getElementById("botResetScoreBtn"),
    scoreXText: document.getElementById("botScoreX"),
    scoreOText: document.getElementById("botScoreO"),
    scoreDrawsText: document.getElementById("botScoreDraws"),
    initialStatus: "Ваш ход: X",
    initialHint: "Сделайте ход, затем бот ответит",
    boardState: Array(9).fill(""),
    currentPlayer: "X",
    isGameFinished: false,
    isBotThinking: false,
    botMoveTimerId: null,
    scores: { X: 0, O: 0, draws: 0 },
  },
};

let currentGameModeKey = null;
let pendingExitModeKey = null;

function disablePageScrollGestures() {
  const preventScroll = (event) => {
    event.preventDefault();
  };

  document.addEventListener("touchmove", preventScroll, { passive: false });
  document.addEventListener("wheel", preventScroll, { passive: false });
}

function closeExitConfirmModal() {
  if (!modalOverlay) {
    return;
  }

  modalOverlay.classList.add("hidden");
  modalOverlay.setAttribute("aria-hidden", "true");
}

function openExitConfirmModal(modeKey) {
  if (!modalOverlay) {
    return;
  }

  pendingExitModeKey = modeKey;
  modalOverlay.classList.remove("hidden");
  modalOverlay.setAttribute("aria-hidden", "false");
  cancelExitBtn?.focus({ preventScroll: true });
}

function cancelPendingBotMove(mode) {
  if (!mode || !mode.botMoveTimerId) {
    return;
  }

  window.clearTimeout(mode.botMoveTimerId);
  mode.botMoveTimerId = null;
  mode.isBotThinking = false;
}

function leaveGameToMenu() {
  if (pendingExitModeKey && gameModes[pendingExitModeKey]) {
    cancelPendingBotMove(gameModes[pendingExitModeKey]);
  }

  pendingExitModeKey = null;
  closeExitConfirmModal();
  showScreen(menuScreen);
}

function focusScreenPrimaryAction(screen) {
  if (!screen) {
    return;
  }

  const actionSelectorByScreen = {
    startScreen: "#startBtn",
    menuScreen: "#friendModeBtn",
    friendGameScreen: "#board .cell:not([disabled])",
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

function showScreen(screenToShow) {
  const screens = [startScreen, menuScreen, friendGameScreen, botGameScreen];

  screens.forEach((screen) => {
    if (!screen) {
      return;
    }

    screen.classList.toggle("hidden", screen !== screenToShow);
  });

  if (screenToShow === friendGameScreen) {
    currentGameModeKey = "friend";
  } else if (screenToShow === botGameScreen) {
    currentGameModeKey = "bot";
  } else {
    currentGameModeKey = null;
  }

  focusScreenPrimaryAction(screenToShow);
}

function updateModeScores(mode) {
  if (!mode) {
    return;
  }

  if (mode.scoreXText) {
    mode.scoreXText.textContent = String(mode.scores.X);
  }

  if (mode.scoreOText) {
    mode.scoreOText.textContent = String(mode.scores.O);
  }

  if (mode.scoreDrawsText) {
    mode.scoreDrawsText.textContent = String(mode.scores.draws);
  }
}

function resetModeScores(mode) {
  if (!mode) {
    return;
  }

  mode.scores.X = 0;
  mode.scores.O = 0;
  mode.scores.draws = 0;
  updateModeScores(mode);
}

function setModeStatus(mode, message, state, hint) {
  if (!mode) {
    return;
  }

  if (mode.statusText) {
    mode.statusText.textContent = message;
  }

  if (mode.statusPanel) {
    mode.statusPanel.dataset.state = state;
  }

  if (mode.statusHint) {
    mode.statusHint.textContent = hint;
  }

  if (mode.screen) {
    mode.screen.dataset.matchState = state === "turn" ? "active" : "finished";
  }

  if (mode.restartBtn) {
    mode.restartBtn.classList.toggle("game-over", state !== "turn");
  }
}

function setBoardDisabled(mode, disabled) {
  if (!mode?.board) {
    return;
  }

  const cells = mode.board.querySelectorAll(".cell");

  cells.forEach((cell) => {
    const index = Number(cell.dataset.index);
    const hasSymbol = Boolean(mode.boardState[index]);
    cell.disabled = disabled || hasSymbol;
  });
}

function clearBoardView(mode) {
  if (!mode?.board) {
    return;
  }

  const cells = mode.board.querySelectorAll(".cell");

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("winner-cell");
    cell.disabled = false;
  });
}

function highlightWinnerCells(mode, line) {
  if (!mode?.board || !Array.isArray(line)) {
    return;
  }

  const cells = mode.board.querySelectorAll(".cell");

  line.forEach((index) => {
    const cell = cells[index];

    if (cell) {
      cell.classList.add("winner-cell");
    }
  });
}

function checkWinner(boardState) {
  const line = winningLines.find((combination) => {
    const [a, b, c] = combination;
    return boardState[a] && boardState[a] === boardState[b] && boardState[b] === boardState[c];
  });

  if (!line) {
    return null;
  }

  return {
    winner: boardState[line[0]],
    line,
  };
}

function isDraw(boardState) {
  return boardState.every((cell) => cell !== "");
}

function resetModeGame(mode) {
  if (!mode) {
    return;
  }

  cancelPendingBotMove(mode);
  mode.boardState = Array(9).fill("");
  mode.currentPlayer = "X";
  mode.isGameFinished = false;

  clearBoardView(mode);

  setModeStatus(mode, mode.initialStatus, "turn", mode.initialHint);
  setBoardDisabled(mode, false);
}

function finishModeWithWinner(mode, winner, line) {
  if (!mode || mode.isGameFinished) {
    return;
  }

  mode.isGameFinished = true;
  mode.scores[winner] += 1;
  updateModeScores(mode);
  highlightWinnerCells(mode, line);
  setBoardDisabled(mode, true);

  if (mode.key === "bot") {
    const message = winner === "X" ? "Победили вы" : "Победил бот";
    const hint = "Партия завершена. Нажмите «Играть снова», чтобы начать новую.";
    setModeStatus(mode, message, "win", hint);
    return;
  }

  setModeStatus(mode, `Победил ${winner}`, "win", "Партия завершена. Нажмите «Играть снова», чтобы начать новую.");
}

function finishModeWithDraw(mode) {
  if (!mode || mode.isGameFinished) {
    return;
  }

  mode.isGameFinished = true;
  mode.scores.draws += 1;
  updateModeScores(mode);
  setBoardDisabled(mode, true);
  setModeStatus(mode, "Ничья", "draw", "Ничья. Попробуйте ещё раз в новой партии.");
}

function evaluateModeState(mode) {
  const winnerResult = checkWinner(mode.boardState);

  if (winnerResult) {
    finishModeWithWinner(mode, winnerResult.winner, winnerResult.line);
    return true;
  }

  if (isDraw(mode.boardState)) {
    finishModeWithDraw(mode);
    return true;
  }

  return false;
}

function getRandomBotMoveIndex(mode) {
  const freeIndexes = mode.boardState
    .map((value, index) => ({ value, index }))
    .filter((cell) => !cell.value)
    .map((cell) => cell.index);

  if (!freeIndexes.length) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * freeIndexes.length);
  return freeIndexes[randomIndex];
}

function performMove(mode, index, symbol) {
  if (!mode?.board || mode.boardState[index]) {
    return false;
  }

  mode.boardState[index] = symbol;

  const cell = mode.board.querySelector(`.cell[data-index="${index}"]`);
  if (cell) {
    cell.textContent = symbol;
    cell.disabled = true;
  }

  return true;
}

function runBotMove(mode) {
  if (!mode || mode.isGameFinished || !mode.isBotThinking) {
    return;
  }

  const botMoveIndex = getRandomBotMoveIndex(mode);

  if (botMoveIndex === null) {
    mode.isBotThinking = false;
    setBoardDisabled(mode, true);
    return;
  }

  performMove(mode, botMoveIndex, "O");

  if (evaluateModeState(mode)) {
    mode.isBotThinking = false;
    mode.botMoveTimerId = null;
    return;
  }

  mode.currentPlayer = "X";
  mode.isBotThinking = false;
  mode.botMoveTimerId = null;
  setModeStatus(mode, "Ваш ход: X", "turn", "Сделайте ход на поле 3×3");
  setBoardDisabled(mode, false);
}

function queueBotMove(mode) {
  if (!mode || mode.isGameFinished) {
    return;
  }

  cancelPendingBotMove(mode);
  mode.isBotThinking = true;
  setModeStatus(mode, "Бот думает...", "turn", "Пожалуйста, подождите ход бота");
  setBoardDisabled(mode, true);

  const delay = 300 + Math.floor(Math.random() * 301);

  mode.botMoveTimerId = window.setTimeout(() => {
    runBotMove(mode);
  }, delay);
}

function handleFriendBoardClick(event) {
  const mode = gameModes.friend;
  const target = event.target;

  if (!(target instanceof HTMLButtonElement) || !target.classList.contains("cell")) {
    return;
  }

  const index = Number(target.dataset.index);

  if (mode.isGameFinished || mode.boardState[index]) {
    return;
  }

  performMove(mode, index, mode.currentPlayer);

  if (evaluateModeState(mode)) {
    return;
  }

  mode.currentPlayer = mode.currentPlayer === "X" ? "O" : "X";
  setModeStatus(mode, `Ход: ${mode.currentPlayer}`, "turn", "Сделайте ход на поле 3×3");
}

function handleBotBoardClick(event) {
  const mode = gameModes.bot;
  const target = event.target;

  if (!(target instanceof HTMLButtonElement) || !target.classList.contains("cell")) {
    return;
  }

  const index = Number(target.dataset.index);

  if (mode.isGameFinished || mode.isBotThinking || mode.currentPlayer !== "X" || mode.boardState[index]) {
    return;
  }

  performMove(mode, index, "X");

  if (evaluateModeState(mode)) {
    return;
  }

  mode.currentPlayer = "O";
  queueBotMove(mode);
}

function isMatchInProgress(mode) {
  if (!mode) {
    return false;
  }

  return !mode.isGameFinished && mode.boardState.some((cell) => cell !== "");
}

function handleBackToMenuClick(modeKey) {
  const mode = gameModes[modeKey];

  if (!mode) {
    leaveGameToMenu();
    return;
  }

  if (isMatchInProgress(mode)) {
    openExitConfirmModal(modeKey);
    return;
  }

  pendingExitModeKey = modeKey;
  leaveGameToMenu();
}

if (startBtn && backBtn && startScreen && menuScreen) {
  startBtn.addEventListener("click", () => {
    showScreen(menuScreen);
  });

  backBtn.addEventListener("click", () => {
    showScreen(startScreen);
  });
}

if (friendModeBtn && friendGameScreen) {
  friendModeBtn.addEventListener("click", () => {
    resetModeGame(gameModes.friend);
    showScreen(friendGameScreen);
  });
}

if (botModeBtn && botGameScreen) {
  botModeBtn.addEventListener("click", () => {
    resetModeGame(gameModes.bot);
    showScreen(botGameScreen);
  });
}

if (gameModes.friend.backToMenuBtn) {
  gameModes.friend.backToMenuBtn.addEventListener("click", () => {
    handleBackToMenuClick("friend");
  });
}

if (gameModes.bot.backToMenuBtn) {
  gameModes.bot.backToMenuBtn.addEventListener("click", () => {
    handleBackToMenuClick("bot");
  });
}

if (gameModes.friend.restartBtn) {
  gameModes.friend.restartBtn.addEventListener("click", () => {
    resetModeGame(gameModes.friend);
  });
}

if (gameModes.bot.restartBtn) {
  gameModes.bot.restartBtn.addEventListener("click", () => {
    resetModeGame(gameModes.bot);
  });
}

if (gameModes.friend.resetScoreBtn) {
  gameModes.friend.resetScoreBtn.addEventListener("click", () => {
    resetModeScores(gameModes.friend);
  });
}

if (gameModes.bot.resetScoreBtn) {
  gameModes.bot.resetScoreBtn.addEventListener("click", () => {
    resetModeScores(gameModes.bot);
  });
}

if (gameModes.friend.board) {
  gameModes.friend.board.addEventListener("click", handleFriendBoardClick);
}

if (gameModes.bot.board) {
  gameModes.bot.board.addEventListener("click", handleBotBoardClick);
}

if (cancelExitBtn) {
  cancelExitBtn.addEventListener("click", () => {
    pendingExitModeKey = null;
    closeExitConfirmModal();
  });
}

if (confirmExitBtn) {
  confirmExitBtn.addEventListener("click", leaveGameToMenu);
}

if (modalOverlay) {
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      pendingExitModeKey = null;
      closeExitConfirmModal();
    }
  });
}

if (exitConfirmModal) {
  exitConfirmModal.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

disablePageScrollGestures();
resetModeGame(gameModes.friend);
resetModeGame(gameModes.bot);
updateModeScores(gameModes.friend);
updateModeScores(gameModes.bot);
showScreen(startScreen);
updateOrientationState();

window.addEventListener("resize", updateOrientationState);
window.addEventListener("orientationchange", updateOrientationState);
