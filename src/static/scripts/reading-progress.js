(function () {
  'use strict';

  var article = document.querySelector('.article-body');
  if (!article) return;

  var bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');

  var fill = document.createElement('div');
  fill.className = 'reading-progress__bar';

  bar.appendChild(fill);
  document.body.appendChild(bar);

  var ticking = false;

  function update() {
    var rect = article.getBoundingClientRect();
    var articleTop = rect.top + window.scrollY;
    var articleHeight = rect.height;
    var scrolled = window.scrollY - articleTop;
    var viewHeight = window.innerHeight;
    var progress = scrolled / (articleHeight - viewHeight);
    progress = Math.max(0, Math.min(1, progress));

    fill.style.width = (progress * 100) + '%';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();
