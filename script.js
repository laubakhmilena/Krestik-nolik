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
const friendRewardedRestartBtn = document.getElementById("friendRewardedRestartBtn");
const botRewardedRestartBtn = document.getElementById("botRewardedRestartBtn");
const orientationOverlay = document.getElementById("orientationOverlay");
const modalOverlay = document.getElementById("modalOverlay");
const exitConfirmModal = document.getElementById("exitConfirmModal");
const confirmExitBtn = document.getElementById("confirmExitBtn");
const cancelExitBtn = document.getElementById("cancelExitBtn");
const STORAGE_KEY = "ticTacToeState";
const STORAGE_VERSION = 1;
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

const BOT_THINK_DELAY_MS = 450;
const INTERSTITIAL_MIN_MATCHES = 2;
const INTERSTITIAL_MIN_INTERVAL_MS = 90_000;
const difficultyMeta = {
  easy: { label: "Легко" },
  medium: { label: "Средне" },
  hard: { label: "Сложно" },
};

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
let isRewardedPending = false;
let interstitialTimerId = null;

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

function disablePageScrollGestures() {
  const shouldAllowNativeScroll = (eventTarget) => {
    if (!(eventTarget instanceof Element)) {
      return false;
    }

    const scrollContainer = eventTarget.closest(".screen, .confirm-modal, .orientation-card");
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
  document.addEventListener("contextmenu", (event) => event.preventDefault());
}

function isPortraitOrientation() {
  const byMedia = window.matchMedia?.("(orientation: portrait)").matches;
  const byViewport = window.innerHeight >= window.innerWidth;
  return byMedia ?? byViewport;
}

let orientationFrameId = null;
let isLandscapeLocked = false;
let wasPortraitOnLastApply = null;

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
  const portrait = isPortraitOrientation();
  const orientationChanged = wasPortraitOnLastApply !== portrait;
  wasPortraitOnLastApply = portrait;

  if (orientationOverlay) {
    orientationOverlay.classList.toggle("hidden", portrait);
    orientationOverlay.setAttribute("aria-hidden", portrait ? "true" : "false");
  }

  document.body.classList.toggle("landscape-locked", !portrait);

  if (!portrait) {
    if (!isLandscapeLocked || orientationChanged) {
      isLandscapeLocked = true;
      closeExitConfirmModal({ keepPendingTarget: false });
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      orientationOverlay?.focus({ preventScroll: true });
    }
    syncUiInteractivity();
    syncPlatformGameplayState();
    updateRewardedButtonsState();
    return;
  }

  if (isLandscapeLocked) {
    isLandscapeLocked = false;
    closeExitConfirmModal({ keepPendingTarget: false });
    focusScreenPrimaryAction(
      [startScreen, menuScreen, botDifficultyScreen, friendGameScreen, botGameScreen].find(
        (screen) => screen && !screen.classList.contains("hidden")
      ) ?? startScreen
    );
  }

  syncUiInteractivity();

  if (gameReadyPending) {
    markGameReadyWhenPossible();
  }

  syncPlatformGameplayState();
  updateRewardedButtonsState();
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
      existingScript.addEventListener("load", () => resolve(Boolean(window.YaGames?.init)), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const sdkScript = document.createElement("script");
    sdkScript.src = YANDEX_SDK_URL;
    sdkScript.async = true;
    sdkScript.onload = () => resolve(Boolean(window.YaGames?.init));
    sdkScript.onerror = () => {
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
      return null;
    }

    const sdkScriptReady = await ensureYandexSdkScript();
    if (!sdkScriptReady || !window.YaGames?.init) {
      return null;
    }

    try {
      yandexGamesSdk = await window.YaGames.init();
      sdkInitialized = true;
      return yandexGamesSdk;
    } catch (error) {
      console.warn("SDK Яндекс Игр не инициализирован, продолжаем в гостевом режиме.", error);
      yandexGamesSdk = null;
      sdkInitialized = false;
      return null;
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

function canUseRewardedRematch(mode) {
  const adApi = getAdvertisementApi();
  const isFriendMode = mode === "friend";
  const targetScreenId = isFriendMode ? "friendGameScreen" : "botGameScreen";
  const isMatchFinished = isFriendMode ? friendGame.isFinished : botGame.isFinished;

  return (
    getActiveScreenId() === targetScreenId &&
    isMatchFinished &&
    !document.hidden &&
    !isModalOpen &&
    !isLandscapeLocked &&
    !isInterstitialPending &&
    !isRewardedPending &&
    !isAdPauseActive &&
    Boolean(adApi?.showRewardedVideo)
  );
}

function setRewardedButtonsBusy(isBusy) {
  [friendRewardedRestartBtn, botRewardedRestartBtn].forEach((button) => {
    if (!button) {
      return;
    }

    button.disabled = isBusy || !button.dataset.adEnabled || button.dataset.adEnabled === "false";
    button.closest(".game-actions")?.classList.toggle("ad-loading", isBusy);
  });
}

function updateRewardedButtonsState() {
  const adApi = getAdvertisementApi();
  const hasRewardedMethod = Boolean(adApi?.showRewardedVideo);
  const buttonStateById = {
    friendRewardedRestartBtn: canUseRewardedRematch("friend"),
    botRewardedRestartBtn: canUseRewardedRematch("bot"),
  };

  [friendRewardedRestartBtn, botRewardedRestartBtn].forEach((button) => {
    if (!button) {
      return;
    }

    button.dataset.adEnabled = String(hasRewardedMethod);
    button.disabled = !buttonStateById[button.id];
    button.hidden = !hasRewardedMethod;
    button.setAttribute(
      "aria-label",
      hasRewardedMethod
        ? "Посмотреть рекламу и получить быстрый реванш"
        : "Rewarded-реклама сейчас недоступна"
    );
  });
}

function canShowInterstitialNow() {
  if (
    isInterstitialPending ||
    isRewardedPending ||
    isAdPauseActive ||
    isModalOpen ||
    isLandscapeLocked ||
    !isCurrentScreenSafeForAdBreak()
  ) {
    return false;
  }

  const adApi = getAdvertisementApi();
  if (!adApi?.showFullscreenAdv) {
    return false;
  }

  const enoughMatches = monetizationState.finishedMatchesSinceLastInterstitial >= INTERSTITIAL_MIN_MATCHES;
  const enoughTimePassed = Date.now() - monetizationState.lastInterstitialAt >= INTERSTITIAL_MIN_INTERVAL_MS;
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
  updateRewardedButtonsState();
  syncPlatformGameplayState();
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

  updateRewardedButtonsState();
  syncPlatformGameplayState();
  saveGameState();
}

function showInterstitialAd(reason = "match-end") {
  if (!canShowInterstitialNow()) {
    return Promise.resolve(false);
  }

  const adApi = getAdvertisementApi();
  isInterstitialPending = true;

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

function showRewardedAd(onReward) {
  if (isRewardedPending || isInterstitialPending || isAdPauseActive || isModalOpen || isLandscapeLocked) {
    return Promise.resolve(false);
  }

  const adApi = getAdvertisementApi();
  if (!adApi?.showRewardedVideo) {
    updateRewardedButtonsState();
    return Promise.resolve(false);
  }

  isRewardedPending = true;
  setRewardedButtonsBusy(true);

  return new Promise((resolve) => {
    let isRewardGranted = false;
    let isCompleted = false;

    const complete = (result) => {
      if (isCompleted) {
        return;
      }

      isCompleted = true;
      isRewardedPending = false;
      setRewardedButtonsBusy(false);
      updateRewardedButtonsState();
      resumeGameAfterAd();
      resolve(result);
    };

    try {
      adApi.showRewardedVideo({
        callbacks: {
          onOpen: () => {
            pauseGameForAd("rewarded:quick-rematch");
          },
          onRewarded: () => {
            isRewardGranted = true;
          },
          onClose: () => {
            if (isRewardGranted) {
              try {
                onReward?.();
              } catch (error) {
                console.warn("Ошибка применения rewarded-награды.", error);
              }
            }
            complete(isRewardGranted);
          },
          onError: (error) => {
            console.warn("Не удалось показать rewarded-видео.", error);
            complete(false);
          },
        },
      });
    } catch (error) {
      console.warn("Ошибка запуска rewarded-видео.", error);
      complete(false);
    }
  });
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
  }, 240);
}

function isGameScreenActive() {
  const activeScreenId = getActiveScreenId();
  return activeScreenId === "friendGameScreen" || activeScreenId === "botGameScreen";
}

function shouldGameplayBeActive() {
  return (
    isGameScreenActive() &&
    isPortraitOrientation() &&
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
    gameReadyPending = true;
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
  updateRewardedButtonsState();

  if (document.hidden && botGame.turn === "bot") {
    botGame.shouldResumeBotMove = !botGame.isFinished;
    stopBotTurnTimer();
    updateStatus(botStatusPanel, botStatusText, botStatusHint, "Бот думает...", "Продолжите игру после возврата");
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
    if (button.disabled) {
      return;
    }

    button.disabled = true;
    try {
      handler(event);
    } finally {
      window.setTimeout(() => {
        button.disabled = false;
      }, 120);
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
  });

  closeExitConfirmModal({ keepPendingTarget: false });

  if (isPortraitOrientation()) {
    focusScreenPrimaryAction(screenToShow);
  }

  if (!isRestoringState && !isSameScreen) {
    saveGameState();
  }

  isShowingScreen = false;
  updateRewardedButtonsState();
  syncPlatformGameplayState();
  resumeBotTurnIfNeeded();
}

function closeExitConfirmModal({ keepPendingTarget = false } = {}) {
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
  updateRewardedButtonsState();
  syncPlatformGameplayState();
  resumeBotTurnIfNeeded();
}

function openExitConfirmModal(targetScreen) {
  if (!targetScreen || !isPortraitOrientation() || isLandscapeLocked) {
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
  updateRewardedButtonsState();
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

function getActiveScreenId() {
  const validScreens = [startScreen, menuScreen, botDifficultyScreen, friendGameScreen, botGameScreen];
  const activeScreen = validScreens.find((screen) => screen && !screen.classList.contains("hidden"));

  if (!activeScreen) {
    return "startScreen";
  }

  return activeScreen.id;
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
  const defaultStatus = winnerResult ? `Победил ${winnerResult.winner}` : isDraw ? "Ничья" : `Ход: ${currentPlayer}`;
  const defaultHint = winnerResult
    ? "Партия завершена. Нажмите «Играть снова», чтобы начать новую."
    : isDraw
      ? "Ничья. Попробуйте ещё раз в новой партии."
      : "Сделайте ход на поле 3×3";

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
    statusText:
      typeof rawFriendState?.statusText === "string" && rawFriendState.statusText.trim()
        ? rawFriendState.statusText
        : defaultStatus,
    statusHint:
      typeof rawFriendState?.statusHint === "string" && rawFriendState.statusHint.trim()
        ? rawFriendState.statusHint
        : defaultHint,
    statusPanelState: getSafePanelState(rawFriendState?.statusPanelState),
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
  const defaultStatus = winnerResult
    ? winnerResult.winner === botSymbol
      ? "Победил бот"
      : "Победили вы"
    : isDraw
      ? "Ничья"
      : turn === "bot"
        ? "Бот думает..."
        : `Ваш ход: ${playerSymbol}`;
  const defaultHint = winnerResult
    ? "Партия завершена. Нажмите «Играть снова», чтобы начать новую."
    : isDraw
      ? "Ничья. Попробуйте другую стратегию."
      : turn === "bot"
        ? "Подождите, бот выбирает ход"
        : "Сделайте ход на поле 3×3";
  const defaultPanelState = winnerResult ? "win" : isDraw ? "draw" : turn === "bot" ? "thinking" : "turn";

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
    statusText:
      typeof rawBotState?.statusText === "string" && rawBotState.statusText.trim()
        ? rawBotState.statusText
        : defaultStatus,
    statusHint:
      typeof rawBotState?.statusHint === "string" && rawBotState.statusHint.trim()
        ? rawBotState.statusHint
        : defaultHint,
    statusPanelState: getSafePanelState(rawBotState?.statusPanelState ?? defaultPanelState),
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
      statusText: statusText?.textContent ?? "Ход: X",
      statusHint: statusHint?.textContent ?? "Сделайте ход на поле 3×3",
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
      statusText: botStatusText?.textContent ?? `Ваш ход: ${botGame.playerSymbol}`,
      statusHint: botStatusHint?.textContent ?? "Сделайте ход на поле 3×3",
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

    cell.textContent = value;
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

    cell.textContent = value;
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

  isRestoringState = false;
  updateRewardedButtonsState();
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
  updateRewardedButtonsState();
  saveGameState();
}

function resetFriendScores() {
  friendGame.scores = { X: 0, O: 0, draws: 0 };
  refreshFriendScores();
  saveGameState();
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
  updateRewardedButtonsState();
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
  target.textContent = friendGame.currentPlayer;
  target.disabled = true;
  saveGameState();

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
    isPortraitOrientation() &&
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
    resultMessage,
    resultMessage === "Ничья"
      ? "Ничья. Попробуйте другую стратегию."
      : "Партия завершена. Нажмите «Играть снова», чтобы начать новую."
  );

  if (botGameScreen) {
    botGameScreen.dataset.matchState = "finished";
  }

  botRestartBtn?.classList.add("game-over");
  updateRewardedButtonsState();
  saveGameState();
  recordFinishedMatchAndMaybeShowAd();
}


function applyBotMove() {
  if (botGame.isFinished || botGame.turn !== "bot" || botGame.isBotThinking) {
    return;
  }

  if (!canBotActNow()) {
    botGame.shouldResumeBotMove = true;
    updateStatus(botStatusPanel, botStatusText, botStatusHint, "Бот думает...", "Продолжите игру, чтобы бот сделал ход");
    setBotBoardInteractive(false);
    saveGameState();
    return;
  }

  stopBotTurnTimer();
  const activeGeneration = botGame.moveGeneration;
  botGame.isBotThinking = true;
  botGame.shouldResumeBotMove = false;
  updateStatus(botStatusPanel, botStatusText, botStatusHint, "Бот думает...", "Подождите, бот выбирает ход");
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
    botGame.shouldResumeBotMove = false;
    botGame.turn = "player";
    setBotBoardInteractive(true);
    updateStatus(
      botStatusPanel,
      botStatusText,
      botStatusHint,
      `Ваш ход: ${botGame.playerSymbol}`,
      "Сделайте ход на поле 3×3"
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
  updateRewardedButtonsState();

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

function handleRewardedQuickRematch(mode) {
  const isFriendMode = mode === "friend";
  if (!canUseRewardedRematch(mode)) {
    return;
  }

  const applyReward = () => {
    if (isFriendMode) {
      resetFriendBoard();
      return;
    }

    resetBotBoard({ keepStarter: false });
  };

  showRewardedAd(applyReward);
}

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
  showScreen(menuScreen);
  saveGameState();
});

bindAction(backToMenuBtn, () => {
  if (isFriendMatchInProgress()) {
    openExitConfirmModal(menuScreen);
    return;
  }

  leaveGameTo(menuScreen);
});

bindAction(botBackToMenuBtn, () => {
  if (isBotMatchInProgress()) {
    openExitConfirmModal(menuScreen);
    return;
  }

  leaveGameTo(menuScreen);
});

bindAction(botChangeDifficultyBtn, () => {
  if (isBotMatchInProgress()) {
    openExitConfirmModal(botDifficultyScreen);
    return;
  }

  leaveGameTo(botDifficultyScreen);
});

bindAction(restartBtn, resetFriendBoard);
bindAction(botRestartBtn, () => resetBotBoard({ keepStarter: false }));
bindAction(resetScoreBtn, resetFriendScores);
bindAction(botResetScoreBtn, resetBotScores);
bindAction(friendRewardedRestartBtn, () => handleRewardedQuickRematch("friend"));
bindAction(botRewardedRestartBtn, () => handleRewardedQuickRematch("bot"));

board?.addEventListener("click", handleFriendCellClick);
botBoard?.addEventListener("click", handleBotCellClick);

bindAction(cancelExitBtn, () => closeExitConfirmModal({ keepPendingTarget: false }));

bindAction(confirmExitBtn, () => {
  if (isLandscapeLocked) {
    closeExitConfirmModal({ keepPendingTarget: false });
    return;
  }

  leaveGameTo(pendingExitTarget ?? menuScreen);
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
  disablePageScrollGestures();
  updateOrientationState();
  closeExitConfirmModal();
  updateRewardedButtonsState();

  initYandexGamesSdk().finally(() => {
    updateRewardedButtonsState();
    syncPlatformGameplayState();
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
    updateStatus(botStatusPanel, botStatusText, botStatusHint, `Ваш ход: ${botGame.playerSymbol}`);
    setBotBoardInteractive(true);
    resetBotScores();
    showScreen(startScreen);
    saveGameState();
  }

  // Дожидаемся завершения первого кадра после восстановления UI
  // и только затем сообщаем платформе о готовности игры.
  window.requestAnimationFrame(() => {
    updateOrientationState();
    updateRewardedButtonsState();
    syncPlatformGameplayState();
    markGameReadyWhenPossible();
  });
}

bootstrapGame();
