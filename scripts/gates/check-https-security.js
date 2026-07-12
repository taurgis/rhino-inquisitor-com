import dns from 'node:dns/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import tls from 'node:tls';

import {
  collectHtmlInventory,
  getArtifactProvenance,
  getCanonicalLinks,
  isAliasHelperPage,
  loadSitemapCollection,
  phase8SeoDefaults,
  readHtmlPage,
  writeJsonReport,
} from './seo-gate-helpers.js';
import { canonicalOrigin, toRepoRelative } from '../url/url-validation-helpers.js';
import { scanMixedContent } from './mixed-content-helpers.js';

const canonicalUrl = new URL(canonicalOrigin);

// The live-host checks target the canonical www origin. Until the production
// custom domain is active, deploys run in "project-host rehearsal mode": the
// live GitHub Pages host is the apex project host, so the canonical www origin
// is not yet serving 200s. In that state the live checks are recorded but
// non-fatal. The deploy workflow signals readiness via RHI_HTTPS_LIVE_HOST_READY
// (from the Pages host check); only "true" enables blocking live checks.
const liveHostReady = String(process.env.RHI_HTTPS_LIVE_HOST_READY ?? '').trim().toLowerCase() === 'true';

const defaults = {
  publicRoot: phase8SeoDefaults.publicRoot,
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  reportPath: path.join(path.dirname(phase8SeoDefaults.sampleMatrixPath), 'https-security-report.json'),
  manualEvidencePath: path.join(path.dirname(phase8SeoDefaults.sampleMatrixPath), 'https-security-manual-evidence.json'),
  skipLiveChecks: !liveHostReady,
  requireLiveChecks: false,
  requestTimeoutMs: 10000,
  apexDomain: 'rhino-inquisitor.com',
  githubPagesOwner: 'taurgis',
};

