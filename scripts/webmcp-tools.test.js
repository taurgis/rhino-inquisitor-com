import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Unit tests for the browser asset `src/assets/scripts/webmcp-tools.js`.
//
// The script is an IIFE that reads only globals (`window`, `document`, `fetch`),
// so it runs under `node:vm` with those stubbed — no DOM library needed. This
// covers everything about the tool's behaviour that does not require a real
// WebMCP implementation; discovery and invocation through an actual agent are
// verified separately in a flagged browser (see docs/development/webmcp-tools.md).

const SOURCE = fs.readFileSync(
  new URL('../src/assets/scripts/webmcp-tools.js', import.meta.url),
  'utf8',
);

const LIST_TOOL = 'listRecentArticles';
const SEARCH_TOOL = 'searchArticles';
const OVERVIEW_TOOL = 'getSiteOverview';

// The real hugo.toml values, delivered to the script as <body> data attributes
// by baseof.html. Used verbatim so the payload measurements below are the
// production ones, not fixture-sized approximations.
const SITE_DATA = {
  rhinoSiteName: 'Rhino Inquisitor',
  rhinoSiteDescription:
    'Technical articles, migration notes, and platform guidance from Rhino Inquisitor.',
  rhinoSiteAbout:
    'Head of Commerce at Forward with more than a decade of experience in' +
    ' Salesforce B2C Commerce Cloud architecture, delivery, platform strategy,' +
    ' and migration.',
};

// Chrome's recommended per-output budget. Breaching it fails invisibly: the
// agent silently drops or truncates. See the map issue's Notes.
const OUTPUT_BUDGET = 1500;

/**
 * Build a stub index entry. `summaryLength` lets a test reproduce the real
 * corpus's summary weight, which is what makes the output budget bite.
 */
function entry(i, { type = 'posts', summaryLength = 133, date, ...overrides } = {}) {
  return {
    title: `Article number ${i}`,
    relPermalink: `/article-${i}/`,
    permalink: `https://rhino-inquisitor.com/article-${i}/`,
    primaryTopic: 'Architecture',
    primaryTopicUrl: '/topics/architecture/',
    categories: ['Salesforce Commerce Cloud', 'Technical'],
    date: date || `2026-09-${String(28 - i).padStart(2, '0')}T12:00:00Z`,
    readingTime: 10 + i,
    summary: 'x'.repeat(summaryLength),
    type,
    typeLabel: type === 'posts' ? 'Article' : 'Page',
    ...overrides,
  };
}

function makeIndex({ posts = 8, pages = 2, summaryLength = 133 } = {}) {
  const items = [];
  for (let i = 0; i < posts; i += 1) {
    items.push(entry(i, { summaryLength }));
  }
  for (let i = 0; i < pages; i += 1) {
    items.push(entry(100 + i, { type: 'pages', summaryLength }));
  }
  return items;
}

/**
 * Execute the script in a fresh sandbox whose global object is also its
 * `window`, mirroring a browser. Returns handles for assertions.
 */
function load({ modelContext, fetchImpl, document: documentStub, siteData } = {}) {
  const registered = [];
  const fetchCalls = [];

  const defaultModelContext = {
    registerTool(definition) {
      registered.push(definition);
    },
  };

  const sandbox = {
    console,
    fetch:
      fetchImpl ||
      function (url, options) {
        fetchCalls.push({ url, options });
        return Promise.resolve({ json: () => Promise.resolve(makeIndex()) });
      },
  };

  sandbox.document =
    documentStub !== undefined
      ? documentStub
      : {
          modelContext: modelContext === undefined ? defaultModelContext : modelContext,
          body: { dataset: siteData === undefined ? { ...SITE_DATA } : siteData },
        };

  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  const run = () => vm.runInContext(SOURCE, sandbox, { filename: 'webmcp-tools.js' });
  run();

  return { sandbox, registered, fetchCalls, run };
}

/**
 * Read one column out of a result's rows as an array belonging to *this*
 * realm. `node:vm` gives the sandbox its own `Array`, and `assert/strict`
 * compares prototypes, so an array the script built is never
 * deep-strict-equal to a literal written here however alike the contents.
 */
function column(result, key) {
  return Array.from(result.results, (row) => row[key]);
}

function toolFrom(registered, name) {
  const matching = registered.filter((definition) => definition.name === name);
  assert.equal(matching.length, 1, `expected exactly one ${name} registration`);
  return matching[0];
}

// ---------------------------------------------------------------------------
// Feature detection and registration posture
// ---------------------------------------------------------------------------

test('bails silently when document.modelContext is absent', () => {
  const { sandbox, registered } = load({ document: {} });
  assert.equal(registered.length, 0);
  // Bailing must leave no trace, so a later script on a browser that gains the
  // API mid-session is not locked out by a stale guard.
  assert.equal(sandbox.__rhinoWebmcpToolsLoaded, undefined);
});

test('bails silently when registerTool is not a function', () => {
  const { sandbox, registered } = load({ modelContext: { registerTool: 'nope' } });
  assert.equal(registered.length, 0);
  assert.equal(sandbox.__rhinoWebmcpToolsLoaded, undefined);
});

test('registers listRecentArticles matching the specified contract', () => {
  const { registered, sandbox } = load();
  const tool = toolFrom(registered, LIST_TOOL);

  assert.equal(tool.name, LIST_TOOL);
  assert.equal(tool.title, 'List recent articles');
  assert.match(tool.description, /^Lists the most recently published articles/);
  assert.ok(tool.description.includes('getArticle'));
  assert.ok(tool.description.includes('searchArticles'));
  assert.equal(tool.annotations.readOnlyHint, true);
  assert.deepEqual(Object.keys(tool.annotations), ['readOnlyHint']);
  assert.equal(typeof tool.execute, 'function');
  assert.equal(sandbox.__rhinoWebmcpToolsLoaded, true);
});

