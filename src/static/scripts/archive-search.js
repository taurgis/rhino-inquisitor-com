(function () {
  if (window.__rhinoArchiveSearchLoaded) {
    return;
  }
  window.__rhinoArchiveSearchLoaded = true;

  var SEARCH_LIMIT = 48;
  var SEARCH_PARAM = 'q';
  var SORT_PARAM = 'sort';
  var DEFAULT_SORT = 'newest';
  var SORT_LABELS = {
    newest: 'Newest first',
    oldest: 'Oldest first',
    'title-asc': 'Title A-Z'
  };

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeSort(value) {
    var normalized = normalize(value);
    if (normalized === 'oldest' || normalized === 'title-asc' || normalized === 'newest') {
      return normalized;
    }
    return DEFAULT_SORT;
  }

  function getStateFromLocation() {
    var params = new URLSearchParams(window.location.search);
    return {
      query: params.get(SEARCH_PARAM) || '',
      sort: normalizeSort(params.get(SORT_PARAM) || DEFAULT_SORT)
    };
  }

  function tokenize(query) {
    return normalize(query).split(/\s+/).filter(Boolean);
  }

  function createMetadata(entry) {
    var items = [];

    if (entry.type === 'posts' && entry.date && entry.dateLabel) {
      items.push('<li><time datetime="' + escapeHtml(entry.date) + '">' + escapeHtml(entry.dateLabel) + '</time></li>');
    }

    if (entry.type === 'posts' && entry.readingTime) {
      items.push('<li>' + escapeHtml(entry.readingTime) + ' min read</li>');
    }

    if (entry.primaryTopic) {
      if (entry.primaryTopicUrl) {
        items.push('<li><a href="' + escapeHtml(entry.primaryTopicUrl) + '">' + escapeHtml(entry.primaryTopic) + '</a></li>');
      } else {
        items.push('<li><span>' + escapeHtml(entry.primaryTopic) + '</span></li>');
      }
    }

    if (!items.length) {
      return '';
    }

    return '<ul class="metadata-row" aria-label="Card details">' + items.join('') + '</ul>';
  }

  function createCard(entry) {
    var media = '';
    var cardClass = 'article-card';
    var speculationAttr = entry.type === 'posts' || (entry.type === 'pages' && entry.permalink !== 'https://www.rhino-inquisitor.com/archive/' && entry.permalink !== '/archive/')
      ? ' data-speculation="archive-article"'
      : '';

    if (entry.heroImage) {
      media = '' +
        '<div class="article-card__media">' +
          '<img src="' + escapeHtml(entry.heroImage) + '" alt="' + escapeHtml(entry.heroImageAlt || entry.title) + '" loading="lazy">' +
        '</div>';
    } else {
      cardClass += ' article-card--no-media';
    }

    return '' +
      '<article class="' + cardClass + '">' +
        media +
        '<div class="article-card__body">' +
          createMetadata(entry) +
          '<h3 class="surface-title article-card__title"><a class="surface-title-link article-card__title-link" href="' + escapeHtml(entry.permalink) + '"' + speculationAttr + '>' + escapeHtml(entry.title) + '</a></h3>' +
          '<p class="article-card__excerpt">' + escapeHtml(entry.summary || 'Open the article for the full entry.') + '</p>' +
        '</div>' +
      '</article>';
  }

  function groupEntriesByYear(entries) {
    var groups = [];

    for (var index = 0; index < entries.length; index += 1) {
      var entry = entries[index];
      var year = entry.year || 'Undated';
      var currentGroup = groups[groups.length - 1];

      if (!currentGroup || currentGroup.year !== year) {
        currentGroup = {
          year: year,
          entries: []
        };
        groups.push(currentGroup);
      }

      currentGroup.entries.push(entry);
    }

    return groups;
  }

  function buildResultsMarkup(entries, totalMatches, query, scopeLabel, sortValue) {
    var activeSort = normalizeSort(sortValue);
    var sortLabel = SORT_LABELS[activeSort] || SORT_LABELS[DEFAULT_SORT];

    if (!entries.length) {
      var clearUrl = new URL(window.location.href);
      clearUrl.searchParams.delete(SEARCH_PARAM);
      if (activeSort === DEFAULT_SORT) {
        clearUrl.searchParams.delete(SORT_PARAM);
      } else {
        clearUrl.searchParams.set(SORT_PARAM, activeSort);
      }
      clearUrl.hash = 'archive-results';

      return '' +
        '<div class="archive-results__head">' +
          '<h2 id="archive-results-heading">Search results</h2>' +
          '<p class="archive-results__summary" role="status" aria-live="polite">Showing <strong class="result-count-badge">0</strong> results</p>' +
        '</div>' +
        '<div class="empty-state">' +
          '<p class="eyebrow">Search</p>' +
          '<h3>No matches for “' + escapeHtml(query) + '”</h3>' +
          '<p>Try another title, topic, or keyword, or clear the current query to restore the current ' + escapeHtml(scopeLabel) + ' view.</p>' +
          '<div class="archive-control-row"><a class="lane-header__action" href="' + escapeHtml(clearUrl.pathname + clearUrl.search + clearUrl.hash) + '">Clear search</a></div>' +
        '</div>';
    }

    var hasQuery = Boolean(String(query || '').trim());
    var heading = hasQuery ? 'Search results' : 'Archive results';
    var summary = 'Showing <strong class="result-count-badge">' + entries.length + '</strong> ' + (entries.length === 1 ? 'result' : 'results');

    if (totalMatches > entries.length) {
      summary += ' from <strong class="result-count-badge">' + totalMatches + '</strong> matches';
    }

    summary += ' sorted by <strong>' + escapeHtml(sortLabel) + '</strong>';

    if (activeSort === 'title-asc') {
      return '' +
        '<div class="archive-results__head">' +
          '<h2 id="archive-results-heading">' + heading + '</h2>' +
          '<p class="archive-results__summary" role="status" aria-live="polite">' + summary + '</p>' +
        '</div>' +
        '<ul class="article-card-grid" role="list">' +
          entries.map(function (entry) {
            return '<li>' + createCard(entry) + '</li>';
          }).join('') +
        '</ul>';
    }

    var groups = groupEntriesByYear(entries);

    return '' +
      '<div class="archive-results__head">' +
        '<h2 id="archive-results-heading">' + heading + '</h2>' +
        '<p class="archive-results__summary" role="status" aria-live="polite">' + summary + '</p>' +
      '</div>' +
      '<div class="archive-year-groups">' +
        groups.map(function (group) {
          return '' +
            '<section class="archive-year-group" id="year-' + escapeHtml(group.year) + '">' +
              '<div class="archive-year-group__header">' +
                '<h3>' + escapeHtml(group.year) + '</h3>' +
                '<p class="surface-note">' + group.entries.length + ' ' + (group.entries.length === 1 ? 'entry' : 'entries') + '</p>' +
              '</div>' +
              '<ul class="article-card-grid" role="list">' +
                group.entries.map(function (entry) {
                  return '<li>' + createCard(entry) + '</li>';
                }).join('') +
              '</ul>' +
            '</section>';
        }).join('') +
      '</div>';
  }

  function scoreEntry(entry, tokens) {
    var title = normalize(entry.title);
    var summary = normalize(entry.summary);
    var typeLabel = normalize(entry.typeLabel);
    var primaryTopic = normalize(entry.primaryTopic);
    var categories = Array.isArray(entry.categories) ? entry.categories.map(normalize) : [];
    var haystack = [title, summary, typeLabel, primaryTopic].concat(categories).join(' ');
    var score = 0;

    for (var index = 0; index < tokens.length; index += 1) {
      var token = tokens[index];
      if (!haystack.includes(token)) {
        return -1;
      }

      if (title.includes(token)) {
        score += 6;
      }

      if (primaryTopic.includes(token)) {
        score += 4;
      }

      if (categories.some(function (category) { return category.includes(token); })) {
        score += 3;
      }

      if (summary.includes(token)) {
        score += 1;
      }
    }

    return score;
  }

  function compareTitles(leftTitle, rightTitle) {
    return String(leftTitle || '').localeCompare(String(rightTitle || ''), undefined, {
      sensitivity: 'base'
    });
  }

  function compareByNewest(left, right) {
    var leftDate = Date.parse(left.date || '');
    var rightDate = Date.parse(right.date || '');
    var leftHasDate = !Number.isNaN(leftDate);
    var rightHasDate = !Number.isNaN(rightDate);

    if (leftHasDate && rightHasDate && rightDate !== leftDate) {
      return rightDate - leftDate;
    }

    if (leftHasDate !== rightHasDate) {
      return leftHasDate ? -1 : 1;
    }

    return compareTitles(left.title, right.title);
  }

  function compareByOldest(left, right) {
    var leftDate = Date.parse(left.date || '');
    var rightDate = Date.parse(right.date || '');
    var leftHasDate = !Number.isNaN(leftDate);
    var rightHasDate = !Number.isNaN(rightDate);

    if (leftHasDate && rightHasDate && leftDate !== rightDate) {
      return leftDate - rightDate;
    }

    if (leftHasDate !== rightHasDate) {
      return leftHasDate ? -1 : 1;
    }

    return compareTitles(left.title, right.title);
  }

  function compareByTitle(left, right) {
    var titleComparison = compareTitles(left.title, right.title);
    if (titleComparison !== 0) {
      return titleComparison;
    }

    return compareByNewest(left, right);
  }

  function sortEntries(entries, sortValue) {
    var activeSort = normalizeSort(sortValue);
    return entries.slice().sort(function (left, right) {
      if (activeSort === 'oldest') {
        return compareByOldest(left, right);
      }

      if (activeSort === 'title-asc') {
        return compareByTitle(left, right);
      }

      return compareByNewest(left, right);
    });
  }

  function matchesScope(entry, scopeKind, scopeValue) {
    if (!scopeKind || !scopeValue) {
      return true;
    }

    if (scopeKind === 'type') {
      return normalize(entry.type) === scopeValue;
    }

    if (scopeKind === 'category') {
      return Array.isArray(entry.categorySlugs) && entry.categorySlugs.indexOf(scopeValue) !== -1;
    }

    return true;
  }

  function initArchiveSearch(form) {
    var input = form.querySelector('input[name="' + SEARCH_PARAM + '"]');
    var status = form.querySelector('[data-search-status]');
    var resultsId = form.dataset.searchResultsId || 'archive-results';
    var resultsRoot = document.getElementById(resultsId);
    var yearControls = document.querySelectorAll(form.dataset.searchYearControlsSelector || '[data-archive-year-controls]');
    var sortControls = document.querySelectorAll('[data-archive-sort]');
    var scopeKind = normalize(form.dataset.searchScopeKind || '');
    var scopeValue = normalize(form.dataset.searchScopeValue || '');
    var scopeLabel = form.dataset.searchScopeLabel || 'archive';
    var stateBaseUrl = form.dataset.searchStateBaseUrl || form.getAttribute('action') || window.location.pathname;
    var indexUrl = form.dataset.searchIndexUrl;
    var initialMarkup = resultsRoot ? resultsRoot.innerHTML : '';
    var defaultStatus = status ? status.textContent : '';
    var indexPromise;

    if (stateBaseUrl.indexOf('#') !== -1) {
      stateBaseUrl = stateBaseUrl.split('#')[0];
    }

    if (!input || !resultsRoot || !indexUrl) {
      return;
    }

    resultsRoot.setAttribute('aria-live', 'polite');

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function setSortControls(sortValue) {
      var activeSort = normalizeSort(sortValue);
      Array.prototype.forEach.call(sortControls, function (control) {
        control.value = activeSort;
      });
    }

    function setYearControlsHidden(hidden) {
      Array.prototype.forEach.call(yearControls, function (control) {
        control.hidden = hidden;
      });
    }

    function getActiveSort() {
      if (!sortControls.length) {
        return DEFAULT_SORT;
      }

      return normalizeSort(sortControls[0].value || DEFAULT_SORT);
    }

    function restoreDefaultState() {
      resultsRoot.innerHTML = initialMarkup;
      setYearControlsHidden(false);
      setStatus(defaultStatus);
    }

    function getIndex() {
      if (!indexPromise) {
        indexPromise = fetch(indexUrl, {
          headers: {
            accept: 'application/json'
          }
        }).then(function (response) {
          if (!response.ok) {
            throw new Error('Search index request failed with HTTP ' + response.status + '.');
          }
          return response.json();
        });
      }

      return indexPromise;
    }

    function updateLocation(query, sortValue, push) {
      var url = new URL(stateBaseUrl, window.location.origin);
      if (query) {
        url.searchParams.set(SEARCH_PARAM, query);
      } else {
        url.searchParams.delete(SEARCH_PARAM);
      }

      if (sortValue && sortValue !== DEFAULT_SORT) {
        url.searchParams.set(SORT_PARAM, sortValue);
      } else {
        url.searchParams.delete(SORT_PARAM);
      }

      url.hash = 'archive-results';

      var nextUrl = url.pathname + url.search + url.hash;
      if (push) {
        window.history.pushState({}, '', nextUrl);
      } else {
        window.history.replaceState({}, '', nextUrl);
      }
    }

    function runSearch(query, sortValue, shouldScroll) {
      var trimmed = String(query || '').trim();
      var tokens = tokenize(trimmed);
      var activeSort = normalizeSort(sortValue);

      input.value = trimmed;
      setSortControls(activeSort);

      if (!tokens.length && activeSort === DEFAULT_SORT) {
        restoreDefaultState();
        return Promise.resolve();
      }

      resultsRoot.setAttribute('aria-busy', 'true');
      setStatus(tokens.length ? 'Updating the ' + scopeLabel + ' results...' : 'Sorting the ' + scopeLabel + '...');

      return getIndex().then(function (entries) {
        var matches = entries
          .filter(function (entry) {
            return matchesScope(entry, scopeKind, scopeValue);
          })
          .filter(function (entry) {
            return !tokens.length || scoreEntry(entry, tokens) >= 0;
          });

        var sortedMatches = sortEntries(matches, activeSort);
        var visibleMatches = tokens.length ? sortedMatches.slice(0, SEARCH_LIMIT) : sortedMatches;

        resultsRoot.innerHTML = buildResultsMarkup(visibleMatches, sortedMatches.length, trimmed, scopeLabel, activeSort);
        setYearControlsHidden(false);

        if (sortedMatches.length) {
          var statusMessage = 'Showing ' + visibleMatches.length + ' of ' + sortedMatches.length + ' ' + (sortedMatches.length === 1 ? 'result' : 'results') + ' in the ' + scopeLabel + ', sorted by ' + SORT_LABELS[activeSort] + '.';
          if (tokens.length && sortedMatches.length > SEARCH_LIMIT) {
            statusMessage += ' Refine your query to narrow the list.';
          }
          setStatus(statusMessage);
        } else if (tokens.length) {
          setStatus('No matching results found in the ' + scopeLabel + '.');
        } else {
          setStatus('No results are available for this sorted ' + scopeLabel + ' view.');
        }

        if (shouldScroll) {
          resultsRoot.scrollIntoView({ block: 'start' });
        }
      }).catch(function (error) {
        restoreDefaultState();
        setStatus('Search is temporarily unavailable. Browse the archive or try again after reloading the page.');
        console.error(error);
      }).finally(function () {
        resultsRoot.removeAttribute('aria-busy');
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var activeSort = getActiveSort();
      updateLocation(query, activeSort, true);
      runSearch(query, activeSort, true);
    });

    input.addEventListener('search', function () {
      if (!input.value.trim()) {
        var activeSort = getActiveSort();
        updateLocation('', activeSort, true);
        runSearch('', activeSort, false);
      }
    });

    Array.prototype.forEach.call(sortControls, function (control) {
      control.addEventListener('change', function () {
        var query = input.value.trim();
        var activeSort = normalizeSort(control.value || DEFAULT_SORT);
        setSortControls(activeSort);
        updateLocation(query, activeSort, true);
        runSearch(query, activeSort, true);
      });
    });

    window.addEventListener('popstate', function () {
      var state = getStateFromLocation();
      runSearch(state.query, state.sort, false);
    });

    var initialState = getStateFromLocation();
    setSortControls(initialState.sort);
    if (initialState.query.trim() || initialState.sort !== DEFAULT_SORT) {
      runSearch(initialState.query, initialState.sort, false);
    }
  }

  function start() {
    var forms = document.querySelectorAll('[data-search-index-url]');
    for (var index = 0; index < forms.length; index += 1) {
      initArchiveSearch(forms[index]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();