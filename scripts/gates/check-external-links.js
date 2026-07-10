import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import pLimit from 'p-limit';
import { EnvHttpProxyAgent, fetch as undiciFetch } from 'undici';

import { DOMAIN_RULES, resolveDomainRule } from './external-link-domains.js';

/**
 * Blocking external-link gate for published content.
 *
 * Born from a 404 that shipped inside a new article: every external link in
 * the article(s) being committed is now verified before the commit lands.
 * The pre-commit hook runs `--staged`, which checks the staged version of
 * each Markdown file under src/content.
 *
 * How a link is judged depends on its domain's entry in
 * scripts/gates/external-link-domains.js:
 *
 *   - status  → plain HTTPS GET; 404/410 or a dead DNS name block the commit.
 *   - render  → the site is a client-side app (help.salesforce.com and the
 *               other Salesforce SPAs) whose HTTP status is the same for
 *               valid and invalid URLs, so the page is rendered in headless
 *               Chromium and its settled text is checked against the
 *               domain's not-found markers.
 *   - skip    → known unverifiable (login walls, bot blockers, placeholder
 *               hosts); recorded but never fetched.
 *
 * A link to a domain with NO entry blocks the commit with instructions to
 * classify the domain — that decision must be made by a human once, not
 * guessed by the gate.
 *
 * Verdicts are deliberately asymmetric: only confident dead signals (404,
 * 410, NXDOMAIN, a rendered not-found page) fail the gate. Everything murky
 * (403 bot walls, 5xx, timeouts, a missing Playwright browser) is a warning,
 * because a pre-commit hook must not block authors on someone else's flaky
 * server. Emergency bypass: SKIP_LINK_CHECK=1 git commit ...
 *
 * Only prose links are checked. Front matter, fenced code blocks, and inline
 * code are masked first — URLs there are examples, not citations. URLs whose
 * host contains `{`/`}` template placeholders are ignored; a host without a
 * single dot (e.g. the literal `http://t`) is reported as a malformed link.
 *
 * `--registry` runs the offline registry-coverage check over ALL content
 * (no network): it is registered in the deploy pipeline's build gate group as
 * the backstop for commits that bypassed the hook (--no-verify, web edits).
 */

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const CONTENT_GLOB_PREFIX = 'src/content/';
const REGISTRY_PATH = 'scripts/gates/external-link-domains.js';
const REQUEST_TIMEOUT_MS = 15000;
const RENDER_TIMEOUT_MS = 30000;
const RENDER_SETTLE_MS = 2000;
// A rendered page whose settled text is shorter than this is judged
// "did not load" rather than "alive" — an unrendered SPA shell, a bot
// challenge, or a blocked request all produce near-empty text, and treating
// that as OK would silently pass dead links (per-domain override:
// rule.minTextChars).
const RENDER_MIN_TEXT_CHARS = 250;
const CONCURRENCY = 8;
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/126.0.0.0 Safari/537.36 rhino-inquisitor-link-gate';

const execFileAsync = promisify(execFile);

// Node's fetch ignores HTTP(S)_PROXY environment variables, which would turn
// every status check into a useless "request failed" warning behind a
// corporate proxy. Route through undici's env-aware agent when one is set.
const proxyEnvConfigured = ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy'].some(
  (name) => process.env[name]
);
const envProxyAgent = proxyEnvConfigured ? new EnvHttpProxyAgent() : null;

function proxyFetch(url, init = {}) {
  return undiciFetch(url, { ...init, dispatcher: envProxyAgent });
}

// --- extraction --------------------------------------------------------------

/** Replace every non-newline character of `match` with spaces so later regex
 * matches keep their original offsets (and therefore line numbers). */
function blankPreservingLines(match) {
  return match.replace(/[^\n]/g, ' ');
}

/** Mask the parts of a Markdown source whose URLs are not prose links:
 * front matter, fenced code blocks, and inline code. */
function maskNonProse(source) {
  return source
    .replace(/^---\r?\n[\s\S]*?\r?\n---(\r?\n|$)/, blankPreservingLines)
    .replace(/```[\s\S]*?(```|$)/g, blankPreservingLines)
    .replace(/~~~[\s\S]*?(~~~|$)/g, blankPreservingLines)
    .replace(/(`{1,2})[^`\n]*?\1/g, blankPreservingLines);
}

