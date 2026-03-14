(function () {
  if (window.__rhinoArchiveSearchLoaded) {
    return;
  }
  window.__rhinoArchiveSearchLoaded = true;

  var SEARCH_LIMIT = 48;
  var SEARCH_PARAM = 'q';

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

  function getQueryFromLocation() {
    var params = new URLSearchParams(window.location.search);
    return params.get(SEARCH_PARAM) || '';
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
          '<h3><a href="' + escapeHtml(entry.permalink) + '">' + escapeHtml(entry.title) + '</a></h3>' +
          '<p class="article-card__excerpt">' + escapeHtml(entry.summary || 'Open the article for the full entry.') + '</p>' +
          '<div class="archive-control-row">' +
            '<a class="lane-header__action" href="' + escapeHtml(entry.permalink) + '">Open article</a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function groupByYear(entries) {
    return entries.reduce(function (groups, entry) {
      var year = entry.year || 'Undated';
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(entry);
      return groups;
    }, {});
  }

  function buildResultsMarkup(entries, totalMatches, query, scopeLabel) {
    if (!entries.length) {
      var clearUrl = new URL(window.location.href);
      clearUrl.searchParams.delete(SEARCH_PARAM);
      clearUrl.hash = 'archive-results';

      return '' +
        '<div class="archive-results__head">' +
          '<h2 id="archive-results-heading">Search results</h2>' +
          '<p class="archive-results__summary">Showing <strong>0</strong> results</p>' +
        '</div>' +
        '<div class="empty-state">' +
          '<p class="eyebrow">Search</p>' +
          '<h3>No matches for “' + escapeHtml(query) + '”</h3>' +
          '<p>Try another title, topic, or keyword, or clear the current query to restore the default ' + escapeHtml(scopeLabel) + ' view.</p>' +
          '<div class="archive-control-row"><a class="lane-header__action" href="' + escapeHtml(clearUrl.pathname + clearUrl.search + clearUrl.hash) + '">Clear search</a></div>' +
        '</div>';
    }

    var groups = groupByYear(entries);
    var years = Object.keys(groups).sort(function (left, right) {
      if (left === 'Undated') {
        return 1;
      }
      if (right === 'Undated') {
        return -1;
      }
      return Number(right) - Number(left);
    });

    var summary = 'Showing <strong>' + entries.length + '</strong> ' + (entries.length === 1 ? 'result' : 'results');
    if (totalMatches > entries.length) {
      summary += ' from <strong>' + totalMatches + '</strong> matches';
    }

    return '' +
      '<div class="archive-results__head">' +
        '<h2 id="archive-results-heading">Search results</h2>' +
        '<p class="archive-results__summary">' + summary + '</p>' +
      '</div>' +
      '<div class="archive-year-groups">' +
        years.map(function (year) {
          return '' +
            '<section class="archive-year-group" id="year-' + escapeHtml(year) + '">' +
              '<div class="archive-year-group__header">' +
                '<h3>' + escapeHtml(year) + '</h3>' +
                '<p class="surface-note">' + groups[year].length + ' ' + (groups[year].length === 1 ? 'entry' : 'entries') + '</p>' +
              '</div>' +
              '<ul class="article-card-grid" role="list">' +
                groups[year].map(function (entry) {
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

  function sortMatches(left, right) {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    var leftDate = Date.parse(left.entry.date || '') || 0;
    var rightDate = Date.parse(right.entry.date || '') || 0;
    if (rightDate !== leftDate) {
      return rightDate - leftDate;
    }

    return left.entry.title.localeCompare(right.entry.title);
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
    var yearJump = document.querySelector(form.dataset.searchYearJumpSelector || '[data-search-year-jump]');
    var scopeKind = normalize(form.dataset.searchScopeKind || '');
    var scopeValue = normalize(form.dataset.searchScopeValue || '');
    var scopeLabel = form.dataset.searchScopeLabel || 'archive';
    var indexUrl = form.dataset.searchIndexUrl;
    var initialMarkup = resultsRoot ? resultsRoot.innerHTML : '';
    var defaultStatus = status ? status.textContent : '';
    var indexPromise;

    if (!input || !resultsRoot || !indexUrl) {
      return;
    }

    resultsRoot.setAttribute('aria-live', 'polite');

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function restoreDefaultState() {
      resultsRoot.innerHTML = initialMarkup;
      if (yearJump) {
        yearJump.hidden = false;
      }
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

    function updateLocation(query, push) {
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set(SEARCH_PARAM, query);
      } else {
        url.searchParams.delete(SEARCH_PARAM);
      }
      url.hash = 'archive-results';

      var nextUrl = url.pathname + url.search + url.hash;
      if (push) {
        window.history.pushState({}, '', nextUrl);
      } else {
        window.history.replaceState({}, '', nextUrl);
      }
    }

    function runSearch(query, shouldScroll) {
      var trimmed = String(query || '').trim();
      var tokens = tokenize(trimmed);

      input.value = trimmed;

      if (!tokens.length) {
        restoreDefaultState();
        return Promise.resolve();
      }

      resultsRoot.setAttribute('aria-busy', 'true');
      setStatus('Searching the ' + scopeLabel + '...');

      return getIndex().then(function (entries) {
        var matches = entries
          .filter(function (entry) {
            return matchesScope(entry, scopeKind, scopeValue);
          })
          .map(function (entry) {
            return {
              entry: entry,
              score: scoreEntry(entry, tokens)
            };
          })
          .filter(function (match) {
            return match.score >= 0;
          })
          .sort(sortMatches);

        var limitedMatches = matches.slice(0, SEARCH_LIMIT).map(function (match) {
          return match.entry;
        });
        resultsRoot.innerHTML = buildResultsMarkup(limitedMatches, matches.length, trimmed, scopeLabel);
        if (yearJump) {
          yearJump.hidden = true;
        }

        if (matches.length) {
          var statusMessage = 'Showing ' + limitedMatches.length + ' of ' + matches.length + ' matching ' + (matches.length === 1 ? 'result' : 'results') + ' in the ' + scopeLabel + '.';
          if (matches.length > SEARCH_LIMIT) {
            statusMessage += ' Refine your query to narrow the list.';
          }
          setStatus(statusMessage);
        } else {
          setStatus('No matching results found in the ' + scopeLabel + '.');
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
      updateLocation(query, true);
      runSearch(query, true);
    });

    input.addEventListener('search', function () {
      if (!input.value.trim()) {
        updateLocation('', true);
        restoreDefaultState();
      }
    });

    window.addEventListener('popstate', function () {
      runSearch(getQueryFromLocation(), false);
    });

    var initialQuery = getQueryFromLocation().trim();
    if (initialQuery) {
      runSearch(initialQuery, false);
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