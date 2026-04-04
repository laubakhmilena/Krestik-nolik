const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const startScreen = document.getElementById("startScreen");
const menuScreen = document.getElementById("menuScreen");
const friendModeBtn = document.getElementById("friendModeBtn");
const friendGameScreen = document.getElementById("friendGameScreen");
const board = document.getElementById("board");
const statusText = document.getElementById("statusText");
const statusPanel = document.getElementById("statusPanel");
const restartBtn = document.getElementById("restartBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");

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

let boardState = Array(9).fill("");
let currentPlayer = "X";
let isGameFinished = false;

function showScreen(screenToShow) {
  const screens = [startScreen, menuScreen, friendGameScreen];

  screens.forEach((screen) => {
    if (!screen) {
      return;
    }

    screen.classList.toggle("hidden", screen !== screenToShow);
  });
}

function updateStatus(message) {
  if (!statusText) {
    return;
  }

  statusText.textContent = message;

  if (statusPanel) {
    const isWin = message.startsWith("Победил");
    const isDraw = message === "Ничья";

    statusPanel.dataset.state = isWin ? "win" : isDraw ? "draw" : "turn";
  }

  if (restartBtn) {
    restartBtn.classList.toggle("game-over", message.startsWith("Победил") || message === "Ничья");
  }
}

function lockBoard() {
  if (!board) {
    return;
  }

  const cells = board.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.disabled = true;
  });
}

function resetGame() {
  boardState = Array(9).fill("");
  currentPlayer = "X";
  isGameFinished = false;

  if (!board) {
    return;
  }

  const cells = board.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
  });

  updateStatus("Ход: X");
}

function checkWinner() {
  return winningLines.find((line) => {
    const [a, b, c] = line;
    return boardState[a] && boardState[a] === boardState[b] && boardState[b] === boardState[c];
  });
}

function handleCellClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLButtonElement) || !target.classList.contains("cell")) {
    return;
  }

  const index = Number(target.dataset.index);

  if (isGameFinished || boardState[index]) {
    return;
  }

  boardState[index] = currentPlayer;
  target.textContent = currentPlayer;

  const winnerLine = checkWinner();
  if (winnerLine) {
    isGameFinished = true;
    updateStatus(`Победил ${currentPlayer}`);
    lockBoard();
    return;
  }

  const isDraw = boardState.every((cell) => cell !== "");
  if (isDraw) {
    isGameFinished = true;
    updateStatus("Ничья");
    lockBoard();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`Ход: ${currentPlayer}`);
}

if (startBtn && backBtn && startScreen && menuScreen) {
  startBtn.addEventListener("click", () => {
    showScreen(menuScreen);
  });

  backBtn.addEventListener("click", () => {
    showScreen(startScreen);
  });
}

if (friendModeBtn && friendGameScreen && menuScreen) {
  friendModeBtn.addEventListener("click", () => {
    resetGame();
    showScreen(friendGameScreen);
  });
}

if (backToMenuBtn && menuScreen) {
  backToMenuBtn.addEventListener("click", () => {
    showScreen(menuScreen);
  });
}

if (restartBtn) {
  restartBtn.addEventListener("click", resetGame);
}

if (board) {
  board.addEventListener("click", handleCellClick);
}
