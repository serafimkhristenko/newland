(function () {
  var amounts = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
  if (!amounts.length) return;

  var target = Number(amounts[0].dataset.countTo);
  var duration = 6500;
  var startedAt = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The amount is set in the Pricedown display font, whose digits are
  // proportional and lack tabular figures — so a plain textContent count-up
  // makes the number wiggle horizontally frame to frame. Render each glyph in
  // its own fixed-width "odometer" cell so digits only change in place.
  function buildCells(amount, str) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < str.length; i += 1) {
      var ch = str.charAt(i);
      var cell = document.createElement("span");
      cell.className = ch >= "0" && ch <= "9" ? "odo-cell odo-cell--digit" : "odo-cell odo-cell--symbol";
      cell.textContent = ch;
      frag.appendChild(cell);
    }
    amount.textContent = "";
    amount.appendChild(frag);
    amount._odoLen = str.length;
  }

  function setValue(amount, str) {
    if (amount._odoLen !== str.length) {
      buildCells(amount, str);
      return;
    }
    var cells = amount.childNodes;
    for (var i = 0; i < str.length; i += 1) {
      if (cells[i].textContent !== str.charAt(i)) cells[i].textContent = str.charAt(i);
    }
  }

  // Size every digit cell to the widest glyph 0-9 in this element's own font,
  // measured after web fonts have loaded so the reservation is exact.
  function measureDigitWidth(amount) {
    if (!amount.getClientRects().length) return; // hidden at this breakpoint
    var probe = document.createElement("span");
    probe.className = "odo-cell odo-cell--digit";
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.width = "auto";
    amount.appendChild(probe);
    var max = 0;
    for (var d = 0; d <= 9; d += 1) {
      probe.textContent = String(d);
      max = Math.max(max, probe.getBoundingClientRect().width);
    }
    amount.removeChild(probe);
    if (max > 0) amount.style.setProperty("--odo-digit-width", (Math.ceil(max * 100) / 100) + "px");
  }

  function reserveWidth(amount) {
    if (!amount.getClientRects().length) return;
    setValue(amount, "$" + Math.round(target));
    var width = Math.ceil(amount.getBoundingClientRect().width);
    amount.style.minWidth = width + "px";
    if (amount.classList.contains("cta__amount")) amount.style.flexBasis = width + "px";
  }

  function render(value) {
    var str = "$" + Math.round(value);
    amounts.forEach(function (amount) { setValue(amount, str); });
  }

  function animate(timestamp) {
    if (startedAt === null) startedAt = timestamp;
    var progress = Math.min((timestamp - startedAt) / duration, 1);
    var easedProgress = 1 - Math.pow(1 - progress, 3);
    render(target * easedProgress);
    if (progress < 1) window.requestAnimationFrame(animate);
    else render(target);
  }

  var started = false;
  function start() {
    if (started) return;
    started = true;
    amounts.forEach(measureDigitWidth);
    amounts.forEach(reserveWidth);
    if (reduceMotion) {
      render(target);
      return;
    }
    render(0);
    window.requestAnimationFrame(animate);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
    if (document.fonts.status === "loaded") start();
  } else {
    start();
  }
})();