test('honours the character budgets for every registered tool', () => {
  const { registered } = load();
  assert.ok(registered.length >= 1);

  for (const tool of registered) {
    assert.ok(tool.name.length <= 30, `tool name ${tool.name} > 30`);
    assert.ok(
      tool.description.length <= 500,
      `${tool.name} description ${tool.description.length} > 500`,
    );

    for (const [key, schema] of Object.entries(tool.inputSchema.properties)) {
      assert.ok(key.length <= 30, `parameter name ${key} > 30`);
      assert.ok(
        schema.description.length <= 150,
        `${tool.name}.${key} description ${schema.description.length} > 150`,
      );
    }
  }
});

test('passes inputSchema as an object, not a JSON string', () => {
  const tool = toolFrom(load().registered, LIST_TOOL);

  assert.equal(typeof tool.inputSchema, 'object');
  assert.equal(tool.inputSchema.type, 'object');
  assert.equal(tool.inputSchema.properties.limit.type, 'integer');
  assert.equal(tool.inputSchema.properties.limit.minimum, 1);
  assert.equal(tool.inputSchema.properties.limit.maximum, 20);
  // No $schema keyword, per the tool-spec convention.
  assert.equal(tool.inputSchema.$schema, undefined);
});

test('does not register twice when the script executes again', () => {
  const { registered, run } = load();
  const first = registered.length;
  run();
  assert.equal(registered.length, first, 're-execution must register nothing further');
});

test('swallows a registerTool failure without throwing', () => {
  assert.doesNotThrow(() => {
    load({
      modelContext: {
        registerTool() {
          throw new Error('registration rejected');
        },
      },
    });
  });
});

// Chrome never throws from `registerTool` — measured on 153.0.8010.47, every
// bad definition (missing description, unconvertible inputSchema, duplicate
// name) arrives as a *rejection* of the returned promise. A try/catch alone
// therefore catches nothing and the failure surfaces as an unhandled rejection
// in the reader's console, which breaks the "nothing observable" posture.
test('swallows a rejected registration promise, which is how Chrome reports one', async () => {
  const unhandled = [];
  const record = (reason) => unhandled.push(reason);
  process.on('unhandledRejection', record);

  try {
    load({
      modelContext: {
        registerTool() {
          return Promise.reject(new TypeError('Required member is undefined.'));
        },
      },
    });
    await new Promise((resolve) => setImmediate(resolve));
  } finally {
    process.off('unhandledRejection', record);
  }

  assert.deepEqual(unhandled, []);
});

// ---------------------------------------------------------------------------
// Tool behaviour
// ---------------------------------------------------------------------------

test('returns the four newest articles by default, excluding reference pages', async () => {
  const { registered } = load();
  const result = await toolFrom(registered, LIST_TOOL).execute({});

  assert.equal(result.returned, 4);
  assert.equal(result.totalArticles, 8, 'totalArticles counts posts only');
  assert.equal(result.results.length, 4);
  assert.equal(result.guidance, undefined);

  // Newest first.
  const dates = result.results.map((row) => row.date);
  assert.deepEqual(dates, [...dates].sort().reverse());

  // No reference pages leak in.
  for (const row of result.results) {
    assert.ok(!row.url.startsWith('/article-10'), `page leaked: ${row.url}`);
  }
});

test('rows use the shared row shape sourced from the index', async () => {
  const { registered } = load();
  const result = await toolFrom(registered, LIST_TOOL).execute({});

  assert.deepEqual(Object.keys(result.results[0]).sort(), [
    'date',
    'readingTime',
    'summary',
    'title',
    'topic',
    'url',
  ]);
  assert.equal(result.results[0].url, '/article-0/');
  assert.equal(result.results[0].topic, 'Architecture');
});

test('clamps limit in code rather than rejecting out-of-range values', async () => {
  const { registered } = load();
  const tool = toolFrom(registered, LIST_TOOL);

  assert.equal((await tool.execute({ limit: 1 })).returned, 1);
  assert.equal((await tool.execute({ limit: 0 })).returned, 1, 'below minimum clamps up');
  assert.equal((await tool.execute({ limit: -5 })).returned, 1);
  assert.equal((await tool.execute({ limit: 'many' })).returned, 4, 'non-numeric falls back');
  assert.equal((await tool.execute()).returned, 4, 'missing args object is tolerated');
});

test('tolerates a missing or malformed index without throwing', async () => {
  const { registered } = load({
    fetchImpl: () => Promise.resolve({ json: () => Promise.resolve({ not: 'an array' }) }),
  });
  const result = await toolFrom(registered, LIST_TOOL).execute({});

  assert.equal(result.returned, 0);
  assert.ok(result.guidance, 'degenerate index returns guidance, not a bare error');
});

test('returns guidance instead of an error when the index fetch fails', async () => {
  const { registered } = load({ fetchImpl: () => Promise.reject(new Error('offline')) });
  const result = await toolFrom(registered, LIST_TOOL).execute({});

  assert.ok(result.guidance, 'expected a guiding sentence');
  assert.ok(result.guidance.includes('rhino-inquisitor.com'));
  assert.equal(result.returned, 0);
});

test('returns guidance when the index holds no articles', async () => {
  const { registered } = load({
    fetchImpl: () => Promise.resolve({ json: () => Promise.resolve(makeIndex({ posts: 0 })) }),
  });
  const result = await toolFrom(registered, LIST_TOOL).execute({});

  assert.equal(result.returned, 0);
  assert.equal(result.totalArticles, 0);
  assert.ok(result.guidance);
});

// ---------------------------------------------------------------------------
// Output budget
// ---------------------------------------------------------------------------

