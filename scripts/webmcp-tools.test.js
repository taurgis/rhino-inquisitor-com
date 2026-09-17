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
    primaryTopicSlug: 'architecture',
    primaryTopicUrl: 'https://rhino-inquisitor.com/category/architecture/',
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
    ['searchArticles', 'getSiteOverview', 'getArticle'],
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
// getArticle
// ---------------------------------------------------------------------------

// Markdown companions are not written by src/layouts/_default/single.markdown.md
// alone: scripts/seo/generate-llm-artifacts.js rewrites every Hugo-emitted
// index.md from the rendered HTML, so the shape this tool parses is that
// script's output — front matter, then `## Key Takeaways` with one `- ` bullet
// per hand-written takeaway (no blank line between), then the body.
//
// Measured over a full production build on 2026-09-17: 180 companions, 161 with
// a three-bullet takeaways block and 19 with none, and 5 of the 180 opening on
// something that is not prose. Every body excerpt below is copied verbatim from
// that build, so the parse rule is tested against the shape it actually meets.
const ARTICLE_TOOL = 'getArticle';

function companion(body, { slug = 'article-0', contentType = 'article' } = {}) {
  return [
    '---',
    "title: 'Article number 0'",
    `canonical_url: 'https://rhino-inquisitor.com/${slug}/'`,
    `markdown_url: 'https://rhino-inquisitor.com/${slug}/index.md'`,
    `content_type: ${contentType}`,
    'site_name: Rhino Inquisitor',
    'categories:',
    '  - Salesforce Commerce Cloud',
    'tags: []',
    '---',
    body,
    '',
  ].join('\n');
}

// public/sfcc-cartridge-path-overrides-explained/index.md. Takeaways and first
// paragraph verbatim; the two further paragraphs that run before its next
// heading are stood in for by the short one, which is the thing the
// first-paragraph-only rule has to stop at.
const POST_OPENING =
  'You add a cartridge to the path, put it first, override a template, deploy,' +
  ' and refresh the storefront. Nothing changes. You start doubting the cartridge' +
  ' assignment, then the Business Manager path, then your own sanity. Ninety' +
  ' minutes later you learn the file was fine — the code version wasn’t.';

const POST_TAKEAWAYS = [
  'Explains cartridge path resolution as one of three separate mechanisms, alongside module.superModule and HookMgr',
  "Shows why only the last cartridge's hook return value reaches the caller, and where the community 'unhooking' trick actually stops",
  'Separates the three things called caching in SFCC, and explains why SCSS imports break at build time rather than at runtime',
];

const POST_BODY = [
  '## Key Takeaways',
  ...POST_TAKEAWAYS.map((item) => `- ${item}`),
  '',
  POST_OPENING,
  '',
  'A second paragraph, before any heading arrives.',
  '',
  '## Three Mechanisms, Not One',
  '',
  'Body text under the first heading.',
].join('\n');

/**
 * Serve `/index.json` from `items` and each path in `companions`; anything else
 * 404s the way the real host does for a URL with no Markdown companion.
 */
function loadArticles({ companions = {}, items, indexFetch } = {}) {
  const requests = [];
  const index = items || makeIndex();

  const handles = load({
    fetchImpl(url, options) {
      requests.push({ url, options });

      if (url === '/index.json') {
        return indexFetch
          ? indexFetch(url, options)
          : Promise.resolve({ ok: true, json: () => Promise.resolve(index) });
      }

      if (Object.prototype.hasOwnProperty.call(companions, url)) {
        const body = companions[url];
        return typeof body === 'function'
          ? body(url, options)
          : Promise.resolve({ ok: true, text: () => Promise.resolve(body) });
      }

      return Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve('<!doctype html><title>404</title>'),
      });
    },
  });

  return { ...handles, requests, index };
}

function articleWith(options) {
  const handles = loadArticles(options);
  return { ...handles, tool: toolFrom(handles.registered, ARTICLE_TOOL) };
}

function onePost(body = POST_BODY) {
  return articleWith({ companions: { '/article-0/index.md': companion(body) } });
}

function markdownRequests(requests) {
  return requests.filter((request) => request.url !== '/index.json');
}

