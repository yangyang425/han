const coverScreen = document.querySelector("#coverScreen");
const confessionScreen = document.querySelector("#confessionScreen");
const unlockTrack = document.querySelector("#unlockTrack");
const unlockHandle = document.querySelector("#unlockHandle");
const unlockFill = document.querySelector("#unlockFill");
const yesButton = document.querySelector("#yesButton");
const moreButton = document.querySelector("#moreButton");
const toast = document.querySelector("#toast");

let toastTimer;
let dragState = null;
let unlocked = false;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function burst(x, y, count = 14) {
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--x", `${Math.random() * 150 - 75}px`);
    heart.style.animationDelay = `${i * 18}ms`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1050);
  }
}

function openConfession(x, y) {
  if (unlocked) return;
  unlocked = true;
  unlockTrack.classList.add("is-unlocked");
  unlockTrack.setAttribute("aria-valuenow", "100");
  moveUnlockHandle(getMaxUnlockX());
  burst(x, y, 12);
  coverScreen.classList.remove("is-active");
  confessionScreen.classList.add("is-active");
  showToast("小信已经打开啦");
}

function getMaxUnlockX() {
  const trackRect = unlockTrack.getBoundingClientRect();
  const handleRect = unlockHandle.getBoundingClientRect();
  return Math.max(0, trackRect.width - handleRect.width - 8);
}

function moveUnlockHandle(x) {
  const max = getMaxUnlockX();
  const safeX = Math.max(0, Math.min(max, x));
  const percent = max === 0 ? 0 : Math.round((safeX / max) * 100);
  unlockHandle.style.transform = `translateX(${safeX}px)`;
  unlockFill.style.width = `${safeX + 48}px`;
  unlockTrack.setAttribute("aria-valuenow", String(percent));
  return { safeX, max, percent };
}

function resetUnlockHandle() {
  unlockTrack.classList.remove("is-dragging");
  moveUnlockHandle(0);
}

unlockTrack.addEventListener("pointerdown", (event) => {
  if (unlocked) return;
  const trackRect = unlockTrack.getBoundingClientRect();
  const handleRect = unlockHandle.getBoundingClientRect();
  dragState = {
    trackLeft: trackRect.left,
    handleHalf: handleRect.width / 2
  };
  unlockTrack.classList.add("is-dragging");
  unlockTrack.setPointerCapture(event.pointerId);
  moveUnlockHandle(event.clientX - dragState.trackLeft - dragState.handleHalf);
});

unlockTrack.addEventListener("pointermove", (event) => {
  if (!dragState || unlocked) return;
  moveUnlockHandle(event.clientX - dragState.trackLeft - dragState.handleHalf);
});

unlockTrack.addEventListener("pointerup", (event) => {
  if (!dragState || unlocked) return;
  const result = moveUnlockHandle(event.clientX - dragState.trackLeft - dragState.handleHalf);
  dragState = null;
  unlockTrack.classList.remove("is-dragging");
  unlockTrack.releasePointerCapture(event.pointerId);

  if (result.percent >= 86) {
    openConfession(event.clientX, event.clientY);
  } else {
    resetUnlockHandle();
  }
});

unlockTrack.addEventListener("pointercancel", (event) => {
  if (!dragState || unlocked) return;
  dragState = null;
  unlockTrack.releasePointerCapture(event.pointerId);
  resetUnlockHandle();
});

unlockTrack.addEventListener("keydown", (event) => {
  if (unlocked) return;
  if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const rect = unlockTrack.getBoundingClientRect();
    openConfession(rect.right - 32, rect.top + rect.height / 2);
  }
});

yesButton.addEventListener("click", (event) => {
  burst(event.clientX, event.clientY, 22);
  showToast("那就说好了，要一直偏心你");
});

moreButton.addEventListener("click", () => {
  showToast("不允许！");
});