test('keeps the default payload under the per-output character budget', async () => {
  const { registered } = load({
    // The real corpus's worst observed summary length.
    fetchImpl: () =>
      Promise.resolve({ json: () => Promise.resolve(makeIndex({ summaryLength: 159 })) }),
  });
  const result = await toolFrom(registered, LIST_TOOL).execute({});

  const serialized = JSON.stringify(result);
  assert.ok(
    serialized.length <= OUTPUT_BUDGET,
    `default payload ${serialized.length} > ${OUTPUT_BUDGET}`,
  );
});

test('caps rows to the output budget when a larger limit is requested', async () => {
  const { registered } = load({
    fetchImpl: () =>
      Promise.resolve({
        json: () => Promise.resolve(makeIndex({ posts: 30, pages: 0, summaryLength: 159 })),
      }),
  });
  const result = await toolFrom(registered, LIST_TOOL).execute({ limit: 20 });

  const serialized = JSON.stringify(result);
  assert.ok(
    serialized.length <= OUTPUT_BUDGET,
    `limit:20 payload ${serialized.length} > ${OUTPUT_BUDGET}`,
  );
  assert.ok(result.returned < 20, 'expected the row count to be capped');
  assert.ok(result.returned >= 1, 'at least one row must survive the cap');
  assert.equal(result.results.length, result.returned);
  assert.ok(
    result.guidance,
    'a capped response must say so, rather than looking like the whole answer',
  );
  assert.equal(result.totalArticles, 30);
});

test('reports no cap when the requested limit fits the budget', async () => {
  const { registered } = load();
  const result = await toolFrom(registered, LIST_TOOL).execute({ limit: 2 });

  assert.equal(result.returned, 2);
  assert.equal(result.guidance, undefined);
});

// ---------------------------------------------------------------------------
// The shared index fetch
// ---------------------------------------------------------------------------

test('shares one in-flight fetch across concurrent calls', async () => {
  let calls = 0;
  const { registered } = load({
    fetchImpl: () => {
      calls += 1;
      return new Promise((resolve) => {
        setTimeout(() => resolve({ json: () => Promise.resolve(makeIndex()) }), 5);
      });
    },
  });
  const tool = toolFrom(registered, LIST_TOOL);

  const [a, b] = await Promise.all([tool.execute({}), tool.execute({ limit: 2 })]);

  assert.equal(calls, 1, 'concurrent calls must share one request');
  assert.equal(a.returned, 4);
  assert.equal(b.returned, 2);
});

test('reuses the cached index on a later sequential call', async () => {
  let calls = 0;
  const { registered } = load({
    fetchImpl: () => {
      calls += 1;
      return Promise.resolve({ json: () => Promise.resolve(makeIndex()) });
    },
  });
  const tool = toolFrom(registered, LIST_TOOL);

  await tool.execute({});
  await tool.execute({});

  assert.equal(calls, 1);
});

test('retries the fetch after a rejection instead of caching the failure', async () => {
  let calls = 0;
  const { registered } = load({
    fetchImpl: () => {
      calls += 1;
      if (calls === 1) {
        return Promise.reject(new Error('offline'));
      }
      return Promise.resolve({ json: () => Promise.resolve(makeIndex()) });
    },
  });
  const tool = toolFrom(registered, LIST_TOOL);

  const failed = await tool.execute({});
  assert.ok(failed.guidance);

  const recovered = await tool.execute({});
  assert.equal(calls, 2, 'a failed promise must not be cached');
  assert.equal(recovered.returned, 4);
});

test('passes the execute AbortSignal through to fetch', async () => {
  const seen = [];
  const { registered } = load({
    fetchImpl: (url, options) => {
      seen.push({ url, options });
      return Promise.resolve({ json: () => Promise.resolve(makeIndex()) });
    },
  });

  const controller = new AbortController();
  await toolFrom(registered, LIST_TOOL).execute({}, controller.signal);

  assert.equal(seen.length, 1);
  assert.equal(seen[0].url, '/index.json');
  assert.equal(seen[0].options.signal, controller.signal);
});

test('an abort during an in-flight fetch surfaces as guidance, not a throw', async () => {
  const { registered } = load({
    fetchImpl: (url, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }),
  });

  const controller = new AbortController();
  const pending = toolFrom(registered, LIST_TOOL).execute({}, controller.signal);
  controller.abort();

  const result = await pending;
  assert.ok(result.guidance, 'an aborted call must resolve with guidance, not reject');
});

// ---------------------------------------------------------------------------
// searchArticles
// ---------------------------------------------------------------------------

// The exact sentences specified for the two empty-result paths. The first is
// quoted verbatim from the tool spec; the second is adapted for a query that
// tokenizes to nothing, which the spec does not give a sentence for.
const NO_MATCH_SENTENCE = (query) =>
  `No articles match "${query}" on rhino-inquisitor.com. Try fewer or broader` +
  ' words, or call getSiteOverview to see the topics this site covers.';

const EMPTY_QUERY_SENTENCE =
  'Call searchArticles with words to search for, or call listRecentArticles' +
  ' for the newest articles.';

/**
 * A corpus with deliberately varied titles, topics and categories, so the
 * token gate, each of the four weights, and the topic filter are all
 * distinguishable from one another. Dates are chosen so that a plain
 * newest-first sort disagrees with the relevance order.
 */
