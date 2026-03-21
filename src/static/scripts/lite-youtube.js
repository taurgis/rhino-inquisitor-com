const LITE_YOUTUBE_SELECTOR = 'lite-youtube[data-video-id]';
const YOUTUBE_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

function activateLiteYoutube(element) {
  if (element.dataset.activated === 'true') {
    return;
  }

  const videoId = element.getAttribute('data-video-id') || '';
  const videoTitle = element.getAttribute('data-video-title') || 'YouTube video';

  if (!videoId) {
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&autoplay=1`;
  iframe.title = videoTitle;
  iframe.loading = 'eager';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = YOUTUBE_ALLOW;
  iframe.allowFullscreen = true;

  element.replaceChildren(iframe);
  element.dataset.activated = 'true';
  element.classList.add('is-activated');
}

function initLiteYoutube(element) {
  if (element.dataset.enhanced === 'true') {
    return;
  }

  const button = element.querySelector('.video-embed__play');
  if (!button) {
    return;
  }

  button.addEventListener('click', () => activateLiteYoutube(element));
  element.dataset.enhanced = 'true';
}

function initAllLiteYoutube() {
  document.querySelectorAll(LITE_YOUTUBE_SELECTOR).forEach((element) => initLiteYoutube(element));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllLiteYoutube, { once: true });
} else {
  initAllLiteYoutube();
}