(function () {
  var timer = document.querySelector("[data-bonus-timer]");
  if (!timer) return;

  var timerValue = timer.querySelector("[data-timer-value]");
  var cta = document.querySelector(".cta");
  var ctaLabel = cta ? cta.querySelector(".cta__label") : null;
  var ctaAmount = cta ? cta.querySelector(".cta__amount") : null;
  var storageKey = "newland-bonus-expires-at";
  var duration = (3 * 60 + 33) * 1000;
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
    timer.classList.add("cta__timer--expired");
    timer.setAttribute("aria-live", "polite");
    timerValue.textContent = "00:00";
    timerValue.dateTime = "PT0S";
    timerValue.setAttribute("aria-label", "Время бонуса истекло");

    if (cta) {
      cta.classList.add("cta--expired");
      cta.setAttribute("aria-disabled", "true");
      cta.removeAttribute("href");
    }

    if (ctaLabel) ctaLabel.textContent = "Бонус сгорел";
    if (ctaAmount) ctaAmount.hidden = true;
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

(function () {
  var preview = new URLSearchParams(window.location.search).get("preview") === "client";
  if (preview) {
    document.documentElement.classList.add("client-preview");
    var activity = document.querySelector("[data-live-activity]");
    if (activity) activity.setAttribute("aria-label", "Показатели активности игроков");
  }
})();

(function () {
  var playersElement = document.querySelector("[data-live-players]");
  var paidElement = document.querySelector("[data-live-paid]");
  var toast = document.querySelector("[data-cashout-toast]");
  var activityElement = document.querySelector("[data-live-activity]");
  var playerElement = document.querySelector("[data-cashout-player]");
  var amountElement = document.querySelector("[data-cashout-amount]");
  if (!playersElement || !paidElement) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileCashout = window.matchMedia("(max-width: 640px)");
  var players = 154475;
  var paid = 25000000;
  var roots = [
    "LuckyAce", "NeonWolf", "RiverKing", "SpinQueen", "CryptoFox",
    "RoyalFlush", "NightOwl", "WildSeven", "TurboChip", "VegasMoon",
    "PokerNova", "GoldShark", "RedDiamond", "BlackJack", "MintDealer",
    "FlashBet", "PixelAce", "StormCard", "MoonRoulette", "CherryKing",
    "WinHunter", "CashRaven", "HighRoller", "LuckyByte", "VioletTiger"
  ];
  var suffixes = ["77", "X", "VIP", "_777", "Pro", "GG"];
  var nicknames = [];
  var nicknameIndex = 0;

  function formatNumber(value) {
    return Math.round(value).toLocaleString("ru-RU");
  }

  function shuffle(values) {
    for (var index = values.length - 1; index > 0; index -= 1) {
      var randomIndex = Math.floor(Math.random() * (index + 1));
      var current = values[index];
      values[index] = values[randomIndex];
      values[randomIndex] = current;
    }
  }

  roots.forEach(function (root) {
    suffixes.forEach(function (suffix) {
      nicknames.push(root + suffix);
    });
  });
  shuffle(nicknames);

  function updateStats() {
    players += Math.floor(Math.random() * 31) - 12;
    if (players < 154475) players = 154475 + Math.floor(Math.random() * 20);
    paid += Math.floor(Math.random() * 9000) + 1500;
    playersElement.textContent = formatNumber(players);
    paidElement.textContent = "$" + formatNumber(paid);
  }

  function nextNickname() {
    if (nicknameIndex >= nicknames.length) {
      shuffle(nicknames);
      nicknameIndex = 0;
    }
    var nickname = nicknames[nicknameIndex];
    nicknameIndex += 1;
    return nickname;
  }

  function fillToast() {
    if (!toast || !playerElement || !amountElement) return;
    var cashout = 1000 + Math.floor(Math.random() * 541) * 100;
    playerElement.textContent = nextNickname();
    amountElement.textContent = "$" + formatNumber(cashout);
  }

  function showToast() {
    if (!toast) return;
    var visibleDuration = mobileCashout.matches ? 2800 : 3600;
    fillToast();
    if (activityElement) activityElement.classList.add("is-obscured");
    toast.hidden = false;
    toast.classList.remove("is-leaving");
    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    window.setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.classList.add("is-leaving");
      window.setTimeout(function () {
        toast.hidden = true;
        toast.classList.remove("is-leaving");
        if (activityElement) activityElement.classList.remove("is-obscured");
        var nextDelay = mobileCashout.matches
          ? 5000 + Math.random() * 3000
          : 2200 + Math.random() * 3200;
        window.setTimeout(showToast, nextDelay);
      }, 320);
    }, visibleDuration);
  }

  if (reduceMotion) {
    fillToast();
    if (toast) {
      if (activityElement) activityElement.classList.add("is-obscured");
      toast.hidden = false;
      toast.classList.add("is-visible");
    }
    return;
  }

  window.setInterval(function () {
    if (!document.hidden) updateStats();
  }, 2600);
  window.setTimeout(showToast, mobileCashout.matches ? 3500 : 1800);
})();