function searchCorpus() {
  return [
    entry(1, {
      title: 'Cartridge path and overrides',
      relPermalink: '/cartridge-path/',
      primaryTopic: 'Architecture',
      categories: ['Salesforce Commerce Cloud'],
      summary: 'How template resolution walks the configured cartridges.',
      date: '2026-01-05T00:00:00Z',
    }),
    entry(2, {
      title: 'Deployment checklist',
      relPermalink: '/deployment-checklist/',
      primaryTopic: 'Go-Live',
      categories: ['GO-LIVE'],
      summary: 'Mentions the cartridge path once, in passing.',
      date: '2026-09-05T00:00:00Z',
    }),
    entry(3, {
      title: 'Job framework basics',
      relPermalink: '/job-framework/',
      primaryTopic: 'Commerce Cloud',
      categories: ['Salesforce Commerce Cloud', 'Technical'],
      summary: 'Chunk-oriented steps and their configuration.',
      date: '2026-05-05T00:00:00Z',
    }),
    entry(4, {
      type: 'pages',
      title: 'Glossary of platform terms',
      relPermalink: '/glossary/',
      primaryTopic: '',
      categories: ['Reference'],
      summary: 'Definitions for the vocabulary used across this site.',
      date: '2026-03-05T00:00:00Z',
    }),
  ];
}

function loadCorpus(entries) {
  return load({
    fetchImpl: () => Promise.resolve({ json: () => Promise.resolve(entries) }),
  });
}

function searchWith(entries) {
  return toolFrom(loadCorpus(entries).registered, SEARCH_TOOL);
}

test('registers searchArticles matching the specified contract', () => {
  const tool = toolFrom(load().registered, SEARCH_TOOL);

  assert.equal(tool.name, SEARCH_TOOL);
  assert.equal(tool.title, 'Search articles');
  assert.equal(
    tool.description,
    'Searches the titles, topics and summaries of every article and reference' +
      ' page published on rhino-inquisitor.com, a technical blog about Salesforce' +
      ' B2C Commerce Cloud. Use it to find what this site has written on a' +
      ' subject, and to get the URL of an article before calling getArticle.' +
      ' Results are ranked by relevance, best match first.',
  );
  assert.equal(tool.annotations.readOnlyHint, true);
  assert.deepEqual(Object.keys(tool.annotations), ['readOnlyHint']);
  assert.equal(typeof tool.execute, 'function');
});

test('searchArticles declares the specified input schema as an object', () => {
  const tool = toolFrom(load().registered, SEARCH_TOOL);

  assert.equal(typeof tool.inputSchema, 'object');
  assert.equal(tool.inputSchema.type, 'object');
  assert.deepEqual(Object.keys(tool.inputSchema.properties).sort(), [
    'limit',
    'query',
    'topic',
  ]);
  assert.deepEqual(Array.from(tool.inputSchema.required), ['query']);
  assert.equal(tool.inputSchema.properties.query.type, 'string');
  assert.equal(tool.inputSchema.properties.topic.type, 'string');
  assert.equal(tool.inputSchema.properties.limit.type, 'integer');
  assert.equal(tool.inputSchema.properties.limit.minimum, 1);
  assert.equal(tool.inputSchema.properties.limit.maximum, 20);
  assert.equal(tool.inputSchema.$schema, undefined);
});

test('excludes an entry unless every token appears somewhere in it', async () => {
  const result = await searchWith(searchCorpus()).execute({
    query: 'cartridge deployment',
  });

  // "Deployment checklist" carries both tokens (title + summary). The
  // cartridge-path article carries only one, so the AND gate drops it.
  assert.equal(result.matchCount, 1);
  assert.deepEqual(column(result, 'url'), ['/deployment-checklist/']);
});

test('ranks by weighted score, not by date', async () => {
  const result = await searchWith(searchCorpus()).execute({ query: 'cartridge' });

  assert.equal(result.matchCount, 2);
  // The older article wins: the token is in its title (+6) against a summary
  // mention (+1) in the newer one. A plain date sort would invert this.
  assert.deepEqual(column(result, 'url'), ['/cartridge-path/', '/deployment-checklist/']);
});

test('a token matching only typeLabel passes the gate but scores nothing', async () => {
  const result = await searchWith(searchCorpus()).execute({ query: 'article' });

  // Every post's typeLabel is "Article"; the one `pages` entry's is "Page".
  assert.equal(result.matchCount, 3);
  // All three score zero, so the date tie-break decides: newest first.
  assert.deepEqual(column(result, 'url'), [
    '/deployment-checklist/',
    '/job-framework/',
    '/cartridge-path/',
  ]);
});

test('searches reference pages as well as articles', async () => {
  const result = await searchWith(searchCorpus()).execute({ query: 'glossary' });

  assert.equal(result.matchCount, 1);
  assert.equal(result.results[0].url, '/glossary/');
});

test('matches case- and diacritic-insensitively', async () => {
  const entries = searchCorpus();
  entries[0].title = 'Cartrìdge path and overrides';
  const result = await searchWith(entries).execute({ query: 'CARTRIDGE PATH' });

  assert.equal(result.results[0].url, '/cartridge-path/');
});

test('counts a multi-category match once, not once per category', async () => {
  const entries = [
    entry(10, {
      title: 'Zebra',
      relPermalink: '/zebra/',
      primaryTopic: 'Architecture',
      categories: ['Technical', 'Technical writing'],
      summary: 'No shared words here.',
      date: '2026-01-01T00:00:00Z',
    }),
    entry(11, {
      title: 'Apple',
      relPermalink: '/apple/',
      primaryTopic: 'Architecture',
      categories: ['Technical'],
      summary: 'No shared words here.',
      date: '2026-02-01T00:00:00Z',
    }),
  ];

  const result = await searchWith(entries).execute({ query: 'technical' });

  // Both score +3 once, so the newer one leads. Scoring per matching category
  // would give Zebra +6 and put it first.
  assert.deepEqual(column(result, 'url'), ['/apple/', '/zebra/']);
});

