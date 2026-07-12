(function () {
  'use strict';

  function cssVar(name, fallback) {
    var value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value ? value.trim() : fallback;
  }

  function init() {
    if (typeof mermaid === 'undefined') return;

    mermaid.initialize({
      startOnLoad: true,
      securityLevel: 'strict',
      fontFamily: cssVar('--font-body', 'sans-serif'),
      theme: 'base',
      themeVariables: {
        background: cssVar('--panel', '#fbf8f1'),
        textColor: cssVar('--body-ink', '#332f28'),
        lineColor: cssVar('--navy', '#123a5e'),
        mainBkg: cssVar('--callout', '#eaf1f8'),
        primaryColor: cssVar('--callout', '#eaf1f8'),
        primaryTextColor: cssVar('--callout-ink', '#2a4763'),
        primaryBorderColor: cssVar('--navy', '#123a5e'),
        secondaryColor: cssVar('--canvas', '#eeeae2'),
        tertiaryColor: cssVar('--base', '#f6f2ea'),
        nodeBorder: cssVar('--navy', '#123a5e'),
        clusterBkg: cssVar('--canvas', '#eeeae2'),
        clusterBorder: cssVar('--rule', '#e2dacc'),
        edgeLabelBackground: cssVar('--panel', '#fbf8f1'),
        actorBkg: cssVar('--callout', '#eaf1f8'),
        actorBorder: cssVar('--navy', '#123a5e'),
        actorTextColor: cssVar('--callout-ink', '#2a4763'),
        actorLineColor: cssVar('--navy', '#123a5e'),
        signalColor: cssVar('--navy', '#123a5e'),
        signalTextColor: cssVar('--body-ink', '#332f28'),
        labelBoxBkgColor: cssVar('--callout', '#eaf1f8'),
        labelBoxBorderColor: cssVar('--navy', '#123a5e'),
        labelTextColor: cssVar('--callout-ink', '#2a4763'),
        noteBkgColor: cssVar('--code-inline-bg', '#ede6d8'),
        noteBorderColor: cssVar('--field', '#d8cfbd'),
        noteTextColor: cssVar('--body-ink', '#332f28'),
        loopTextColor: cssVar('--body-ink', '#332f28'),
        activationBkgColor: cssVar('--canvas', '#eeeae2'),
        activationBorderColor: cssVar('--field', '#d8cfbd')
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