test('registers getArticle matching the specified contract', () => {
  const tool = toolFrom(load().registered, ARTICLE_TOOL);

  assert.equal(tool.name, ARTICLE_TOOL);
  assert.equal(tool.title, 'Get article');
  assert.equal(
    tool.description,
    'Returns a summary of one article on rhino-inquisitor.com: its title,' +
      ' publication date, topic, hand-written key takeaways, opening paragraph,' +
      ' and the URL of its full Markdown text. Use it after searchArticles or' +
      ' listRecentArticles to learn what an article covers. Fetch the returned' +
      ' markdownUrl for the complete article.',
  );
  assert.deepEqual(Object.keys(tool.annotations), ['readOnlyHint']);
  assert.equal(tool.annotations.readOnlyHint, true);
  assert.equal(typeof tool.execute, 'function');
});

test('getArticle declares the specified input schema as an object', () => {
  const tool = toolFrom(load().registered, ARTICLE_TOOL);

  assert.equal(typeof tool.inputSchema, 'object');
  assert.equal(tool.inputSchema.type, 'object');
  assert.deepEqual(Object.keys(tool.inputSchema.properties), ['url']);
  assert.equal(tool.inputSchema.properties.url.type, 'string');
  assert.equal(
    tool.inputSchema.properties.url.description,
    "The article's URL or path as returned by searchArticles or" +
      ' listRecentArticles, for example "/cartridge-path-and-overrides/".',
  );
  assert.deepEqual(Array.from(tool.inputSchema.required), ['url']);
});

test('returns the digest fields sourced from the index, not the companion', async () => {
  const { tool } = onePost();

  const result = await tool.execute({ url: '/article-0/' });

  assert.deepEqual(Object.keys(result), [
    'title',
    'url',
    'markdownUrl',
    'date',
    'topic',
    'categories',
    'readingTime',
    'keyTakeaways',
    'opening',
  ]);
  assert.equal(result.title, 'Article number 0');
  assert.equal(result.url, '/article-0/');
  assert.equal(result.date, '2026-09-28T12:00:00Z');
  assert.equal(result.topic, 'Architecture');
  assert.deepEqual(Array.from(result.categories), [
    'Salesforce Commerce Cloud',
    'Technical',
  ]);
  assert.equal(result.readingTime, 10);
});

// Measured over the same production build: `markdown_url` in the front matter
// equals `permalink` + "index.md" for all 175 index entries, so the tool can
// report the companion's own declared URL without parsing its front matter —
// which matters, because gray-matter folds the long ones onto a second line.
test('reports the markdownUrl the companion declares for itself', async () => {
  const { tool } = onePost();

  const result = await tool.execute({ url: '/article-0/' });
  const declared = /markdown_url: '([^']+)'/.exec(companion(POST_BODY))[1];

  assert.equal(result.markdownUrl, declared);
  assert.equal(result.markdownUrl, 'https://rhino-inquisitor.com/article-0/index.md');
});

test('fetches the companion same-origin rather than at its absolute URL', async () => {
  const { tool, requests } = onePost();

  await tool.execute({ url: '/article-0/' });

  assert.deepEqual(
    markdownRequests(requests).map((request) => request.url),
    ['/article-0/index.md'],
  );
});

test('extracts every takeaway bullet and the first paragraph', async () => {
  const { tool } = onePost();

  const result = await tool.execute({ url: '/article-0/' });

  assert.deepEqual(Array.from(result.keyTakeaways), POST_TAKEAWAYS);
  assert.equal(result.opening, POST_OPENING);
});

