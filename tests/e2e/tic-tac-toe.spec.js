const { test, expect } = require("@playwright/test");

async function openMainMenu(page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("#startScreen")).toBeVisible();
  await page.locator("#startBtn").click();
  await expect(page.locator("#menuScreen")).toBeVisible();
}

async function openFriendGame(page) {
  await openMainMenu(page);
  await page.locator("#friendModeBtn").click();
  await expect(page.locator("#friendGameScreen")).toBeVisible();
}

test("loads the start screen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Крестики|Tic-Tac-Toe/i);
  await expect(page.locator("#startScreen")).toBeVisible();
  await expect(page.locator("#startTitle")).toBeVisible();
  await expect(page.locator("#startBtn")).toBeEnabled();
});

test("opens the main menu", async ({ page }) => {
  await openMainMenu(page);
  await expect(page.locator("#menuTitle")).toContainText(/Выберите режим|Choose Game Mode/i);
  await expect(page.locator("#friendModeBtn")).toBeEnabled();
  await expect(page.locator("#botModeBtn")).toBeEnabled();
});

test("starts friend mode and alternates turns without overwriting a cell", async ({ page }) => {
  await openFriendGame(page);
  const cells = page.locator("#board .cell");
  await expect(cells).toHaveCount(9);
  await cells.nth(0).click();
  await expect(cells.nth(0)).toHaveAttribute("data-symbol", "X");
  await expect(cells.nth(0)).toBeDisabled();
  await cells.nth(1).click();
  await expect(cells.nth(1)).toHaveAttribute("data-symbol", "O");
});

test("registers a win, blocks the board and restarts the round", async ({ page }) => {
  await openFriendGame(page);
  const cells = page.locator("#board .cell");
  for (const move of [0, 3, 1, 4, 2]) await cells.nth(move).click();
  await expect(page.locator("#statusText")).toContainText(/Победил|wins/i);
  await expect(page.locator("#scoreX")).toHaveText("1");
  await expect(cells.nth(5)).toBeDisabled();
  await expect(cells.nth(5)).toHaveAttribute("data-symbol", "");
  await page.locator("#restartBtn").click();
  for (let i = 0; i < 9; i += 1) await expect(cells.nth(i)).toBeEmpty();
  await expect(page.locator("#scoreX")).toHaveText("1");
});

test("resets the match score", async ({ page }) => {
  await openFriendGame(page);
  const cells = page.locator("#board .cell");
  for (const move of [0, 3, 1, 4, 2]) await cells.nth(move).click();
  await page.locator("#resetScoreBtn").click();
  await expect(page.locator("#scoreX")).toHaveText("0");
  await expect(page.locator("#scoreO")).toHaveText("0");
  await expect(page.locator("#scoreDraws")).toHaveText("0");
});

test("persists a selected theme and ignores corrupted saved state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("ticTacToeState", "not-json"));
  await page.reload();
  await expect(page.locator("#startScreen")).toBeVisible();
  await page.locator("#themeToggleBtn").click();
  await page.locator('[data-theme-option="classic-xo"]').click();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "classic-xo");
  await page.reload();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "classic-xo");
});

test("opens and cancels exit confirmation", async ({ page }) => {
  await openFriendGame(page);
  await page.locator("#board .cell").nth(0).click();
  await page.locator("#backToMenuBtn").click();
  await expect(page.locator("#exitConfirmModal")).toBeVisible();
  await page.locator("#cancelExitBtn").click();
  await expect(page.locator("#modalOverlay")).toBeHidden();
  await expect(page.locator("#friendGameScreen")).toBeVisible();
});

test("opens bot difficulty selection", async ({ page }) => {
  await openMainMenu(page);
  await page.locator("#botModeBtn").click();
  await expect(page.locator("#botDifficultyScreen")).toBeVisible();
  await expect(page.locator("#easyLevelBtn")).toBeEnabled();
  await expect(page.locator("#mediumLevelBtn")).toBeEnabled();
  await expect(page.locator("#hardLevelBtn")).toBeEnabled();
});