test('filters by exact normalized primaryTopic, not by category', async () => {
  const tool = searchWith(searchCorpus());

  const matched = await tool.execute({ query: 'the', topic: 'Commerce Cloud' });
  assert.equal(matched.matchCount, 1);
  assert.equal(matched.results[0].url, '/job-framework/');

  // "Salesforce Commerce Cloud" is a category string, not a topic name.
  const byCategory = await tool.execute({
    query: 'the',
    topic: 'Salesforce Commerce Cloud',
  });
  assert.equal(byCategory.matchCount, 0);

  // Exact match after normalizing, so a topic prefix does not match either.
  const prefix = await tool.execute({ query: 'the', topic: 'Commerce' });
  assert.equal(prefix.matchCount, 0);

  const lowercased = await tool.execute({ query: 'the', topic: 'commerce cloud' });
  assert.equal(lowercased.matchCount, 1);
});

test('an unrecognized topic takes the ordinary no-match path', async () => {
  const result = await searchWith(searchCorpus()).execute({
    query: 'cartridge',
    topic: 'Nonexistent',
  });

  assert.equal(result.matchCount, 0);
  assert.equal(result.returned, 0);
  assert.equal(result.results.length, 0);
  assert.equal(result.guidance, NO_MATCH_SENTENCE('cartridge'));
});

test('returns the specified sentence when tokens match nothing', async () => {
  const result = await searchWith(searchCorpus()).execute({ query: 'kubernetes' });

  assert.equal(result.query, 'kubernetes');
  assert.equal(result.matchCount, 0);
  assert.equal(result.returned, 0);
  assert.equal(result.results.length, 0);
  assert.equal(result.guidance, NO_MATCH_SENTENCE('kubernetes'));
});

test('treats a query that tokenizes to nothing as a no-match, without fetching', async () => {
  const { registered, fetchCalls } = load();
  const tool = toolFrom(registered, SEARCH_TOOL);

  for (const query of ['', '   ', undefined]) {
    const result = await tool.execute({ query });
    assert.equal(result.matchCount, 0);
    assert.equal(result.returned, 0);
    assert.equal(result.results.length, 0);
    assert.equal(result.guidance, EMPTY_QUERY_SENTENCE);
  }

  assert.equal(await tool.execute().then((r) => r.guidance), EMPTY_QUERY_SENTENCE);
  assert.equal(fetchCalls.length, 0, 'an unusable query must not hit the network');
});

test('defaults to four results and clamps limit in code', async () => {
  const tool = searchWith(searchCorpus());

  assert.equal((await tool.execute({ query: 'article' })).returned, 3, 'all matches fit');
  assert.equal((await tool.execute({ query: 'article', limit: 1 })).returned, 1);
  assert.equal((await tool.execute({ query: 'article', limit: 0 })).returned, 1);
  assert.equal((await tool.execute({ query: 'article', limit: -5 })).returned, 1);
  assert.equal((await tool.execute({ query: 'article', limit: 'lots' })).returned, 3);
});

test('caps at four matches by default when more are available', async () => {
  const entries = [];
  for (let i = 0; i < 10; i += 1) {
    entries.push(
      entry(i, { title: `Cartridge note ${i}`, relPermalink: `/note-${i}/`, summary: 'Short.' }),
    );
  }

  const result = await searchWith(entries).execute({ query: 'cartridge' });

  assert.equal(result.matchCount, 10);
  assert.equal(result.returned, 4);
  assert.equal(result.results.length, 4);
});

test('trims rows to the output budget while reporting the true match count', async () => {
  const entries = [];
  for (let i = 0; i < 30; i += 1) {
    entries.push(
      entry(i, {
        title: `Cartridge deep dive number ${i}`,
        relPermalink: `/cartridge-deep-dive-number-${i}/`,
        summaryLength: 159,
      }),
    );
  }

  const result = await searchWith(entries).execute({ query: 'cartridge', limit: 20 });

  const serialized = JSON.stringify(result);
  assert.ok(
    serialized.length <= OUTPUT_BUDGET,
    `payload ${serialized.length} > ${OUTPUT_BUDGET}`,
  );
  assert.equal(result.matchCount, 30, 'matchCount reports the untrimmed total');
  assert.ok(result.returned < 20, 'expected the rows to be trimmed');
  assert.ok(result.returned >= 1);
  assert.equal(result.results.length, result.returned);
});

test('uses the shared row shape and envelope', async () => {
  const result = await searchWith(searchCorpus()).execute({ query: 'cartridge' });

  assert.deepEqual(Object.keys(result).sort(), [
    'matchCount',
    'query',
    'results',
    'returned',
  ]);
  assert.equal(result.guidance, undefined, 'a complete answer carries no guidance');
  assert.deepEqual(Object.keys(result.results[0]).sort(), [
    'date',
    'readingTime',
    'summary',
    'title',
    'topic',
    'url',
  ]);
  assert.equal(result.results[0].topic, 'Architecture');
});

test('searchArticles shares the cached index with listRecentArticles', async () => {
  let calls = 0;
  const { registered } = load({
    fetchImpl: () => {
      calls += 1;
      return Promise.resolve({ json: () => Promise.resolve(searchCorpus()) });
    },
  });

  await Promise.all([
    toolFrom(registered, LIST_TOOL).execute({}),
    toolFrom(registered, SEARCH_TOOL).execute({ query: 'cartridge' }),
  ]);

  assert.equal(calls, 1, 'both tools must join one request for /index.json');
});

test('searchArticles degrades to guidance on every failure path', async () => {
  const offline = await toolFrom(
    load({ fetchImpl: () => Promise.reject(new Error('offline')) }).registered,
    SEARCH_TOOL,
  ).execute({ query: 'cartridge' });
  assert.equal(offline.matchCount, 0);
  assert.ok(offline.guidance.includes('rhino-inquisitor.com'));

  const malformed = await toolFrom(
    load({
      fetchImpl: () => Promise.resolve({ json: () => Promise.resolve({ not: 'an array' }) }),
    }).registered,
    SEARCH_TOOL,
  ).execute({ query: 'cartridge' });
  assert.equal(malformed.matchCount, 0);
  assert.ok(malformed.guidance);
});