const LINK_PATTERNS = [
  // Markdown inline links and images: [text](url), [text](url "title"),
  // with one level of balanced parentheses inside the URL.
  /!?\[[^\]]*\]\(\s*((?:https?:\/\/)(?:[^()\s]|\([^()]*\))+)(?:\s+["'][^)]*)?\s*\)/g,
  // Autolinks: <https://...>
  /<((?:https?:\/\/)[^>\s]+)>/g,
  // Raw HTML anchors that survive in Markdown bodies.
  /href="((?:https?:\/\/)[^"]+)"/g,
  /href='((?:https?:\/\/)[^']+)'/g
];

/**
 * Extract external prose links from Markdown source.
 * Returns [{ url, host, line, skipReasonless flags }]; entries with
 * `placeholder: true` (templated hosts) are dropped, hosts without a dot are
 * flagged `malformed: true`.
 */
function extractExternalLinks(source) {
  const masked = maskNonProse(source);
  const links = [];
  const seenAt = new Set();
  for (const pattern of LINK_PATTERNS) {
    for (const match of masked.matchAll(pattern)) {
      const url = match[1];
      const offset = match.index + match[0].indexOf(url);
      const key = `${offset}:${url}`;
      if (seenAt.has(key)) continue;
      seenAt.add(key);
      const line = masked.slice(0, offset).split('\n').length;
      let host;
      try {
        host = new URL(url).hostname.toLowerCase();
      } catch {
        links.push({ url, host: null, line, malformed: true });
        continue;
      }
      if (/[{}$]/.test(host)) continue; // templated placeholder, e.g. {shortCode}.api...
      if (!host.includes('.') && host !== 'localhost') {
        links.push({ url, host, line, malformed: true });
        continue;
      }
      links.push({ url, host, line });
    }
  }
  return links.sort((a, b) => a.line - b.line);
}

// --- domain resolution -------------------------------------------------------

/** Group links whose domain has no registry entry, keyed by hostname. */
function collectUnknownDomains(links, rules = DOMAIN_RULES) {
  const unknown = new Map();
  for (const link of links) {
    if (link.malformed) continue;
    if (resolveDomainRule(link.host, rules, link.url)) continue;
    if (!unknown.has(link.host)) unknown.set(link.host, []);
    unknown.get(link.host).push(link);
  }
  return unknown;
}

function unknownDomainMessage(unknown) {
  const lines = [
    `external-link gate: ${unknown.size} domain(s) are not registered in ${REGISTRY_PATH}.`,
    '',
    'Every externally linked domain needs a verification strategy before it can',
    'be committed, so the gate knows how to detect a dead link on that site:',
    ''
  ];
  for (const [host, occurrences] of unknown) {
    lines.push(`  ${host}`);
    for (const link of occurrences) {
      lines.push(`    ${link.file ?? '(source)'}:${link.line}  ${link.url}`);
    }
  }
  lines.push(
    '',
    `To fix: add one entry per domain to DOMAIN_RULES in ${REGISTRY_PATH}:`,
    '',
    "  - 'status' — normal server-rendered site; a plain request's status code",
    '    is trustworthy. This is the right choice for most domains.',
    "  - 'render' — client-side app that answers 200 for valid AND invalid",
    '    URLs (like help.salesforce.com); add deadMarkers regexes matching its',
    '    not-found wording so the rendered page can be judged.',
    "  - 'skip'   — not machine-verifiable (login wall, bot blocker,",
    '    placeholder host); give a reason and verify the link by hand.',
    '',
    'Open the link in a browser first to confirm it works, then re-run the',
    'commit. `npm run test:external-links` verifies the registry still covers',
    'every domain linked from src/content.'
  );
  return lines.join('\n');
}

// --- verification ------------------------------------------------------------