function printHelp() {
  console.log(`Usage: node scripts/gates/check-https-security.js [options]

Options:
  --public-dir <path>         Override the built public directory.
  --sample-matrix <path>      Override validation/sample-matrix.json.
  --report <path>             Override validation/https-security-report.json.
  --manual-evidence <path>    Override validation/https-security-manual-evidence.json.
  --skip-live-checks          Skip DNS, TLS, redirect, and header checks.
  --require-live-checks       Exit non-zero if a live check is manual-required.
  --request-timeout-ms <ms>   Timeout for live checks (default: 10000).
  --apex-domain <domain>      Override the apex domain (default: rhino-inquisitor.com).
  --github-pages-owner <id>   Override the GitHub owner for TXT verification.
  --help                      Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--manual-evidence':
        options.manualEvidencePath = path.resolve(argv[++index]);
        break;
      case '--skip-live-checks':
        options.skipLiveChecks = true;
        break;
      case '--require-live-checks':
        options.requireLiveChecks = true;
        break;
      case '--request-timeout-ms':
        options.requestTimeoutMs = Number.parseInt(argv[++index], 10);
        break;
      case '--apex-domain':
        options.apexDomain = String(argv[++index]).trim();
        break;
      case '--github-pages-owner':
        options.githubPagesOwner = String(argv[++index]).trim();
        break;
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isFinite(options.requestTimeoutMs) || options.requestTimeoutMs <= 0) {
    throw new Error('--request-timeout-ms must be a positive integer.');
  }

  return options;
}

function createCheckResult({
  status,
  blocking = true,
  summary,
  findings = [],
  warnings = [],
  details = {},
  evidenceSource = 'automation',
}) {
  return {
    status,
    blocking,
    summary,
    evidenceSource,
    findings,
    warnings,
    details,
  };
}

function flattenJsonLdNodes(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenJsonLdNodes(entry));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  if (Array.isArray(value['@graph'])) {
    return value['@graph'].flatMap((entry) => flattenJsonLdNodes(entry));
  }

  return [value];
}

function normalizeStatus(results, { requireManual = false } = {}) {
  if (results.some((result) => result.status === 'fail' && result.blocking !== false)) {
    return 'fail';
  }

  if (requireManual && results.some((result) => result.status === 'manual-required' && result.blocking !== false)) {
    return 'manual-required';
  }

  if (results.some((result) => result.status === 'manual-required')) {
    return 'manual-required';
  }

  if (results.some((result) => result.status === 'warning')) {
    return 'warning';
  }

  return 'pass';
}

function summarizeCounts(results) {
  return results.reduce((summary, result) => {
    if (result.status === 'fail') {
      summary.fail += 1;
    } else if (result.status === 'warning') {
      summary.warning += 1;
    } else if (result.status === 'manual-required') {
      summary.manualRequired += 1;
    } else if (result.status === 'pass') {
      summary.pass += 1;
    }
    return summary;
  }, { pass: 0, fail: 0, warning: 0, manualRequired: 0 });
}

function countBlockingFailures(results) {
  return results.reduce((count, result) => {
    if (result.status === 'fail' && result.blocking !== false) {
      return count + 1;
    }
    return count;
  }, 0);
}

function countWarnings(results) {
  return results.reduce((count, result) => count + (result.warnings?.length ?? 0), 0);
}

function readDatasetRc(sampleMatrix) {
  const rc = sampleMatrix?.rc ?? {};
  return {
    tag: rc.tag ?? null,
    commit: rc.commit ?? null,
  };
}

async function loadSampleMatrix(sampleMatrixPath) {
  try {
    const source = await fs.readFile(sampleMatrixPath, 'utf8');
    return JSON.parse(source);
  } catch {
    return null;
  }
}

async function loadManualEvidence(manualEvidencePath) {
  try {
    const source = await fs.readFile(manualEvidencePath, 'utf8');
    return JSON.parse(source);
  } catch {
    return null;
  }
}

async function analyzeCanonicalUrls(publicRoot) {
  const htmlInventory = await collectHtmlInventory(publicRoot);
  const findings = [];
  let checkedPages = 0;

  for (const inventoryEntry of htmlInventory.values()) {
    if (inventoryEntry.route === '/404.html') {
      continue;
    }

    const { $ } = await readHtmlPage(inventoryEntry.filePath);
    if (isAliasHelperPage($)) {
      continue;
    }

    const href = getCanonicalLinks($).first().attr('href')?.trim() ?? '';
    if (!href) {
      continue;
    }

    checkedPages += 1;

    let parsed;
    try {
      parsed = new URL(href);
    } catch {
      continue;
    }

    if (parsed.protocol !== 'https:' || parsed.hostname !== canonicalUrl.hostname) {
      findings.push({
        route: inventoryEntry.route,
        builtArtifactPath: inventoryEntry.repoRelativePath,
        canonicalUrl: href,
        message: `Canonical must use ${canonicalOrigin}.`,
      });
    }
  }

  return createCheckResult({
    status: findings.length > 0 ? 'fail' : 'pass',
    summary: findings.length > 0
      ? `Found ${findings.length} canonical URL entries that are not HTTPS on ${canonicalUrl.hostname}.`
      : `Validated HTTPS canonical URLs on ${checkedPages} built HTML pages.`,
    findings,
    details: {
      checkedPages,
      canonicalOrigin,
    },
  });
}

async function analyzeSitemapUrls(publicRoot) {
  const sitemap = await loadSitemapCollection(publicRoot);
  const findings = [];

  for (const entry of sitemap.urlEntries) {
    let parsed;
    try {
      parsed = new URL(entry.loc);
    } catch {
      continue;
    }

    if (parsed.protocol !== 'https:' || parsed.hostname !== canonicalUrl.hostname) {
      findings.push({
        sitemapPath: toRepoRelative(sitemap.rootPath),
        loc: entry.loc,
        message: `Sitemap loc must use ${canonicalOrigin}.`,
      });
    }
  }

  return createCheckResult({
    status: findings.length > 0 ? 'fail' : 'pass',
    summary: findings.length > 0
      ? `Found ${findings.length} sitemap URLs that are not HTTPS on ${canonicalUrl.hostname}.`
      : `Validated HTTPS sitemap URLs across ${sitemap.urlEntries.length} entries.`,
    findings,
    details: {
      rootPath: toRepoRelative(sitemap.rootPath),
      checkedEntries: sitemap.urlEntries.length,
      unresolvedChildren: sitemap.unresolvedChildren,
    },
  });
}

function inspectStructuredDataValue({ route, builtArtifactPath, scriptIndex, jsonPath, value, findings, warnings }) {
  if (typeof value !== 'string' || (!value.startsWith('http://') && !value.startsWith('https://'))) {
    return;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return;
  }

  if (parsed.protocol !== 'https:') {
    findings.push({ route, builtArtifactPath, scriptIndex, jsonPath, value, message: 'Structured-data URL must use HTTPS.' });
    return;
  }

  if (parsed.hostname !== canonicalUrl.hostname
    && (parsed.hostname === canonicalUrl.host || parsed.hostname.endsWith('.rhino-inquisitor.com') || parsed.hostname.includes('github.io'))) {
    warnings.push({ route, builtArtifactPath, scriptIndex, jsonPath, value, message: `Structured-data URL uses a non-canonical internal host (${parsed.hostname}).` });
  }
}

function walkStructuredData(routeContext, value, currentPath, findings, warnings) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      walkStructuredData(routeContext, entry, `${currentPath}[${index}]`, findings, warnings);
    });
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    const childPath = `${currentPath}.${key}`;

    if ((key === '@id' || key === 'url' || key === 'mainEntityOfPage') && typeof entry === 'string') {
      inspectStructuredDataValue({ ...routeContext, jsonPath: childPath, value: entry, findings, warnings });
      continue;
    }

    if (key === 'mainEntityOfPage' && entry && typeof entry === 'object') {
      if (typeof entry['@id'] === 'string') {
        inspectStructuredDataValue({ ...routeContext, jsonPath: `${childPath}.@id`, value: entry['@id'], findings, warnings });
      }
      if (typeof entry.url === 'string') {
        inspectStructuredDataValue({ ...routeContext, jsonPath: `${childPath}.url`, value: entry.url, findings, warnings });
      }
    }

    walkStructuredData(routeContext, entry, childPath, findings, warnings);
  }
}

async function analyzeStructuredDataUrls(publicRoot) {
  const htmlInventory = await collectHtmlInventory(publicRoot);
  const findings = [];
  const warnings = [];
  let checkedPages = 0;
  let checkedBlocks = 0;

  for (const inventoryEntry of htmlInventory.values()) {
    if (inventoryEntry.route === '/404.html') {
      continue;
    }

    const { $ } = await readHtmlPage(inventoryEntry.filePath);
    if (isAliasHelperPage($)) {
      continue;
    }

    const blocks = $('script[type="application/ld+json"]').toArray();
    if (blocks.length === 0) {
      continue;
    }

    checkedPages += 1;

    for (const [index, element] of blocks.entries()) {
      const rawValue = $(element).html()?.trim() ?? '';
      if (!rawValue) {
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(rawValue);
      } catch {
        continue;
      }

      checkedBlocks += 1;
      for (const node of flattenJsonLdNodes(parsed)) {
        walkStructuredData(
          {
            route: inventoryEntry.route,
            builtArtifactPath: inventoryEntry.repoRelativePath,
            scriptIndex: index,
          },
          node,
          '$',
          findings,
          warnings,
        );
      }
    }
  }

  return createCheckResult({
    status: findings.length > 0 ? 'fail' : warnings.length > 0 ? 'warning' : 'pass',
    summary: findings.length > 0
      ? `Found ${findings.length} blocking structured-data URLs using non-HTTPS values.`
      : warnings.length > 0
        ? `Validated structured-data HTTPS URLs but found ${warnings.length} non-canonical internal-host warnings.`
        : `Validated structured-data HTTPS URLs across ${checkedBlocks} JSON-LD blocks on ${checkedPages} pages.`,
    findings,
    warnings,
    details: {
      checkedPages,
      checkedBlocks,
    },
  });
}

async function analyzeArtifactChecks(publicRoot) {
  const mixedContent = await scanMixedContent(publicRoot);
  const mixedContentResult = createCheckResult({
    status: mixedContent.failures.length > 0 ? 'fail' : 'pass',
    summary: mixedContent.failures.length > 0
      ? `Found ${mixedContent.failures.length} mixed-content references in the built artifact.`
      : `Scanned ${mixedContent.htmlFilesScanned} HTML files and ${mixedContent.cssFilesScanned} CSS files with zero mixed-content references.`,
    findings: mixedContent.failures.map((failure) => ({ message: failure })),
    details: {
      htmlFilesScanned: mixedContent.htmlFilesScanned,
      cssFilesScanned: mixedContent.cssFilesScanned,
    },
  });
  const canonicalHttps = await analyzeCanonicalUrls(publicRoot);
  const sitemapHttps = await analyzeSitemapUrls(publicRoot);
  const structuredDataHttps = await analyzeStructuredDataUrls(publicRoot);

  return {
    mixedContent: mixedContentResult,
    canonicalHttps,
    sitemapHttps,
    structuredDataHttps,
  };
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkHttpsResponse(url, timeoutMs) {
  try {
    const response = await fetchWithTimeout(url, { redirect: 'manual' }, timeoutMs);
    const status = response.status === 200 ? 'pass' : 'fail';
    return createCheckResult({
      status,
      summary: status === 'pass'
        ? `${url} returned HTTP 200.`
        : `${url} returned HTTP ${response.status} instead of 200.`,
      details: {
        url,
        statusCode: response.status,
      },
      evidenceSource: 'live-host',
    });
  } catch (error) {
    return createCheckResult({
      status: 'manual-required',
      summary: `Unable to confirm HTTPS response for ${url}.`,
      details: {
        url,
        error: error instanceof Error ? error.message : String(error),
      },
      evidenceSource: 'live-host',
    });
  }
}

async function checkRedirect(fromUrl, expectedPrefix, timeoutMs, label) {
  try {
    const response = await fetchWithTimeout(fromUrl, { redirect: 'manual' }, timeoutMs);
    const location = response.headers.get('location') ?? '';
    const isRedirect = response.status >= 300 && response.status < 400;
    const status = isRedirect && location.startsWith(expectedPrefix) ? 'pass' : 'fail';

    return createCheckResult({
      status,
      summary: status === 'pass'
        ? `${label} redirects to ${location}.`
        : `${label} returned HTTP ${response.status} with location ${location || '(none)'}.`,
      details: {
        fromUrl,
        expectedPrefix,
        statusCode: response.status,
        location,
      },
      evidenceSource: 'live-host',
    });
  } catch (error) {
    return createCheckResult({
      status: 'manual-required',
      summary: `Unable to confirm redirect behavior for ${label}.`,
      details: {
        fromUrl,
        expectedPrefix,
        error: error instanceof Error ? error.message : String(error),
      },
      evidenceSource: 'live-host',
    });
  }
}

async function checkApexRedirect(apexDomain, timeoutMs) {
  const fromUrl = `http://${apexDomain}/`;

  try {
    const response = await fetchWithTimeout(fromUrl, { redirect: 'manual' }, timeoutMs);
    const location = response.headers.get('location') ?? '';
    const isRedirect = response.status >= 300 && response.status < 400;

    if (isRedirect && location.startsWith(canonicalOrigin)) {
      return createCheckResult({
        status: 'pass',
        summary: `${fromUrl} redirects to ${location}.`,
        details: {
          fromUrl,
          statusCode: response.status,
          location,
        },
        evidenceSource: 'live-host',
      });
    }

    if (isRedirect && location.startsWith(`https://${apexDomain}/`)) {
      return createCheckResult({
        status: 'warning',
        blocking: false,
        summary: `${fromUrl} redirects to ${location} instead of the canonical ${canonicalOrigin}/ host.`,
        warnings: [{
          message: 'Apex HTTP currently consolidates to HTTPS apex. Document whether provider or edge controls will enforce the final apex-to-www redirect.'
        }],
        details: {
          fromUrl,
          statusCode: response.status,
          location,
        },
        evidenceSource: 'live-host',
      });
    }

    return createCheckResult({
      status: 'fail',
      summary: `${fromUrl} returned HTTP ${response.status} with location ${location || '(none)'}.`,
      details: {
        fromUrl,
        statusCode: response.status,
        location,
      },
      evidenceSource: 'live-host',
    });
  } catch (error) {
    return createCheckResult({
      status: 'manual-required',
      blocking: false,
      summary: `Unable to confirm apex HTTP consolidation behavior for ${fromUrl}.`,
      details: {
        fromUrl,
        error: error instanceof Error ? error.message : String(error),
      },
      evidenceSource: 'live-host',
    });
  }
}

async function checkApexHttpsHost(apexDomain, timeoutMs) {
  const apexUrl = `https://${apexDomain}/`;

  try {
    const response = await fetchWithTimeout(apexUrl, { redirect: 'manual' }, timeoutMs);
    const location = response.headers.get('location') ?? '';

    if (response.status >= 300 && response.status < 400 && location.startsWith(canonicalOrigin)) {
      return createCheckResult({
        status: 'pass',
        summary: `${apexUrl} redirects to ${location}.`,
        details: {
          url: apexUrl,
          statusCode: response.status,
          location,
        },
        evidenceSource: 'live-host',
      });
    }

    if (response.status === 200) {
      return createCheckResult({
        status: 'warning',
        blocking: false,
        summary: `${apexUrl} returned HTTP 200 instead of redirecting to the canonical ${canonicalOrigin}/ host.`,
        warnings: [{
          message: 'The HTTPS apex host is live and indexable as a non-canonical host entry point. Accept this as a launch warning or remediate it at the provider or edge layer.'
        }],
        details: {
          url: apexUrl,
          statusCode: response.status,
          location,
        },
        evidenceSource: 'live-host',
      });
    }

    return createCheckResult({
      status: 'warning',
      blocking: false,
      summary: `${apexUrl} returned HTTP ${response.status}${location ? ` with location ${location}` : ''}.`,
      warnings: [{
        message: 'The HTTPS apex host did not demonstrate one-hop canonical-host consolidation.'
      }],
      details: {
        url: apexUrl,
        statusCode: response.status,
        location,
      },
      evidenceSource: 'live-host',
    });
  } catch (error) {
    return createCheckResult({
      status: 'manual-required',
      blocking: false,
      summary: `Unable to confirm HTTPS apex-host behavior for ${apexUrl}.`,
      details: {
        url: apexUrl,
        error: error instanceof Error ? error.message : String(error),
      },
      evidenceSource: 'live-host',
    });
  }
}

async function checkTlsCertificate(hostname, timeoutMs) {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: true,
    }, () => {
      const certificate = socket.getPeerCertificate();
      socket.end();

      if (!certificate || Object.keys(certificate).length === 0) {
        resolve(createCheckResult({
          status: 'fail',
          summary: `No peer certificate was presented for ${hostname}.`,
          details: { hostname },
          evidenceSource: 'live-host',
        }));
        return;
      }

      const validFrom = Date.parse(certificate.valid_from);
      const validTo = Date.parse(certificate.valid_to);
      const now = Date.now();
      const inRange = Number.isFinite(validFrom) && Number.isFinite(validTo) && now >= validFrom && now <= validTo;
      const status = socket.authorized && inRange ? 'pass' : 'fail';

      resolve(createCheckResult({
        status,
        summary: status === 'pass'
          ? `TLS certificate for ${hostname} is trusted and currently valid.`
          : `TLS certificate check failed for ${hostname}.`,
        details: {
          hostname,
          authorized: socket.authorized,
          authorizationError: socket.authorizationError ?? null,
          validFrom: certificate.valid_from,
          validTo: certificate.valid_to,
          subject: certificate.subject ?? null,
          issuer: certificate.issuer ?? null,
          fingerprint256: certificate.fingerprint256 ?? null,
        },
        evidenceSource: 'live-host',
      }));
    });

    socket.setTimeout(timeoutMs, () => {
      socket.destroy();
      resolve(createCheckResult({
        status: 'manual-required',
        summary: `TLS certificate check for ${hostname} timed out.`,
        details: { hostname, timeoutMs },
        evidenceSource: 'live-host',
      }));
    });

    socket.on('error', (error) => {
      resolve(createCheckResult({
        status: 'manual-required',
        summary: `Unable to complete the TLS certificate check for ${hostname}.`,
        details: {
          hostname,
          error: error instanceof Error ? error.message : String(error),
        },
        evidenceSource: 'live-host',
      }));
    });
  });
}

