(function () {
  'use strict';

  var BADGE_LABEL = 'Zoom';
  var IMAGE_PATH_RE = /\.(avif|jpe?g|png|webp)$/i;
  var DIAGRAM_TRIGGER_LABEL = 'Open diagram in larger view';
  var DIAGRAM_DIALOG_LABEL = 'Expanded diagram';
  var DIAGRAM_CLOSE_LABEL = 'Close enlarged diagram';
  var DIAGRAM_MAGNIFY_TEXT = 'Zoom in';
  var DIAGRAM_FIT_TEXT = 'Fit to screen';

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

  function enhanceDiagrams(articleBody) {
    var wraps = articleBody.querySelectorAll('.mermaid-wrap');

    wraps.forEach(function (wrap) {
      if (wrap.querySelector('.rhino-diagram-zoom-button') || !wrap.querySelector('.mermaid svg')) {
        return;
      }

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'rhino-diagram-zoom-button';
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-label', DIAGRAM_TRIGGER_LABEL);
      button.textContent = BADGE_LABEL;

      wrap.classList.add('rhino-diagram-zoom-target');
      wrap.appendChild(button);
    });
  }

  function renameIds(root, oldId, newId) {
    // Mermaid scopes its <style> rules and marker/aria references to the SVG's
    // id, so the copy needs its own id everywhere to avoid duplicate ids.
    var nodes = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));

    nodes.forEach(function (node) {
      Array.prototype.forEach.call(node.attributes, function (attribute) {
        if (attribute.value.indexOf(oldId) !== -1) {
          attribute.value = attribute.value.split(oldId).join(newId);
        }
      });

      if (node.tagName.toLowerCase() === 'style' && node.textContent.indexOf(oldId) !== -1) {
        node.textContent = node.textContent.split(oldId).join(newId);
      }
    });
  }

  function cloneDiagram(source) {
    var clone = source.cloneNode(true);

    if (source.id) {
      renameIds(clone, source.id, source.id + '-zoom');
    }

    clone.style.removeProperty('max-width');
    if (clone.getAttribute('viewBox')) {
      clone.removeAttribute('width');
      clone.removeAttribute('height');
    }

    return clone;
  }

  function getDiagramSize(source) {
    var rect = source.getBoundingClientRect();
    var viewBox = source.viewBox && source.viewBox.baseVal;
    var hasViewBox = Boolean(viewBox && viewBox.width > 0 && viewBox.height > 0);

    return {
      ratio: hasViewBox ? viewBox.width / viewBox.height : (rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 1),
      // Fitting a tall diagram to the viewport height could show it smaller
      // than it is inline, so never go below its natural size or 1.5x the
      // inline size.
      minWidth: Math.max(hasViewBox ? viewBox.width : 0, rect.width * 1.5),
    };
  }

  function setDiagramMagnified(frame, mediaHost, toggleButton, magnified, clientX, clientY) {
    var svg = frame.querySelector('svg');
    if (!svg) return;

    var hostRect = mediaHost.getBoundingClientRect();
    var pointX = typeof clientX === 'number' ? clientX : hostRect.left + hostRect.width / 2;
    var pointY = typeof clientY === 'number' ? clientY : hostRect.top + hostRect.height / 2;
    var before = svg.getBoundingClientRect();
    var fractionX = before.width ? (pointX - before.left) / before.width : 0.5;
    var fractionY = before.height ? (pointY - before.top) / before.height : 0.5;

    frame.classList.toggle('is-magnified', magnified);
    toggleButton.textContent = magnified ? DIAGRAM_FIT_TEXT : DIAGRAM_MAGNIFY_TEXT;

    // Keep the point under the cursor (or the view centre) in place.
    var after = svg.getBoundingClientRect();
    mediaHost.scrollLeft += after.left + fractionX * after.width - pointX;
    mediaHost.scrollTop += after.top + fractionY * after.height - pointY;
  }

  function openDiagram(dialog, mediaHost, captionNode, closeButton, toggleButton, trigger, wrap) {
    var source = wrap.querySelector('.mermaid svg');
    if (!source) return;

    var frame = document.createElement('div');
    frame.className = 'article-image-zoom__diagram';
    var size = getDiagramSize(source);
    frame.style.setProperty('--diagram-ratio', String(size.ratio));
    frame.style.setProperty('--diagram-min-width', Math.round(size.minWidth) + 'px');
    frame.appendChild(cloneDiagram(source));
    mediaHost.replaceChildren(frame);

    setCaption(captionNode, '');
    dialog.dataset.rhinoDiagramOpen = 'true';
    dialog.setAttribute('aria-label', DIAGRAM_DIALOG_LABEL);
    closeButton.setAttribute('aria-label', DIAGRAM_CLOSE_LABEL);
    toggleButton.textContent = DIAGRAM_MAGNIFY_TEXT;
    toggleButton.hidden = false;
    dialog._rhinoZoomTrigger = trigger;

    if (dialog.open) {
      return;
    }

    dialog.showModal();
  }

  function hasTextSelection() {
    var selection = window.getSelection ? window.getSelection() : null;
    return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
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

  function handleDiagramActivate(event, dialog, mediaHost, captionNode, closeButton, toggleButton) {
    var wrap = event.target.closest('.rhino-diagram-zoom-target');
    if (!wrap) return false;

    var button = event.target.closest('.rhino-diagram-zoom-button');
    if (!button) {
      // The whole diagram is a pointer shortcut; leave links and text
      // selection alone.
      if (event.target.closest('a') || hasTextSelection()) return true;
      button = wrap.querySelector('.rhino-diagram-zoom-button');
    }

    event.preventDefault();
    openDiagram(dialog, mediaHost, captionNode, closeButton, toggleButton, button, wrap);
    return true;
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

  function handleDialogClick(event, dialog, mediaHost, toggleButton) {
    if (event.target === dialog) {
      dialog.close();
      return;
    }

    var frame = event.target.closest('.article-image-zoom__diagram');
    if (frame && dialog.dataset.rhinoDiagramOpen === 'true') {
      setDiagramMagnified(frame, mediaHost, toggleButton, !frame.classList.contains('is-magnified'), event.clientX, event.clientY);
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
    var toggleButton = dialog.querySelector('[data-rhino-image-zoom-toggle]');
    var defaultDialogLabel = dialog.getAttribute('aria-label');
    var defaultCloseLabel = closeButton && closeButton.getAttribute('aria-label');

    if (!mediaHost || !closeButton) {
      return;
    }

    enhanceCandidates(articleBody);

    // Mermaid renders asynchronously (mermaid-init.js), so diagrams get their
    // trigger once rendering finishes; the direct call covers diagrams that
    // were already rendered before this ran.
    if (toggleButton) {
      enhanceDiagrams(articleBody);
      document.addEventListener('rhino:diagrams-rendered', function () {
        enhanceDiagrams(articleBody);
      });

      toggleButton.addEventListener('click', function () {
        var frame = mediaHost.querySelector('.article-image-zoom__diagram');
        if (frame) {
          setDiagramMagnified(frame, mediaHost, toggleButton, !frame.classList.contains('is-magnified'));
        }
      });
    }

    articleBody.addEventListener('click', function (event) {
      if (toggleButton && handleDiagramActivate(event, dialog, mediaHost, captionNode, closeButton, toggleButton)) {
        return;
      }

      handleActivate(event, dialog, mediaHost, captionNode);
    });

    articleBody.addEventListener('keydown', function (event) {
      handleKeydown(event, dialog, mediaHost, captionNode);
    });

    closeButton.addEventListener('click', function () {
      dialog.close();
    });

    dialog.addEventListener('click', function (event) {
      handleDialogClick(event, dialog, mediaHost, toggleButton);
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

      if (dialog.dataset.rhinoDiagramOpen === 'true') {
        dialog.removeAttribute('data-rhino-diagram-open');
        dialog.setAttribute('aria-label', defaultDialogLabel);
        closeButton.setAttribute('aria-label', defaultCloseLabel);
        toggleButton.hidden = true;
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