// The two other companions the ticket names, verbatim: takeaways block and the
// paragraphs that run before anything else, copied out of the same production
// build. Both have more than one paragraph before their next heading, which is
// what the first-paragraph-only rule has to stop at on real prose rather than
// on a fixture written to be stopped at.
const SAMPLED_COMPANIONS = [
  {
    slug: 'securing-custom-endpoints-in-sfcc',
    takeaways: [
      'Explains why a custom endpoint that works for one developer can fail for a teammate for reasons that have nothing to do with the code',
      'Verifies the exact SFRA CSRF pattern against the official storefront-reference-architecture source, including which checkout routes skip it',
      'Compares controller auth, SCAPI Custom API scopes, and OCAPI client permissions, with a decision table for the SFRA and SCAPI choices',
    ],
    paragraphs: [
      'Deploy a custom SFRA (Storefront Reference Architecture) controller and it is reachable by anyone who knows the URL. Deploy a custom SCAPI (Salesforce Commerce API) endpoint and it may be reachable by nobody at all, including you, holding a valid token. Those are the two ways to add your own endpoint to SFCC (Salesforce B2C Commerce Cloud), and their default security postures are exact opposites. One trusts every caller until you write the check yourself. The other trusts nobody until the configuration is exactly right.',
      'So “how do I secure my custom endpoint” is really two questions wearing one sentence. On the SFRA side you are adding gates that don’t exist yet, and the mistake that costs you is forgetting one. On the SCAPI side the gates are already standing, and the mistake that costs you is a typo in a scope name capped at 25 characters, which doesn’t reject your request so much as make the endpoint stop existing.',
    ],
  },
  {
    slug: 'multi-site-multi-brand-storefronts-on-sfcc',
    takeaways: [
      'Frames a decision rubric for sharing one SFCC storefront codebase across sites versus splitting it by brand divergence',
      "Compares SFRA site preferences and template branching against Storefront Next's Page Designer content and Commerce Apps",
      'Walks through session and basket continuity across locale-specific site domains, including the dw.order.mergeBasket hook',
    ],
    paragraphs: [
      'Two questions landed in two different Slack channels the same week, wearing different clothes. In `#storefront-next`, someone building a multi-brand rollout wanted to know how far Storefront Next would let their homepages and product detail pages (PDPs) diverge before the “one codebase” pitch stopped making sense. In `#pwa-kit`, someone else was chasing a bug where a shopper’s basket vanished the moment they switched from the US site to the Canadian one, and wanted to know why auth and basket state weren’t just… there. Same underlying question, asked from opposite ends: should our sites share a codebase, or not?',
      'Somebody answered the PWA Kit thread well, buried three replies deep: split codebases for brands that genuinely diverge, one multi-site codebase for the ones that don’t, and Commerce Apps for the shared-but-exceptional bits in between. That’s the right answer. It just never made it out of the thread.',
      '## The Part That’s Already Shared, Whatever You Decide',
    ],
  },
];

test('reads the takeaways and opening of each sampled real companion', async () => {
  for (const sample of SAMPLED_COMPANIONS) {
    const body = [
      '## Key Takeaways',
      ...sample.takeaways.map((item) => `- ${item}`),
      '',
      sample.paragraphs.join('\n\n'),
    ].join('\n');

    const { tool } = articleWith({
      companions: { '/article-0/index.md': companion(body, { slug: sample.slug }) },
    });

    const result = await tool.execute({ url: '/article-0/' });

    assert.deepEqual(Array.from(result.keyTakeaways), sample.takeaways, sample.slug);
    assert.equal(result.opening, sample.paragraphs[0], sample.slug);
    assert.ok(
      JSON.stringify(result).length <= OUTPUT_BUDGET,
      `${sample.slug} payload ${JSON.stringify(result).length} > ${OUTPUT_BUDGET}`,
    );
  }
});

// Not three-by-contract: the block mirrors however many items the post's
// `takeaways` front matter carries, which is three for all 161 posts today.
test('takes however many takeaway bullets the companion carries', async () => {
  const { tool } = onePost(
    ['## Key Takeaways', '- One', '- Two', '', 'Opening prose here.'].join('\n'),
  );

  const result = await tool.execute({ url: '/article-0/' });

  assert.deepEqual(Array.from(result.keyTakeaways), ['One', 'Two']);
  assert.equal(result.opening, 'Opening prose here.');
});

test('stops the opening at the first paragraph break, not at the next heading', async () => {
  const { tool } = onePost();

  const result = await tool.execute({ url: '/article-0/' });

  assert.ok(!result.opening.includes('A second paragraph'));
  assert.ok(!result.opening.includes('Three Mechanisms'));
});

// public/headless/index.md and public/ideas/index.md: the 14 `pages`-type
// entries set no `takeaways`, so their companions have no takeaways block at
// all. /headless/ also opens on "Play video", a label the rendered player
// contributes — one of the 4 companions that do.
test('returns an empty takeaways list for a pages companion that has none', async () => {
  const { tool } = articleWith({
    items: [entry(0, { type: 'pages' })],
    companions: {
      '/article-0/index.md': companion(
        'Salesforce allows its clients and partners to guide the internal product' +
          ' teams to prioritise features in their favourite products.',
        { contentType: 'page' },
      ),
    },
  });

  const result = await tool.execute({ url: '/article-0/' });

  assert.deepEqual(Array.from(result.keyTakeaways), []);
  assert.match(result.opening, /^Salesforce allows its clients/);
});