/** Judge a plain HTTP response status. Exported for tests. */
function judgeStatus(status, rule = {}) {
  if (Array.isArray(rule.okStatuses) && rule.okStatuses.includes(status)) {
    return { state: 'ok', detail: `HTTP ${status} (allowed for this domain)` };
  }
  if (status === 404 || status === 410) {
    return { state: 'dead', detail: `HTTP ${status}` };
  }
  if (status >= 200 && status < 400) {
    return { state: 'ok', detail: `HTTP ${status}` };
  }
  return {
    state: 'warn',
    detail: `HTTP ${status} — blocked or transient; verify this link manually`
  };
}

async function fetchVerdict(url, rule, fetchImpl) {
  try {
    const response = await fetchImpl(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*' }
    });
    try {
      await response.body?.cancel();
    } catch {
      /* body already consumed or not cancellable */
    }
    return judgeStatus(response.status, rule);
  } catch (error) {
    const code = error?.cause?.code ?? error?.code;
    if (code === 'ENOTFOUND') {
      return { state: 'dead', detail: 'DNS name does not resolve' };
    }
    return {
      state: 'warn',
      detail: `request failed (${code ?? error.message}) — offline or transient; verify manually`
    };
  }
}

async function checkStatusLink(url, rule, { fetchImpl = null } = {}) {
  if (fetchImpl) {
    return fetchVerdict(url, rule, fetchImpl);
  }
  const primary = await fetchVerdict(url, rule, envProxyAgent ? proxyFetch : fetch);
  if (primary.state !== 'warn' || !envProxyAgent) {
    return primary;
  }
  // The configured proxy blocked or failed the request without a definitive
  // answer; some environments allow direct egress the proxy denies, so a
  // direct attempt may still settle the verdict.
  const direct = await fetchVerdict(url, rule, fetch);
  return direct.state === 'warn' ? primary : direct;
}

/** Judge a rendered SPA page against the domain rule. Exported for tests. */
function judgeRenderedPage({ finalUrl, text }, rule) {
  for (const pattern of rule.deadUrlPatterns ?? []) {
    if (pattern.test(finalUrl)) {
      return { state: 'dead', detail: `client app redirected to ${finalUrl}` };
    }
  }
  for (const pattern of rule.deadMarkers ?? []) {
    const match = text.match(pattern);
    if (match) {
      return { state: 'dead', detail: `rendered page says "${match[0]}"` };
    }
  }
  const textLength = text.trim().length;
  const minTextChars = rule.minTextChars ?? RENDER_MIN_TEXT_CHARS;
  if (textLength < minTextChars) {
    return {
      state: 'warn',
      detail:
        `rendered page has almost no text (${textLength} chars) — ` +
        'the client app may not have loaded; verify this link manually'
    };
  }
  return { state: 'ok', detail: 'rendered without a not-found marker' };
}

async function checkRenderedLink(url, rule, renderer) {
  try {
    const page = await renderer.render(url);
    return judgeRenderedPage(page, rule);
  } catch (error) {
    const reason = String(error.message).split('\n')[0];
    return {
      state: 'warn',
      detail: `could not render (${reason}) — verify this link manually`
    };
  }
}

/** Lazily start headless Chromium via Playwright. Throws a descriptive error
 * when the browser is unavailable so render links degrade to warnings. */
