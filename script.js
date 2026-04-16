const appShell = document.getElementById("appShell");
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
const themePicker = document.getElementById("themePicker");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeMenu = document.getElementById("themeMenu");
const themeOptionButtons = document.querySelectorAll("[data-theme-option]");
const STORAGE_KEY = "ticTacToeState";
const THEME_STORAGE_KEY = "ticTacToeTheme";
const STORAGE_VERSION = 2;
const YANDEX_SDK_URL = "https://yandex.ru/games/sdk/v2";

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

const BOT_THINK_DELAY_MS = 180;
const INTERSTITIAL_MIN_MATCHES = 2;
const INTERSTITIAL_MIN_INTERVAL_MS = 90_000;
const difficultyMeta = {
  easy: { translationKey: "difficulty.easy" },
  medium: { translationKey: "difficulty.medium" },
  hard: { translationKey: "difficulty.hard" },
};
const DEFAULT_THEME = "sun-moon";
const availableThemes = new Set(["cloud-star", "cat-yarn", "coffee-donut", DEFAULT_THEME, "fire-water", "classic-xo"]);
const themeColorByTheme = {
  "cloud-star": "#dff5ff",
  "cat-yarn": "#ffd8c7",
  "coffee-donut": "#f8dfbd",
  "sun-moon": "#4555bd",
  "fire-water": "#153e75",
  "classic-xo": "#f4f7fb",
};
const themeSymbols = {
  "cloud-star": { X: "☁️", O: "⭐" },
  "cat-yarn": { X: "🐱", O: "🧶" },
  "coffee-donut": { X: "☕", O: "🍩" },
  "sun-moon": { X: "☀️", O: "🌙" },
  "fire-water": { X: "🔥", O: "💧" },
  "classic-xo": { X: "X", O: "O" },
};

const translations = {
  ru: {
    document: {
      title: "Крестики-Нолики: Новая Эра",
    },
    common: {
      back: "Назад",
    },
    start: {
      eyebrow: "Классическая игра для двоих",
      title: "Крестики-Нолики: Новая Эра",
      subtitle: "Выбирайте режим и начинайте весёлую партию в обновлённом ярком интерфейсе.",
      cta: "Начать играть",
    },
    menu: {
      title: "Выберите режим игры",
      friendTitle: "Игра с другом",
      friendText: "Играть вдвоём на одном устройстве",
      botBadge: "Новое",
      botTitle: "Игра с ботом",
      botText: "Сразитесь с ИИ на трёх уровнях сложности",
    },
    difficulty: {
      title: "Выберите уровень сложности",
      groupAria: "Уровень сложности",
      easy: "Легко",
      medium: "Средне",
      hard: "Сложно",
    },
    friend: {
      title: "Игра с другом",
      scoreboardAria: "Счёт матчей",
      boardAria: "Поле крестиков-ноликов",
    },
    bot: {
      title: "Игра с ботом",
      scoreboardAria: "Счёт матчей с ботом",
      boardAria: "Поле крестиков-ноликов с ботом",
      playerScoreLabel: "Вы (X)",
      botScoreLabel: "Бот (O)",
      changeDifficulty: "Сменить сложность",
      difficultyLabel: "Сложность: {label}",
    },
    game: {
      statusCaption: "Статус партии",
      draws: "Ничьи",
      restart: "Играть снова",
      backToMenu: "Назад в меню",
      resetScore: "Сбросить счёт",
    },
    modal: {
      exitTitle: "Выйти в меню?",
      exitText: "Вы сможете продолжить текущую партию позже",
      cancel: "Остаться",
      confirm: "Выйти",
    },
    orientation: {
      title: "Поверните устройство",
      text: "Игра доступна только в вертикальном режиме",
    },
    status: {
      friendTurn: "Ход: {symbol}",
      playerTurn: "Ваш ход: {symbol}",
      botThinking: "Бот думает...",
      friendWinner: "Победил {symbol}",
      botWinner: "Победил бот",
      playerWinner: "Победили вы",
      draw: "Ничья",
    },
    hint: {
      makeMove: "Сделайте ход на поле 3×3",
      matchFinished: "Партия завершена. Нажмите «Играть снова», чтобы начать новую.",
      friendDraw: "Ничья. Попробуйте ещё раз в новой партии.",
      botDraw: "Ничья. Попробуйте другую стратегию.",
      botThinking: "Подождите, бот выбирает ход",
      resumeAfterReturn: "Продолжите игру после возврата",
      resumeToLetBotMove: "Продолжите игру, чтобы бот сделал ход",
      botStarts: "Бот начинает партию",
    },
    aria: {
      cell: "Клетка {index}",
    },
  },
  en: {
    document: {
      title: "Tic-Tac-Toe: New Era",
    },
    common: {
      back: "Back",
    },
    start: {
      eyebrow: "Classic game for two",
      title: "Tic-Tac-Toe: New Era",
      subtitle: "Choose a mode and jump into a bright, polished match right away.",
      cta: "Start Playing",
    },
    menu: {
      title: "Choose Game Mode",
      friendTitle: "Play with a Friend",
      friendText: "Two players on the same device",
      botBadge: "New",
      botTitle: "Play vs Bot",
      botText: "Challenge the AI on three difficulty levels",
    },
    difficulty: {
      title: "Choose Difficulty",
      groupAria: "Difficulty level",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
    },
    friend: {
      title: "Play with a Friend",
      scoreboardAria: "Match score",
      boardAria: "Tic-tac-toe board",
    },
    bot: {
      title: "Play vs Bot",
      scoreboardAria: "Match score against the bot",
      boardAria: "Tic-tac-toe board against the bot",
      playerScoreLabel: "You (X)",
      botScoreLabel: "Bot (O)",
      changeDifficulty: "Change Difficulty",
      difficultyLabel: "Difficulty: {label}",
    },
    game: {
      statusCaption: "Match Status",
      draws: "Draws",
      restart: "Play Again",
      backToMenu: "Back to Menu",
      resetScore: "Reset Score",
    },
    modal: {
      exitTitle: "Leave to menu?",
      exitText: "You can continue the current match later.",
      cancel: "Stay",
      confirm: "Leave",
    },
    orientation: {
      title: "Rotate Your Device",
      text: "This game is available only in portrait mode",
    },
    status: {
      friendTurn: "Turn: {symbol}",
      playerTurn: "Your turn: {symbol}",
      botThinking: "Bot is thinking...",
      friendWinner: "{symbol} wins",
      botWinner: "Bot wins",
      playerWinner: "You win",
      draw: "Draw",
    },
    hint: {
      makeMove: "Make a move on the 3×3 board",
      matchFinished: "The match is over. Tap “Play Again” to start a new one.",
      friendDraw: "It's a draw. Try again in a new match.",
      botDraw: "It's a draw. Try a different strategy.",
      botThinking: "Please wait while the bot chooses a move",
      resumeAfterReturn: "Continue the game after you come back",
      resumeToLetBotMove: "Continue the game so the bot can make its move",
      botStarts: "The bot starts this round",
    },
    aria: {
      cell: "Cell {index}",
    },
  },
};

function resolveLanguage(rawLanguage) {
  const normalized = String(rawLanguage ?? "").trim().toLowerCase();

  if (normalized.startsWith("en")) {
    return "en";
  }

  if (normalized.startsWith("ru")) {
    return "ru";
  }

  return "ru";
}

function getFallbackLanguage() {
  if (typeof navigator === "undefined") {
    return resolveLanguage(document.documentElement.lang);
  }

  return resolveLanguage(navigator.languages?.[0] ?? navigator.language ?? document.documentElement.lang);
}

let pendingExitTarget = null;
let isRestoringState = false;
let isModalOpen = false;
let isShowingScreen = false;
let yandexGamesSdk = null;
let sdkInitialized = false;
let sdkInitPromise = null;
let sdkScriptLoadPromise = null;
let gameReadySent = false;
let gameReadyPending = false;
let gameReadyInFlight = false;
let gameReadyRetryTimerId = null;
let gameplayDesiredActive = false;
let gameplayPlatformActive = false;
let lastSavedStateJson = "";
let isAdPauseActive = false;
let activeAdType = null;
let isInterstitialPending = false;
let interstitialTimerId = null;
let activeLanguage = getFallbackLanguage();
let sdkLanguage = null;
let sdkInitCompleted = false;
let layoutSyncFrameId = null;
let stickyBannerSyncPromise = null;

const clickLockMap = new WeakMap();

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
  moveGeneration: 0,
  shouldResumeBotMove: false,
};