test('an aborted search resolves with guidance rather than rejecting', async () => {
  const { registered } = load({
    fetchImpl: (url, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }),
  });

  const controller = new AbortController();
  const pending = toolFrom(registered, SEARCH_TOOL).execute(
    { query: 'cartridge' },
    controller.signal,
  );
  controller.abort();

  const result = await pending;
  assert.ok(result.guidance);
  assert.equal(result.returned, 0);
});

test('one failing registration does not prevent the others', () => {
  const registered = [];
  const { sandbox } = load({
    modelContext: {
      registerTool(definition) {
        if (definition.name === 'listRecentArticles') {
          throw new Error('schema rejected');
        }
        registered.push(definition);
      },
    },
  });

  assert.equal(sandbox.__rhinoWebmcpToolsLoaded, true);
  assert.deepEqual(
    registered.map((definition) => definition.name),
    ['searchArticles', 'getSiteOverview'],
    'a rejected tool definition must not take the rest of the surface down',
  );
});

// ---------------------------------------------------------------------------
// getSiteOverview
// ---------------------------------------------------------------------------

const OVERVIEW_DESCRIPTION =
  'Describes rhino-inquisitor.com: what it publishes, how many articles it' +
  ' has, the range of publication dates, the topics it covers with an article' +
  ' count for each, and the URLs of its machine-readable feeds. Use it first' +
  ' to judge whether this site covers a subject, and to get valid topic names' +
  ' for searchArticles.';

/**
 * A corpus that separates every question the overview answers: two topics of
 * different sizes, a page-only topic, a page with no topic at all, and a page
 * dated *after* the newest article so an articles-only date range is
 * distinguishable from a whole-index one.
 */
function overviewCorpus() {
  return [
    entry(1, { primaryTopic: 'Commerce Cloud', date: '2026-09-14T13:55:09Z' }),
    entry(2, { primaryTopic: 'Commerce Cloud', date: '2024-05-01T00:00:00Z' }),
    entry(3, { primaryTopic: 'Architecture', date: '2022-02-24T13:18:00Z' }),
    entry(4, { type: 'pages', primaryTopic: 'Podcasts', date: '2027-01-01T00:00:00Z' }),
    entry(5, { type: 'pages', primaryTopic: '', date: '2021-01-01T00:00:00Z' }),
  ];
}

function overviewWith(entries, options) {
  const { registered } = load({
    ...options,
    fetchImpl: () => Promise.resolve({ json: () => Promise.resolve(entries) }),
  });
  return toolFrom(registered, OVERVIEW_TOOL);
}

/** The live corpus's shape: 161 articles, 14 pages, 13 article topics. */
function liveScaleCorpus() {
  // Commerce Cloud and Architecture are one short each: the newest and oldest
  // articles are appended below and belong to those topics, so the totals
  // still come to the live 81 and 9.
  const topics = [
    ['Commerce Cloud', 80],
    ['Release Notes', 30],
    ['Community', 18],
    ['Architecture', 8],
    ['Certification', 6],
    ['Corporate', 4],
    ['AI', 3],
    ['Go-Live', 3],
    ['Documentation', 2],
    ['ERD', 2],
    ['React', 1],
    ['Salesforce Platform', 1],
    ['Technical', 1],
  ];

  const entries = [];
  let i = 0;
  for (const [primaryTopic, count] of topics) {
    for (let n = 0; n < count; n += 1) {
      i += 1;
      entries.push(entry(i, { primaryTopic, date: '2024-05-01T00:00:00Z' }));
    }
  }
  entries.push(entry(0, { primaryTopic: 'Commerce Cloud', date: '2026-09-14T13:55:09Z' }));
  entries.push(entry(9000, { primaryTopic: 'Architecture', date: '2022-02-24T13:18:00Z' }));
  for (let n = 0; n < 14; n += 1) {
    entries.push(entry(200 + n, { type: 'pages', primaryTopic: 'Podcasts' }));
  }
  return entries;
}

test('registers getSiteOverview matching the specified contract', () => {
  const tool = toolFrom(load().registered, OVERVIEW_TOOL);

  assert.equal(tool.name, OVERVIEW_TOOL);
  assert.equal(tool.title, 'Site overview');
  assert.equal(tool.description, OVERVIEW_DESCRIPTION);
  assert.equal(tool.annotations.readOnlyHint, true);
  assert.deepEqual(Object.keys(tool.annotations), ['readOnlyHint']);
  assert.equal(typeof tool.execute, 'function');
});

// The one open unknown this tool carried: whether Chrome accepts an
// `inputSchema` with no parameters in it. Measured directly on Chrome
// 153.0.8010.47 (`--enable-features=WebMCP`): registration resolves and
// `getTools()` lists the tool with `inputSchema` reflected back as the string
// `{"type":"object","properties":{}}`. The recorded fallback of omitting
// `inputSchema` altogether is therefore not needed.
test('getSiteOverview declares the measured empty-properties input schema', () => {
  const tool = toolFrom(load().registered, OVERVIEW_TOOL);

  assert.equal(typeof tool.inputSchema, 'object');
  assert.equal(tool.inputSchema.type, 'object');
  assert.equal(typeof tool.inputSchema.properties, 'object');
  assert.deepEqual(Object.keys(tool.inputSchema.properties), []);
  assert.equal(tool.inputSchema.$schema, undefined);
  assert.equal(tool.inputSchema.required, undefined);
});

