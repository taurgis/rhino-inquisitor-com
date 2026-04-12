(function () {
  var toc = document.querySelector('.article-toc--desktop nav');
  if (!toc) return;

  var tocContainer = document.querySelector('.article-toc--desktop');
  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  var ids = links.map(function (a) { return a.getAttribute('href').slice(1); });
  var activeClass = 'toc-active';

  /* ── Overflow fade hint ── */
  function checkOverflow() {
    if (!tocContainer) return;
    var overflows = tocContainer.scrollHeight > tocContainer.clientHeight + 2;
    tocContainer.classList.toggle('toc-overflows', overflows);

    var atEnd = tocContainer.scrollHeight - tocContainer.scrollTop - tocContainer.clientHeight < 4;
    tocContainer.classList.toggle('toc-scrolled-end', atEnd);
  }

  if (tocContainer) {
    tocContainer.addEventListener('scroll', checkOverflow, { passive: true });
    checkOverflow();
  }

  function update() {
    var scrollY = window.scrollY || window.pageYOffset;
    var current = '';
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.getBoundingClientRect().top <= 120) {
        current = ids[i];
      }
    }
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add(activeClass);
      } else {
        a.classList.remove(activeClass);
      }
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  update();
})();