test('skips a media label the rendered page contributed to reach the prose', async () => {
  const { tool } = articleWith({
    items: [entry(0, { type: 'pages' })],
    companions: {
      '/article-0/index.md': companion(
        [
          'Play video',
          '',
          'If your organisation is looking for a way to improve its online presence' +
            ' and connect with more customers, Headless may be a good fit.',
        ].join('\n'),
        { contentType: 'page' },
      ),
    },
  });

  const result = await tool.execute({ url: '/article-0/' });

  assert.match(result.opening, /^If your organisation/);
});

// public/salesforce-b2c-commerce-cloud-erd/index.md opens on an image, then a
// bare link, then a heading, and only then on prose.
test('skips a leading image, bare link and heading to reach the prose', async () => {
  const { tool } = articleWith({
    items: [entry(0, { type: 'pages' })],
    companions: {
      '/article-0/index.md': companion(
        [
          '![Full Salesforce B2C Commerce Cloud entity relationship diagram.](/salesforce-b2c-commerce-cloud-erd/erd.webp)',
          '',
          '[view on Lucidchart](https://lucid.app/lucidchart/f1c8c33a/edit)',
          '',
          '## An unofficial overview of the SFCC data model',
          '',
          'Once upon a time, a budding developer wanted to work with' +
            ' [Salesforce B2C Commerce Cloud](/the-salesforce-b2c-commerce-cloud-environment/).',
        ].join('\n'),
        { contentType: 'page' },
      ),
    },
  });

  const result = await tool.execute({ url: '/article-0/' });

  assert.match(result.opening, /^Once upon a time/);
});

// public/creating-custom-ocapi-endpoints/index.md and three others open on an
// update callout, which turndown renders as a blockquote.
test('strips the blockquote marker from an opening callout', async () => {
  const { tool } = onePost(
    [
      '## Key Takeaways',
      '- One takeaway',
      '',
      '> **Updated July 2026:** When this article first appeared in 2022, there' +
        ' was no official way to add your own endpoint.',
      '',
      '## For the archives',
    ].join('\n'),
  );

  const result = await tool.execute({ url: '/article-0/' });

  assert.equal(
    result.opening,
    '**Updated July 2026:** When this article first appeared in 2022, there was' +
      ' no official way to add your own endpoint.',
  );
});

test('falls back to the first block when nothing near the top reads as prose', async () => {
  const { tool } = onePost(
    ['Play video', '', 'Watch it', '', 'Listen', '', 'Read it', '', 'No sentence here either'].join(
      '\n',
    ),
  );

  const result = await tool.execute({ url: '/article-0/' });

  assert.equal(result.opening, 'Play video');
});

test('collapses a hard-wrapped paragraph onto one line', async () => {
  const { tool } = onePost(
    ['First half of the sentence', 'and the second half of it.', '', 'Next.'].join('\n'),
  );

  const result = await tool.execute({ url: '/article-0/' });

  assert.equal(result.opening, 'First half of the sentence and the second half of it.');
});

// ---------------------------------------------------------------------------
// Resolving the url argument
// ---------------------------------------------------------------------------

test('resolves a full permalink and a bare path to the identical result', async () => {
  const byPath = onePost();
  const byPermalink = onePost();

  const fromPath = await byPath.tool.execute({ url: '/article-0/' });
  const fromPermalink = await byPermalink.tool.execute({
    url: 'https://rhino-inquisitor.com/article-0/',
  });

  assert.deepEqual(JSON.parse(JSON.stringify(fromPermalink)), JSON.parse(JSON.stringify(fromPath)));
  // One companion request each: neither shape is distinguished by fetching and
  // seeing what 404s.
  assert.equal(markdownRequests(byPath.requests).length, 1);
  assert.equal(markdownRequests(byPermalink.requests).length, 1);
});

test('tolerates a missing trailing slash, a query string and a fragment', async () => {
  for (const url of [
    '/article-0',
    'article-0/',
    '/article-0/?utm_source=agent',
    '/article-0/#key-takeaways',
    '/Article-0/',
    '  /article-0/  ',
    '/article-0/index.md',
  ]) {
    const { tool } = onePost();
    const result = await tool.execute({ url });
    assert.equal(result.url, '/article-0/', `${url} did not resolve`);
  }
});

test('does not resolve a same-path URL on another origin', async () => {
  const { tool, requests } = onePost();

  const result = await tool.execute({ url: 'https://example.com/article-0/' });

  assert.match(result.guidance, /^No article at that URL/);
  assert.equal(markdownRequests(requests).length, 0);
});