test('describes the site from hugo.toml, delivered as body data attributes', async () => {
  const result = await overviewWith(overviewCorpus()).execute({});

  assert.equal(result.name, SITE_DATA.rhinoSiteName);
  assert.equal(result.description, SITE_DATA.rhinoSiteDescription);
  assert.equal(result.about, SITE_DATA.rhinoSiteAbout);
});

test('caps the about text so prose can never crowd out the measured figures', async () => {
  const tool = overviewWith(liveScaleCorpus(), {
    siteData: { ...SITE_DATA, rhinoSiteAbout: 'y'.repeat(1600) },
  });

  const result = await tool.execute({});
  const serialized = JSON.stringify(result);

  assert.ok(serialized.length <= OUTPUT_BUDGET, `payload ${serialized.length} > ${OUTPUT_BUDGET}`);
  // Shortened, and marked as shortened rather than passed off as the whole
  // statement.
  assert.ok(result.about.length < 1600);
  assert.match(result.about, /…$/);
  // The figures the tool exists to report all survive the cut.
  assert.equal(result.articleCount, 161);
  assert.ok(result.topics.length >= 5, `only ${result.topics.length} topics survived`);
  assert.equal(result.feeds.sitemap, '/sitemap.xml');
});

test('leaves a normal-length about text exactly as written', async () => {
  const result = await overviewWith(liveScaleCorpus()).execute({});

  assert.equal(result.about, SITE_DATA.rhinoSiteAbout);
});

test('omits site details rather than throwing when the data attributes are absent', async () => {
  const tool = overviewWith(overviewCorpus(), { siteData: {} });
  const result = await tool.execute({});

  assert.equal(result.name, undefined);
  assert.equal(result.description, undefined);
  assert.equal(result.about, undefined);
  // The measurable part of the answer still stands.
  assert.equal(result.articleCount, 3);
});

test('counts articles and pages by type, not by typeLabel', async () => {
  const entries = overviewCorpus();
  // A label that disagrees with the machine-stable field must not sway the
  // count: `type` is the criterion.
  entries[0].typeLabel = 'Page';
  entries[3].typeLabel = 'Article';

  const result = await overviewWith(entries).execute({});

  assert.equal(result.articleCount, 3);
  assert.equal(result.pageCount, 2);
});

test('lists every topic with at least one article, largest first', async () => {
  const result = await overviewWith(overviewCorpus()).execute({});

  assert.deepEqual(
    Array.from(result.topics, (topic) => [topic.name, topic.articleCount]),
    [
      ['Commerce Cloud', 2],
      ['Architecture', 1],
    ],
    'page-only topics and the empty topic are both excluded',
  );
});

test('breaks a topic-count tie by name so the list is stable', async () => {
  const entries = [
    entry(1, { primaryTopic: 'React' }),
    entry(2, { primaryTopic: 'AI' }),
    entry(3, { primaryTopic: 'Technical' }),
  ];

  const result = await overviewWith(entries).execute({});

  assert.deepEqual(Array.from(result.topics, (topic) => topic.name), [
    'AI',
    'React',
    'Technical',
  ]);
});

test('topic names are the exact strings searchArticles filters on', async () => {
  const entries = overviewCorpus();
  const { registered } = load({
    fetchImpl: () => Promise.resolve({ json: () => Promise.resolve(entries) }),
  });

  const overview = await toolFrom(registered, OVERVIEW_TOOL).execute({});
  const topic = overview.topics[0].name;
  const search = await toolFrom(registered, SEARCH_TOOL).execute({
    query: 'article',
    topic,
  });

  assert.equal(search.matchCount, 2, `${topic} must be a usable topic filter`);
});

test('reports the newest and oldest article dates, ignoring pages', async () => {
  const result = await overviewWith(overviewCorpus()).execute({});

  // The corpus holds a page dated 2027 and a page dated 2021, both outside
  // the article range. The field names say Article, so the range does too.
  assert.equal(result.newestArticle, '2026-09-14T13:55:09Z');
  assert.equal(result.oldestArticle, '2022-02-24T13:18:00Z');
});

test('omits the date range when no article carries a usable date', async () => {
  // `entry()` substitutes a real date for a falsy one, so the undated case is
  // built by deleting the field rather than by passing "".
  const entries = [entry(1), entry(2, { date: 'not-a-date' })];
  delete entries[0].date;
  const result = await overviewWith(entries).execute({});

  assert.equal(result.newestArticle, undefined);
  assert.equal(result.oldestArticle, undefined);
  assert.equal(result.articleCount, 2);
});

test('announces the five machine-readable feeds', async () => {
  const result = await overviewWith(overviewCorpus()).execute({});

  assert.deepEqual({ ...result.feeds }, {
    llms: '/llms.txt',
    llmsFull: '/llms-full.txt',
    searchIndex: '/index.json',
    rss: '/index.xml',
    sitemap: '/sitemap.xml',
  });
});

test('hands out a fresh feeds object per call, not a shared constant', async () => {
  const tool = overviewWith(overviewCorpus());
  const first = await tool.execute({});
  first.feeds.rss = 'https://example.com/hijacked';
  const second = await tool.execute({});

  assert.equal(second.feeds.rss, '/index.xml');
});

test('keeps the live-scale overview under the per-output character budget', async () => {
  const result = await overviewWith(liveScaleCorpus()).execute({});

  assert.equal(result.articleCount, 161);
  assert.equal(result.pageCount, 14);
  assert.equal(result.topics.length, 13, 'every article topic fits today');
  assert.equal(result.guidance, undefined, 'nothing was trimmed');
  assert.ok(
    JSON.stringify(result).length <= OUTPUT_BUDGET,
    `overview payload ${JSON.stringify(result).length} > ${OUTPUT_BUDGET}`,
  );
});

