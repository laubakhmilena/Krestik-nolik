const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const startScreen = document.getElementById("startScreen");
const menuScreen = document.getElementById("menuScreen");
const friendModeBtn = document.getElementById("friendModeBtn");
const friendGameScreen = document.getElementById("friendGameScreen");
const board = document.getElementById("board");
const statusText = document.getElementById("statusText");
const statusPanel = document.getElementById("statusPanel");
const scoreXText = document.getElementById("scoreX");
const scoreOText = document.getElementById("scoreO");
const scoreDrawsText = document.getElementById("scoreDraws");
const restartBtn = document.getElementById("restartBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

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
let winningLine = null;
let scoreX = 0;
let scoreO = 0;
let scoreDraws = 0;

function showScreen(screenToShow) {
  const screens = [startScreen, menuScreen, friendGameScreen];

  screens.forEach((screen) => {
    if (!screen) {
      return;
    }

    screen.classList.toggle("hidden", screen !== screenToShow);
  });
}

function updateScores() {
  if (scoreXText) {
    scoreXText.textContent = String(scoreX);
  }

  if (scoreOText) {
    scoreOText.textContent = String(scoreO);
  }

  if (scoreDrawsText) {
    scoreDrawsText.textContent = String(scoreDraws);
  }
}

function resetScores() {
  scoreX = 0;
  scoreO = 0;
  scoreDraws = 0;
  updateScores();
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

function highlightWinnerCells(line) {
  if (!board || !Array.isArray(line)) {
    return;
  }

  const cells = board.querySelectorAll(".cell");
  line.forEach((index) => {
    const cell = cells[index];

    if (cell) {
      cell.classList.add("winner-cell");
    }
  });
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
  winningLine = null;

  if (!board) {
    return;
  }

  const cells = board.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("winner-cell");
  });

  updateStatus("Ход: X");
}

function checkWinner() {
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

  const winnerResult = checkWinner();
  if (winnerResult) {
    isGameFinished = true;
    winningLine = winnerResult.line;

    if (winnerResult.winner === "X") {
      scoreX += 1;
    } else {
      scoreO += 1;
    }

    updateScores();
    updateStatus(`Победил ${winnerResult.winner}`);
    highlightWinnerCells(winningLine);
    lockBoard();
    return;
  }

  const isDraw = boardState.every((cell) => cell !== "");
  if (isDraw) {
    isGameFinished = true;
    scoreDraws += 1;
    updateScores();
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

if (resetScoreBtn) {
  resetScoreBtn.addEventListener("click", resetScores);
}

if (board) {
  board.addEventListener("click", handleCellClick);
}

updateScores();