test('reuses the shared index promise instead of fetching the index again', async () => {
  const { tool, registered, requests } = onePost();

  await tool.execute({ url: '/article-0/' });
  await toolFrom(registered, LIST_TOOL).execute({});
  await tool.execute({ url: '/article-0/' });

  assert.equal(
    requests.filter((request) => request.url === '/index.json').length,
    1,
    'getArticle must join the one shared index fetch',
  );
});

test('returns the no-article sentence for a URL matching nothing, without fetching', async () => {
  const { tool, requests } = onePost();

  const result = await tool.execute({ url: '/not-a-real-article/' });

  assert.equal(
    result.guidance,
    'No article at that URL on rhino-inquisitor.com. Call searchArticles to find' +
      ' one, or listRecentArticles for the newest.',
  );
  assert.equal(result.url, '/not-a-real-article/');
  assert.equal(markdownRequests(requests).length, 0, 'no fetch may be attempted');
});

test('returns the topic-index sentence for a section URL, without fetching', async () => {
  for (const url of ['/posts/', '/pages/', '/archive/', '/posts/page/3/', '/']) {
    const { tool, requests } = onePost();

    const result = await tool.execute({ url });

    assert.equal(
      result.guidance,
      'That URL is a topic index, not an article. Call searchArticles with a topic' +
        ' from getSiteOverview to get articles on it.',
      `${url} did not read as a topic index`,
    );
    assert.equal(markdownRequests(requests).length, 0, `${url} was fetched`);
  }
});

// The sentence names a topic only when the index proves searchArticles will
// accept it: `primaryTopic` is what that tool filters on, and it differs from
// the category display name for half the corpus.
test('names the topic from the index for a term URL', async () => {
  const { tool, requests } = onePost();

  const result = await tool.execute({ url: '/category/architecture/' });

  assert.equal(
    result.guidance,
    'That URL is a topic index, not an article. Call searchArticles with topic' +
      ' "Architecture" to get articles on it.',
  );
  assert.equal(markdownRequests(requests).length, 0);
});

test('falls back to getSiteOverview for a term with no searchable topic name', async () => {
  const { tool } = onePost();

  const result = await tool.execute({ url: '/category/podcasts/' });

  assert.match(result.guidance, /with a topic from getSiteOverview/);
});

test('asks for a url when called without one, without fetching anything', async () => {
  for (const args of [undefined, {}, { url: '' }, { url: '   ' }, { url: 42 }]) {
    const { tool, requests } = onePost();

    const result = await tool.execute(args);

    assert.equal(
      result.guidance,
      'Call getArticle with the url of an article on rhino-inquisitor.com, as' +
        ' returned by searchArticles or listRecentArticles.',
    );
    assert.equal(requests.length, 0, 'an empty url needs no network at all');
  }
});

test('echoes back a long url argument capped rather than whole', async () => {
  const { tool } = onePost();

  const result = await tool.execute({ url: `/${'x'.repeat(4000)}/` });

  assert.ok(result.url.length <= 200);
  assert.ok(result.url.endsWith('…'));
});

// ---------------------------------------------------------------------------
// The output budget
// ---------------------------------------------------------------------------

test('keeps a typical article under the output budget untrimmed', async () => {
  const { tool } = onePost();

  const result = await tool.execute({ url: '/article-0/' });

  assert.ok(JSON.stringify(result).length <= OUTPUT_BUDGET);
  assert.equal(result.opening, POST_OPENING);
  assert.ok(!result.opening.endsWith('…'));
});

test('trims the opening to fit the budget, marking the cut', async () => {
  const { tool } = onePost(
    [
      '## Key Takeaways',
      ...POST_TAKEAWAYS.map((item) => `- ${item}`),
      '',
      `${'A sentence about cartridges. '.repeat(400)}`,
      '',
      '## A heading',
    ].join('\n'),
  );

  const result = await tool.execute({ url: '/article-0/' });

  const serialized = JSON.stringify(result);
  assert.ok(
    serialized.length <= OUTPUT_BUDGET,
    `serialized ${serialized.length} > ${OUTPUT_BUDGET}`,
  );
  assert.ok(result.opening.endsWith('…'), 'a trimmed opening must say so');
  assert.deepEqual(Array.from(result.keyTakeaways), POST_TAKEAWAYS);
});

test('gives up the opening entirely rather than breaching the budget', async () => {
  const { tool } = onePost(
    [
      '## Key Takeaways',
      `- ${'t'.repeat(1400)}`,
      '',
      'An opening that has no room left to live in.',
    ].join('\n'),
  );

  const result = await tool.execute({ url: '/article-0/' });

  assert.equal(result.opening, undefined);
  assert.match(result.guidance, /^The opening paragraph did not fit/);
});

