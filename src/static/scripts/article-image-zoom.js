(function () {
  'use strict';

  var BADGE_LABEL = 'Zoom';
  var IMAGE_PATH_RE = /\.(avif|jpe?g|png|webp)$/i;

  function toUrl(value) {
    if (!value) return null;

    try {
      return new URL(value, window.location.href);
    } catch (error) {
      return null;
    }
  }

  function isImageLink(anchor, image) {
    if (!anchor || !image) return false;

    var href = anchor.getAttribute('href');
    var hrefUrl = toUrl(href);
    if (!hrefUrl || hrefUrl.origin !== window.location.origin || !IMAGE_PATH_RE.test(hrefUrl.pathname)) {
      return false;
    }

    var zoomSourceUrl = toUrl(image.dataset.rhinoZoomSource);
    var zoomUrl = toUrl(image.dataset.rhinoZoomSrc);

    return Boolean(
      (zoomSourceUrl && hrefUrl.pathname === zoomSourceUrl.pathname) ||
      (zoomUrl && hrefUrl.pathname === zoomUrl.pathname)
    );
  }

  function createLabel(image) {
    return image.dataset.rhinoZoomLabel || 'Open image in larger view';
  }

  function createBadge() {
    var badge = document.createElement('span');
    badge.className = 'rhino-image-zoom-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = BADGE_LABEL;
    return badge;
  }

  function appendBadge(host) {
    if (!host || host.querySelector('.rhino-image-zoom-badge')) {
      return;
    }

    host.classList.add('rhino-image-zoom-target');
    host.appendChild(createBadge());
  }

  function ensureStandaloneHost(image) {
    var targetNode = image.parentElement && image.parentElement.tagName === 'PICTURE' ? image.parentElement : image;
    var wrapper = targetNode.parentElement;

    if (wrapper && wrapper.classList.contains('rhino-image-zoom-target')) {
      return wrapper;
    }

    wrapper = document.createElement('span');
    wrapper.className = 'rhino-image-zoom-target';
    targetNode.parentNode.insertBefore(wrapper, targetNode);
    wrapper.appendChild(targetNode);
    return wrapper;
  }

  function makePlainImageTrigger(image) {
    image.classList.add('rhino-image-zoom-trigger');
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-haspopup', 'dialog');
    image.setAttribute('aria-label', createLabel(image));
    appendBadge(ensureStandaloneHost(image));
  }

  function makeAnchorTrigger(anchor, image) {
    anchor.dataset.rhinoZoomTrigger = 'true';
    anchor.classList.add('rhino-image-zoom-trigger');
    anchor.classList.add('rhino-image-zoom-target');
    anchor.setAttribute('aria-haspopup', 'dialog');
    if (!anchor.getAttribute('aria-label')) {
      anchor.setAttribute('aria-label', createLabel(image));
    }
    appendBadge(anchor);
  }

  function enhanceCandidates(articleBody) {
    var images = articleBody.querySelectorAll('img[data-rhino-zoom-src]');

    images.forEach(function (image) {
      var anchor = image.closest('a');

      if (anchor) {
        if (isImageLink(anchor, image)) {
          makeAnchorTrigger(anchor, image);
        }

        return;
      }

      makePlainImageTrigger(image);
    });
  }

  function setCaption(captionNode, text) {
    if (!captionNode) return;

    if (text) {
      captionNode.textContent = text;
      captionNode.hidden = false;
      return;
    }

    captionNode.textContent = '';
    captionNode.hidden = true;
  }

  function createDialogMedia(mediaHost) {
    var picture = document.createElement('picture');
    picture.className = 'article-image-zoom__picture';

    var avifNode = document.createElement('source');
    avifNode.setAttribute('type', 'image/avif');
    avifNode.setAttribute('data-rhino-image-zoom-avif', '');

    var imageNode = document.createElement('img');
    imageNode.setAttribute('data-rhino-image-zoom-image', '');
    imageNode.alt = '';

    picture.appendChild(avifNode);
    picture.appendChild(imageNode);
    mediaHost.replaceChildren(picture);

    return {
      avifNode: avifNode,
      imageNode: imageNode,
    };
  }

  function clearDialog(dialog, imageNode, avifNode, captionNode) {
    dialog.removeAttribute('data-rhino-image-open');
    if (avifNode) {
      avifNode.removeAttribute('srcset');
    }
    imageNode.removeAttribute('src');
    imageNode.removeAttribute('width');
    imageNode.removeAttribute('height');
    imageNode.alt = '';
    setCaption(captionNode, '');
  }

  function openDialog(dialog, mediaHost, captionNode, trigger, image) {
    var zoomSrc = image.dataset.rhinoZoomSrc;
    if (!zoomSrc) return;

    var media = createDialogMedia(mediaHost);
    var imageNode = media.imageNode;
    var avifNode = media.avifNode;

    if (avifNode) {
      if (image.dataset.rhinoZoomAvif) {
        avifNode.setAttribute('srcset', image.dataset.rhinoZoomAvif);
      } else {
        avifNode.removeAttribute('srcset');
      }
    }

    imageNode.setAttribute('src', zoomSrc);
    imageNode.alt = image.dataset.rhinoZoomAlt || image.alt || '';

    if (image.dataset.rhinoZoomWidth) {
      imageNode.setAttribute('width', image.dataset.rhinoZoomWidth);
    }
    if (image.dataset.rhinoZoomHeight) {
      imageNode.setAttribute('height', image.dataset.rhinoZoomHeight);
    }

    setCaption(captionNode, image.dataset.rhinoZoomCaption || '');
    dialog.dataset.rhinoImageOpen = 'true';
    dialog._rhinoZoomTrigger = trigger;

    if (dialog.open) {
      return;
    }

    dialog.showModal();
  }

  function getTriggerFromTarget(target) {
    if (!target) return null;

    var anchor = target.closest('a[data-rhino-zoom-trigger="true"]');
    if (anchor) {
      return anchor;
    }

    return target.closest('img.rhino-image-zoom-trigger');
  }

  function handleActivate(event, dialog, mediaHost, captionNode) {
    var trigger = getTriggerFromTarget(event.target);
    if (!trigger) return;

    var image = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img[data-rhino-zoom-src]');
    if (!image) return;

    event.preventDefault();
    openDialog(dialog, mediaHost, captionNode, trigger, image);
  }

  function handleKeydown(event, dialog, mediaHost, captionNode) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    var trigger = getTriggerFromTarget(event.target);
    if (!trigger) return;

    event.preventDefault();
    var image = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img[data-rhino-zoom-src]');
    if (!image) return;

    openDialog(dialog, mediaHost, captionNode, trigger, image);
  }

  function handleDialogClick(event, dialog) {
    if (event.target === dialog) {
      dialog.close();
    }
  }

  function init() {
    var articleBody = document.querySelector('.article-body');
    var dialog = document.querySelector('[data-rhino-image-zoom-dialog]');

    if (!articleBody || !dialog || typeof dialog.showModal !== 'function') {
      return;
    }

    var mediaHost = dialog.querySelector('[data-rhino-image-zoom-media]');
    var captionNode = dialog.querySelector('[data-rhino-image-zoom-caption]');
    var closeButton = dialog.querySelector('[data-rhino-image-zoom-close]');

    if (!mediaHost || !closeButton) {
      return;
    }

    enhanceCandidates(articleBody);

    articleBody.addEventListener('click', function (event) {
      handleActivate(event, dialog, mediaHost, captionNode);
    });

    articleBody.addEventListener('keydown', function (event) {
      handleKeydown(event, dialog, mediaHost, captionNode);
    });

    closeButton.addEventListener('click', function () {
      dialog.close();
    });

    dialog.addEventListener('click', function (event) {
      handleDialogClick(event, dialog);
    });

    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.close();
      }
    });

    dialog.addEventListener('close', function () {
      var imageNode = dialog.querySelector('[data-rhino-image-zoom-image]');
      var avifNode = dialog.querySelector('[data-rhino-image-zoom-avif]');

      if (imageNode) {
        clearDialog(dialog, imageNode, avifNode, captionNode);
      } else {
        dialog.removeAttribute('data-rhino-image-open');
        setCaption(captionNode, '');
      }

      mediaHost.replaceChildren();

      if (dialog._rhinoZoomTrigger && typeof dialog._rhinoZoomTrigger.focus === 'function') {
        dialog._rhinoZoomTrigger.focus();
      }

      dialog._rhinoZoomTrigger = null;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();