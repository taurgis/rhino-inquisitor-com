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

const TOOL_NAME = 'listRecentArticles';

// Chrome's recommended per-output budget. Breaching it fails invisibly: the
// agent silently drops or truncates. See the map issue's Notes.
const OUTPUT_BUDGET = 1500;

/**
 * Build a stub index entry. `summaryLength` lets a test reproduce the real
 * corpus's summary weight, which is what makes the output budget bite.
 */
function entry(i, { type = 'posts', summaryLength = 133, date } = {}) {
  return {
    title: `Article number ${i}`,
    relPermalink: `/article-${i}/`,
    permalink: `https://rhino-inquisitor.com/article-${i}/`,
    primaryTopic: 'Architecture',
    date: date || `2026-09-${String(28 - i).padStart(2, '0')}T12:00:00Z`,
    readingTime: 10 + i,
    summary: 'x'.repeat(summaryLength),
    type,
    typeLabel: type === 'posts' ? 'Article' : 'Page',
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

function toolFrom(registered) {
  assert.equal(registered.length, 1, 'expected exactly one registered tool');
  return registered[0];
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

test('registers one tool matching the specified contract', () => {
  const { registered, sandbox } = load();
  const tool = toolFrom(registered);

  assert.equal(tool.name, TOOL_NAME);
  assert.equal(tool.title, 'List recent articles');
  assert.match(tool.description, /^Lists the most recently published articles/);
  assert.ok(tool.description.includes('getArticle'));
  assert.ok(tool.description.includes('searchArticles'));
  assert.equal(tool.annotations.readOnlyHint, true);
  assert.deepEqual(Object.keys(tool.annotations), ['readOnlyHint']);
  assert.equal(typeof tool.execute, 'function');
  assert.equal(sandbox.__rhinoWebmcpToolsLoaded, true);
});

test('honours the character budgets for names and descriptions', () => {
  const tool = toolFrom(load().registered);

  assert.ok(tool.name.length <= 30, `tool name ${tool.name.length} > 30`);
  assert.ok(tool.description.length <= 500, `description ${tool.description.length} > 500`);

  for (const [key, schema] of Object.entries(tool.inputSchema.properties)) {
    assert.ok(key.length <= 30, `parameter name ${key} > 30`);
    assert.ok(
      schema.description.length <= 150,
      `parameter ${key} description ${schema.description.length} > 150`,
    );
  }
});

test('passes inputSchema as an object, not a JSON string', () => {
  const tool = toolFrom(load().registered);

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
  run();
  assert.equal(registered.length, 1);
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
  const result = await toolFrom(registered).execute({});

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
  const result = await toolFrom(registered).execute({});

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
  const tool = toolFrom(registered);

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
  const result = await toolFrom(registered).execute({});

  assert.equal(result.returned, 0);
  assert.ok(result.guidance, 'degenerate index returns guidance, not a bare error');
});

test('returns guidance instead of an error when the index fetch fails', async () => {
  const { registered } = load({ fetchImpl: () => Promise.reject(new Error('offline')) });
  const result = await toolFrom(registered).execute({});

  assert.ok(result.guidance, 'expected a guiding sentence');
  assert.ok(result.guidance.includes('rhino-inquisitor.com'));
  assert.equal(result.returned, 0);
});

test('returns guidance when the index holds no articles', async () => {
  const { registered } = load({
    fetchImpl: () => Promise.resolve({ json: () => Promise.resolve(makeIndex({ posts: 0 })) }),
  });
  const result = await toolFrom(registered).execute({});

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
  const result = await toolFrom(registered).execute({});

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
  const result = await toolFrom(registered).execute({ limit: 20 });

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
  const result = await toolFrom(registered).execute({ limit: 2 });

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
  const tool = toolFrom(registered);

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
  const tool = toolFrom(registered);

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
  const tool = toolFrom(registered);

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
  await toolFrom(registered).execute({}, controller.signal);

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
  const pending = toolFrom(registered).execute({}, controller.signal);
  controller.abort();

  const result = await pending;
  assert.ok(result.guidance, 'an aborted call must resolve with guidance, not reject');
});
