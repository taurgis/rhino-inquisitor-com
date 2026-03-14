import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';
import matter from 'gray-matter';

import {
  canonicalOrigin,
  collectPublicHtmlState,
  matchesExpectedMergeTarget,
  normalizeUrlLike,
  readRedirectHtml,
  repoRoot,
  toRepoRelative,
  toPosixPath
} from '../migration/url-validation-helpers.js';

const defaults = {
  inputPath: path.join(repoRoot, 'migration/url-map.csv'),
  contentRoot: path.join(repoRoot, 'src/content'),
  publicRoot: path.join(repoRoot, 'public'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-redirect-security.csv')
};

const siteRelativeAliasPattern = /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)\/$/;

const sensitivePatterns = [
  { name: 'aws-access-key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'github-token', pattern: /ghp_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,}/g },
  { name: 'google-api-key', pattern: /AIza[0-9A-Za-z\-_]{35}/g },
  { name: 'slack-token', pattern: /xox[aboprs]-[A-Za-z0-9-]{10,}/g },
  { name: 'stripe-key', pattern: /sk_(?:live|test)_[A-Za-z0-9]{16,}/g },
  { name: 'bearer-token', pattern: /Bearer\s+[A-Za-z0-9._\-]{20,}/g },
  {
    name: 'credential-literal',
    pattern: /(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password)\s*[:=]\s*['"][^'"\n]{8,}['"]/gi
  },
  {
    name: 'email-address',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
  }
];

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--input') {
      options.inputPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--content-dir') {
      options.contentRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--public-dir') {
      options.publicRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--report') {
      options.reportPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--help') {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/phase-6/check-redirect-security.js [options]

Options:
  --input <path>        Override the reviewed URL map path.
  --content-dir <path>  Override the Hugo content directory.
  --public-dir <path>   Override the built public directory.
  --report <path>       Override the redirect security CSV path.
  --help                Show this help message.
`);
}

function createReportRow(overrides = {}) {
  return {
    scope: overrides.scope ?? '',
    subject: overrides.subject ?? '',
    source_file: overrides.source_file ?? '',
    public_file: overrides.public_file ?? '',
    target_value: overrides.target_value ?? '',
    refresh_target: overrides.refresh_target ?? '',
    canonical_target: overrides.canonical_target ?? '',
    status: overrides.status ?? 'pass',
    actual_outcome: overrides.actual_outcome ?? 'ok',
    notes: overrides.notes ?? ''
  };
}

function loadUrlMapRows(source) {
  return parseCsv(source, {
    columns: true,
    skip_empty_lines: true
  }).sort((left, right) => left.legacy_url.localeCompare(right.legacy_url));
}

async function loadContentAliasEntries(contentRoot) {
  const markdownFiles = (await fg('**/*.md', {
    cwd: contentRoot,
    onlyFiles: true,
    suppressErrors: true
  })).sort();

  const aliasEntries = [];

  for (const relativePath of markdownFiles) {
    const normalizedPath = toPosixPath(relativePath);
    const absolutePath = path.join(contentRoot, relativePath);
    const parsedFile = matter.read(absolutePath);
    const pageUrl = typeof parsedFile.data.url === 'string' ? parsedFile.data.url.trim() : '';
    const aliases = Array.isArray(parsedFile.data.aliases) ? parsedFile.data.aliases : [];

    for (const aliasValue of aliases) {
      aliasEntries.push({
        aliasValue: typeof aliasValue === 'string' ? aliasValue.trim() : '',
        pageUrl,
        sourceFile: normalizedPath
      });
    }
  }

  return aliasEntries.sort((left, right) => {
    const fileDelta = left.sourceFile.localeCompare(right.sourceFile);
    if (fileDelta !== 0) {
      return fileDelta;
    }

    return left.aliasValue.localeCompare(right.aliasValue);
  });
}

function evaluateContentAliases(aliasEntries) {
  const reportRows = [];
  const validEntries = [];
  const failures = [];

  for (const entry of aliasEntries) {
    const reportRow = createReportRow({
      scope: 'content-alias',
      subject: entry.aliasValue,
      source_file: entry.sourceFile,
      target_value: entry.pageUrl
    });

    if (entry.aliasValue.length === 0) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'empty-alias-value';
      reportRow.notes = 'Alias entries must be non-empty strings.';
      failures.push(reportRow);
      reportRows.push(reportRow);
      continue;
    }

    if (/^https?:\/\//i.test(entry.aliasValue)) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'absolute-alias-url';
      reportRow.notes = 'Aliases must be relative source paths, not absolute URLs.';
      failures.push(reportRow);
      reportRows.push(reportRow);
      continue;
    }

    if (!entry.aliasValue.startsWith('/')) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'non-site-relative-alias';
      reportRow.notes = 'Aliases must start with a leading slash.';
      failures.push(reportRow);
      reportRows.push(reportRow);
      continue;
    }

    if (!siteRelativeAliasPattern.test(entry.aliasValue)) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'malformed-alias-path';
      reportRow.notes = 'Aliases must remain lowercase site-relative paths ending with a trailing slash.';
      failures.push(reportRow);
      reportRows.push(reportRow);
      continue;
    }

    reportRow.actual_outcome = 'relative-alias-path';
    reportRow.notes = 'Alias value is a valid site-relative source path.';
    validEntries.push(entry);
    reportRows.push(reportRow);
  }

  return { failures, reportRows, validEntries };
}

function evaluateUrlMapTargets(rows) {
  const reportRows = [];
  const failures = [];
  const mergeRows = [];
  let checkedCount = 0;

  for (const row of rows) {
    const targetValue = String(row.target_url ?? '').trim();
    if (targetValue.length === 0) {
      continue;
    }

    checkedCount += 1;
    if (row.disposition === 'merge' && row.implementation_layer === 'pages-static') {
      mergeRows.push(row);
    }

    if (!/^http:\/\//i.test(targetValue)) {
      continue;
    }

    const reportRow = createReportRow({
      scope: 'url-map',
      subject: row.legacy_url,
      source_file: 'migration/url-map.csv',
      target_value: targetValue,
      status: 'fail',
      actual_outcome: 'http-target-url',
      notes: 'Redirect target URLs must not downgrade to HTTP.'
    });
    failures.push(reportRow);
    reportRows.push(reportRow);
  }

  reportRows.unshift(createReportRow({
    scope: 'url-map',
    subject: 'target-url-scan',
    source_file: 'migration/url-map.csv',
    target_value: String(checkedCount),
    status: failures.length === 0 ? 'pass' : 'fail',
    actual_outcome: failures.length === 0 ? 'https-only-targets' : 'http-targets-found',
    notes: `Checked ${checkedCount} url-map target_url value(s); pages-static merge rows in scope: ${mergeRows.length}.`
  }));

  return { failures, mergeRows, reportRows };
}

function requireSecureDestination(rawValue, fieldName, { allowSiteRelative = false } = {}) {
  if (allowSiteRelative && rawValue.startsWith('/')) {
    return { ok: true, url: normalizeUrlLike(rawValue) };
  }

  if (!/^https?:\/\//i.test(rawValue)) {
    return {
      ok: false,
      reason: `${fieldName}-not-absolute`,
      notes: `${fieldName} must be an absolute URL derived from the production baseURL.`
    };
  }

  const parsed = new URL(rawValue);
  if (parsed.protocol !== 'https:') {
    return {
      ok: false,
      reason: `${fieldName}-not-https`,
      notes: `${fieldName} must use HTTPS.`
    };
  }

  if (parsed.origin !== canonicalOrigin) {
    return {
      ok: false,
      reason: `${fieldName}-cross-domain`,
      notes: `${fieldName} must remain on ${canonicalOrigin}.`
    };
  }

  return { ok: true, url: normalizeUrlLike(rawValue) };
}

async function readCachedRedirectPage(descriptor, cache) {
  let parsed = cache.get(descriptor.relativePath);
  if (!parsed) {
    parsed = await readRedirectHtml(descriptor);
    cache.set(descriptor.relativePath, parsed);
  }

  return parsed;
}

async function validateBuiltAliasPage({
  cache,
  expectedTargetRaw,
  legacyPath,
  matchEntry,
  publicState,
  scope,
  sourceFile,
  subject
}) {
  const legacyInfo = normalizeUrlLike(legacyPath);
  const descriptor = publicState.htmlRoutes.get(legacyInfo.comparablePathOnly);
  const expectedTarget = expectedTargetRaw ? normalizeUrlLike(expectedTargetRaw) : null;
  const routeClass = matchEntry?.url_class ?? matchEntry?.route_class ?? '';
  const allowSiteRelativeTarget = routeClass === 'system' && expectedTarget?.pathname === '/feed/';
  const reportRow = createReportRow({
    scope,
    subject,
    source_file: sourceFile,
    public_file: descriptor?.relativePath ?? '',
    target_value: expectedTargetRaw ?? ''
  });

  if (!descriptor) {
    reportRow.status = 'fail';
    reportRow.actual_outcome = 'missing-built-alias-page';
    reportRow.notes = 'Expected a built alias helper page at the legacy source path.';
    return reportRow;
  }

  const parsedAlias = await readCachedRedirectPage(descriptor, cache);

  if (!parsedAlias?.isRedirectPage || !parsedAlias.metaRefreshTarget) {
    reportRow.status = 'fail';
    reportRow.actual_outcome = 'missing-meta-refresh';
    reportRow.notes = 'Built alias helper page does not expose a meta refresh target.';
    return reportRow;
  }

  if (!parsedAlias.canonicalTarget) {
    reportRow.status = 'fail';
    reportRow.actual_outcome = 'missing-canonical-target';
    reportRow.notes = 'Built alias helper page does not declare a canonical target.';
    return reportRow;
  }

  reportRow.refresh_target = parsedAlias.metaRefreshTarget;
  reportRow.canonical_target = parsedAlias.canonicalTarget;

  const refreshCheck = requireSecureDestination(parsedAlias.metaRefreshTarget, 'meta-refresh', {
    allowSiteRelative: allowSiteRelativeTarget
  });
  if (!refreshCheck.ok) {
    reportRow.status = 'fail';
    reportRow.actual_outcome = refreshCheck.reason;
    reportRow.notes = refreshCheck.notes;
    return reportRow;
  }

  const canonicalCheck = requireSecureDestination(parsedAlias.canonicalTarget, 'canonical-target', {
    allowSiteRelative: allowSiteRelativeTarget
  });
  if (!canonicalCheck.ok) {
    reportRow.status = 'fail';
    reportRow.actual_outcome = canonicalCheck.reason;
    reportRow.notes = canonicalCheck.notes;
    return reportRow;
  }

  const refreshTarget = refreshCheck.url;
  const canonicalTarget = canonicalCheck.url;

  if (refreshTarget.comparable === legacyInfo.comparable) {
    reportRow.status = 'fail';
    reportRow.actual_outcome = 'self-referencing-refresh';
    reportRow.notes = 'Alias helper page refreshes back to the legacy source path.';
    return reportRow;
  }

  if (canonicalTarget.comparable === legacyInfo.comparable) {
    reportRow.status = 'fail';
    reportRow.actual_outcome = 'self-referencing-canonical';
    reportRow.notes = 'Alias helper page canonical points back to the legacy source path.';
    return reportRow;
  }

  if (refreshTarget.absolute !== canonicalTarget.absolute) {
    reportRow.status = 'fail';
    reportRow.actual_outcome = 'refresh-canonical-mismatch';
    reportRow.notes = 'Meta refresh and canonical targets must match exactly.';
    return reportRow;
  }

  if (expectedTargetRaw) {
    const refreshMatches = matchEntry
      ? matchesExpectedMergeTarget(matchEntry, refreshTarget, expectedTarget)
      : refreshTarget.comparable === expectedTarget.comparable;
    const canonicalMatches = matchEntry
      ? matchesExpectedMergeTarget(matchEntry, canonicalTarget, expectedTarget)
      : canonicalTarget.comparable === expectedTarget.comparable;

    if (!refreshMatches || !canonicalMatches) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'unexpected-destination';
      reportRow.notes = `Built alias helper resolves to ${refreshTarget.serverRelative} instead of ${expectedTarget.serverRelative}.`;
      return reportRow;
    }
  }

  reportRow.actual_outcome = 'same-site-https-alias';
  reportRow.notes = `Built alias helper verified at ${descriptor.relativePath}.`;
  return reportRow;
}

async function evaluateBuiltAliasPages({ contentAliasEntries, mergeRows, publicState }) {
  const cache = new Map();
  const reportRows = [];
  const failures = [];

  for (const row of mergeRows) {
    const reportRow = await validateBuiltAliasPage({
      cache,
      expectedTargetRaw: row.target_url,
      legacyPath: row.legacy_url,
      matchEntry: row,
      publicState,
      scope: 'built-alias-page',
      sourceFile: 'migration/url-map.csv',
      subject: row.legacy_url
    });
    if (reportRow.status === 'fail') {
      failures.push(reportRow);
    }
    reportRows.push(reportRow);
  }

  for (const entry of contentAliasEntries) {
    const reportRow = await validateBuiltAliasPage({
      cache,
      expectedTargetRaw: entry.pageUrl || null,
      legacyPath: entry.aliasValue,
      matchEntry: null,
      publicState,
      scope: 'built-content-alias',
      sourceFile: entry.sourceFile,
      subject: entry.aliasValue
    });
    if (reportRow.status === 'fail') {
      failures.push(reportRow);
    }
    reportRows.push(reportRow);
  }

  return { failures, reportRows };
}

async function scanPhase6Artifacts(reportPath) {
  const ignoredRelativeReportPath = toRepoRelative(reportPath);
  const relativeFiles = (await fg([
    'scripts/phase-6/**/*.js',
    'migration/reports/phase-6-*.*'
  ], {
    cwd: repoRoot,
    onlyFiles: true,
    suppressErrors: true
  }))
    .map((relativePath) => toPosixPath(relativePath))
    .filter((relativePath) => relativePath !== ignoredRelativeReportPath)
    .sort();

  const failures = [];

  for (const relativePath of relativeFiles) {
    const absolutePath = path.join(repoRoot, relativePath);
    const source = await fs.readFile(absolutePath, 'utf8');

    for (const entry of sensitivePatterns) {
      const matches = source.match(entry.pattern) ?? [];
      if (matches.length === 0) {
        continue;
      }

      failures.push(createReportRow({
        scope: 'artifact-scan',
        subject: relativePath,
        source_file: relativePath,
        status: 'fail',
        actual_outcome: `matched-${entry.name}`,
        notes: `Matched ${entry.name} pattern ${matches.length} time(s).`
      }));
    }
  }

  const reportRows = [createReportRow({
    scope: 'artifact-scan',
    subject: 'phase-6-artifact-scan',
    target_value: String(relativeFiles.length),
    status: failures.length === 0 ? 'pass' : 'fail',
    actual_outcome: failures.length === 0 ? 'no-credential-or-pii-patterns' : 'credential-or-pii-patterns-found',
    notes: `Scanned ${relativeFiles.length} Phase 6 script and report file(s) for credential-like and PII-like patterns.`
  })];

  reportRows.push(...failures);
  return { failures, reportRows };
}

async function writeReport(reportPath, rows) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    stringifyCsv(rows, {
      header: true,
      columns: [
        'scope',
        'subject',
        'source_file',
        'public_file',
        'target_value',
        'refresh_target',
        'canonical_target',
        'status',
        'actual_outcome',
        'notes'
      ]
    }),
    'utf8'
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const [urlMapSource, contentAliasEntries, publicState] = await Promise.all([
    fs.readFile(options.inputPath, 'utf8'),
    loadContentAliasEntries(options.contentRoot),
    collectPublicHtmlState(options.publicRoot)
  ]);

  const urlMapRows = loadUrlMapRows(urlMapSource);
  const aliasInputResults = evaluateContentAliases(contentAliasEntries);
  const urlMapResults = evaluateUrlMapTargets(urlMapRows);
  const builtAliasResults = await evaluateBuiltAliasPages({
    contentAliasEntries: aliasInputResults.validEntries,
    mergeRows: urlMapResults.mergeRows,
    publicState
  });
  const artifactScanResults = await scanPhase6Artifacts(options.reportPath);

  const reportRows = [
    ...aliasInputResults.reportRows,
    ...urlMapResults.reportRows,
    ...builtAliasResults.reportRows,
    ...artifactScanResults.reportRows
  ];
  const failures = [
    ...aliasInputResults.failures,
    ...urlMapResults.failures,
    ...builtAliasResults.failures,
    ...artifactScanResults.failures
  ];

  await writeReport(options.reportPath, reportRows);

  console.log(`Checked ${aliasInputResults.validEntries.length} valid content alias value(s).`);
  console.log(`Checked ${urlMapResults.mergeRows.length} pages-static merge row(s) from ${toRepoRelative(options.inputPath)}.`);
  console.log(`Redirect security report written to ${toRepoRelative(options.reportPath)}.`);
  console.log(`Pass rows: ${reportRows.length - failures.length}`);
  console.log(`Fail rows: ${failures.length}`);

  if (failures.length > 0) {
    console.error('Redirect security validation failed:');
    for (const failure of failures) {
      console.error(`- [${failure.scope}] ${failure.subject} [${failure.actual_outcome}] ${failure.notes}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Redirect security validation passed.');
}

await main();