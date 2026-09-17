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
  // to work while quietly lying. We enforce it ourselves and say when we do.
  var OUTPUT_BUDGET = 1500;

  var DEFAULT_LIMIT = 4;
  var MIN_LIMIT = 1;
  var MAX_LIMIT = 20;

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

  // The index mixes articles (`type: "posts"`) with standalone reference pages
  // (`type: "pages"`). Only articles belong in a "recent articles" answer.
  function articlesFrom(index) {
    if (!Array.isArray(index)) {
      return null;
    }

    return index
      .filter(function (entry) {
        return entry && entry.type === 'posts';
      })
      .sort(function (a, b) {
        if (a.date === b.date) {
          return 0;
        }
        return a.date < b.date ? 1 : -1;
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

  function candidateFor(articles, count, wanted) {
    var payload = {
      returned: count,
      totalArticles: articles.length,
      results: articles.slice(0, count).map(toRow)
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
  // blindly. Return the most rows that actually fit and tell the agent the list
  // was cut — a short, honest answer beats a long one the agent will truncate
  // at an arbitrary point without knowing it did.
  function fitToBudget(articles, limit) {
    var wanted = Math.min(limit, articles.length);

    for (var count = wanted; count >= 1; count -= 1) {
      var candidate = candidateFor(articles, count, wanted);
      if (JSON.stringify(candidate).length <= OUTPUT_BUDGET) {
        return candidate;
      }
    }

    // Even a single row overflows (a pathologically long summary). One row with
    // the cap declared is still more use to an agent than nothing.
    return candidateFor(articles, 1, wanted);
  }

  function emptyResult(guidance) {
    return {
      returned: 0,
      totalArticles: 0,
      results: [],
      guidance: guidance
    };
  }

  try {
    document.modelContext.registerTool({
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
              return emptyResult(
                'The article index for rhino-inquisitor.com could not be read.' +
                  ' Fetch /llms.txt for a plain-text list of the site\'s articles instead.'
              );
            }

            if (articles.length === 0) {
              return emptyResult(
                'No articles are published on rhino-inquisitor.com yet.'
              );
            }

            return fitToBudget(articles, limit);
          },
          function () {
            // Every failure path — offline, aborted, malformed response —
            // resolves with a sentence the agent can act on. Rejecting would
            // give the agent an opaque error and no next move.
            return emptyResult(
              'Could not load the article index for rhino-inquisitor.com. Try' +
                ' again, or fetch /llms.txt for a plain-text list of its articles.'
            );
          }
        );
      }
    });
  } catch (error) {
    // Registration is best-effort. A rejected tool definition, or an API shape
    // that drifted during the origin trial, must never surface on a reader's
    // page: they came here to read, not to see our integration fail.
  }
})();
