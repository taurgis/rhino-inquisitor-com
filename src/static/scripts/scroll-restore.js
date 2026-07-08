(function () {
  'use strict';

  // Preserve the reader's scroll position when a backgrounded tab is discarded
  // and reloaded (common on mobile, and increasingly on desktop, after opening
  // an external link in a new tab). Deferred scripts and lazy-loaded media make
  // the page height unstable at load time, so the browser's automatic scroll
  // restoration can drop the reader back to the top. We take manual control and
  // persist the position ourselves.

  if (!('sessionStorage' in window) || !('scrollRestoration' in history)) {
    return;
  }

  var KEY_PREFIX = 'rhino:scroll:';
  var storageKey = KEY_PREFIX + window.location.pathname;

  var storage;
  try {
    storage = window.sessionStorage;
    // Access probe: Safari private mode throws on write.
    storage.setItem(KEY_PREFIX + 'probe', '1');
    storage.removeItem(KEY_PREFIX + 'probe');
  } catch (error) {
    return;
  }

  // Take over so the browser doesn't fight our restoration on reload.
  history.scrollRestoration = 'manual';

  function save() {
    try {
      storage.setItem(storageKey, String(window.scrollY));
    } catch (error) {
      /* storage full or unavailable — nothing we can do */
    }
  }

  function restore() {
    // An explicit anchor target wins over a saved position.
    if (window.location.hash) {
      return;
    }

    var stored = storage.getItem(storageKey);
    if (stored === null) {
      return;
    }

    var y = parseInt(stored, 10);
    if (isNaN(y) || y <= 0) {
      return;
    }

    // Only restore for reload / back-forward navigations (which covers a
    // discarded-and-reloaded tab). A fresh navigation to the page should start
    // at the top as usual.
    var navEntries = typeof performance !== 'undefined' && performance.getEntriesByType
      ? performance.getEntriesByType('navigation')
      : [];
    var navType = navEntries.length ? navEntries[0].type : '';
    if (navType !== 'reload' && navType !== 'back_forward') {
      return;
    }

    // Re-apply across a few frames because deferred scripts and lazy media can
    // still be growing the document after load.
    var attempts = 0;
    function apply() {
      window.scrollTo(0, y);
      attempts += 1;
      if (attempts < 3 && Math.abs(window.scrollY - y) > 2) {
        requestAnimationFrame(apply);
      }
    }
    apply();
  }

  // Save on every event that can precede a tab being frozen or discarded.
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      save();
    }
  });

  if (document.readyState === 'complete') {
    restore();
  } else {
    window.addEventListener('load', restore);
  }
})();