test('drops the least-covered topics before breaching the budget, and says so', async () => {
  const entries = [];
  for (let i = 0; i < 60; i += 1) {
    entries.push(entry(i, { primaryTopic: `Topic number ${i}` }));
  }
  entries.push(entry(500, { primaryTopic: 'Topic number 0' }));

  const result = await overviewWith(entries).execute({});
  const serialized = JSON.stringify(result);

  assert.ok(serialized.length <= OUTPUT_BUDGET, `payload ${serialized.length} > ${OUTPUT_BUDGET}`);
  assert.ok(result.topics.length < 60, 'the full topic list cannot fit');
  assert.ok(result.topics.length > 0);
  // The biggest topic survives the cut; the cut itself is declared.
  assert.equal(result.topics[0].name, 'Topic number 0');
  assert.equal(
    result.guidance,
    `Only the ${result.topics.length} most-covered of 60 topics fit one` +
      ' response. Fetch /index.json for the full list.',
  );
  // Never truncated, whatever else goes: a half-written name or feed URL is
  // worse than a missing one.
  for (const topic of result.topics) {
    assert.match(topic.name, /^Topic number \d+$/);
  }
  assert.equal(result.feeds.sitemap, '/sitemap.xml');
});

test('omits every unmeasured figure when the index cannot be read', async () => {
  const tool = overviewWith({ not: 'an array' });
  const result = await tool.execute({});

  // A zero count would be a claim about the site; an absent one is the truth
  // about the failure. `matchCount: 0` elsewhere counts results, not articles.
  assert.equal(result.articleCount, undefined);
  assert.equal(result.pageCount, undefined);
  assert.equal(result.topics, undefined);
  assert.equal(result.newestArticle, undefined);
  // What the document itself knows still stands, and the feeds are the way out.
  assert.equal(result.name, SITE_DATA.rhinoSiteName);
  assert.equal(result.feeds.llms, '/llms.txt');
  assert.equal(
    result.guidance,
    'The article index for rhino-inquisitor.com could not be read. Fetch' +
      " /llms.txt for a plain-text list of the site's articles instead.",
  );
});

test('returns guidance rather than rejecting when the index fetch fails', async () => {
  const tool = toolFrom(
    load({ fetchImpl: () => Promise.reject(new Error('offline')) }).registered,
    OVERVIEW_TOOL,
  );

  const result = await tool.execute({});

  assert.equal(
    result.guidance,
    'Could not load the article index for rhino-inquisitor.com. Try again, or' +
      ' fetch /llms.txt for a plain-text list of its articles.',
  );
  assert.equal(result.articleCount, undefined);
  assert.equal(result.feeds.searchIndex, '/index.json');
});

test('an aborted overview resolves with guidance rather than rejecting', async () => {
  const { registered } = load({
    fetchImpl: (url, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('aborted')));
      }),
  });

  const controller = new AbortController();
  const pending = toolFrom(registered, OVERVIEW_TOOL).execute({}, controller.signal);
  controller.abort();

  const result = await pending;
  assert.ok(result.guidance);
  assert.equal(result.articleCount, undefined);
});

test('getSiteOverview joins the index fetch shared by the other tools', async () => {
  const { registered, fetchCalls } = load();

  await Promise.all([
    toolFrom(registered, OVERVIEW_TOOL).execute({}),
    toolFrom(registered, LIST_TOOL).execute({}),
    toolFrom(registered, SEARCH_TOOL).execute({ query: 'article' }),
  ]);

  assert.equal(fetchCalls.length, 1, 'three tools, one request');
});

// ---------------------------------------------------------------------------
// The shape of execute's second argument
// ---------------------------------------------------------------------------

// Measured on Chrome 153.0.8010.47: `execute` is handed an options object
// carrying the AbortSignal on a `signal` property, not the bare AbortSignal
// its documentation describes. Handing that wrapper to fetch rejects the
// request outright ("Failed to convert value to 'AbortSignal'"), so before
// this was unwrapped every tool answered every call with nothing but its own
// could-not-load guidance, however healthy the network was.
test('unwraps the AbortSignal from the options object Chrome passes', async () => {
  const controller = new AbortController();

  for (const name of [OVERVIEW_TOOL, LIST_TOOL, SEARCH_TOOL]) {
    const { registered, fetchCalls } = load();

    await toolFrom(registered, name).execute({ query: 'article' }, {
      signal: controller.signal,
    });

    assert.equal(fetchCalls.length, 1, `${name} made no request`);
    assert.equal(
      fetchCalls[0].options.signal,
      controller.signal,
      `${name} passed the wrapper to fetch instead of the signal`,
    );
  }
});

test('an abort delivered through the options object still yields guidance', async () => {
  const { registered } = load({
    fetchImpl: (url, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('aborted')));
      }),
  });

  const controller = new AbortController();
  const pending = toolFrom(registered, OVERVIEW_TOOL).execute({}, {
    signal: controller.signal,
  });
  controller.abort();

  const result = await pending;
  assert.ok(result.guidance);
});

test('tolerates a second argument that is neither shape', async () => {
  const { registered, fetchCalls } = load();

  const result = await toolFrom(registered, OVERVIEW_TOOL).execute({}, 'nonsense');

  assert.equal(fetchCalls[0].options.signal, undefined);
  assert.equal(result.articleCount, 8);
});

test('passes the overview AbortSignal through to fetch', async () => {
  const { registered, fetchCalls } = load();
  const controller = new AbortController();

  await toolFrom(registered, OVERVIEW_TOOL).execute({}, controller.signal);

  assert.equal(fetchCalls[0].options.signal, controller.signal);
});

test('tolerates being called with no arguments at all', async () => {
  const tool = overviewWith(overviewCorpus());

  const result = await tool.execute();

  assert.equal(result.articleCount, 3);
});
