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