function normalizeCaaRecords(records) {
  return records.flatMap((record) => [
    record.issue ? { tag: 'issue', value: record.issue } : null,
    record.issuewild ? { tag: 'issuewild', value: record.issuewild } : null,
    record.iodef ? { tag: 'iodef', value: record.iodef } : null,
  ]).filter(Boolean);
}

async function checkCaaRecords(domain) {
  try {
    const records = await dns.resolveCaa(domain);
    const normalized = normalizeCaaRecords(records);
    const letsEncryptAllowed = normalized.some((record) => String(record.value).toLowerCase().includes('letsencrypt.org'));

    if (normalized.length === 0) {
      return createCheckResult({
        status: 'pass',
        summary: `No CAA records were published for ${domain}.`,
        details: {
          domain,
          records: [],
        },
        evidenceSource: 'dns',
      });
    }

    return createCheckResult({
      status: letsEncryptAllowed ? 'pass' : 'fail',
      summary: letsEncryptAllowed
        ? `CAA records for ${domain} allow Let's Encrypt issuance.`
        : `CAA records for ${domain} do not include letsencrypt.org.`,
      details: {
        domain,
        records: normalized,
      },
      evidenceSource: 'dns',
    });
  } catch (error) {
    if (error && (error.code === 'ENODATA' || error.code === 'ENOTFOUND')) {
      return createCheckResult({
        status: 'pass',
        summary: `No CAA records were published for ${domain}.`,
        details: {
          domain,
          records: [],
        },
        evidenceSource: 'dns',
      });
    }

    return createCheckResult({
      status: 'manual-required',
      summary: `Unable to inspect CAA records for ${domain}.`,
      details: {
        domain,
        error: error instanceof Error ? error.message : String(error),
      },
      evidenceSource: 'dns',
    });
  }
}