const monetizationState = {
  finishedMatchesSinceLastInterstitial: 0,
  lastInterstitialAt: 0,
};

function getTranslationValue(key, language = activeLanguage) {
  return key.split(".").reduce((value, part) => (value && typeof value === "object" ? value[part] : undefined), translations[language]);
}

function t(key, values = {}, language = activeLanguage) {
  const template = getTranslationValue(key, language) ?? getTranslationValue(key, "ru") ?? key;

  if (typeof template !== "string") {
    return String(template ?? key);
  }

  return template.replace(/\{(\w+)\}/g, (_, token) => String(values[token] ?? `{${token}}`));
}

function setTextIfPresent(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function getSafeTheme(theme) {
  return availableThemes.has(theme) ? theme : DEFAULT_THEME;
}

function loadSavedTheme() {
  try {
    return getSafeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch (error) {
    console.warn("РќРµ СѓРґР°Р»РѕСЃСЊ РїСЂРѕС‡РёС‚Р°С‚СЊ С‚РµРјСѓ", error);
    return DEFAULT_THEME;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, getSafeTheme(theme));
    return true;
  } catch (error) {
    console.warn("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ С‚РµРјСѓ", error);
    return false;
  }
}

function updateThemeMetaColor(theme) {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", themeColorByTheme[theme] ?? themeColorByTheme[DEFAULT_THEME]);
  }
}

function getActiveTheme() {
  return getSafeTheme(document.body.dataset.theme);
}

function getDisplaySymbol(symbol, theme = getActiveTheme()) {
  if (symbol !== "X" && symbol !== "O") {
    return "";
  }

  const symbolPair = themeSymbols[getSafeTheme(theme)] ?? themeSymbols[DEFAULT_THEME];
  return symbolPair[symbol] ?? symbol;
}

function refreshBoardSymbols(boardEl, state) {
  if (!boardEl || !Array.isArray(state)) {
    return;
  }

  boardEl.querySelectorAll(".cell").forEach((cell) => {
    const index = Number(cell.dataset.index);
    setCellValue(cell, state[index] ?? "");
  });
}

function getLocalizedSymbolLabel(key, symbol) {
  const translatedLabel = t(key);
  return translatedLabel.replace(/\((X|O)\)/, `(${getDisplaySymbol(symbol)})`);
}

function refreshSymbolLabels() {
  const scoreXLabel = scoreXText?.previousElementSibling;
  const scoreOLabel = scoreOText?.previousElementSibling;
  const botScoreXLabel = botScoreXText?.previousElementSibling;
  const botScoreOLabel = botScoreOText?.previousElementSibling;

  setTextIfPresent(scoreXLabel, getDisplaySymbol("X"));
  setTextIfPresent(scoreOLabel, getDisplaySymbol("O"));
  setTextIfPresent(botScoreXLabel, getLocalizedSymbolLabel("bot.playerScoreLabel", botGame.playerSymbol));
  setTextIfPresent(botScoreOLabel, getLocalizedSymbolLabel("bot.botScoreLabel", botGame.botSymbol));
}

function refreshThemeSymbols() {
  refreshBoardSymbols(board, friendGame.state);
  refreshBoardSymbols(botBoard, botGame.state);
  refreshSymbolLabels();
  refreshCurrentStatuses();
}

function updateThemeOptions(theme) {
  const activeTheme = getSafeTheme(theme);

  themeOptionButtons.forEach((button) => {
    const isActive = button.dataset.themeOption === activeTheme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", isActive ? "true" : "false");
  });
}

function applyTheme(theme, { shouldSave = false } = {}) {
  const activeTheme = getSafeTheme(theme);

  document.body.dataset.theme = activeTheme;
  updateThemeOptions(activeTheme);
  updateThemeMetaColor(activeTheme);
  refreshThemeSymbols();

  if (shouldSave) {
    saveTheme(activeTheme);
  }
}

function setThemeMenuOpen(isOpen) {
  if (!themeMenu || !themeToggleBtn) {
    return;
  }

  themeMenu.classList.toggle("hidden", !isOpen);
  themeToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");

  if (isOpen) {
    const activeOption = themeMenu.querySelector(".theme-option.is-active");
    if (activeOption instanceof HTMLElement) {
      activeOption.focus({ preventScroll: true });
    }
  }
}

function isThemeMenuOpen() {
  return Boolean(themeMenu && !themeMenu.classList.contains("hidden"));
}

function setCellValue(cell, value) {
  if (!(cell instanceof HTMLElement)) {
    return;
  }

  const symbol = value === "X" || value === "O" ? value : "";
  cell.textContent = getDisplaySymbol(symbol);
  cell.dataset.symbol = symbol;
  cell.classList.toggle("cell-x", symbol === "X");
  cell.classList.toggle("cell-o", symbol === "O");
}

function updateBoardAriaLabels() {
  [board, botBoard].forEach((boardEl) => {
    boardEl?.querySelectorAll(".cell").forEach((cell) => {
      const cellIndex = Number(cell.dataset.index) + 1;
      cell.setAttribute("aria-label", t("aria.cell", { index: cellIndex }));
    });
  });
}

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translationKey = element.dataset.i18n;

    if (!translationKey) {
      return;
    }

    element.textContent = t(translationKey);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const translationKey = element.dataset.i18nAriaLabel;

    if (!translationKey) {
      return;
    }

    element.setAttribute("aria-label", t(translationKey));
  });

  refreshSymbolLabels();
  updateBoardAriaLabels();
}

function getFriendTurnStatusPayload(player = friendGame.currentPlayer) {
  return {
    text: t("status.friendTurn", { symbol: getDisplaySymbol(player) }),
    hint: t("hint.makeMove"),
    panelState: "turn",
  };
}

function getFriendWinnerStatusPayload(player) {
  return {
    text: t("status.friendWinner", { symbol: getDisplaySymbol(player) }),
    hint: t("hint.matchFinished"),
    panelState: "win",
  };
}

function getDrawStatusPayload({ botMode = false } = {}) {
  return {
    text: t("status.draw"),
    hint: t(botMode ? "hint.botDraw" : "hint.friendDraw"),
    panelState: "draw",
  };
}

function getBotPlayerTurnStatusPayload(player = botGame.playerSymbol) {
  return {
    text: t("status.playerTurn", { symbol: getDisplaySymbol(player) }),
    hint: t("hint.makeMove"),
    panelState: "turn",
  };
}

function getBotThinkingStatusPayload({ resumePending = false } = {}) {
  return {
    text: t("status.botThinking"),
    hint: t(resumePending ? "hint.resumeToLetBotMove" : "hint.botThinking"),
    panelState: "thinking",
  };
}

function getBotStartsStatusPayload() {
  return {
    text: t("status.botThinking"),
    hint: t("hint.botStarts"),
    panelState: "thinking",
  };
}

function getBotWinnerStatusPayload() {
  return {
    text: t("status.botWinner"),
    hint: t("hint.matchFinished"),
    panelState: "win",
  };
}

function getPlayerWinnerStatusPayload() {
  return {
    text: t("status.playerWinner"),
    hint: t("hint.matchFinished"),
    panelState: "win",
  };
}

function refreshCurrentStatuses() {
  const friendWinner = getWinnerForState(friendGame.state);
  const friendIsDraw = !friendWinner && getAvailableMoves(friendGame.state).length === 0;
  if (friendWinner) {
    updateStatus(statusPanel, statusText, statusHint, getFriendWinnerStatusPayload(friendWinner.winner));
  } else if (friendGame.isFinished || friendIsDraw) {
    updateStatus(statusPanel, statusText, statusHint, getDrawStatusPayload());
  } else {
    updateStatus(statusPanel, statusText, statusHint, getFriendTurnStatusPayload(friendGame.currentPlayer));
  }

  const botWinner = getWinnerForState(botGame.state);
  const botIsDraw = !botWinner && getAvailableMoves(botGame.state).length === 0;
  if (botWinner) {
    updateStatus(
      botStatusPanel,
      botStatusText,
      botStatusHint,
      botWinner.winner === botGame.botSymbol ? getBotWinnerStatusPayload() : getPlayerWinnerStatusPayload()
    );
    return;
  }

  if (botGame.isFinished || botIsDraw) {
    updateStatus(botStatusPanel, botStatusText, botStatusHint, getDrawStatusPayload({ botMode: true }));
    return;
  }

  if (botGame.turn === "bot" || botGame.isBotThinking || botGame.shouldResumeBotMove) {
    updateStatus(
      botStatusPanel,
      botStatusText,
      botStatusHint,
      getBotThinkingStatusPayload({
        resumePending: botGame.shouldResumeBotMove || !canBotActNow(),
      })
    );
    return;
  }

  updateStatus(botStatusPanel, botStatusText, botStatusHint, getBotPlayerTurnStatusPayload(botGame.playerSymbol));
}

