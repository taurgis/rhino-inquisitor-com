import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { access, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { load as loadHtml } from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const pa11yCiPath = path.join(
  rootDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'pa11y-ci.cmd' : 'pa11y-ci'
);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
};

const defaults = {
  configPath: path.join(rootDir, 'pa11y-ci.config.js'),
  publicDir: path.join(rootDir, 'public'),
  reportPath: path.join(rootDir, 'migration', 'reports', 'phase-5-accessibility-audit.md')
};

function printHelp() {
  console.log(`Usage: node scripts/seo/check-a11y.js [options]

Options:
  --config <path>       Override pa11y config module (defaults to pa11y-ci.config.js).
  --public-dir <path>   Override built public directory (defaults to public).
  --report <path>       Override markdown audit path.
  --help                Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--config':
        options.configPath = path.resolve(argv[++index]);
        break;
      case '--public-dir':
        options.publicDir = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function getContentType(filePath) {
  return contentTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

function toServedFilePath(requestPathname, publicDir) {
  const decodedPath = decodeURIComponent(requestPathname);
  const normalizedPath = path.posix.normalize(decodedPath);
  const relativePath = normalizedPath === '/'
    ? 'index.html'
    : normalizedPath.endsWith('/')
      ? path.posix.join(normalizedPath.slice(1), 'index.html')
      : normalizedPath.slice(1);

  const resolvedPath = path.resolve(publicDir, relativePath);
  if (!resolvedPath.startsWith(publicDir)) {
    return null;
  }

  return resolvedPath;
}

function toRouteFilePath(route, publicDir) {
  if (route === '/') {
    return path.join(publicDir, 'index.html');
  }

  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  const relativePath = normalizedRoute.endsWith('/')
    ? path.posix.join(normalizedRoute.slice(1), 'index.html')
    : normalizedRoute.slice(1);

  return path.join(publicDir, relativePath);
}

function normalizeText(value) {
  return value.replace(/\s+/gu, ' ').trim().toLowerCase();
}

function readConfiguredUrls() {
  const rawValue = process.env.CHECK_A11Y_URLS;
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall back to delimiter parsing below.
  }

  return rawValue
    .split(/[\n,]/u)
    .map((value) => value.trim())
    .filter(Boolean);
}

async function serveFile(filePath, response) {
  const fileStats = await stat(filePath);
  if (fileStats.isDirectory()) {
    return false;
  }

  const fileBuffer = await readFile(filePath);
  response.writeHead(200, { 'Content-Type': getContentType(filePath) });
  response.end(fileBuffer);
  return true;
}

async function createStaticServer(publicDir) {
  await access(publicDir);

  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const primaryPath = toServedFilePath(requestUrl.pathname, publicDir);

      if (!primaryPath) {
        response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Bad request');
        return;
      }

      if (await serveFile(primaryPath, response)) {
        return;
      }

      if (!path.extname(primaryPath)) {
        const fallbackPath = path.join(primaryPath, 'index.html');
        if (await serveFile(fallbackPath, response)) {
          return;
        }
      }

      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    } catch (error) {
      if (error?.code === 'ENOENT') {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }

      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Internal server error');
    }
  });

  return await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`
      });
    });
  });
}