async function checkCustomDomainVerification(domain, owner) {
  const recordName = `_github-pages-challenge-${owner}.${domain}`;

  try {
    const records = await dns.resolveTxt(recordName);
    const flattened = records.map((entry) => entry.join('')).filter(Boolean);
    const status = flattened.length > 0 ? 'pass' : 'fail';

    return createCheckResult({
      status,
      summary: status === 'pass'
        ? `Found the GitHub Pages domain-verification TXT record for ${domain}.`
        : `No GitHub Pages domain-verification TXT record was found for ${domain}.`,
      details: {
        recordName,
        values: flattened,
        note: 'This DNS check verifies the anti-takeover TXT record, not the repository settings UI state.',
      },
      evidenceSource: 'dns',
    });
  } catch (error) {
    if (error && (error.code === 'ENODATA' || error.code === 'ENOTFOUND')) {
      return createCheckResult({
        status: 'manual-required',
        blocking: false,
        summary: `No GitHub Pages domain-verification TXT record was found for ${domain}.`,
        warnings: [{
          message: 'GitHub may satisfy ownership with an existing account-level verification record. Confirm the verified-domain state in Pages settings before sign-off.'
        }],
        details: {
          recordName,
        },
        evidenceSource: 'dns',
      });
    }

    return createCheckResult({
      status: 'manual-required',
      summary: `Unable to inspect the GitHub Pages domain-verification TXT record for ${domain}.`,
      details: {
        recordName,
        error: error instanceof Error ? error.message : String(error),
      },
      evidenceSource: 'dns',
    });
  }
}

