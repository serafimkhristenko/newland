(function () {
  var amount = document.querySelector("[data-count-to]");
  if (!amount) return;

  var target = Number(amount.dataset.countTo);
  var duration = 4500;
  var startedAt = null;

  function render(value) {
    amount.textContent = "$" + Math.round(value);
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    render(target);
    return;
  }

  function animate(timestamp) {
    if (startedAt === null) startedAt = timestamp;

    var progress = Math.min((timestamp - startedAt) / duration, 1);
    var easedProgress = 1 - Math.pow(1 - progress, 3);
    render(target * easedProgress);

    if (progress < 1) {
      window.requestAnimationFrame(animate);
    } else {
      render(target);
    }
  }

  render(0);
  window.requestAnimationFrame(animate);
})();

(function () {
  if (!window.matchMedia("(max-width: 640px)").matches) return;

  var timer = document.querySelector("[data-bonus-timer]");
  if (!timer) return;

  var timerLabel = timer.querySelector("[data-timer-label]");
  var timerValue = timer.querySelector("[data-timer-value]");
  var cta = document.querySelector(".cta");
  var ctaLabel = cta ? cta.querySelector(".cta__label") : null;
  var storageKey = "newland-bonus-expires-at";
  var duration = 2 * 60 * 1000;
  var expiresAt = 0;
  var intervalId = null;

  try {
    expiresAt = Number(sessionStorage.getItem(storageKey));
    if (!Number.isFinite(expiresAt) || expiresAt <= 0 || expiresAt > Date.now() + duration) {
      expiresAt = Date.now() + duration;
      sessionStorage.setItem(storageKey, String(expiresAt));
    }
  } catch (error) {
    expiresAt = Date.now() + duration;
  }

  function expireBonus() {
    timer.classList.add("bonus-timer--expired");
    timer.setAttribute("aria-live", "polite");
    timerLabel.textContent = "Бонус сгорел";
    timerValue.textContent = "00:00";
    timerValue.dateTime = "PT0S";
    timerValue.setAttribute("aria-label", "Время бонуса истекло");

    if (cta) {
      cta.classList.add("cta--expired");
      cta.setAttribute("aria-disabled", "true");
      cta.removeAttribute("href");
    }

    if (ctaLabel) ctaLabel.textContent = "Бонус сгорел";
    if (intervalId !== null) window.clearInterval(intervalId);
  }

  function renderTimer() {
    var secondsLeft = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    if (secondsLeft === 0) {
      expireBonus();
      return;
    }

    var minutes = Math.floor(secondsLeft / 60);
    var seconds = secondsLeft % 60;
    var formatted = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    timerValue.textContent = formatted;
    timerValue.dateTime = "PT" + secondsLeft + "S";
    timerValue.setAttribute("aria-label", "До завершения бонуса " + minutes + " минут " + seconds + " секунд");
  }

  if (cta) {
    cta.addEventListener("click", function (event) {
      if (cta.getAttribute("aria-disabled") === "true") event.preventDefault();
    });
  }

  renderTimer();
  intervalId = window.setInterval(renderTimer, 250);
})();