function refreshLocalizedUi() {
  document.documentElement.lang = activeLanguage;
  document.title = t("document.title");
  applyStaticTranslations();
  updateDifficultyLabel();
  refreshCurrentStatuses();
  scheduleAdaptiveLayoutSync();
}

function applyLanguage(language) {
  const resolvedLanguage = resolveLanguage(language);

  if (resolvedLanguage === activeLanguage && document.documentElement.lang === resolvedLanguage) {
    refreshLocalizedUi();
    return;
  }

  activeLanguage = resolvedLanguage;
  refreshLocalizedUi();
}

function detectAndApplySdkLanguage(sdk) {
  const environmentLanguage = sdk?.environment?.i18n?.lang;

  if (!environmentLanguage) {
    return;
  }

  sdkLanguage = resolveLanguage(environmentLanguage);
  applyLanguage(sdkLanguage);
}

function markBootComplete() {
  document.body?.removeAttribute("data-booting");
}

function disablePageScrollGestures() {
  const shouldAllowNativeScroll = (eventTarget) => {
    if (!(eventTarget instanceof Element)) {
      return false;
    }

    const scrollContainer = eventTarget.closest(".confirm-modal");
    if (!scrollContainer) {
      return false;
    }

    return scrollContainer.scrollHeight > scrollContainer.clientHeight + 1;
  };

  const preventScroll = (event) => {
    if (shouldAllowNativeScroll(event.target)) {
      return;
    }

    event.preventDefault();
  };

  document.addEventListener("touchmove", preventScroll, { passive: false });
  document.addEventListener("wheel", preventScroll, { passive: false });
  document.addEventListener("gesturestart", preventScroll, { passive: false });
  document.addEventListener("gesturechange", preventScroll, { passive: false });
  document.addEventListener("contextmenu", (event) => event.preventDefault());
}

let orientationFrameId = null;
let isLandscapeLocked = false;

function setApplicationInteractivity(isInteractive) {
  if (!appShell) {
    return;
  }

  appShell.setAttribute("aria-hidden", isInteractive ? "false" : "true");

  if ("inert" in appShell) {
    appShell.inert = !isInteractive;
  }
}

function syncUiInteractivity() {
  setApplicationInteractivity(!isLandscapeLocked && !isModalOpen);
}

function applyOrientationState() {
  if (orientationOverlay) {
    orientationOverlay.classList.add("hidden");
    orientationOverlay.setAttribute("aria-hidden", "true");
  }

  document.body.classList.remove("landscape-locked");

  if (isLandscapeLocked) {
    isLandscapeLocked = false;
    focusScreenPrimaryAction(
      [startScreen, menuScreen, botDifficultyScreen, friendGameScreen, botGameScreen].find(
        (screen) => screen && !screen.classList.contains("hidden")
      ) ?? startScreen
    );
  }

  syncUiInteractivity();
  scheduleAdaptiveLayoutSync();

  if (gameReadyPending) {
    markGameReadyWhenPossible();
  }

  syncPlatformGameplayState();
  syncStickyBannerState();
  resumeBotTurnIfNeeded();
}

function updateOrientationState() {
  if (orientationFrameId) {
    window.cancelAnimationFrame(orientationFrameId);
  }

  orientationFrameId = window.requestAnimationFrame(() => {
    orientationFrameId = null;
    applyOrientationState();
  });
}

