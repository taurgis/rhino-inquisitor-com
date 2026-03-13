import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { load as loadHtml } from 'cheerio';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';

import {
  canonicalOrigin,
  extractRedirectDetails,
  loadManifest,
  repoRoot,
  toPosixPath,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const canonicalHost = new URL(canonicalOrigin).host.toLowerCase();
const supportedInternalHosts = new Set([
  canonicalHost,
  'rhino-inquisitor.com',
  'therhinotimes.com',
  'www.therhinotimes.com',
  'taurgis.github.io'
]);
const validModes = new Set(['full', 'subset']);
const defaults = {
  publicDir: process.env.CHECK_LINKS_PUBLIC_DIR
    ? path.resolve(process.env.CHECK_LINKS_PUBLIC_DIR)
    : path.join(repoRoot, 'public'),
  manifestPath: process.env.CHECK_LINKS_MANIFEST
    ? path.resolve(process.env.CHECK_LINKS_MANIFEST)
    : path.join(repoRoot, 'migration', 'url-manifest.json'),
  seoBaselinePath: path.join(repoRoot, 'migration', 'phase-1-seo-baseline.md'),
  reportPath: path.join(repoRoot, 'migration', 'reports', 'phase-5-internal-links-audit.csv'),
  allowManifestTargets: process.env.CHECK_LINKS_ALLOW_MANIFEST_TARGETS === '1',
  mode: process.env.CHECK_INTERNAL_LINKS_MODE?.trim() || process.env.CHECK_LINKS_MODE?.trim() || 'full'
};

function printHelp() {
  console.log(`Usage: node scripts/seo/check-internal-links.js [options]

Options:
  --public-dir <path>              Override built public directory.
  --manifest <path>                Override migration/url-manifest.json path.
  --seo-baseline <path>            Override the Phase 1 SEO baseline markdown path.
  --report <path>                  Override audit CSV path.
  --mode <mode>                    Validation mode: full or subset.
  --allow-manifest-targets         Allow unresolved keep/merge manifest targets.
  --help                           Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicDir = path.resolve(argv[++index]);
        break;
      case '--manifest':
        options.manifestPath = path.resolve(argv[++index]);
        break;
      case '--seo-baseline':
        options.seoBaselinePath = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--mode': {
        const mode = argv[++index]?.trim();
        if (!validModes.has(mode)) {
          throw new Error(`Unknown internal-link validation mode: ${mode}`);
        }
        options.mode = mode;
        break;
      }
      case '--allow-manifest-targets':
        options.allowManifestTargets = true;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!validModes.has(options.mode)) {
    throw new Error(`Unknown internal-link validation mode: ${options.mode}`);
  }

  return options;
}

function normalizeWhitespace(value) {
  return String(value ?? '').replace(/\s+/gu, ' ').trim();
}

function hasFileExtension(pathname) {
  return path.posix.extname(pathname) !== '';
}

function normalizePathname(pathname) {
  let decodedPathname = pathname;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    decodedPathname = pathname;
  }

  if (!decodedPathname) {
    return '/';
  }

  const normalized = decodedPathname.replace(/\/{2,}/gu, '/');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function normalizeComparablePath(pathname) {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === '/' || normalizedPathname === '/404.html') {
    return normalizedPathname;
  }

  if (hasFileExtension(normalizedPathname)) {
    return normalizedPathname;
  }

  return normalizedPathname.endsWith('/') ? normalizedPathname : `${normalizedPathname}/`;
}

function normalizeRoute(route) {
  return normalizeComparablePath(route);
}

function toAbsoluteUrl(route) {
  return new URL(route, `${canonicalOrigin}/`).toString();
}

function routeFromHtmlPath(publicDir, filePath) {
  const relativePath = toPosixPath(path.relative(publicDir, filePath));

  if (relativePath === 'index.html') {
    return '/';
  }

  if (relativePath === '404.html') {
    return '/404.html';
  }

  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'index.html'.length)}`;
  }

  return `/${relativePath}`;
}

function buildPublicCandidates(pathname) {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === '/') {
    return ['index.html'];
  }

  const trimmedPath = normalizedPathname.replace(/^\//u, '');

  if (normalizedPathname.endsWith('/')) {
    return [`${trimmedPath}index.html`];
  }

  if (hasFileExtension(normalizedPathname)) {
    return [trimmedPath];
  }

  return [trimmedPath, `${trimmedPath}.html`, `${trimmedPath}/index.html`];
}

function normalizeComparableLocation(value) {
  const input = String(value ?? '').trim();
  if (!input) {
    return null;
  }

  const parsed = new URL(
    /^[a-zA-Z][a-zA-Z\d+.-]*:/u.test(input)
      ? input
      : `${canonicalOrigin}${input.startsWith('/') ? input : `/${input}`}`
  );
  const pathname = normalizePathname(parsed.pathname);
  const comparablePath = normalizeComparablePath(pathname);

  return {
    pathname,
    search: parsed.search || '',
    comparablePath,
    comparable: `${comparablePath}${parsed.search || ''}`,
    absolute: `${parsed.origin}${pathname}${parsed.search || ''}`
  };
}

function readRobotsTokens($) {
  const content = ($('meta[name="robots"]').attr('content') ?? '').toLowerCase();

  return new Set(
    content
      .split(/[\s,]+/u)
      .map((token) => token.trim())
      .filter(Boolean)
  );
}

function classifyTemplateFamily(route, $, redirectDetails) {
  if (route === '/') {
    return 'homepage';
  }

  if (route === '/404.html') {
    return '404';
  }

  if (redirectDetails.isRedirectPage) {
    return 'redirect-helper';
  }

  if (/\/page\/\d+\/$/u.test(route)) {
    return 'pagination';
  }

  if (route === '/category/' || route.startsWith('/category/')) {
    return 'category';
  }

  if (($('meta[property="og:type"]').attr('content') ?? '').trim() === 'article') {
    return 'article';
  }

  return 'page';
}

function isIndexable(route, $, redirectDetails) {
  if (route === '/404.html' || redirectDetails.isRedirectPage) {
    return false;
  }

  return !readRobotsTokens($).has('noindex');
}

function isSkippableHref(href) {
  return !href
    || href.startsWith('#')
    || href.startsWith('//')
    || /^(?:mailto|tel|javascript|data):/iu.test(href);
}

function classifyAnchorContext($, element) {
  const anchor = $(element);

  if (anchor.closest('.breadcrumbs').length > 0) {
    return 'breadcrumb';
  }

  if (anchor.closest('.site-nav, .site-drawer__nav, .site-footer__nav, nav').length > 0) {
    return 'navigation';
  }

  if (anchor.closest('.article-related').length > 0) {
    return 'related';
  }

  if (anchor.closest('.pagination').length > 0) {
    return 'pagination';
  }

  return 'content';
}

function resolveHref(href, sourceRoute) {
  const hasExplicitScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/u.test(href);
  const baseUrl = toAbsoluteUrl(sourceRoute);

  let parsed;
  try {
    parsed = new URL(href, baseUrl);
  } catch {
    return {
      href,
      isInternal: !hasExplicitScheme,
      invalid: true
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = normalizePathname(parsed.pathname);
  const isWordPressHost = hostname.endsWith('wordpress.com') || hostname.endsWith('wp.com');
  const isInternal = !hasExplicitScheme || isWordPressHost || supportedInternalHosts.has(hostname);
  const isLegacyHost = isInternal && hostname !== canonicalHost;

  return {
    href,
    isInternal,
    invalid: false,
    absolute: parsed.toString(),
    host: hostname,
    pathname,
    search: parsed.search || '',
    comparable: `${normalizeComparablePath(pathname)}${parsed.search || ''}`,
    comparablePath: normalizeComparablePath(pathname),
    hasWpContent: pathname.includes('/wp-content/'),
    isWordPressHost,
    isLegacyHost
  };
}

function parseTopTrafficRoutes(markdownSource) {
  const marker = '### Top pages by clicks (90-day export)';
  const markerIndex = markdownSource.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error('Unable to locate the 90-day top pages section in the SEO baseline.');
  }

  const sectionSource = markdownSource.slice(markerIndex + marker.length);
  const topRoutes = [];

  for (const line of sectionSource.split(/\r?\n/u)) {
    const match = /^\|\s*\d+\s*\|\s*(https:\/\/www\.rhino-inquisitor\.com\/[^|]*)\s*\|/u.exec(line);
    if (!match) {
      if (topRoutes.length > 0 && line.startsWith('### ')) {
        break;
      }
      continue;
    }

    const route = normalizeComparableLocation(match[1])?.comparablePath;
    if (route) {
      topRoutes.push(route);
    }

    if (topRoutes.length === 10) {
      break;
    }
  }

  if (topRoutes.length < 10) {
    throw new Error(`Expected 10 critical routes from the 90-day SEO baseline, found ${topRoutes.length}.`);
  }

  return topRoutes;
}

function buildManifestData(entries) {
  const deprecatedSources = new Map();
  const allowedTargets = new Set();

  for (const entry of entries) {
    const legacyInfo = normalizeComparableLocation(entry.legacy_url);
    const targetInfo = normalizeComparableLocation(entry.target_url);

    if (legacyInfo && ['merge', 'retire'].includes(entry.disposition)) {
      deprecatedSources.set(legacyInfo.comparable, {
        disposition: entry.disposition,
        targetPath: targetInfo?.comparablePath ?? null,
        targetComparable: targetInfo?.comparable ?? null
      });
    }

    if (targetInfo && ['keep', 'merge'].includes(entry.disposition)) {
      allowedTargets.add(targetInfo.comparablePath);
    }
  }

  return {
    deprecatedSources,
    allowedTargets
  };
}

function isHtmlLikeTarget(pathname) {
  const comparablePath = normalizeComparablePath(pathname);
  return comparablePath === '/404.html' || !hasFileExtension(comparablePath) || comparablePath.endsWith('.html');
}

function makeLinkRow(page, link, result) {
  return {
    row_type: 'link',
    status: result.status,
    severity: result.severity,
    issue_type: result.issueType,
    template_family: page.family,
    source_route: page.route,
    target_route: result.targetRoute ?? '',
    href: link.href,
    anchor_text: link.anchorText,
    link_context: link.context,
    is_indexable: page.indexable ? 'yes' : 'no',
    is_critical: page.isCritical ? 'yes' : 'no',
    inbound_count: '',
    click_depth: '',
    message: result.message
  };
}

function buildPageSummaryRow(page, summary) {
  return {
    row_type: 'page',
    status: summary.status,
    severity: summary.severity,
    issue_type: summary.issueType,
    template_family: page.family,
    source_route: page.route,
    target_route: '',
    href: '',
    anchor_text: '',
    link_context: '',
    is_indexable: page.indexable ? 'yes' : 'no',
    is_critical: page.isCritical ? 'yes' : 'no',
    inbound_count: String(summary.inboundCount),
    click_depth: summary.clickDepth == null ? '' : String(summary.clickDepth),
    message: summary.message
  };
}

function buildMissingRouteRow(route) {
  return {
    row_type: 'page',
    status: 'fail',
    severity: 'critical',
    issue_type: 'missing-critical-route',
    template_family: 'missing',
    source_route: route,
    target_route: '',
    href: '',
    anchor_text: '',
    link_context: '',
    is_indexable: 'yes',
    is_critical: 'yes',
    inbound_count: '',
    click_depth: '',
    message: 'Critical route from the 90-day baseline or policy set is missing from the built site output.'
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const [manifestEntries, seoBaselineSource] = await Promise.all([
    loadManifest(options.manifestPath),
    readFile(options.seoBaselinePath, 'utf8')
  ]);
  const { deprecatedSources, allowedTargets } = buildManifestData(manifestEntries);
  const topTrafficRoutes = new Set(parseTopTrafficRoutes(seoBaselineSource));

  const htmlFiles = await fg('**/*.html', {
    cwd: options.publicDir,
    absolute: true,
    dot: true
  });
  if (htmlFiles.length === 0) {
    throw new Error(`No built HTML files found under ${toRepoRelative(options.publicDir) || options.publicDir}. Run a production build first.`);
  }

  const publicFiles = new Set(
    (
      await fg('**/*', {
        cwd: options.publicDir,
        onlyFiles: true,
        dot: true
      })
    ).map((entry) => toPosixPath(entry))
  );

  const pages = [];
  const pagesByRoute = new Map();
  const htmlPathToRoute = new Map();

  for (const htmlFile of htmlFiles) {
    const htmlSource = await readFile(htmlFile, 'utf8');
    const $ = loadHtml(htmlSource);
    const route = normalizeRoute(routeFromHtmlPath(options.publicDir, htmlFile));
    const redirectDetails = extractRedirectDetails(htmlSource);
    const family = classifyTemplateFamily(route, $, redirectDetails);
    const indexable = isIndexable(route, $, redirectDetails);
    const relativePath = toPosixPath(path.relative(options.publicDir, htmlFile));
    const page = {
      route,
      relativePath,
      family,
      indexable,
      isCritical: false,
      linkFindings: [],
      blockingLinkCount: 0,
      warningLinkCount: 0
    };

    pages.push(page);
    pagesByRoute.set(route, page);
    htmlPathToRoute.set(relativePath, route);
  }

  const categoryRoutes = new Set(
    pages.filter((page) => page.route === '/category/' || page.route.startsWith('/category/')).map((page) => page.route)
  );
  const criticalRoutes = new Set(['/', '/privacy-policy/', ...categoryRoutes, ...topTrafficRoutes]);
  for (const page of pages) {
    page.isCritical = criticalRoutes.has(page.route);
  }

  const rows = [];
  const graph = new Map();
  const blockingRows = [];
  const warningRows = [];

  for (const page of pages) {
    const htmlSource = await readFile(path.join(options.publicDir, page.relativePath), 'utf8');
    const $ = loadHtml(htmlSource);
    const graphTargets = new Set();

    $('a[href]').each((_, element) => {
      const href = ($(element).attr('href') ?? '').trim();
      if (isSkippableHref(href)) {
        return;
      }

      const link = {
        href,
        anchorText: normalizeWhitespace($(element).text()),
        context: classifyAnchorContext($, element)
      };
      const resolved = resolveHref(href, page.route);
      if (!resolved.isInternal) {
        return;
      }

      const candidatePaths = resolved.invalid ? [] : buildPublicCandidates(resolved.pathname);
      const existingCandidate = candidatePaths.find((candidatePath) => publicFiles.has(candidatePath)) ?? null;
      const targetRoute = existingCandidate ? htmlPathToRoute.get(existingCandidate) ?? null : null;
      const deprecatedTarget = resolved.invalid ? null : deprecatedSources.get(resolved.comparable);
      const missingAllowedTarget = !existingCandidate && options.allowManifestTargets && !resolved.invalid && allowedTargets.has(resolved.comparablePath);
      const targetsHtml = Boolean(targetRoute)
        || (!resolved.invalid && isHtmlLikeTarget(resolved.pathname))
        || Boolean(deprecatedTarget?.targetPath && isHtmlLikeTarget(deprecatedTarget.targetPath));

      const issueTypes = [];
      if (resolved.invalid) {
        issueTypes.push('invalid-internal-url');
      }
      if (resolved.isWordPressHost || resolved.isLegacyHost) {
        issueTypes.push('legacy-host');
      }
      if (resolved.hasWpContent) {
        issueTypes.push('wp-content-path');
      }
      if (deprecatedTarget) {
        issueTypes.push('deprecated-source-link');
      }
      if (!resolved.invalid && !existingCandidate && !missingAllowedTarget) {
        issueTypes.push('broken-link');
      }

      let status = 'pass';
      let severity = 'info';
      let issueType = 'ok';
      let message = 'Internal link resolves to an existing target.';

      if (missingAllowedTarget) {
        status = 'warn';
        severity = 'warning';
        issueType = 'subset-manifest-target';
        message = 'Internal link target is outside the current partial build, but the route is approved as a keep/merge manifest target.';
      }

      if (issueTypes.length > 0) {
        issueType = issueTypes.join('+');
        const targetLabel = deprecatedTarget?.targetPath ?? targetRoute ?? resolved.comparablePath ?? '';
        const fragments = [];
        if (issueTypes.includes('invalid-internal-url')) {
          fragments.push('href could not be parsed as a valid internal URL');
        }
        if (issueTypes.includes('legacy-host')) {
          fragments.push(`href uses a non-canonical internal host (${resolved.host})`);
        }
        if (issueTypes.includes('wp-content-path')) {
          fragments.push('href points to a legacy wp-content path');
        }
        if (issueTypes.includes('deprecated-source-link')) {
          fragments.push(`href points to a ${deprecatedTarget?.disposition ?? 'deprecated'} source route instead of ${targetLabel || 'its canonical target'}`);
        }
        if (issueTypes.includes('broken-link')) {
          fragments.push('href does not resolve to a built file in public/');
        }
        message = fragments.join(' | ');

        const blocksNavigation = link.context === 'navigation' || link.context === 'breadcrumb';
        const blocksCriticalPage = page.isCritical && targetsHtml;
        const blocksHtmlIa = targetsHtml && issueTypes.some((currentIssue) => [
          'invalid-internal-url',
          'legacy-host',
          'deprecated-source-link',
          'broken-link'
        ].includes(currentIssue));
        const shouldBlock = blocksNavigation || blocksCriticalPage || blocksHtmlIa;

        status = shouldBlock ? 'fail' : 'warn';
        severity = shouldBlock ? 'critical' : 'warning';
      }

      const row = makeLinkRow(page, link, {
        status,
        severity,
        issueType,
        targetRoute: targetRoute ?? deprecatedTarget?.targetPath ?? (resolved.invalid ? null : resolved.comparablePath),
        message
      });
      rows.push(row);

      if (status === 'fail') {
        page.blockingLinkCount += 1;
        page.linkFindings.push(message);
        blockingRows.push(row);
      } else if (status === 'warn') {
        page.warningLinkCount += 1;
        page.linkFindings.push(message);
        warningRows.push(row);
      }

      if (
        status === 'pass'
        && targetRoute
        && targetRoute !== page.route
        && pagesByRoute.has(targetRoute)
      ) {
        graphTargets.add(targetRoute);
      }
    });

    graph.set(page.route, graphTargets);
  }

  const inboundMap = new Map();
  for (const [sourceRoute, targetRoutes] of graph.entries()) {
    for (const targetRoute of targetRoutes) {
      const currentInbound = inboundMap.get(targetRoute) ?? new Set();
      currentInbound.add(sourceRoute);
      inboundMap.set(targetRoute, currentInbound);
    }
  }

  const clickDepthByRoute = new Map();
  if (pagesByRoute.has('/')) {
    clickDepthByRoute.set('/', 0);
    const queue = ['/'];

    while (queue.length > 0) {
      const currentRoute = queue.shift();
      const currentDepth = clickDepthByRoute.get(currentRoute) ?? 0;

      for (const targetRoute of graph.get(currentRoute) ?? []) {
        if (clickDepthByRoute.has(targetRoute)) {
          continue;
        }

        clickDepthByRoute.set(targetRoute, currentDepth + 1);
        queue.push(targetRoute);
      }
    }
  }

  if (options.mode === 'full') {
    for (const criticalRoute of criticalRoutes) {
      if (!pagesByRoute.has(criticalRoute)) {
        const row = buildMissingRouteRow(criticalRoute);
        rows.push(row);
        blockingRows.push(row);
      }
    }
  }

  for (const page of pages.sort((left, right) => left.route.localeCompare(right.route))) {
    const inboundCount = inboundMap.get(page.route)?.size ?? 0;
    const clickDepth = clickDepthByRoute.get(page.route);
    const issues = [];
    const warnings = [];

    if (page.blockingLinkCount > 0) {
      issues.push(`${page.blockingLinkCount} internal link defect(s) on this page`);
    }

    if (options.mode === 'full' && page.indexable && page.route !== '/') {
      if (inboundCount === 0) {
        issues.push('indexable page is orphaned (zero inbound internal links)');
      }

      if (!clickDepthByRoute.has(page.route)) {
        issues.push('indexable page is unreachable from the homepage through valid internal links');
      } else if (clickDepth > 3) {
        warnings.push(`click depth is ${clickDepth}, above the Phase 5 warning threshold of 3`);
      }
    }

    if (page.warningLinkCount > 0) {
      warnings.push(`${page.warningLinkCount} warning link finding(s) on this page`);
    }

    let status = 'pass';
    let severity = 'info';
    let issueType = 'page-ok';
    let message = 'Page passed internal-link and IA validation.';

    if (issues.length > 0) {
      status = 'fail';
      severity = 'critical';
      issueType = 'page-defect';
      message = issues.join(' | ');
    } else if (warnings.length > 0) {
      status = 'warn';
      severity = 'warning';
      issueType = 'page-warning';
      message = warnings.join(' | ');
      warningRows.push({ source_route: page.route, issue_type: issueType });
    }

    const pageRow = buildPageSummaryRow(page, {
      status,
      severity,
      issueType,
      inboundCount,
      clickDepth,
      message
    });
    rows.push(pageRow);

    if (status === 'fail') {
      blockingRows.push(pageRow);
    }
  }

  rows.sort((left, right) => {
    if (left.source_route !== right.source_route) {
      return left.source_route.localeCompare(right.source_route);
    }

    if (left.row_type !== right.row_type) {
      return left.row_type.localeCompare(right.row_type);
    }

    if (left.issue_type !== right.issue_type) {
      return left.issue_type.localeCompare(right.issue_type);
    }

    return left.href.localeCompare(right.href);
  });

  await mkdir(path.dirname(options.reportPath), { recursive: true });
  await writeFile(
    options.reportPath,
    stringifyCsv(rows, {
      header: true,
      columns: [
        'row_type',
        'status',
        'severity',
        'issue_type',
        'template_family',
        'source_route',
        'target_route',
        'href',
        'anchor_text',
        'link_context',
        'is_indexable',
        'is_critical',
        'inbound_count',
        'click_depth',
        'message'
      ]
    }),
    'utf8'
  );

  const reportLabel = toRepoRelative(options.reportPath);
  console.log(`Internal-link audit evaluated ${pages.length} HTML page(s) and wrote ${reportLabel}.`);
  console.log(`Blocking findings: ${blockingRows.length}. Warning findings: ${warningRows.length}. Mode: ${options.mode}.`);

  if (blockingRows.length > 0) {
    console.error('Internal-link validation failed. Top findings:');
    for (const row of blockingRows.slice(0, 20)) {
      console.error(`- ${row.source_route}${row.href ? ` -> ${row.href}` : ''}: ${row.message}`);
    }
    if (blockingRows.length > 20) {
      console.error(`- ...and ${blockingRows.length - 20} more blocking finding(s).`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
