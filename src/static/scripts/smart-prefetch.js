(function () {
  if (window.__rhinoSmartPrefetchLoaded) {
    return;
  }
  window.__rhinoSmartPrefetchLoaded = true;

  var HOVER_DELAY_MS = 200;
  var INTENT_SELECTOR = 'a[data-speculation="article"]';
  var prefetchedUrls = new Set();
  var hoverTimers = new WeakMap();
  var finePointerQuery = typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: fine)')
    : null;
  var probe = document.createElement('link');

  if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    return;
  }

  if (!probe.relList || typeof probe.relList.supports !== 'function' || !probe.relList.supports('prefetch')) {
    return;
  }

  function getConnection() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }

  function readEffectiveType() {
    var connection = getConnection();
    return String((connection && connection.effectiveType) || '').toLowerCase();
  }

  function isNoindexPage() {
    var robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      return false;
    }

    return /(^|[\s,])noindex([\s,]|$)/i.test(robots.getAttribute('content') || '');
  }

  function isConstrainedNetwork() {
    var connection = getConnection();
    var effectiveType = readEffectiveType();
    return Boolean(connection && connection.saveData) || effectiveType === 'slow-2g' || effectiveType === '2g';
  }

  function isIntentEligible() {
    return navigator.onLine !== false && !isNoindexPage() && !isConstrainedNetwork();
  }

  function normalizePrefetchUrl(anchor) {
    if (!anchor || anchor.hasAttribute('download')) {
      return null;
    }

    var target = String(anchor.getAttribute('target') || '').trim().toLowerCase();
    var rel = String(anchor.getAttribute('rel') || '').toLowerCase();
    var href = String(anchor.getAttribute('href') || '').trim();
    var url;
    var pathname;

    if (!href || href.charAt(0) === '#') {
      return null;
    }

    if (target && target !== '_self') {
      return null;
    }

    if (rel.indexOf('external') !== -1 || rel.indexOf('nofollow') !== -1) {
      return null;
    }

    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return null;
    }

    if (url.origin !== window.location.origin) {
      return null;
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    if (url.search) {
      return null;
    }

    url.hash = '';
    pathname = url.pathname || '/';

    if (pathname === window.location.pathname) {
      return null;
    }

    if (/\/404(?:\.html)?\/?$/i.test(pathname)) {
      return null;
    }

    if (/\/(?:index\.xml|sitemap\.xml)$/i.test(pathname)) {
      return null;
    }

    if (/\.(?:xml|json|txt|pdf|zip|gz|mp3|mp4|mov|webm|jpe?g|png|gif|webp|svg)$/i.test(pathname)) {
      return null;
    }

    return url.href;
  }

  function appendPrefetch(url) {
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = url;
    link.setAttribute('data-rhino-prefetch', 'true');
    document.head.appendChild(link);
    prefetchedUrls.add(url);
  }

  function prefetchAnchor(anchor) {
    var url = normalizePrefetchUrl(anchor);

    if (!url || prefetchedUrls.has(url)) {
      return;
    }

    if (!isIntentEligible()) {
      return;
    }

    appendPrefetch(url);
  }

  function scheduleIntentPrefetch(anchor) {
    if (!anchor || !finePointerQuery || !finePointerQuery.matches || hoverTimers.has(anchor)) {
      return;
    }

    hoverTimers.set(anchor, window.setTimeout(function () {
      hoverTimers.delete(anchor);
      prefetchAnchor(anchor);
    }, HOVER_DELAY_MS));
  }

  function cancelIntentPrefetch(anchor) {
    var timer = hoverTimers.get(anchor);
    if (!timer) {
      return;
    }

    window.clearTimeout(timer);
    hoverTimers.delete(anchor);
  }

  function findIntentAnchor(target) {
    if (!target || typeof target.closest !== 'function') {
      return null;
    }

    return target.closest(INTENT_SELECTOR);
  }

  document.addEventListener('pointerenter', function (event) {
    scheduleIntentPrefetch(findIntentAnchor(event.target));
  }, true);

  document.addEventListener('pointerleave', function (event) {
    cancelIntentPrefetch(findIntentAnchor(event.target));
  }, true);

  document.addEventListener('focusin', function (event) {
    var anchor = findIntentAnchor(event.target);

    if (!anchor) {
      return;
    }

    prefetchAnchor(anchor);
  });
})();