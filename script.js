(function () {
  'use strict';

  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  function animateCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = 'true';
    var target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    var suffix = el.dataset.suffix || '';
    var duration = 900;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function preparePrefillBars() {
    document.querySelectorAll('[data-progress]').forEach(function (bar) {
      bar.style.setProperty('--fill', bar.dataset.progress + '%');
    });
  }
  preparePrefillBars();

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
      var counter = el.querySelector('[data-count]');
      if (counter) animateCount(counter);
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        var counter = el.querySelector('[data-count]');
        if (counter) animateCount(counter);
        observer.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();