async function loadAccessibilityConfig(configPath) {
  const loadedModule = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`);
  const config = loadedModule.default ?? loadedModule.pa11yConfig;
  if (!config || !Array.isArray(config.urls) || config.urls.length === 0) {
    throw new Error(`Accessibility config ${path.relative(rootDir, configPath)} must export a default config with at least one URL.`);
  }

  return {
    config,
    approvedNonCriticalAaExceptions: loadedModule.approvedNonCriticalAaExceptions ?? [],
    manualKeyboardRoutes: loadedModule.manualKeyboardRoutes ?? []
  };
}

async function createGeneratedConfig(baseUrl, config, resultsPath, configuredUrls) {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'rhi-a11y-'));
  const generatedConfigPath = path.join(tempDir, '.pa11yci.generated.json');
  const routes = configuredUrls ?? config.urls;
  const routeMap = new Map();
  const urls = routes.map((entry) => {
    const route = typeof entry === 'string' ? entry : entry.url;
    const absoluteUrl = new URL(route, baseUrl).toString();
    routeMap.set(absoluteUrl, route);

    if (typeof entry === 'string') {
      return absoluteUrl;
    }

    return {
      ...entry,
      url: absoluteUrl
    };
  });

  const generatedConfig = {
    ...config,
    urls,
    defaults: {
      ...(config.defaults ?? {}),
      reporters: [
        'cli',
        ['json', { fileName: resultsPath }]
      ]
    }
  };

  await writeFile(generatedConfigPath, `${JSON.stringify(generatedConfig, null, 2)}\n`);

  return {
    generatedConfigPath,
    routeMap,
    cleanup: async () => rm(tempDir, { force: true, recursive: true })
  };
}

async function runPa11y(configFile) {
  await access(pa11yCiPath);

  return await new Promise((resolve, reject) => {
    const child = spawn(pa11yCiPath, ['--config', configFile], {
      cwd: rootDir,
      stdio: 'inherit'
    });

    child.once('error', reject);
    child.once('close', (code) => resolve(code ?? 1));
  });
}

function classifyLevel(issue) {
  const code = issue.code ?? '';
  if (code.includes('WCAG2AAA')) {
    return 'AAA';
  }
  if (code.includes('WCAG2AA')) {
    return 'AA';
  }
  if (code.includes('WCAG2A')) {
    return 'A';
  }
  return 'other';
}

function matchApprovedException(route, issue, exceptions) {
  for (const exception of exceptions) {
    const routeMatches = !Array.isArray(exception.routes)
      || exception.routes.includes('*')
      || exception.routes.includes(route);
    const codeMatches = !exception.code || exception.code === issue.code;
    const selectorMatches = !exception.selector || exception.selector === issue.selector;
    const messageMatches = !exception.messageIncludes
      || (issue.message ?? '').toLowerCase().includes(String(exception.messageIncludes).toLowerCase());

    if (routeMatches && codeMatches && selectorMatches && messageMatches) {
      return exception;
    }
  }

  return null;
}

function formatIssue(issue) {
  const fragments = [];
  if (issue.code) {
    fragments.push(issue.code);
  }
  if (issue.selector) {
    fragments.push(`selector: ${issue.selector}`);
  }
  fragments.push(issue.message ?? 'Unknown accessibility issue');
  return fragments.join(' | ');
}

function evaluateHeadings($) {
  const scope = $('main').first();
  const headingSource = scope.length > 0 ? scope : $.root();
  const headings = headingSource.find('h1, h2, h3, h4, h5, h6').toArray();
  const findings = [];
  let previousLevel = 0;

  for (const heading of headings) {
    const tagName = heading.tagName?.toLowerCase() ?? '';
    const currentLevel = Number.parseInt(tagName.slice(1), 10);
    if (Number.isNaN(currentLevel)) {
      continue;
    }

    if (previousLevel > 0 && currentLevel - previousLevel > 1) {
      findings.push(`Heading level skips from h${previousLevel} to h${currentLevel}.`);
    }

    previousLevel = currentLevel;
  }

  return findings;
}

function evaluateSemantics(html, route) {
  const $ = loadHtml(html);
  const findings = [];
  const h1Elements = $('h1').toArray();
  const pageTitle = $('title').first().text().trim();
  const main = $('main#main-content').first();
  const skipLink = $('a[href="#main-content"]').first();
  const images = $('img').toArray();

  if (h1Elements.length !== 1) {
    findings.push(`Expected exactly one h1, found ${h1Elements.length}.`);
  }

  if (h1Elements.length === 1 && pageTitle) {
    const h1Text = $(h1Elements[0]).text().trim();
    const normalizedH1 = normalizeText(h1Text);
    const normalizedTitle = normalizeText(pageTitle.split('|')[0] ?? pageTitle);

    if (normalizedH1 && normalizedTitle && !normalizedTitle.includes(normalizedH1) && !normalizedH1.includes(normalizedTitle)) {
      findings.push(`The page title "${pageTitle}" does not align with the primary h1 "${h1Text}".`);
    }
  }

  findings.push(...evaluateHeadings($));

  if ($('header').length === 0) {
    findings.push('Missing header landmark.');
  }
  if (main.length === 0) {
    findings.push('Missing main landmark with id="main-content".');
  }
  if ($('nav').length === 0) {
    findings.push('Missing navigation landmark.');
  }
  if ($('footer').length === 0) {
    findings.push('Missing footer landmark.');
  }
  if (skipLink.length === 0) {
    findings.push('Missing skip link targeting #main-content.');
  }

  for (const image of images) {
    const alt = $(image).attr('alt');
    const role = ($(image).attr('role') ?? '').trim().toLowerCase();
    const ariaHidden = ($(image).attr('aria-hidden') ?? '').trim().toLowerCase();
    const src = $(image).attr('src') ?? '(missing src)';
    const isDecorative = alt === '' && (role === 'presentation' || role === 'none' || ariaHidden === 'true');

    if (typeof alt !== 'string') {
      findings.push(`Image ${src} is missing an alt attribute.`);
      continue;
    }

    if (alt.trim() === '' && !isDecorative) {
      findings.push(`Image ${src} uses an empty alt attribute without a decorative presentation hint.`);
    }
  }

  return {
    route,
    findings
  };
}

async function auditSemantics(routes, publicDir) {
  const results = [];

  for (const route of routes) {
    const htmlPath = toRouteFilePath(route, publicDir);
    const html = await readFile(htmlPath, 'utf8');
    results.push(evaluateSemantics(html, route));
  }

  return results;
}

function summarizeRoute(route, pa11yFindings, semanticFindings) {
  const technicalFindings = [];
  const blockingLevelAFindings = [];
  const blockingLevelAaFindings = [];
  const triagedLevelAaFindings = [];
  const supportingFindings = [];

  for (const finding of pa11yFindings) {
    if (!finding.code) {
      technicalFindings.push(finding);
      continue;
    }

    const level = classifyLevel(finding);
    if (level === 'A') {
      blockingLevelAFindings.push(finding);
      continue;
    }

    if (level === 'AA') {
      const approvedException = matchApprovedException(route, finding, approvedNonCriticalAaExceptions);
      if (approvedException) {
        triagedLevelAaFindings.push({
          finding,
          approvedException
        });
      } else {
        blockingLevelAaFindings.push(finding);
      }
      continue;
    }

    supportingFindings.push(finding);
  }

  return {
    route,
    technicalFindings,
    blockingLevelAFindings,
    blockingLevelAaFindings,
    triagedLevelAaFindings,
    supportingFindings,
    semanticFindings,
    passed: technicalFindings.length === 0
      && blockingLevelAFindings.length === 0
      && blockingLevelAaFindings.length === 0
      && semanticFindings.length === 0
  };
}

function buildMarkdownReport({
  configPath,
  reportPath,
  routeSummaries,
  manualKeyboardRoutes,
  publicDir,
  pa11yExitCode
}) {
  const generatedAt = new Date().toISOString();
  const totals = routeSummaries.reduce((accumulator, summary) => {
    accumulator.levelA += summary.blockingLevelAFindings.length;
    accumulator.levelAA += summary.blockingLevelAaFindings.length;
    accumulator.triagedAA += summary.triagedLevelAaFindings.length;
    accumulator.technical += summary.technicalFindings.length;
    accumulator.semantic += summary.semanticFindings.length;
    return accumulator;
  }, {
    levelA: 0,
    levelAA: 0,
    triagedAA: 0,
    technical: 0,
    semantic: 0
  });

  const reportLines = [
    '# Phase 5 Accessibility Audit',
    '',
    '## Scope',
    '',
    `- Generated: ${generatedAt}`,
    `- Command: node scripts/seo/check-a11y.js --config ${path.relative(rootDir, configPath)} --report ${path.relative(rootDir, reportPath)}`,
    `- Config: ${path.relative(rootDir, configPath)}`,
    `- Public build: ${path.relative(rootDir, publicDir) || '.'}`,
    `- Representative routes: ${routeSummaries.map((summary) => `\`${summary.route}\``).join(', ')}`,
    `- Manual keyboard routes (separate evidence): ${manualKeyboardRoutes.map((route) => `\`${route}\``).join(', ') || 'None'}`,
    '- Critical Level AA policy: all Level AA findings on representative templates are blocking unless explicitly listed in `approvedNonCriticalAaExceptions` within `pa11y-ci.config.js`.',
    '- Image alternative-text coverage is additionally enforced at full-site scope by `npm run check:images`; this audit confirms rendered semantics on the representative RHI-056 route set.',
    '',
    '## Summary',
    '',
    '| Metric | Count |',
    '|---|---:|',
    `| Representative routes | ${routeSummaries.length} |`,
    `| Blocking Level A findings | ${totals.levelA} |`,
    `| Blocking Level AA findings | ${totals.levelAA} |`,
    `| Triaged non-critical Level AA findings | ${totals.triagedAA} |`,
    `| Technical scan failures | ${totals.technical} |`,
    `| Semantic template findings | ${totals.semantic} |`,
    `| pa11y raw exit code | ${pa11yExitCode} |`,
    '',
    '## Representative Route Results',
    ''
  ];

  for (const summary of routeSummaries) {
    reportLines.push(`### ${summary.route}`);
    reportLines.push('');
    reportLines.push(`- Result: ${summary.passed ? 'PASS' : 'FAIL'}`);
    reportLines.push(`- Blocking Level A findings: ${summary.blockingLevelAFindings.length}`);
    reportLines.push(`- Blocking Level AA findings: ${summary.blockingLevelAaFindings.length}`);
    reportLines.push(`- Triaged Level AA findings: ${summary.triagedLevelAaFindings.length}`);
    reportLines.push(`- Semantic template findings: ${summary.semanticFindings.length}`);
    reportLines.push(`- Technical failures: ${summary.technicalFindings.length}`);

    if (summary.blockingLevelAFindings.length > 0) {
      reportLines.push('- Blocking Level A details:');
      for (const finding of summary.blockingLevelAFindings) {
        reportLines.push(`  - ${formatIssue(finding)}`);
      }
    }

    if (summary.blockingLevelAaFindings.length > 0) {
      reportLines.push('- Blocking Level AA details:');
      for (const finding of summary.blockingLevelAaFindings) {
        reportLines.push(`  - ${formatIssue(finding)}`);
      }
    }

    if (summary.triagedLevelAaFindings.length > 0) {
      reportLines.push('- Triaged non-critical Level AA details:');
      for (const entry of summary.triagedLevelAaFindings) {
        const owner = entry.approvedException.owner ?? 'unassigned';
        const targetPhase = entry.approvedException.targetPhase ?? 'unspecified';
        const reason = entry.approvedException.reason ?? 'No reason recorded';
        reportLines.push(`  - ${formatIssue(entry.finding)} | owner: ${owner} | target: ${targetPhase} | reason: ${reason}`);
      }
    }

    if (summary.semanticFindings.length > 0) {
      reportLines.push('- Semantic template details:');
      for (const finding of summary.semanticFindings) {
        reportLines.push(`  - ${finding}`);
      }
    }

    if (summary.technicalFindings.length > 0) {
      reportLines.push('- Technical failure details:');
      for (const finding of summary.technicalFindings) {
        reportLines.push(`  - ${formatIssue(finding)}`);
      }
    }

    if (summary.supportingFindings.length > 0) {
      reportLines.push('- Supporting findings outside explicit Level A/AA routing:');
      for (const finding of summary.supportingFindings) {
        reportLines.push(`  - ${formatIssue(finding)}`);
      }
    }

    if (summary.passed) {
      reportLines.push('- Representative route is clean for the RHI-056 automated gate.');
    }

    reportLines.push('');
  }

  reportLines.push('## Triaged Non-Critical Level AA Exceptions');
  reportLines.push('');
  if (approvedNonCriticalAaExceptions.length === 0) {
    reportLines.push('None.');
  } else {
    for (const exception of approvedNonCriticalAaExceptions) {
      reportLines.push(`- Routes: ${(exception.routes ?? ['*']).join(', ')} | code: ${exception.code ?? 'message match'} | owner: ${exception.owner ?? 'unassigned'} | target: ${exception.targetPhase ?? 'unspecified'} | reason: ${exception.reason ?? 'No reason recorded'}`);
    }
  }

  reportLines.push('');
  reportLines.push('## Manual Keyboard Verification');
  reportLines.push('');
  reportLines.push(`Separate manual keyboard evidence for ${manualKeyboardRoutes.map((route) => `\`${route}\``).join(', ') || 'the required routes'} is recorded in the RHI-056 ticket and implementation note.`);
  reportLines.push('');
  reportLines.push('## Exit Decision');
  reportLines.push('');
  if (totals.levelA === 0 && totals.levelAA === 0 && totals.technical === 0 && totals.semantic === 0) {
    reportLines.push('PASS. The representative Phase 5 accessibility gate is clean with zero blocking Level A issues, zero blocking Level AA issues, and zero semantic template failures.');
  } else {
    reportLines.push('FAIL. Blocking accessibility findings remain and must be resolved or explicitly triaged before RHI-056 can close.');
  }

  return `${reportLines.join('\n')}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const publicDir = path.resolve(options.publicDir);
  const configPath = path.resolve(options.configPath);
  const reportPath = path.resolve(options.reportPath);
  const configuredUrls = readConfiguredUrls();
  const { config, approvedNonCriticalAaExceptions: configuredExceptions, manualKeyboardRoutes } = await loadAccessibilityConfig(configPath);

  approvedNonCriticalAaExceptions.splice(0, approvedNonCriticalAaExceptions.length, ...configuredExceptions);

  await access(publicDir);
  await mkdir(path.dirname(reportPath), { recursive: true });

  const tempDir = await mkdtemp(path.join(tmpdir(), 'rhi-a11y-results-'));
  const resultsPath = path.join(tempDir, 'pa11y-results.json');
  const { server, baseUrl } = await createStaticServer(publicDir);
  const { generatedConfigPath, routeMap, cleanup } = await createGeneratedConfig(baseUrl, config, resultsPath, configuredUrls);

  let pa11yExitCode = 1;

  console.log(`Serving ${path.relative(rootDir, publicDir) || '.'}/ at ${baseUrl}`);

  try {
    pa11yExitCode = await runPa11y(generatedConfigPath);
    let rawResults = { results: {} };

    try {
      rawResults = JSON.parse(await readFile(resultsPath, 'utf8'));
    } catch (error) {
      throw new Error(`Failed to read pa11y JSON output: ${error instanceof Error ? error.message : String(error)}`);
    }

    const representativeRoutes = Array.from(routeMap.values());
    const semanticResults = await auditSemantics(representativeRoutes, publicDir);
    const semanticByRoute = new Map(semanticResults.map((entry) => [entry.route, entry.findings]));

    const routeSummaries = Array.from(routeMap.entries()).map(([absoluteUrl, route]) => summarizeRoute(
      route,
      rawResults.results?.[absoluteUrl] ?? [],
      semanticByRoute.get(route) ?? []
    ));

    const markdownReport = buildMarkdownReport({
      configPath,
      reportPath,
      routeSummaries,
      manualKeyboardRoutes,
      publicDir,
      pa11yExitCode
    });

    await writeFile(reportPath, markdownReport);

    const hasBlockingFindings = routeSummaries.some((summary) => !summary.passed);
    const finalExitCode = pa11yExitCode === 1 || hasBlockingFindings ? 1 : 0;

    if (finalExitCode === 0) {
      console.log(`Phase 5 accessibility audit passed. Report written to ${path.relative(rootDir, reportPath)}.`);
    } else {
      console.error(`Phase 5 accessibility audit failed. Report written to ${path.relative(rootDir, reportPath)}.`);
    }

    process.exitCode = finalExitCode;
  } finally {
    server.close();
    await cleanup();
    await rm(tempDir, { force: true, recursive: true });
  }
}

const approvedNonCriticalAaExceptions = [];

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`check:a11y:seo failed: ${message}`);
  process.exitCode = 1;
});