async function createPlaywrightRenderer() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error(
      "playwright is not installed (run 'npm ci'); SPA links cannot be deep-verified"
    );
  }
  // Default launch first; fall back to an explicitly provided binary
  // (LINK_GATE_CHROMIUM) or the shared /opt/pw-browsers wrapper that
  // sandboxed agent environments pre-install for pinned Playwright versions.
  const fallbackBinaries = [process.env.LINK_GATE_CHROMIUM, '/opt/pw-browsers/chromium'].filter(
    Boolean
  );
  // LINK_GATE_IGNORE_HTTPS_ERRORS=1 lets the renderer work behind a
  // TLS-inspecting (MITM) proxy whose CA Chromium does not trust.
  const ignoreHttpsErrors = process.env.LINK_GATE_IGNORE_HTTPS_ERRORS === '1';
  const launchOptions = {
    headless: true,
    args: ignoreHttpsErrors ? ['--ignore-certificate-errors'] : []
  };
  let browser;
  try {
    browser = await chromium.launch(launchOptions);
  } catch {
    for (const executablePath of fallbackBinaries) {
      try {
        await fs.access(executablePath);
        browser = await chromium.launch({ ...launchOptions, executablePath });
        break;
      } catch {
        /* try the next candidate */
      }
    }
    if (!browser) {
      throw new Error(
        "no Playwright browser found (run 'npx playwright install chromium'); " +
          'SPA links cannot be deep-verified'
      );
    }
  }
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    ignoreHTTPSErrors: ignoreHttpsErrors
  });
  return {
    async render(url) {
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: RENDER_TIMEOUT_MS });
        await page.waitForLoadState('networkidle', { timeout: RENDER_TIMEOUT_MS }).catch(() => {});
        await page.waitForTimeout(RENDER_SETTLE_MS);
        const text = await page.evaluate(() => document.body?.innerText ?? '');
        return { finalUrl: page.url(), text };
      } finally {
        await page.close().catch(() => {});
      }
    },
    async close() {
      await browser.close().catch(() => {});
    }
  };
}

/**
 * Verify a list of extracted links. Duplicates (same URL) are checked once.
 * `fetchImpl` and `createRenderer` are injectable for tests.
 * Returns { results: [{ ...link, rule, state, detail }] }.
 */
async function verifyLinks(
  links,
  { rules = DOMAIN_RULES, fetchImpl = null, createRenderer = createPlaywrightRenderer } = {}
) {
  const limit = pLimit(CONCURRENCY);
  const verdictByUrl = new Map();
  let rendererPromise = null;
  const getRenderer = () => {
    rendererPromise ??= createRenderer();
    return rendererPromise;
  };

  const tasks = [];
  for (const link of links) {
    if (link.malformed) {
      link.state = 'dead';
      link.detail = 'malformed external URL (no valid hostname)';
      continue;
    }
    const rule = resolveDomainRule(link.host, rules, link.url);
    link.rule = rule;
    if (!rule) {
      link.state = 'unknown-domain';
      link.detail = `no entry for ${link.host} in ${REGISTRY_PATH}`;
      continue;
    }
    if (rule.strategy === 'skip') {
      link.state = 'skipped';
      link.detail = rule.reason ?? 'not machine-verifiable';
      continue;
    }
    if (!verdictByUrl.has(link.url)) {
      verdictByUrl.set(
        link.url,
        limit(async () => {
          if (rule.strategy === 'render') {
            let renderer;
            try {
              renderer = await getRenderer();
            } catch (error) {
              return { state: 'warn', detail: error.message };
            }
            return checkRenderedLink(link.url, rule, renderer);
          }
          return checkStatusLink(link.url, rule, { fetchImpl });
        })
      );
    }
    tasks.push(
      verdictByUrl.get(link.url).then((verdict) => {
        link.state = verdict.state;
        link.detail = verdict.detail;
      })
    );
  }
  await Promise.all(tasks);
  if (rendererPromise) {
    await rendererPromise.then((renderer) => renderer.close()).catch(() => {});
  }
  return { results: links };
}

// --- file gathering ----------------------------------------------------------

function isContentMarkdown(file) {
  return file.startsWith(CONTENT_GLOB_PREFIX) && file.endsWith('.md');
}

async function listStagedContentFiles() {
  // ACMR: without R, a renamed-and-edited article (a slug rename is exactly
  // when links get touched) is invisible to the gate.
  const { stdout } = await execFileAsync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
    { cwd: REPO_ROOT }
  );
  return stdout.split('\n').filter(Boolean).filter(isContentMarkdown);
}

async function readStaged(file) {
  const { stdout } = await execFileAsync('git', ['show', `:${file}`], {
    cwd: REPO_ROOT,
    maxBuffer: 16 * 1024 * 1024
  });
  return stdout;
}

async function listAllContentFiles() {
  const fg = (await import('fast-glob')).default;
  return fg('src/content/**/*.md', { cwd: REPO_ROOT });
}

// --- CLI ---------------------------------------------------------------------

