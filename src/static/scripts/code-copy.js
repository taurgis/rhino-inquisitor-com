(function () {
  'use strict';

  var COPIED_MS = 2000;
  var COPY_LABEL = 'Copy';
  var COPIED_LABEL = 'Copied';
  var SVG_COPY =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
    '</svg>';
  var SVG_CHECK =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="20 6 9 17 4 12"/>' +
    '</svg>';

  function createButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy-btn';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.innerHTML = SVG_COPY + ' ' + COPY_LABEL;
    return btn;
  }

  function handleClick(e) {
    var btn = e.currentTarget;
    var pre = btn.closest('.highlight') ? btn.closest('.highlight').querySelector('pre') : btn.parentElement;
    if (!pre) return;
    var code = pre.querySelector('code');
    var text = (code || pre).textContent;

    navigator.clipboard.writeText(text).then(function () {
      btn.innerHTML = SVG_CHECK + ' ' + COPIED_LABEL;
      btn.setAttribute('data-copied', '');

      setTimeout(function () {
        btn.innerHTML = SVG_COPY + ' ' + COPY_LABEL;
        btn.removeAttribute('data-copied');
      }, COPIED_MS);
    });
  }

  function init() {
    var blocks = document.querySelectorAll('.article-body .highlight');

    blocks.forEach(function (block) {
      var btn = createButton();
      btn.addEventListener('click', handleClick);
      block.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
