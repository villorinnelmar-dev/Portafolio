(function () {
  'use strict';

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

  function revealElement(el) {
    if (el.classList.contains('is-visible')) return;
    el.classList.add('is-visible');
    var counter = el.querySelector('[data-count]');
    if (counter) animateCount(counter);
  }

  function preparePrefillBars() {
    document.querySelectorAll('[data-progress]').forEach(function (bar) {
      bar.style.setProperty('--fill', bar.dataset.progress + '%');
    });
  }
  preparePrefillBars();

  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(revealElement);
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          revealElement(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- collapsible case sections ---------- */
  var caseToggles = Array.prototype.slice.call(document.querySelectorAll('.case-toggle'));

  function setPanelOpen(toggle, panel, open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      panel.classList.add('is-open');
      // reveal any scroll-reveal elements hidden inside the collapsed panel
      Array.prototype.slice.call(panel.querySelectorAll('[data-reveal]')).forEach(revealElement);
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      // lock current height first so the collapse transition has a start point
      panel.style.maxHeight = panel.scrollHeight + 'px';
      requestAnimationFrame(function () {
        panel.style.maxHeight = '0px';
      });
      panel.classList.remove('is-open');
    }
  }

  caseToggles.forEach(function (toggle) {
    var panelId = toggle.getAttribute('aria-controls');
    var panel = document.getElementById(panelId);
    if (!panel) return;
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setPanelOpen(toggle, panel, !isOpen);
    });
  });

  window.addEventListener('resize', debounce(function () {
    caseToggles.forEach(function (toggle) {
      var panelId = toggle.getAttribute('aria-controls');
      var panel = document.getElementById(panelId);
      if (panel && panel.classList.contains('is-open')) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  }, 150));

  /* ---------- process timeline connecting line ---------- */
  function positionProcessLine() {
    var list = document.querySelector('.process-list');
    var line = document.querySelector('.process-line');
    if (!list || !line) return;
    var nums = Array.prototype.slice.call(list.querySelectorAll('.process-num'));
    if (nums.length < 2) return;
    var listRect = list.getBoundingClientRect();
    var firstRect = nums[0].getBoundingClientRect();
    var lastRect = nums[nums.length - 1].getBoundingClientRect();
    var top = (firstRect.top - listRect.top) + firstRect.height / 2;
    var bottom = (lastRect.top - listRect.top) + lastRect.height / 2;
    line.style.top = top + 'px';
    line.style.height = Math.max(0, bottom - top) + 'px';
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  positionProcessLine();
  window.addEventListener('resize', debounce(positionProcessLine, 150));
  window.addEventListener('load', positionProcessLine);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(positionProcessLine);
  }
})();