async function resolveHostRecords(hostname) {
  const results = [];

  for (const resolver of [dns.resolveCname, dns.resolve4, dns.resolve6]) {
    try {
      const records = await resolver(hostname);
      if (Array.isArray(records) && records.length > 0) {
        results.push(...records);
      }
    } catch (error) {
      if (!(error && (error.code === 'ENODATA' || error.code === 'ENOTFOUND' || error.code === 'ENODOMAIN'))) {
        throw error;
      }
    }
  }

  return results;
}

async function checkWildcardDns(domain) {
  const randomHost = `rhi-phase8-${Date.now()}.${domain}`;

  try {
    const records = await resolveHostRecords(randomHost);
    const hasWildcard = records.length > 0;

    return createCheckResult({
      status: hasWildcard ? 'fail' : 'pass',
      summary: hasWildcard
        ? `Wildcard-style DNS answers were returned for ${randomHost}.`
        : `No wildcard-style DNS answers were returned for ${randomHost}.`,
      details: {
        hostname: randomHost,
        records,
      },
      evidenceSource: 'dns',
    });
  } catch (error) {
    return createCheckResult({
      status: 'manual-required',
      summary: `Unable to verify wildcard DNS behavior for ${domain}.`,
      details: {
        hostname: randomHost,
        error: error instanceof Error ? error.message : String(error),
      },
      evidenceSource: 'dns',
    });
  }
}