function parseArgs(argv) {
  const parsed = { files: [], staged: false, all: false, registry: false };
  for (const arg of argv) {
    if (arg === '--staged') parsed.staged = true;
    else if (arg === '--all') parsed.all = true;
    else if (arg === '--registry') parsed.registry = true;
    else parsed.files.push(arg);
  }
  return parsed;
}

/**
 * Offline registry-coverage check over ALL content: every linked domain must
 * resolve in the registry. No network use, so it is deterministic enough to
 * run in CI as the backstop for commits that bypassed the pre-commit hook
 * (--no-verify, web-UI edits, machines without hooks installed).
 */
async function checkRegistryCoverage() {
  const files = await listAllContentFiles();
  const links = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(REPO_ROOT, file), 'utf8');
    for (const link of extractExternalLinks(raw)) {
      link.file = file;
      links.push(link);
    }
  }
  const unknown = collectUnknownDomains(links);
  if (unknown.size > 0) {
    console.error(unknownDomainMessage(unknown));
    process.exitCode = 1;
    return;
  }
  const domains = new Set(links.filter((link) => !link.malformed).map((link) => link.host));
  console.log(
    `external-link gate: registry covers all ${domains.size} domain(s) linked across ` +
      `${files.length} content file(s).`
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.registry) {
    await checkRegistryCoverage();
    return;
  }
  let files;
  let read;
  if (args.staged) {
    files = await listStagedContentFiles();
    read = readStaged;
  } else if (args.all) {
    files = await listAllContentFiles();
    read = (file) => fs.readFile(path.join(REPO_ROOT, file), 'utf8');
  } else if (args.files.length > 0) {
    files = args.files.map((file) => path.relative(REPO_ROOT, path.resolve(file)));
    read = (file) => fs.readFile(path.join(REPO_ROOT, file), 'utf8');
  } else {
    console.error(
      'usage: node scripts/gates/check-external-links.js --staged | --all | --registry | <file.md> [...]'
    );
    process.exitCode = 2;
    return;
  }

  if (files.length === 0) {
    console.log('external-link gate: no staged content files; nothing to check.');
    return;
  }

  const links = [];
  for (const file of files) {
    const raw = await read(file);
    for (const link of extractExternalLinks(raw)) {
      link.file = file;
      links.push(link);
    }
  }

  if (links.length === 0) {
    console.log(`external-link gate: no external links in ${files.length} file(s).`);
    return;
  }

  const unknown = collectUnknownDomains(links);
  if (unknown.size > 0) {
    console.error(unknownDomainMessage(unknown));
    process.exitCode = 1;
    return;
  }

  console.log(
    `external-link gate: checking ${links.length} link(s) across ${files.length} file(s)...`
  );
  const { results } = await verifyLinks(links);

  const dead = results.filter((link) => link.state === 'dead');
  const warned = results.filter((link) => link.state === 'warn');
  const skipped = results.filter((link) => link.state === 'skipped');

  for (const link of warned) {
    console.warn(`- warn ${link.file}:${link.line}  ${link.url}\n    ${link.detail}`);
  }
  if (skipped.length > 0) {
    console.log(
      `external-link gate: ${skipped.length} link(s) on skip-listed domains were not fetched.`
    );
  }
  if (dead.length > 0) {
    console.error(`external-link gate: ${dead.length} dead link(s):`);
    for (const link of dead) {
      console.error(`- ${link.file}:${link.line}  ${link.url}\n    ${link.detail}`);
      if (process.env.GITHUB_ACTIONS) {
        console.error(
          `::error file=${link.file},line=${link.line},title=external-link gate::${link.url} — ${link.detail}`
        );
      }
    }
    console.error(
      'Fix or remove the dead link(s). Emergency bypass: SKIP_LINK_CHECK=1 git commit ...'
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `external-link gate: OK (${results.length - warned.length - skipped.length} verified, ` +
      `${skipped.length} skipped, ${warned.length} warning(s)).`
  );
}

export {
  maskNonProse,
  extractExternalLinks,
  collectUnknownDomains,
  unknownDomainMessage,
  judgeStatus,
  judgeRenderedPage,
  checkStatusLink,
  checkRenderedLink,
  createPlaywrightRenderer,
  verifyLinks,
  listStagedContentFiles
};

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
