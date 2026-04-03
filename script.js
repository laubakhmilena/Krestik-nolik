const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const startScreen = document.getElementById("startScreen");
const menuScreen = document.getElementById("menuScreen");

if (startBtn && backBtn && startScreen && menuScreen) {
  startBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
  });

  backBtn.addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
}