async function checkSecurityHeaders(url, timeoutMs) {
  const trackedHeaders = [
    'strict-transport-security',
    'content-security-policy',
    'referrer-policy',
    'x-content-type-options',
    'x-frame-options',
  ];

  try {
    const response = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'manual' }, timeoutMs);
    const observedHeaders = Object.fromEntries(
      trackedHeaders.map((header) => [header, response.headers.get(header)])
    );
    const missingHeaders = trackedHeaders.filter((header) => !observedHeaders[header]);
    const status = missingHeaders.length > 0 ? 'warning' : 'pass';

    return createCheckResult({
      status,
      blocking: false,
      summary: missingHeaders.length > 0
        ? `Observed ${missingHeaders.length} missing origin security headers on ${url}.`
        : `Observed all tracked origin security headers on ${url}.`,
      warnings: missingHeaders.map((header) => ({ header, message: `${header} is not present on the live response.` })),
      details: {
        url,
        statusCode: response.status,
        observedHeaders,
        missingHeaders,
      },
      evidenceSource: 'live-host',
    });
  } catch (error) {
    return createCheckResult({
      status: 'manual-required',
      blocking: false,
      summary: `Unable to capture origin security headers from ${url}.`,
      details: {
        url,
        error: error instanceof Error ? error.message : String(error),
      },
      evidenceSource: 'live-host',
    });
  }
}

// Registered Link relation types ([RFC 8288] Section 2.1.1, [RFC 9727]
// Section 3) that signal machine-readable resources for API/agent discovery.
const agentDiscoveryLinkRelations = ['api-catalog', 'service-desc', 'service-doc', 'describedby'];

function extractLinkRelations(linkHeaderValue) {
  if (!linkHeaderValue) {
    return [];
  }

  const relPattern = /rel\s*=\s*(?:"([^"]*)"|([^\s;,]+))/gi;
  const relations = [];
  let match;

  while ((match = relPattern.exec(linkHeaderValue)) !== null) {
    const value = match[1] ?? match[2] ?? '';
    relations.push(...value.split(/\s+/).filter(Boolean).map((relation) => relation.toLowerCase()));
  }

  return relations;
}

