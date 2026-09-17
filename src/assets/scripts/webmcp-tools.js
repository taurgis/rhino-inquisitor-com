(function () {
  'use strict';

  // Expose this site's content to an in-page AI agent through WebMCP
  // (`document.modelContext`), so an agent running in the reader's browser can
  // query the corpus with structured tool calls instead of scraping rendered
  // HTML. The tools describe the SITE, not the current page, so this script is
  // declared on every template and registers the same set everywhere.
  //
  // WebMCP is an origin trial and a Draft Community Group Report, not a
  // standards-track API — it has already renamed its entry point once
  // (`navigator.modelContext` -> `document.modelContext`). Everything below is
  // therefore feature-detected and failure-swallowing: on any browser without
  // the API, or once the origin-trial token expires, this file must do nothing
  // observable at all.

  if (window.__rhinoWebmcpToolsLoaded) {
    return;
  }

  // One check covers three cases that are indistinguishable from here and want
  // identical handling: the browser never had the API, the origin-trial token
  // expired, or the origin was never enrolled. Deliberately does NOT set the
  // guard flag, so nothing is latched on a browser that lacks the API.
  if (
    !document.modelContext ||
    typeof document.modelContext.registerTool !== 'function'
  ) {
    return;
  }

  window.__rhinoWebmcpToolsLoaded = true;

  var INDEX_URL = '/index.json';

  // Chrome recommends at most 1.5K characters per individual tool output. The
  // limit matters more than it looks: exceeding it fails *invisibly*, with the
  // agent silently dropping or truncating the payload, so the tool would appear
  // to work while quietly lying. We enforce it ourselves, and every tool makes
  // the cut visible in its own answer.
  var OUTPUT_BUDGET = 1500;

  var DEFAULT_LIMIT = 4;
  var MIN_LIMIT = 1;
  var MAX_LIMIT = 20;

  // Every failure path resolves with one of these instead of rejecting: an
  // agent handed an opaque error has nothing to act on, while a sentence
  // naming a next move keeps it moving.
  var INDEX_UNREADABLE =
    'The article index for rhino-inquisitor.com could not be read. Fetch' +
    ' /llms.txt for a plain-text list of the site\'s articles instead.';

  var INDEX_UNAVAILABLE =
    'Could not load the article index for rhino-inquisitor.com. Try again, or' +
    ' fetch /llms.txt for a plain-text list of its articles.';

  var UNUSABLE_QUERY =
    'Call searchArticles with words to search for, or call listRecentArticles' +
    ' for the newest articles.';

  // The site's search index, shared by every tool. Cached as the PROMISE, not
  // the resolved value, so concurrent tool calls join one in-flight request
  // rather than racing two. A rejection clears the cache so the next call
  // retries instead of being permanently stuck on a failed fetch.
  var indexPromise = null;

  function getIndex(signal) {
    if (!indexPromise) {
      indexPromise = fetch(INDEX_URL, { signal: signal })
        .then(function (response) {
          return response.json();
        })
        .catch(function (error) {
          indexPromise = null;
          throw error;
        });
    }
    return indexPromise;
  }

  // -------------------------------------------------------------------------
  // Text matching and ranking.
  //
  // `normalize`, `tokenize`, `scoreEntry`, `compareTitles` and
  // `compareByNewest` below are an INTENTIONAL DUPLICATE of the same functions
  // in src/static/scripts/archive-search.js, which powers the human-facing
  // archive search. Decided deliberately: this site has no bundler, so there is
  // no import to share, and the two are expected to diverge — the archive's
  // copy feeds a rendered list with its own sort controls, where the score is
  // only ever read as a `>= 0` match gate, while this copy feeds a
  // character-capped agent payload where the score actually drives the order.
  //
  // Keep the token gate and the 6/4/3/1 weights in step across both copies, so
  // a human searching the archive and an agent calling searchArticles agree on
  // what counts as a match.
  // -------------------------------------------------------------------------

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // No de-duplication: a repeated word is scored twice, matching the archive.
  function tokenize(query) {
    return normalize(query).split(/\s+/).filter(Boolean);
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

      // The AND gate: one token missing anywhere in the entry excludes it
      // outright, however well the others scored.
      if (haystack.indexOf(token) === -1) {
        return -1;
      }

      if (title.indexOf(token) !== -1) {
        score += 6;
      }

      if (primaryTopic.indexOf(token) !== -1) {
        score += 4;
      }

      // `.some()`, so an entry with three matching categories still scores the
      // same +3 as one with a single match.
      if (categories.some(function (category) { return category.indexOf(token) !== -1; })) {
        score += 3;
      }

      if (summary.indexOf(token) !== -1) {
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
    var leftHasDate = !isNaN(leftDate);
    var rightHasDate = !isNaN(rightDate);

    if (leftHasDate && rightHasDate && rightDate !== leftDate) {
      return rightDate - leftDate;
    }

    if (leftHasDate !== rightHasDate) {
      return leftHasDate ? -1 : 1;
    }

    return compareTitles(left.title, right.title);
  }

  // The index mixes articles (`type: "posts"`) with standalone reference pages
  // (`type: "pages"`). searchArticles covers both — it promises to search
  // "every article and reference page" — so the split lives here rather than in
  // the fetch.
  function entriesFrom(index) {
    if (!Array.isArray(index)) {
      return null;
    }

    return index.filter(function (entry) {
      return Boolean(entry);
    });
  }

  // Only articles belong in a "recent articles" answer.
  function articlesFrom(index) {
    var entries = entriesFrom(index);

    if (entries === null) {
      return null;
    }

    return entries
      .filter(function (entry) {
        return entry.type === 'posts';
      })
      .sort(compareByNewest);
  }

  // Relevance order, best first. This is the one place on the site where the
  // weighted score actually decides what a reader sees: the archive page always
  // sorts by the visitor's own date/title control instead.
  function rankEntries(entries, tokens, topic) {
    var wantedTopic = normalize(topic);
    var scored = [];

    for (var index = 0; index < entries.length; index += 1) {
      var entry = entries[index];

      // Exact match on `primaryTopic` after normalizing, applied before
      // scoring. Not `categories`: the two fields carry different display
      // strings for most of the corpus ("Commerce Cloud" against "Salesforce
      // Commerce Cloud"), so filtering on categories would silently drop the
      // larger half of the site. An unrecognized topic simply yields nothing
      // and flows into the ordinary no-match answer.
      if (wantedTopic && normalize(entry.primaryTopic) !== wantedTopic) {
        continue;
      }

      var score = scoreEntry(entry, tokens);
      if (score < 0) {
        continue;
      }

      scored.push({ entry: entry, score: score });
    }

    scored.sort(function (left, right) {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      // Neither the spec nor the archive says how to break a tie; newest first
      // matches the rest of the site.
      return compareByNewest(left.entry, right.entry);
    });

    return scored.map(function (item) {
      return item.entry;
    });
  }

  // The row shape is shared across all of this site's tools, so an agent that
  // has seen one result set can read the others without re-learning it.
  function toRow(entry) {
    return {
      title: entry.title,
      url: entry.relPermalink,
      topic: entry.primaryTopic,
      date: entry.date,
      readingTime: entry.readingTime,
      summary: entry.summary
    };
  }

  // Validate strictly here even though the schema already advertises the range:
  // schema bounds are advisory to an agent, and a tool that rejects a slightly
  // out-of-range number is less useful than one that does the obvious thing.
  function clampLimit(raw) {
    if (raw === undefined || raw === null) {
      return DEFAULT_LIMIT;
    }

    var requested = Number(raw);
    if (!isFinite(requested)) {
      return DEFAULT_LIMIT;
    }

    requested = Math.floor(requested);
    if (requested < MIN_LIMIT) {
      return MIN_LIMIT;
    }
    if (requested > MAX_LIMIT) {
      return MAX_LIMIT;
    }
    return requested;
  }

  function guidanceFor(returned, wanted) {
    return (
      'Only the first ' +
      returned +
      ' of ' +
      wanted +
      ' articles fit one response. Call listRecentArticles again with a smaller' +
      ' limit for more detail, or fetch /index.json for the full list.'
    );
  }

  function rowsFrom(entries, count) {
    return entries.slice(0, count).map(toRow);
  }

  function candidateFor(articles, count, wanted) {
    var payload = {
      returned: count,
      totalArticles: articles.length,
      results: rowsFrom(articles, count)
    };

    // Only claim a cap when one actually happened, so a complete answer is not
    // mistaken for a partial one.
    if (count < wanted) {
      payload.guidance = guidanceFor(count, wanted);
    }

    return payload;
  }

  // A full `limit: 20` of real rows is roughly 4.5x the output budget, and no
  // row shape brings it under, so the requested count cannot be honoured
  // blindly. Return the most rows that actually fit — a short, honest answer
  // beats a long one the agent will truncate at an arbitrary point without
  // knowing it did. `buildCandidate` owns saying so, because each tool declares
  // the cut differently.
  function fitToBudget(buildCandidate, wanted) {
    for (var count = wanted; count >= 1; count -= 1) {
      var candidate = buildCandidate(count, wanted);
      if (JSON.stringify(candidate).length <= OUTPUT_BUDGET) {
        return candidate;
      }
    }

    // Even a single row overflows (a pathologically long summary). One row is
    // still more use to an agent than nothing.
    return buildCandidate(1, wanted);
  }

  function emptyListResult(guidance) {
    return {
      returned: 0,
      totalArticles: 0,
      results: [],
      guidance: guidance
    };
  }

  function searchCandidateFor(query, matches, count) {
    // No guidance sentence when this trims: `matchCount` against `returned`
    // already tells the agent more rows exist, and a sentence saying so costs
    // ~170 characters — most of a whole row out of the same 1.5K.
    return {
      query: query,
      matchCount: matches.length,
      returned: count,
      results: rowsFrom(matches, count)
    };
  }

  function emptySearchResult(query, guidance) {
    return {
      query: query,
      matchCount: 0,
      returned: 0,
      results: [],
      guidance: guidance
    };
  }

  function noMatchGuidance(query) {
    return (
      'No articles match "' +
      query +
      '" on rhino-inquisitor.com. Try fewer or broader words, or call' +
      ' getSiteOverview to see the topics this site covers.'
    );
  }

  // Each registration gets its own try/catch, so a definition the browser
  // rejects — a schema shape that drifted mid-origin-trial, say — costs only
  // that one tool rather than the whole surface. Failures are swallowed
  // outright: readers came here to read, not to watch our integration fail.
  function register(definition) {
    try {
      document.modelContext.registerTool(definition);
    } catch (error) {
      // Best-effort by design. See above.
    }
  }

  register({
    name: 'listRecentArticles',
    title: 'List recent articles',
    description:
      'Lists the most recently published articles on rhino-inquisitor.com,' +
      ' newest first. Use it to find out what is new on the site, or to get' +
      ' the URL of a recent article before calling getArticle. For a' +
      ' subject-specific search, use searchArticles instead.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: MIN_LIMIT,
          maximum: MAX_LIMIT,
          description: 'How many articles to list, newest first. Defaults to 4.'
        }
      }
    },
    annotations: {
      readOnlyHint: true
    },
    execute: function (args, signal) {
      var limit = clampLimit(args && args.limit);

      return getIndex(signal).then(
        function (index) {
          var articles = articlesFrom(index);

          if (articles === null) {
            return emptyListResult(INDEX_UNREADABLE);
          }

          if (articles.length === 0) {
            return emptyListResult(
              'No articles are published on rhino-inquisitor.com yet.'
            );
          }

          return fitToBudget(function (count, wanted) {
            return candidateFor(articles, count, wanted);
          }, Math.min(limit, articles.length));
        },
        function () {
          // Every failure path — offline, aborted, malformed response —
          // resolves with a sentence the agent can act on. Rejecting would
          // give the agent an opaque error and no next move.
          return emptyListResult(INDEX_UNAVAILABLE);
        }
      );
    }
  });

  register({
    name: 'searchArticles',
    title: 'Search articles',
    description:
      'Searches the titles, topics and summaries of every article and reference' +
      ' page published on rhino-inquisitor.com, a technical blog about Salesforce' +
      ' B2C Commerce Cloud. Use it to find what this site has written on a' +
      ' subject, and to get the URL of an article before calling getArticle.' +
      ' Results are ranked by relevance, best match first.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Words to search for. Every word must appear in an article\'s' +
            ' title, topic, category or summary for it to match.'
        },
        limit: {
          type: 'integer',
          minimum: MIN_LIMIT,
          maximum: MAX_LIMIT,
          description:
            'How many results to return. Defaults to 4. Fewer, better-ranked' +
            ' results usually serve better than many.'
        },
        topic: {
          type: 'string',
          description:
            'Restrict results to one topic, using a topic name from' +
            ' getSiteOverview, for example "Architecture".'
        }
      },
      required: ['query']
    },
    annotations: {
      readOnlyHint: true
    },
    execute: function (args, signal) {
      // Validate strictly in code, loosely in the schema: `query` is marked
      // required but carries no `minLength`, and schema constraints are
      // advisory to an agent in any case.
      var query = args && typeof args.query === 'string' ? args.query : '';
      var topic = args && typeof args.topic === 'string' ? args.topic : '';
      var limit = clampLimit(args && args.limit);
      var tokens = tokenize(query);

      // A query with no words in it needs no network request: there is nothing
      // to search for, and the answer would be the same either way.
      if (tokens.length === 0) {
        return Promise.resolve(emptySearchResult(query, UNUSABLE_QUERY));
      }

      return getIndex(signal).then(
        function (index) {
          var entries = entriesFrom(index);

          if (entries === null) {
            return emptySearchResult(query, INDEX_UNREADABLE);
          }

          var matches = rankEntries(entries, tokens, topic);

          if (matches.length === 0) {
            return emptySearchResult(query, noMatchGuidance(query));
          }

          return fitToBudget(function (count) {
            return searchCandidateFor(query, matches, count);
          }, Math.min(limit, matches.length));
        },
        function () {
          return emptySearchResult(query, INDEX_UNAVAILABLE);
        }
      );
    }
  });
})();
