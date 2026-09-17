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
function load({ modelContext, fetchImpl, document: documentStub } = {}) {
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
      : { modelContext: modelContext === undefined ? defaultModelContext : modelContext };

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
    ['searchArticles'],
    'a rejected tool definition must not take the rest of the surface down',
  );
});