async function checkAgentDiscoveryLinkHeader(url, timeoutMs) {
  try {
    const response = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'manual' }, timeoutMs);
    const linkHeaderValue = response.headers.get('link');
    const relations = extractLinkRelations(linkHeaderValue);
    const matchedRelations = relations.filter((relation) => agentDiscoveryLinkRelations.includes(relation));
    const status = matchedRelations.length > 0 ? 'pass' : 'warning';

    return createCheckResult({
      status,
      blocking: false,
      summary: matchedRelations.length > 0
        ? `Observed an agent-discovery Link header (rel="${matchedRelations.join(', ')}") on ${url}.`
        : `No Link header with a registered api-catalog/service-desc/service-doc/describedby relation was observed on ${url}.`,
      warnings: matchedRelations.length > 0 ? [] : [{
        header: 'link',
        message: 'Add a Link response header (RFC 8288 / RFC 9727 Section 3) via the Cloudflare zone in front of this origin — GitHub Pages cannot set custom response headers.',
      }],
      details: {
        url,
        statusCode: response.status,
        linkHeaderValue,
        relations,
        matchedRelations,
      },
      evidenceSource: 'live-host',
    });
  } catch (error) {
    return createCheckResult({
      status: 'manual-required',
      blocking: false,
      summary: `Unable to capture the Link response header from ${url}.`,
      details: {
        url,
        error: error instanceof Error ? error.message : String(error),
      },
      evidenceSource: 'live-host',
    });
  }
}

function createPagesSettingsCheck(wwwRedirectResult, verificationResult) {
  const inferredPass = wwwRedirectResult.status === 'pass' && verificationResult.status === 'pass';
  return createCheckResult({
    status: inferredPass ? 'pass' : 'manual-required',
    blocking: false,
    summary: inferredPass
      ? 'Observed redirect and DNS evidence consistent with GitHub Pages HTTPS enforcement and domain verification.'
      : 'Repository Pages settings were not inspected automatically; confirm Enforce HTTPS and the verified-domain UI state manually.',
    details: {
      note: 'This gate records observable redirect and DNS evidence. GitHub Pages settings UI state still requires manual confirmation when formal sign-off demands it.',
    },
    evidenceSource: inferredPass ? 'inferred-from-live-evidence' : 'manual',
  });
}

function applyManualEvidence(liveChecks, manualEvidence) {
  if (!manualEvidence?.pagesSettings) {
    return liveChecks;
  }

  const confirmedAt = manualEvidence.confirmedAt ?? null;
  const confirmedBy = manualEvidence.confirmedBy ?? 'owner';
  const note = manualEvidence.pagesSettings.note ?? 'Owner confirmed the repository Pages settings state manually.';

  if (manualEvidence.pagesSettings.verifiedDomain === true) {
    liveChecks.customDomainVerification = createCheckResult({
      status: 'pass',
      blocking: false,
      summary: 'The GitHub Pages custom domain is manually confirmed as verified in Pages settings.',
      details: {
        confirmedAt,
        confirmedBy,
        note,
        settingsState: 'verified',
      },
      evidenceSource: 'manual-owner-confirmation',
    });
  }

  if (manualEvidence.pagesSettings.enforceHttpsEnabled === true) {
    liveChecks.pagesSettings = createCheckResult({
      status: 'pass',
      blocking: false,
      summary: 'The repository Pages settings are manually confirmed, including Enforce HTTPS.',
      details: {
        confirmedAt,
        confirmedBy,
        note,
        enforceHttpsEnabled: true,
        verifiedDomain: manualEvidence.pagesSettings.verifiedDomain === true,
      },
      evidenceSource: 'manual-owner-confirmation',
    });
  }

  return liveChecks;
}

