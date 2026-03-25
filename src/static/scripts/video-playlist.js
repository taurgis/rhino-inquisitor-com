(function () {
  if (window.__rhinoVideoPlaylistLoaded) {
    return;
  }
  window.__rhinoVideoPlaylistLoaded = true;

  function buildEmbedUrl(baseUrl, autoplay) {
    if (!baseUrl) {
      return '';
    }

    var separator = baseUrl.indexOf('?') === -1 ? '?' : '&';
    return autoplay ? baseUrl + separator + 'autoplay=1' : baseUrl;
  }

  function togglePageLink(link, url) {
    if (!link) {
      return;
    }

    if (url) {
      link.href = url;
      link.hidden = false;
      link.removeAttribute('aria-hidden');
      return;
    }

    link.hidden = true;
    link.setAttribute('aria-hidden', 'true');
    link.removeAttribute('href');
  }

  function updateQuery(slug) {
    var nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('video', slug);
    window.history.replaceState({}, '', nextUrl.pathname + nextUrl.search + nextUrl.hash);
  }

  function initHub(hub) {
    var iframe = hub.querySelector('[data-video-iframe]');
    var playerCard = hub.querySelector('[data-video-player-card]');
    var title = hub.querySelector('[data-video-heading]');
    var duration = hub.querySelector('[data-video-duration]');
    var description = hub.querySelector('[data-video-description]');
    var status = hub.querySelector('[data-video-status]');
    var secondaryLink = hub.querySelector('[data-video-secondary-link]');
    var pageLink = hub.querySelector('[data-video-page-link]');
    var buttons = Array.prototype.slice.call(hub.querySelectorAll('[data-video-select]'));

    if (!iframe || buttons.length === 0) {
      return;
    }

    function applySelection(button, shouldUpdateQuery, shouldAutoplay) {
      var slug = button.getAttribute('data-video-slug') || '';
      var embedBase = button.getAttribute('data-video-embed-base') || '';
      var watchUrl = button.getAttribute('data-video-watch-url') || '';
      var pageUrl = button.getAttribute('data-video-page-url') || '';
      var itemTitle = button.getAttribute('data-video-title') || '';
      var playerTitle = button.getAttribute('data-video-player-title') || itemTitle;
      var itemDuration = button.getAttribute('data-video-duration') || '';
      var itemDescription = button.getAttribute('data-video-description') || '';
      var embedUrl = buildEmbedUrl(embedBase, shouldAutoplay);

      if (embedUrl && iframe.getAttribute('src') !== embedUrl) {
        iframe.setAttribute('src', embedUrl);
      }
      iframe.setAttribute('title', playerTitle);

      if (title) {
        title.textContent = itemTitle;
      }
      if (duration) {
        duration.textContent = itemDuration;
      }
      if (description) {
        description.textContent = itemDescription;
      }
      if (status) {
        status.textContent = itemTitle ? 'Now watching ' + itemTitle : '';
      }
      if (secondaryLink) {
        secondaryLink.href = watchUrl;
        secondaryLink.setAttribute(
          'aria-label',
          itemTitle ? 'Watch ' + itemTitle + ' on YouTube (opens in a new tab)' : 'Watch on YouTube (opens in a new tab)'
        );
      }
      togglePageLink(pageLink, pageUrl);

      buttons.forEach(function (currentButton) {
        var item = currentButton.closest('[data-video-item]');
        var isActive = currentButton === button;
        currentButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        if (item) {
          item.classList.toggle('is-active', isActive);
          var state = item.querySelector('.video-hub__trigger-state');
          if (state) {
            state.textContent = isActive ? 'Now watching' : 'Watch here';
          }
        }
      });

      if (shouldUpdateQuery && slug) {
        updateQuery(slug);
      }

      if (shouldAutoplay && playerCard) {
        playerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        playerCard.focus({ preventScroll: true });
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        applySelection(button, true, true);
      });
    });

    var requestedSlug = new URLSearchParams(window.location.search).get('video');
    if (!requestedSlug) {
      return;
    }

    var matchingButton = buttons.find(function (button) {
      return button.getAttribute('data-video-slug') === requestedSlug;
    });

    if (matchingButton) {
      applySelection(matchingButton, false, false);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-rhino-video-hub]'), initHub);
})();