// ---------------------------------------------------------------------------
// Failure paths
// ---------------------------------------------------------------------------

test('passes the execute AbortSignal to the companion fetch as an option', async () => {
  const { tool, requests } = onePost();
  const controller = new AbortController();

  await tool.execute({ url: '/article-0/' }, { signal: controller.signal });

  const [companionRequest] = markdownRequests(requests);
  assert.equal(companionRequest.options.signal, controller.signal);
});

test('an abort mid-companion-fetch resolves with guidance and leaves no hung state', async () => {
  const unhandled = [];
  const record = (reason) => unhandled.push(reason);
  process.on('unhandledRejection', record);

  let attempt = 0;
  const { tool } = articleWith({
    companions: {
      '/article-0/index.md': (url, options) => {
        attempt += 1;
        if (attempt > 1) {
          return Promise.resolve({ ok: true, text: () => Promise.resolve(companion(POST_BODY)) });
        }
        // Rejecting an already-aborted signal outright, as fetch does: by the
        // time getArticle reaches the companion the index round trip is over,
        // so an abort called on the tool has usually already fired.
        return new Promise((resolve, reject) => {
          const fail = () => reject(new DOMException('Aborted', 'AbortError'));

          if (options.signal.aborted) {
            fail();
            return;
          }

          options.signal.addEventListener('abort', fail);
        });
      },
    },
  });

  const controller = new AbortController();
  const pending = tool.execute({ url: '/article-0/' }, { signal: controller.signal });
  controller.abort();

  const aborted = await pending;
  assert.match(aborted.guidance, /^Could not read the Markdown/);

  // The next call must still work: the index promise is shared, so an aborted
  // companion fetch that poisoned it would take every other tool down with it.
  const recovered = await tool.execute({ url: '/article-0/' });
  assert.equal(recovered.opening, POST_OPENING);

  await new Promise((resolve) => setImmediate(resolve));
  process.off('unhandledRejection', record);
  assert.deepEqual(unhandled, []);
});

test('reports what the index knows when the companion fetch fails', async () => {
  const { tool } = articleWith({
    companions: {
      '/article-0/index.md': () => Promise.reject(new Error('offline')),
    },
  });

  const result = await tool.execute({ url: '/article-0/' });

  assert.equal(
    result.guidance,
    'Could not read the Markdown for that article on rhino-inquisitor.com. Fetch' +
      ' https://rhino-inquisitor.com/article-0/index.md directly, or try again.',
  );
  // Everything the index already supplied still stands; only the two fields
  // that needed the companion are absent.
  assert.equal(result.title, 'Article number 0');
  assert.equal(result.markdownUrl, 'https://rhino-inquisitor.com/article-0/index.md');
  assert.equal(result.keyTakeaways, undefined);
  assert.equal(result.opening, undefined);
});

test('treats a non-OK companion response as a failure, not as content', async () => {
  const { tool } = articleWith({ companions: {} });

  const result = await tool.execute({ url: '/article-0/' });

  assert.match(result.guidance, /^Could not read the Markdown/);
  assert.equal(result.opening, undefined);
});

test('treats a response that is not a Markdown companion as a failure', async () => {
  const { tool } = articleWith({
    companions: { '/article-0/index.md': '<!doctype html><title>Article</title>' },
  });

  const result = await tool.execute({ url: '/article-0/' });

  assert.match(result.guidance, /^Could not read the Markdown/);
});

test('treats a companion with front matter but no body as a failure', async () => {
  const { tool } = articleWith({ companions: { '/article-0/index.md': companion('') } });

  const result = await tool.execute({ url: '/article-0/' });

  assert.match(result.guidance, /^Could not read the Markdown/);
});

test('returns guidance rather than rejecting when the index fetch fails', async () => {
  const { tool } = articleWith({
    indexFetch: () => Promise.reject(new Error('offline')),
  });

  const result = await tool.execute({ url: '/article-0/' });

  assert.equal(
    result.guidance,
    'Could not load the article index for rhino-inquisitor.com. Try again, or' +
      ' fetch /llms.txt for a plain-text list of its articles.',
  );
  assert.equal(result.url, '/article-0/');
});

test('returns guidance when the index is malformed', async () => {
  const { tool } = articleWith({
    indexFetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ nope: true }) }),
  });

  const result = await tool.execute({ url: '/article-0/' });

  assert.match(result.guidance, /^The article index for rhino-inquisitor.com could not be read/);
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