async function analyzeLiveChecks(options) {
  if (options.skipLiveChecks) {
    const skippedCheck = (blocking = true) => createCheckResult({
      status: 'manual-required',
      blocking,
      summary: 'Live checks were skipped for this run.',
      details: { skipped: true },
      evidenceSource: 'manual',
    });

    return {
      httpsResponse: skippedCheck(),
      wwwHttpRedirect: skippedCheck(),
      apexHttpRedirect: skippedCheck(),
      apexHttpsResponse: skippedCheck(false),
      tlsCertificate: skippedCheck(),
      caa: skippedCheck(),
      customDomainVerification: skippedCheck(),
      wildcardDns: skippedCheck(),
      securityHeaders: skippedCheck(false),
      agentDiscoveryLinkHeader: skippedCheck(false),
      pagesSettings: skippedCheck(false),
    };
  }

  const httpsResponse = await checkHttpsResponse(canonicalOrigin, options.requestTimeoutMs);
  const wwwHttpRedirect = await checkRedirect(`http://${canonicalUrl.hostname}/`, canonicalOrigin, options.requestTimeoutMs, `http://${canonicalUrl.hostname}/`);
  const apexHttpRedirect = await checkApexRedirect(options.apexDomain, options.requestTimeoutMs);
  const apexHttpsResponse = await checkApexHttpsHost(options.apexDomain, options.requestTimeoutMs);
  const tlsCertificate = await checkTlsCertificate(canonicalUrl.hostname, options.requestTimeoutMs);
  const caa = await checkCaaRecords(options.apexDomain);
  const customDomainVerification = await checkCustomDomainVerification(options.apexDomain, options.githubPagesOwner);
  const wildcardDns = await checkWildcardDns(options.apexDomain);
  const securityHeaders = await checkSecurityHeaders(canonicalOrigin, options.requestTimeoutMs);
  const agentDiscoveryLinkHeader = await checkAgentDiscoveryLinkHeader(canonicalOrigin, options.requestTimeoutMs);
  const pagesSettings = createPagesSettingsCheck(wwwHttpRedirect, customDomainVerification);

  return {
    httpsResponse,
    wwwHttpRedirect,
    apexHttpRedirect,
    apexHttpsResponse,
    tlsCertificate,
    caa,
    customDomainVerification,
    wildcardDns,
    securityHeaders,
    agentDiscoveryLinkHeader,
    pagesSettings,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const sampleMatrix = await loadSampleMatrix(options.sampleMatrixPath);
  const manualEvidence = await loadManualEvidence(options.manualEvidencePath);
  const artifactChecks = await analyzeArtifactChecks(options.publicRoot);
  const liveChecks = applyManualEvidence(await analyzeLiveChecks(options), manualEvidence);
  const artifactResults = Object.values(artifactChecks);
  const liveResults = Object.values(liveChecks);
  const artifactStatus = normalizeStatus(artifactResults);
  const liveStatus = normalizeStatus(liveResults, { requireManual: options.requireLiveChecks });
  const overallStatus = normalizeStatus([...artifactResults, ...liveResults], { requireManual: options.requireLiveChecks });
  const report = {
    schemaVersion: 1,
    phase: 8,
    ticket: 'RHI-090',
    generatedAt: new Date().toISOString(),
    canonicalOrigin,
    mode: {
      skipLiveChecks: options.skipLiveChecks,
      requireLiveChecks: options.requireLiveChecks,
      requestTimeoutMs: options.requestTimeoutMs,
      liveHostReady,
      rehearsal: options.skipLiveChecks && !liveHostReady,
    },
    manualEvidence: manualEvidence ? {
      path: toRepoRelative(options.manualEvidencePath),
      confirmedAt: manualEvidence.confirmedAt ?? null,
      confirmedBy: manualEvidence.confirmedBy ?? null,
      note: manualEvidence.pagesSettings?.note ?? null,
    } : null,
    artifactProvenance: getArtifactProvenance(readDatasetRc(sampleMatrix)),
    summary: {
      status: overallStatus,
      artifactStatus,
      liveStatus,
      artifactCounts: summarizeCounts(artifactResults),
      liveCounts: summarizeCounts(liveResults),
      blockingFailureCount: countBlockingFailures([...artifactResults, ...liveResults]),
      warningCount: countWarnings([...artifactResults, ...liveResults]),
      manualRequiredCount: [...artifactResults, ...liveResults].filter((result) => result.status === 'manual-required').length,
    },
    artifactChecks,
    liveChecks,
  };

  await writeJsonReport(options.reportPath, report);

  if (artifactStatus === 'fail' || liveResults.some((result) => result.status === 'fail' && result.blocking !== false)) {
    console.error('check:https-security failed');
    process.exitCode = 1;
    return;
  }

  if (options.requireLiveChecks && liveStatus === 'manual-required') {
    console.error('check:https-security requires completed live checks');
    process.exitCode = 1;
    return;
  }

  console.log(`check:https-security ${overallStatus}`);
  console.log(`- report: ${toRepoRelative(options.reportPath)}`);
  console.log(`- artifact status: ${artifactStatus}`);
  console.log(`- live status: ${liveStatus}`);
  if (options.skipLiveChecks && !liveHostReady) {
    console.log(`- live-host checks skipped: project-host rehearsal mode (set RHI_HTTPS_LIVE_HOST_READY=true once ${canonicalUrl.hostname} is the active custom domain).`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`check:https-security failed: ${message}`);
  process.exitCode = 1;
});