function ensureYandexSdkScript() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(false);
  }

  if (window.YaGames?.init) {
    return Promise.resolve(true);
  }

  if (sdkScriptLoadPromise) {
    return sdkScriptLoadPromise;
  }

  sdkScriptLoadPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src="${YANDEX_SDK_URL}"]`);

    if (existingScript instanceof HTMLScriptElement) {
      if (window.YaGames?.init) {
        resolve(true);
        return;
      }

      if (existingScript.dataset.sdkLoadState === "error") {
        resolve(false);
        return;
      }

      existingScript.addEventListener(
        "load",
        () => {
          existingScript.dataset.sdkLoadState = "loaded";
          resolve(Boolean(window.YaGames?.init));
        },
        { once: true }
      );
      existingScript.addEventListener(
        "error",
        () => {
          existingScript.dataset.sdkLoadState = "error";
          resolve(false);
        },
        { once: true }
      );
      return;
    }

    const sdkScript = document.createElement("script");
    sdkScript.src = YANDEX_SDK_URL;
    sdkScript.async = true;
    sdkScript.onload = () => {
      sdkScript.dataset.sdkLoadState = "loaded";
      resolve(Boolean(window.YaGames?.init));
    };
    sdkScript.onerror = () => {
      sdkScript.dataset.sdkLoadState = "error";
      console.warn("Не удалось загрузить SDK Яндекс Игр, продолжаем без платформенных API.");
      resolve(false);
    };
    document.head.appendChild(sdkScript);
  });

  return sdkScriptLoadPromise;
}

// Платформенная интеграция Яндекс Игр.
// Инициализация не обязательна для локального запуска и не блокирует игру при ошибках SDK.
async function initYandexGamesSdk() {
  if (sdkInitPromise) {
    return sdkInitPromise;
  }

  sdkInitPromise = (async () => {
    if (typeof window === "undefined") {
      sdkInitCompleted = true;
      return null;
    }

    const sdkScriptReady = await ensureYandexSdkScript();
    if (!sdkScriptReady || !window.YaGames?.init) {
      sdkInitCompleted = true;
      return null;
    }

    try {
      yandexGamesSdk = await window.YaGames.init();
      sdkInitialized = true;
      detectAndApplySdkLanguage(yandexGamesSdk);
      await syncStickyBannerState();
      return yandexGamesSdk;
    } catch (error) {
      console.warn("SDK Яндекс Игр не инициализирован, продолжаем в гостевом режиме.", error);
      yandexGamesSdk = null;
      sdkInitialized = false;
      return null;
    } finally {
      sdkInitCompleted = true;
    }
  })();

  return sdkInitPromise;
}

function getYandexGameplayApi() {
  return sdkInitialized ? yandexGamesSdk?.features?.GameplayAPI ?? null : null;
}

function getAdvertisementApi() {
  if (!sdkInitialized || !yandexGamesSdk) {
    return null;
  }

  return yandexGamesSdk?.features?.AdvertisementAPI ?? yandexGamesSdk?.adv ?? null;
}

async function syncStickyBannerState() {
  const adApi = getAdvertisementApi();
  if (!adApi?.getBannerAdvStatus || !adApi?.hideBannerAdv) {
    return;
  }

  if (stickyBannerSyncPromise) {
    return stickyBannerSyncPromise;
  }

  stickyBannerSyncPromise = (async () => {
    try {
      const bannerStatus = await adApi.getBannerAdvStatus();

      if (bannerStatus?.stickyAdvIsShowing) {
        await adApi.hideBannerAdv();
      }
    } catch (error) {
      console.warn("Не удалось синхронизировать sticky-баннер.", error);
    } finally {
      stickyBannerSyncPromise = null;
    }
  })();

  return stickyBannerSyncPromise;
}

function isCurrentScreenSafeForAdBreak() {
  if (document.hidden || isShowingScreen || isModalOpen || isLandscapeLocked) {
    return false;
  }

  const activeScreenId = getActiveScreenId();

  if (activeScreenId === "friendGameScreen") {
    return friendGame.isFinished;
  }

  if (activeScreenId === "botGameScreen") {
    return botGame.isFinished && !botGame.isBotThinking;
  }

  return activeScreenId === "startScreen" || activeScreenId === "menuScreen" || activeScreenId === "botDifficultyScreen";
}

function canShowInterstitialNow({ requireMatchCount = true, requireInterval = true, allowGameplayTransition = false } = {}) {
  if (
    isInterstitialPending ||
    isAdPauseActive ||
    document.hidden ||
    isModalOpen ||
    isLandscapeLocked ||
    (!allowGameplayTransition && !isCurrentScreenSafeForAdBreak())
  ) {
    return false;
  }

  const adApi = getAdvertisementApi();
  if (!adApi?.showFullscreenAdv) {
    return false;
  }

  const enoughMatches =
    !requireMatchCount || monetizationState.finishedMatchesSinceLastInterstitial >= INTERSTITIAL_MIN_MATCHES;
  const enoughTimePassed = !requireInterval || Date.now() - monetizationState.lastInterstitialAt >= INTERSTITIAL_MIN_INTERVAL_MS;
  return enoughMatches && enoughTimePassed;
}

function pauseGameForAd(adType) {
  if (isAdPauseActive) {
    return;
  }

  isAdPauseActive = true;
  activeAdType = adType;
  stopBotTurnTimer();
  setBotBoardInteractive(false);
  lockBoard(board);
  syncPlatformGameplayState();
  syncStickyBannerState();
  saveGameState();
}

function resumeGameAfterAd() {
  if (!isAdPauseActive) {
    return;
  }

  isAdPauseActive = false;
  activeAdType = null;

  if (!friendGame.isFinished && getActiveScreenId() === "friendGameScreen") {
    unlockBoard(board, friendGame.state);
  }

  if (getActiveScreenId() === "botGameScreen" && !botGame.isFinished) {
    if (botGame.turn === "player") {
      setBotBoardInteractive(true);
    }

    resumeBotTurnIfNeeded();
  }

  syncPlatformGameplayState();
  syncStickyBannerState();
  scheduleAdaptiveLayoutSync();
  saveGameState();
}

function showInterstitialAd(reason = "match-end", options = {}) {
  if (!canShowInterstitialNow(options)) {
    return Promise.resolve(false);
  }

  const adApi = getAdvertisementApi();
  isInterstitialPending = true;
  pauseGameForAd(`interstitial:${reason}`);

  return new Promise((resolve) => {
    let resumed = false;
    const complete = (shown) => {
      if (resumed) {
        return;
      }

      resumed = true;
      isInterstitialPending = false;
      resumeGameAfterAd();
      resolve(shown);
    };

    try {
      adApi.showFullscreenAdv({
        callbacks: {
          onOpen: () => {
            pauseGameForAd(`interstitial:${reason}`);
          },
          onClose: (wasShown = true) => {
            if (wasShown) {
              monetizationState.finishedMatchesSinceLastInterstitial = 0;
              monetizationState.lastInterstitialAt = Date.now();
            }
            complete(Boolean(wasShown));
          },
          onError: (error) => {
            console.warn("Не удалось показать interstitial.", error);
            complete(false);
          },
          onOffline: () => {
            complete(false);
          },
        },
      });
    } catch (error) {
      console.warn("Ошибка запуска interstitial.", error);
      complete(false);
    }
  });
}

function showUserActionInterstitial(reason) {
  return showInterstitialAd(reason, {
    requireMatchCount: false,
    allowGameplayTransition: true,
  });
}

async function runAfterUserActionInterstitial(reason, action) {
  await showUserActionInterstitial(reason);
  action?.();
}

function recordFinishedMatchAndMaybeShowAd() {
  monetizationState.finishedMatchesSinceLastInterstitial += 1;
  saveGameState();

  if (interstitialTimerId) {
    window.clearTimeout(interstitialTimerId);
    interstitialTimerId = null;
  }

  if (!canShowInterstitialNow()) {
    return;
  }

  interstitialTimerId = window.setTimeout(() => {
    interstitialTimerId = null;

    if (!canShowInterstitialNow()) {
      return;
    }

    showInterstitialAd("after-match");
  }, 80);
}

function isGameScreenActive() {
  const activeScreenId = getActiveScreenId();
  return activeScreenId === "friendGameScreen" || activeScreenId === "botGameScreen";
}

function isGameplayMatchActive() {
  const activeScreenId = getActiveScreenId();

  if (activeScreenId === "friendGameScreen") {
    return !friendGame.isFinished;
  }

  if (activeScreenId === "botGameScreen") {
    return !botGame.isFinished;
  }

  return false;
}

function shouldGameplayBeActive() {
  return (
    isGameScreenActive() &&
    isGameplayMatchActive() &&
    !document.hidden &&
    !isAdPauseActive &&
    !isModalOpen &&
    !isLandscapeLocked
  );
}

function syncPlatformGameplayState() {
  const shouldBeActive = shouldGameplayBeActive();
  gameplayDesiredActive = shouldBeActive;
  const gameplayApi = getYandexGameplayApi();

  if (shouldBeActive) {
    if (gameplayPlatformActive) {
      return;
    }

    if (!gameplayApi?.start) {
      return;
    }

    try {
      gameplayApi.start();
      gameplayPlatformActive = true;
    } catch (error) {
      console.warn("Не удалось вызвать GameplayAPI.start()", error);
    }
    return;
  }

  if (!gameplayPlatformActive) {
    return;
  }

  if (!gameplayApi?.stop) {
    gameplayPlatformActive = false;
    return;
  }

  try {
    gameplayApi.stop();
    gameplayPlatformActive = false;
  } catch (error) {
    console.warn("Не удалось вызвать GameplayAPI.stop()", error);
  }
}

// Вызываем ready только после восстановления UI/состояния и первого стабильного кадра.
function markGameReadyWhenPossible() {
  if (gameReadySent || gameReadyInFlight) {
    return;
  }

  if (gameReadyRetryTimerId) {
    window.clearTimeout(gameReadyRetryTimerId);
    gameReadyRetryTimerId = null;
  }

  if (document.hidden || isLandscapeLocked || isShowingScreen || isAdPauseActive) {
    gameReadyPending = true;
    return;
  }

  if (!sdkInitialized || !yandexGamesSdk) {
    gameReadyPending = !sdkInitCompleted;
    return;
  }

  const loadingApi = sdkInitialized ? yandexGamesSdk?.features?.LoadingAPI : null;
  if (!loadingApi?.ready) {
    gameReadyPending = false;
    return;
  }

  gameReadyPending = false;
  gameReadyInFlight = true;

  Promise.resolve()
    .then(() => loadingApi.ready())
    .then(() => {
      gameReadySent = true;
      gameReadyPending = false;
    })
    .catch((error) => {
      console.warn("Не удалось вызвать LoadingAPI.ready()", error);
      gameReadyPending = true;
      if (!gameReadyRetryTimerId && !document.hidden) {
        gameReadyRetryTimerId = window.setTimeout(() => {
          gameReadyRetryTimerId = null;
          markGameReadyWhenPossible();
        }, 800);
      }
    })
    .finally(() => {
      gameReadyInFlight = false;
    });
}

function handlePageVisibilityChange() {
  syncPlatformGameplayState();
  scheduleAdaptiveLayoutSync();

  if (!document.hidden) {
    syncStickyBannerState();
  }

  if (document.hidden && botGame.turn === "bot") {
    botGame.shouldResumeBotMove = !botGame.isFinished;
    stopBotTurnTimer();
    updateStatus(botStatusPanel, botStatusText, botStatusHint, {
      text: t("status.botThinking"),
      hint: t("hint.resumeAfterReturn"),
      panelState: "thinking",
    });
    saveGameState();
    return;
  }

  if (!document.hidden && gameReadyPending) {
    markGameReadyWhenPossible();
  }

  resumeBotTurnIfNeeded();
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

function bindAction(button, handler) {
  if (!button) {
    return;
  }

  button.addEventListener("click", (event) => {
    if (button.disabled || clickLockMap.get(button)) {
      return;
    }

    clickLockMap.set(button, true);

    const releaseClickLock = () => {
      window.setTimeout(() => {
        clickLockMap.delete(button);
      }, 80);
    };

    try {
      Promise.resolve(handler(event)).finally(releaseClickLock);
    } catch (error) {
      releaseClickLock();
      throw error;
    }
  });
}

function showScreen(screenToShow) {
  if (!screenToShow || isShowingScreen) {
    return;
  }

  const activeScreenId = getActiveScreenId();
  const isSameScreen = activeScreenId === screenToShow.id;
  if (isSameScreen && !isModalOpen) {
    return;
  }

  isShowingScreen = true;
  const screens = [startScreen, menuScreen, botDifficultyScreen, friendGameScreen, botGameScreen];

  screens.forEach((screen) => {
    if (!screen) {
      return;
    }

    screen.classList.toggle("hidden", screen !== screenToShow);
    screen.setAttribute("aria-hidden", screen === screenToShow ? "false" : "true");
  });

  closeExitConfirmModal({ keepPendingTarget: false });

  focusScreenPrimaryAction(screenToShow);

  if (!isRestoringState && !isSameScreen) {
    saveGameState();
  }

  isShowingScreen = false;
  scheduleAdaptiveLayoutSync();
  syncPlatformGameplayState();
  syncStickyBannerState();
  resumeBotTurnIfNeeded();
}

function closeExitConfirmModal({ keepPendingTarget = false, resumeGameplay = true } = {}) {
  if (!keepPendingTarget) {
    pendingExitTarget = null;
  }

  if (!modalOverlay) {
    isModalOpen = false;
    return;
  }

  modalOverlay.classList.add("hidden");
  modalOverlay.setAttribute("aria-hidden", "true");
  isModalOpen = false;
  syncUiInteractivity();
  scheduleAdaptiveLayoutSync();

  if (resumeGameplay) {
    syncPlatformGameplayState();
    resumeBotTurnIfNeeded();
  }
}

function openExitConfirmModal(targetScreen) {
  if (!targetScreen || isLandscapeLocked) {
    return;
  }

  if (isModalOpen && pendingExitTarget?.id === targetScreen.id) {
    return;
  }

  if (!modalOverlay) {
    return;
  }

  pendingExitTarget = targetScreen;
  modalOverlay.classList.remove("hidden");
  modalOverlay.setAttribute("aria-hidden", "false");
  isModalOpen = true;
  syncUiInteractivity();
  cancelExitBtn?.focus({ preventScroll: true });
  stopBotTurnTimer();
  botGame.shouldResumeBotMove = botGame.turn === "bot" && !botGame.isFinished;
  scheduleAdaptiveLayoutSync();
  syncPlatformGameplayState();
  saveGameState();
}

function leaveGameTo(screen) {
  botGame.shouldResumeBotMove = false;
  stopBotTurnTimer();
  closeExitConfirmModal({ keepPendingTarget: false });
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

function updateStatus(panelEl, textEl, hintEl, statusPayload) {
  const safeStatus =
    statusPayload && typeof statusPayload === "object"
      ? statusPayload
      : {
          text: String(statusPayload ?? ""),
          hint: t("hint.makeMove"),
          panelState: "turn",
        };

  setTextIfPresent(textEl, safeStatus.text);

  if (panelEl) {
    panelEl.dataset.state = getSafePanelState(safeStatus.panelState);
  }

  setTextIfPresent(hintEl, safeStatus.hint ?? t("hint.makeMove"));
}

function refreshFriendScores() {
  if (scoreXText) scoreXText.textContent = String(friendGame.scores.X);
  if (scoreOText) scoreOText.textContent = String(friendGame.scores.O);
  if (scoreDrawsText) scoreDrawsText.textContent = String(friendGame.scores.draws);
}

function getActiveScreenId() {
  const validScreens = [startScreen, menuScreen, botDifficultyScreen, friendGameScreen, botGameScreen];
  const activeScreen = validScreens.find((screen) => screen && !screen.classList.contains("hidden"));

  if (!activeScreen) {
    return "startScreen";
  }

  return activeScreen.id;
}

function scheduleAdaptiveLayoutSync() {
  if (layoutSyncFrameId) {
    window.cancelAnimationFrame(layoutSyncFrameId);
  }

  layoutSyncFrameId = window.requestAnimationFrame(() => {
    layoutSyncFrameId = null;
    syncAdaptiveLayout();
  });
}

function syncBoardSize(contentEl, boardEl) {
  if (!contentEl || !boardEl || contentEl.offsetParent === null) {
    boardEl?.style.removeProperty("--board-size");
    return;
  }

  const contentChildren = [...contentEl.children].filter((child) => child instanceof HTMLElement);
  const contentStyles = window.getComputedStyle(contentEl);
  const gridColumns = contentStyles.gridTemplateColumns
    .split(" ")
    .map((column) => Number.parseFloat(column))
    .filter((column) => Number.isFinite(column) && column > 0);
  const isLandscapeGameLayout = window.matchMedia?.("(orientation: landscape)").matches && gridColumns.length > 1;

  if (isLandscapeGameLayout) {
    const maxWidth = Math.max(0, Math.floor(Math.min(gridColumns[0], 370)));
    const maxHeight = Math.max(0, Math.floor(contentEl.clientHeight));
    const nextBoardSize = Math.max(0, Math.min(maxWidth, maxHeight));

    if (nextBoardSize > 0) {
      boardEl.style.setProperty("--board-size", `${nextBoardSize}px`);
      return;
    }

    boardEl.style.removeProperty("--board-size");
    return;
  }

  const rowGap = Number.parseFloat(contentStyles.rowGap) || 0;
  const otherBlocksHeight = contentChildren
    .filter((child) => child !== boardEl)
    .reduce((sum, child) => sum + child.getBoundingClientRect().height, 0);
  const gapsHeight = Math.max(0, contentChildren.length - 1) * rowGap;
  const availableHeight = Math.max(0, Math.floor(contentEl.clientHeight - otherBlocksHeight - gapsHeight));
  const maxWidth = Math.max(0, Math.floor(Math.min(contentEl.clientWidth, 370)));
  const nextBoardSize = Math.max(0, Math.min(maxWidth, availableHeight));

  if (nextBoardSize > 0) {
    boardEl.style.setProperty("--board-size", `${nextBoardSize}px`);
    return;
  }

  boardEl.style.removeProperty("--board-size");
}

function syncAdaptiveLayout() {
  syncBoardSize(friendGameScreen?.querySelector(".friend-game-content"), board);
  syncBoardSize(botGameScreen?.querySelector(".friend-game-content"), botBoard);
}

function getSafeBoardState(boardState) {
  if (!Array.isArray(boardState) || boardState.length !== 9) {
    return Array(9).fill("");
  }

  return boardState.map((cell) => (cell === "X" || cell === "O" ? cell : ""));
}

function getSafeScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0) {
    return 0;
  }

  return Math.floor(score);
}

function getSafeWinningLine(line) {
  if (!Array.isArray(line) || line.length !== 3) {
    return null;
  }

  const normalized = line.map((index) => Number(index));
  const isValid = normalized.every((index) => Number.isInteger(index) && index >= 0 && index <= 8);
  return isValid ? normalized : null;
}

function isWinningLineValidForState(state, line) {
  const safeLine = getSafeWinningLine(line);

  if (!safeLine) {
    return false;
  }

  const [a, b, c] = safeLine;
  return Boolean(state[a] && state[a] === state[b] && state[b] === state[c]);
}

function getSafeDifficulty(value) {
  return Object.hasOwn(difficultyMeta, value) ? value : "easy";
}

function getSafeTurn(value) {
  return value === "bot" ? "bot" : "player";
}

function getSafePanelState(value) {
  return ["turn", "thinking", "win", "draw"].includes(value) ? value : "turn";
}

function getSafeMatchState(value, isFinished) {
  if (["active", "finished"].includes(value)) {
    return value;
  }

  return isFinished ? "finished" : "active";
}

function normalizeFriendGameState(rawFriendState) {
  const state = getSafeBoardState(rawFriendState?.state);
  const winnerResult = getWinnerForState(state);
  const isDraw = !winnerResult && getAvailableMoves(state).length === 0;
  const hasValidWinningLine = isWinningLineValidForState(state, rawFriendState?.winningLine);
  const winningLine = winnerResult?.line ?? (hasValidWinningLine ? getSafeWinningLine(rawFriendState?.winningLine) : null);
  const isFinished = winnerResult ? true : isDraw ? true : Boolean(rawFriendState?.isFinished && getAvailableMoves(state).length === 0);
  const currentPlayer = rawFriendState?.currentPlayer === "O" ? "O" : "X";
  const statusPayload = winnerResult
    ? getFriendWinnerStatusPayload(winnerResult.winner)
    : isDraw
      ? getDrawStatusPayload()
      : getFriendTurnStatusPayload(currentPlayer);

  return {
    state,
    currentPlayer,
    isFinished,
    winningLine: isFinished ? winningLine : null,
    scores: {
      X: getSafeScore(rawFriendState?.scores?.X),
      O: getSafeScore(rawFriendState?.scores?.O),
      draws: getSafeScore(rawFriendState?.scores?.draws),
    },
    statusText: statusPayload.text,
    statusHint: statusPayload.hint,
    statusPanelState: statusPayload.panelState,
    matchState: getSafeMatchState(rawFriendState?.matchState, isFinished),
  };
}

function normalizeBotGameState(rawBotState) {
  const state = getSafeBoardState(rawBotState?.state);
  const playerSymbol = rawBotState?.playerSymbol === "O" ? "O" : "X";
  const botSymbol = playerSymbol === "X" ? "O" : "X";
  const winnerResult = getWinnerForState(state);
  const isDraw = !winnerResult && getAvailableMoves(state).length === 0;
  const hasValidWinningLine = isWinningLineValidForState(state, rawBotState?.winningLine);
  const winningLine = winnerResult?.line ?? (hasValidWinningLine ? getSafeWinningLine(rawBotState?.winningLine) : null);
  const rawTurn = rawBotState?.turn;
  const turn = rawTurn === "bot" ? "bot" : "player";
  const isFinished = winnerResult ? true : isDraw ? true : Boolean(rawBotState?.isFinished && getAvailableMoves(state).length === 0);
  const isBotThinking = !isFinished && turn === "bot" ? Boolean(rawBotState?.isBotThinking) : false;
  const difficulty = getSafeDifficulty(rawBotState?.difficulty);
  const statusPayload = winnerResult
    ? winnerResult.winner === botSymbol
      ? getBotWinnerStatusPayload()
      : getPlayerWinnerStatusPayload()
    : isDraw
      ? getDrawStatusPayload({ botMode: true })
      : turn === "bot"
        ? getBotThinkingStatusPayload({ resumePending: isBotThinking })
        : getBotPlayerTurnStatusPayload(playerSymbol);

  return {
    state,
    isFinished,
    winningLine: isFinished ? winningLine : null,
    scores: {
      player: getSafeScore(rawBotState?.scores?.player),
      bot: getSafeScore(rawBotState?.scores?.bot),
      draws: getSafeScore(rawBotState?.scores?.draws),
    },
    difficulty,
    playerSymbol,
    botSymbol,
    turn: isFinished ? "player" : turn,
    isBotThinking,
    statusText: statusPayload.text,
    statusHint: statusPayload.hint,
    statusPanelState: statusPayload.panelState,
    matchState: getSafeMatchState(rawBotState?.matchState, isFinished),
  };
}

function normalizeScreenState(activeScreen) {
  return ["startScreen", "menuScreen", "botDifficultyScreen", "friendGameScreen", "botGameScreen"].includes(activeScreen)
    ? activeScreen
    : "startScreen";
}

function normalizeMonetizationState(rawMonetizationState) {
  return {
    finishedMatchesSinceLastInterstitial: getSafeScore(rawMonetizationState?.finishedMatchesSinceLastInterstitial),
    lastInterstitialAt: Number.isFinite(Number(rawMonetizationState?.lastInterstitialAt))
      ? Math.max(0, Number(rawMonetizationState.lastInterstitialAt))
      : 0,
  };
}

function getGameState() {
  return {
    version: STORAGE_VERSION,
    activeScreen: getActiveScreenId(),
    friendGame: {
      state: [...friendGame.state],
      currentPlayer: friendGame.currentPlayer,
      isFinished: friendGame.isFinished,
      winningLine: friendGame.winningLine ? [...friendGame.winningLine] : null,
      scores: { ...friendGame.scores },
      statusText: statusText?.textContent ?? t("status.friendTurn", { symbol: "X" }),
      statusHint: statusHint?.textContent ?? t("hint.makeMove"),
      statusPanelState: statusPanel?.dataset.state ?? "turn",
      matchState: friendGameScreen?.dataset.matchState ?? "active",
    },
    monetization: {
      finishedMatchesSinceLastInterstitial: monetizationState.finishedMatchesSinceLastInterstitial,
      lastInterstitialAt: monetizationState.lastInterstitialAt,
    },
    botGame: {
      state: [...botGame.state],
      isFinished: botGame.isFinished,
      winningLine: botGame.winningLine ? [...botGame.winningLine] : null,
      scores: { ...botGame.scores },
      difficulty: botGame.difficulty,
      playerSymbol: botGame.playerSymbol,
      botSymbol: botGame.botSymbol,
      turn: botGame.turn,
      isBotThinking: botGame.isBotThinking,
      statusText: botStatusText?.textContent ?? t("status.playerTurn", { symbol: botGame.playerSymbol }),
      statusHint: botStatusHint?.textContent ?? t("hint.makeMove"),
      statusPanelState: botStatusPanel?.dataset.state ?? "turn",
      matchState: botGameScreen?.dataset.matchState ?? "active",
      difficultyLabel: botDifficultyLabel?.textContent ?? "",
      difficultyLevel: botDifficultyLabel?.dataset.level ?? botGame.difficulty,
    },
  };
}

function saveGameState() {
  try {
    const state = getGameState();
    const stateJson = JSON.stringify(state);
    if (stateJson === lastSavedStateJson) {
      return true;
    }

    localStorage.setItem(STORAGE_KEY, stateJson);
    lastSavedStateJson = stateJson;
    return true;
  } catch (error) {
    console.warn("Не удалось сохранить состояние игры", error);
    return false;
  }
}

function loadGameState() {
  try {
    const rawState = localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
      return null;
    }

    const parsed = JSON.parse(rawState);
    if (!parsed || typeof parsed !== "object") {
      clearSavedGameState();
      return null;
    }

    if (Number.isFinite(Number(parsed.version)) && Number(parsed.version) > STORAGE_VERSION) {
      clearSavedGameState();
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Не удалось прочитать сохранённое состояние игры", error);
    clearSavedGameState();
    return null;
  }
}

function clearSavedGameState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    lastSavedStateJson = "";
  } catch (error) {
    console.warn("Не удалось очистить сохранение игры", error);
  }
}

function restoreFriendBoardUI() {
  if (!board) {
    return;
  }

  const cells = board.querySelectorAll(".cell");
  cells.forEach((cell) => {
    const index = Number(cell.dataset.index);
    const value = friendGame.state[index] ?? "";

    setCellValue(cell, value);
    cell.classList.remove("winner-cell");
    cell.disabled = friendGame.isFinished ? true : Boolean(value);
  });

  if (friendGame.winningLine) {
    highlightWinnerCells(board, friendGame.winningLine);
  }
}

function restoreBotBoardUI() {
  if (!botBoard) {
    return;
  }

  const cells = botBoard.querySelectorAll(".cell");

  cells.forEach((cell) => {
    const index = Number(cell.dataset.index);
    const value = botGame.state[index] ?? "";

    setCellValue(cell, value);
    cell.classList.remove("winner-cell");
    cell.disabled = true;
  });

  if (botGame.winningLine) {
    highlightWinnerCells(botBoard, botGame.winningLine);
  }

  if (botGame.isFinished) {
    lockBoard(botBoard);
    return;
  }

  if (botGame.turn === "player" && !botGame.isBotThinking) {
    unlockBoard(botBoard, botGame.state);
    return;
  }

  lockBoard(botBoard);
}

function restoreGameState(state) {
  isRestoringState = true;
  stopBotTurnTimer();

  const safeState = state && typeof state === "object" ? state : {};
  const normalizedFriendGame = normalizeFriendGameState(safeState.friendGame);
  const normalizedBotGame = normalizeBotGameState(safeState.botGame);
  const normalizedMonetization = normalizeMonetizationState(safeState.monetization);
  const safeActiveScreen = normalizeScreenState(safeState.activeScreen);

  friendGame.scores = normalizedFriendGame.scores;
  refreshFriendScores();

  friendGame.state = normalizedFriendGame.state;
  friendGame.currentPlayer = normalizedFriendGame.currentPlayer;
  friendGame.isFinished = normalizedFriendGame.isFinished;
  friendGame.winningLine = normalizedFriendGame.winningLine;

  if (statusText) {
    statusText.textContent = normalizedFriendGame.statusText;
  }

  if (statusHint) {
    statusHint.textContent = normalizedFriendGame.statusHint;
  }

  if (statusPanel) {
    statusPanel.dataset.state = normalizedFriendGame.statusPanelState;
  }

  if (friendGameScreen) {
    friendGameScreen.dataset.matchState = normalizedFriendGame.matchState;
  }

  restoreFriendBoardUI();
  restartBtn?.classList.toggle("game-over", friendGame.isFinished);

  monetizationState.finishedMatchesSinceLastInterstitial = normalizedMonetization.finishedMatchesSinceLastInterstitial;
  monetizationState.lastInterstitialAt = normalizedMonetization.lastInterstitialAt;

  botGame.scores = normalizedBotGame.scores;
  refreshBotScores();

  botGame.state = normalizedBotGame.state;
  botGame.isFinished = normalizedBotGame.isFinished;
  botGame.winningLine = normalizedBotGame.winningLine;
  botGame.difficulty = normalizedBotGame.difficulty;
  botGame.playerSymbol = normalizedBotGame.playerSymbol;
  botGame.botSymbol = normalizedBotGame.botSymbol;
  botGame.turn = normalizedBotGame.turn;
  botGame.isBotThinking = normalizedBotGame.isBotThinking;

  updateDifficultyLabel();

  if (botStatusText) {
    botStatusText.textContent = normalizedBotGame.statusText;
  }

  if (botStatusHint) {
    botStatusHint.textContent = normalizedBotGame.statusHint;
  }

  if (botStatusPanel) {
    botStatusPanel.dataset.state = normalizedBotGame.statusPanelState;
  }

  if (botGameScreen) {
    botGameScreen.dataset.matchState = normalizedBotGame.matchState;
  }

  restoreBotBoardUI();
  botRestartBtn?.classList.toggle("game-over", botGame.isFinished);

  closeExitConfirmModal({ keepPendingTarget: false });

  const screenById = {
    startScreen,
    menuScreen,
    botDifficultyScreen,
    friendGameScreen,
    botGameScreen,
  };

  showScreen(screenById[safeActiveScreen] ?? startScreen);

  botGame.shouldResumeBotMove = !botGame.isFinished && botGame.turn === "bot";
  botGame.isBotThinking = false;
  refreshCurrentStatuses();

  isRestoringState = false;
  resumeBotTurnIfNeeded();
  saveGameState();
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
      setCellValue(cell, "");
      cell.disabled = false;
      cell.classList.remove("winner-cell");
    });
  }

  updateStatus(statusPanel, statusText, statusHint, getFriendTurnStatusPayload("X"));

  if (friendGameScreen) {
    friendGameScreen.dataset.matchState = "active";
  }

  restartBtn?.classList.remove("game-over");
  scheduleAdaptiveLayoutSync();
  syncPlatformGameplayState();
  saveGameState();
}

function resetFriendScores() {
  friendGame.scores = { X: 0, O: 0, draws: 0 };
  refreshFriendScores();
  saveGameState();
}

function finishFriendGame({ winnerSymbol = null, isDraw = false, line = null } = {}) {
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
    isDraw ? getDrawStatusPayload() : getFriendWinnerStatusPayload(winnerSymbol)
  );

  if (friendGameScreen) {
    friendGameScreen.dataset.matchState = "finished";
  }

  restartBtn?.classList.add("game-over");
  scheduleAdaptiveLayoutSync();
  syncPlatformGameplayState();
  saveGameState();
  recordFinishedMatchAndMaybeShowAd();
}

function handleFriendCellClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLButtonElement) || !target.classList.contains("cell")) {
    return;
  }

  const index = Number(target.dataset.index);

  if (getActiveScreenId() !== "friendGameScreen" || friendGame.isFinished || friendGame.state[index]) {
    return;
  }

  friendGame.state[index] = friendGame.currentPlayer;
  setCellValue(target, friendGame.currentPlayer);
  target.disabled = true;
  saveGameState();

  const winnerResult = getWinnerForState(friendGame.state);
  if (winnerResult) {
    friendGame.scores[winnerResult.winner] += 1;
    refreshFriendScores();
    finishFriendGame({ winnerSymbol: winnerResult.winner, line: winnerResult.line });
    return;
  }

  if (getAvailableMoves(friendGame.state).length === 0) {
    friendGame.scores.draws += 1;
    refreshFriendScores();
    finishFriendGame({ isDraw: true });
    return;
  }

  friendGame.currentPlayer = friendGame.currentPlayer === "X" ? "O" : "X";
  updateStatus(statusPanel, statusText, statusHint, getFriendTurnStatusPayload(friendGame.currentPlayer));
  saveGameState();
}

function stopBotTurnTimer() {
  if (botGame.botTurnTimeoutId) {
    clearTimeout(botGame.botTurnTimeoutId);
    botGame.botTurnTimeoutId = null;
  }

  botGame.isBotThinking = false;
  botGame.moveGeneration += 1;
}

function canBotActNow() {
  return (
    !document.hidden &&
    !isModalOpen &&
    !isAdPauseActive &&
    getActiveScreenId() === "botGameScreen" &&
    !botGame.isFinished &&
    botGame.turn === "bot"
  );
}

function resumeBotTurnIfNeeded() {
  if (!botGame.shouldResumeBotMove && !(botGame.turn === "bot" && !botGame.isFinished)) {
    return;
  }

  if (!canBotActNow()) {
    return;
  }

  botGame.shouldResumeBotMove = false;
  applyBotMove();
}

function updateDifficultyLabel() {
  const level = botGame.difficulty;
  const label = t(difficultyMeta[level].translationKey);

  if (botDifficultyLabel) {
    botDifficultyLabel.textContent = t("bot.difficultyLabel", { label });
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

function finishBotGame({ winner = null, isDraw = false, line = null } = {}) {
  botGame.isFinished = true;
  botGame.winningLine = line;
  botGame.shouldResumeBotMove = false;
  stopBotTurnTimer();

  if (line) {
    highlightWinnerCells(botBoard, line);
  }

  lockBoard(botBoard);
  updateStatus(
    botStatusPanel,
    botStatusText,
    botStatusHint,
    isDraw
      ? getDrawStatusPayload({ botMode: true })
      : winner === "bot"
        ? getBotWinnerStatusPayload()
        : getPlayerWinnerStatusPayload()
  );

  if (botGameScreen) {
    botGameScreen.dataset.matchState = "finished";
  }

  botRestartBtn?.classList.add("game-over");
  scheduleAdaptiveLayoutSync();
  syncPlatformGameplayState();
  saveGameState();
  recordFinishedMatchAndMaybeShowAd();
}


function applyBotMove() {
  if (botGame.isFinished || botGame.turn !== "bot" || botGame.isBotThinking) {
    return;
  }

  if (!canBotActNow()) {
    botGame.shouldResumeBotMove = true;
    updateStatus(botStatusPanel, botStatusText, botStatusHint, getBotThinkingStatusPayload({ resumePending: true }));
    setBotBoardInteractive(false);
    saveGameState();
    return;
  }

  stopBotTurnTimer();
  const activeGeneration = botGame.moveGeneration;
  botGame.isBotThinking = true;
  botGame.shouldResumeBotMove = false;
  updateStatus(botStatusPanel, botStatusText, botStatusHint, getBotThinkingStatusPayload());
  setBotBoardInteractive(false);
  saveGameState();

  botGame.botTurnTimeoutId = window.setTimeout(() => {
    botGame.botTurnTimeoutId = null;

    if (activeGeneration !== botGame.moveGeneration) {
      return;
    }

    if (!canBotActNow()) {
      botGame.isBotThinking = false;
      botGame.shouldResumeBotMove = true;
      saveGameState();
      return;
    }

    if (botGame.isFinished || botGame.turn !== "bot") {
      botGame.isBotThinking = false;
      saveGameState();
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
      saveGameState();
      return;
    }

    botGame.state[move] = botGame.botSymbol;

    const cell = botBoard?.querySelector(`.cell[data-index="${move}"]`);
    if (cell) {
      setCellValue(cell, botGame.botSymbol);
      cell.disabled = true;
    }

    const winner = getWinnerForState(botGame.state);
    if (winner) {
      botGame.scores.bot += 1;
      refreshBotScores();
      finishBotGame({ winner: "bot", line: winner.line });
      return;
    }

    if (getAvailableMoves(botGame.state).length === 0) {
      botGame.scores.draws += 1;
      refreshBotScores();
      finishBotGame({ isDraw: true });
      return;
    }

    botGame.isBotThinking = false;
    botGame.shouldResumeBotMove = false;
    botGame.turn = "player";
    setBotBoardInteractive(true);
    updateStatus(
      botStatusPanel,
      botStatusText,
      botStatusHint,
      getBotPlayerTurnStatusPayload(botGame.playerSymbol)
    );
    saveGameState();
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
  botGame.shouldResumeBotMove = false;

  if (botBoard) {
    botBoard.querySelectorAll(".cell").forEach((cell) => {
      setCellValue(cell, "");
      cell.disabled = false;
      cell.classList.remove("winner-cell");
    });
  }

  if (botGameScreen) {
    botGameScreen.dataset.matchState = "active";
  }

  botRestartBtn?.classList.remove("game-over");
  updateDifficultyLabel();
  scheduleAdaptiveLayoutSync();
  syncPlatformGameplayState();

  if (botGame.turn === "player") {
    setBotBoardInteractive(true);
    updateStatus(botStatusPanel, botStatusText, botStatusHint, getBotPlayerTurnStatusPayload(botGame.playerSymbol));
  } else {
    setBotBoardInteractive(false);
    updateStatus(botStatusPanel, botStatusText, botStatusHint, getBotStartsStatusPayload());
    botGame.shouldResumeBotMove = true;
    resumeBotTurnIfNeeded();
  }

  saveGameState();
}


function resetBotScores() {
  botGame.scores = { player: 0, bot: 0, draws: 0 };
  refreshBotScores();
  saveGameState();
}

function handleBotCellClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLButtonElement) || !target.classList.contains("cell")) {
    return;
  }

  const index = Number(target.dataset.index);

  if (
    getActiveScreenId() !== "botGameScreen" ||
    botGame.isFinished ||
    botGame.isBotThinking ||
    botGame.turn !== "player" ||
    botGame.state[index]
  ) {
    return;
  }

  botGame.state[index] = botGame.playerSymbol;
  setCellValue(target, botGame.playerSymbol);
  target.disabled = true;

  const winner = getWinnerForState(botGame.state);
  if (winner) {
    botGame.scores.player += 1;
    refreshBotScores();
    finishBotGame({ winner: "player", line: winner.line });
    return;
  }

  if (getAvailableMoves(botGame.state).length === 0) {
    botGame.scores.draws += 1;
    refreshBotScores();
    finishBotGame({ isDraw: true });
    return;
  }

  botGame.turn = "bot";
  botGame.shouldResumeBotMove = true;
  saveGameState();
  resumeBotTurnIfNeeded();
}

function isFriendMatchInProgress() {
  return !friendGame.isFinished && friendGame.state.some((cell) => cell !== "");
}

function isBotMatchInProgress() {
  return !botGame.isFinished && botGame.state.some((cell) => cell !== "");
}

function openBotGameWithDifficulty(level) {
  if (getActiveScreenId() === "botGameScreen" && botGame.difficulty === getSafeDifficulty(level) && !botGame.isFinished) {
    return;
  }

  botGame.difficulty = getSafeDifficulty(level);
  updateDifficultyLabel();
  resetBotBoard();
  showScreen(botGameScreen);
  saveGameState();
}

bindAction(themeToggleBtn, (event) => {
  event.stopPropagation();
  setThemeMenuOpen(!isThemeMenuOpen());
});

themeOptionButtons.forEach((button) => {
  bindAction(button, async () => {
    applyTheme(button.dataset.themeOption, { shouldSave: true });
    setThemeMenuOpen(false);
    themeToggleBtn?.focus({ preventScroll: true });
    await showUserActionInterstitial("theme-select");
  });
});

themeMenu?.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.addEventListener("click", (event) => {
  const clickedInsideThemePicker = event.target instanceof Node && themePicker?.contains(event.target);

  if (!isThemeMenuOpen() || clickedInsideThemePicker) {
    return;
  }

  setThemeMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !isThemeMenuOpen()) {
    return;
  }

  setThemeMenuOpen(false);
  themeToggleBtn?.focus({ preventScroll: true });
});

bindAction(startBtn, () => {
  showScreen(menuScreen);
});

bindAction(backBtn, () => {
  showScreen(startScreen);
});

bindAction(friendModeBtn, () => {
  const hasSavedProgress = friendGame.state.some((cell) => cell) && !friendGame.isFinished;
  if (!hasSavedProgress) {
    resetFriendBoard();
  }
  showScreen(friendGameScreen);
  saveGameState();
});

bindAction(botModeBtn, () => {
  showScreen(botDifficultyScreen);
  saveGameState();
});

bindAction(easyLevelBtn, () => openBotGameWithDifficulty("easy"));
bindAction(mediumLevelBtn, () => openBotGameWithDifficulty("medium"));
bindAction(hardLevelBtn, () => openBotGameWithDifficulty("hard"));

bindAction(botDifficultyBackBtn, () => {
  return runAfterUserActionInterstitial("mode-selection", () => {
    showScreen(menuScreen);
    saveGameState();
  });
});

bindAction(backToMenuBtn, () => {
  if (isFriendMatchInProgress()) {
    openExitConfirmModal(menuScreen);
    return;
  }

  return runAfterUserActionInterstitial("to-menu", () => leaveGameTo(menuScreen));
});

bindAction(botBackToMenuBtn, () => {
  if (isBotMatchInProgress()) {
    openExitConfirmModal(menuScreen);
    return;
  }

  return runAfterUserActionInterstitial("to-menu", () => leaveGameTo(menuScreen));
});

bindAction(botChangeDifficultyBtn, () => {
  if (isBotMatchInProgress()) {
    openExitConfirmModal(botDifficultyScreen);
    return;
  }

  return runAfterUserActionInterstitial("change-difficulty", () => leaveGameTo(botDifficultyScreen));
});

bindAction(restartBtn, resetFriendBoard);
bindAction(botRestartBtn, () => resetBotBoard({ keepStarter: false }));
bindAction(resetScoreBtn, resetFriendScores);
bindAction(botResetScoreBtn, resetBotScores);

board?.addEventListener("click", handleFriendCellClick);
botBoard?.addEventListener("click", handleBotCellClick);

bindAction(cancelExitBtn, () => closeExitConfirmModal({ keepPendingTarget: false }));

bindAction(confirmExitBtn, async () => {
  if (isLandscapeLocked) {
    closeExitConfirmModal({ keepPendingTarget: false });
    return;
  }

  const targetScreen = pendingExitTarget ?? menuScreen;
  const reason = targetScreen === botDifficultyScreen ? "change-difficulty" : "to-menu";
  closeExitConfirmModal({ keepPendingTarget: false, resumeGameplay: false });
  await showUserActionInterstitial(reason);
  leaveGameTo(targetScreen);
  saveGameState();
});

modalOverlay?.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeExitConfirmModal({ keepPendingTarget: false });
  }
});

exitConfirmModal?.addEventListener("click", (event) => {
  event.stopPropagation();
});

window.addEventListener("resize", updateOrientationState, { passive: true });
window.addEventListener("orientationchange", updateOrientationState, { passive: true });
document.addEventListener("DOMContentLoaded", updateOrientationState, { once: true });
document.addEventListener("visibilitychange", handlePageVisibilityChange);
window.addEventListener("pagehide", () => {
  if (interstitialTimerId) {
    window.clearTimeout(interstitialTimerId);
    interstitialTimerId = null;
  }

  try {
    getAdvertisementApi()?.hideBannerAdv?.();
  } catch (error) {
    console.warn("Не удалось скрыть sticky-баннер при закрытии страницы", error);
  }

  if (gameplayPlatformActive || gameplayDesiredActive) {
    const gameplayApi = getYandexGameplayApi();

    try {
      gameplayApi?.stop?.();
    } catch (error) {
      console.warn("Не удалось остановить GameplayAPI при закрытии страницы", error);
    } finally {
      gameplayPlatformActive = false;
      gameplayDesiredActive = false;
    }
  }
});

async function bootstrapGame() {
  applyTheme(loadSavedTheme());
  disablePageScrollGestures();
  applyLanguage(activeLanguage);
  updateOrientationState();
  closeExitConfirmModal();
  scheduleAdaptiveLayoutSync();

  initYandexGamesSdk().finally(() => {
    syncPlatformGameplayState();
    syncStickyBannerState();
    scheduleAdaptiveLayoutSync();
    markGameReadyWhenPossible();
  });

  const savedState = loadGameState();

  if (savedState) {
    restoreGameState(savedState);
  } else {
    resetFriendBoard();
    resetFriendScores();
    resetBotBoard({ keepStarter: true });
    botGame.turn = "player";
    updateStatus(botStatusPanel, botStatusText, botStatusHint, getBotPlayerTurnStatusPayload(botGame.playerSymbol));
    setBotBoardInteractive(true);
    resetBotScores();
    showScreen(startScreen);
    saveGameState();
  }

  markBootComplete();

  // Дожидаемся завершения первого кадра после восстановления UI
  // и только затем сообщаем платформе о готовности игры.
  window.requestAnimationFrame(() => {
    updateOrientationState();
    syncPlatformGameplayState();
    syncStickyBannerState();
    scheduleAdaptiveLayoutSync();
    markBootComplete();
    markGameReadyWhenPossible();
  });
}

bootstrapGame();
