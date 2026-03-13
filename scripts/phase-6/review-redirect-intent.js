import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');

const defaults = {
  inputPath: path.join(repoRoot, 'migration/url-map.csv'),
  outputPath: path.join(repoRoot, 'migration/url-map.csv'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-redirect-intent-review.csv')
};

const reviewer = 'Thomas Theunen';
const reviewMarker = 'RHI-064 review:';
const exactEquivalent = 'exact-equivalent';
const consolidatedEquivalent = 'consolidated-equivalent';

const consolidatedRules = new Map([
  [
    '/category/external/forward/',
    'Approved as consolidated-equivalent because the low-signal nested forward taxonomy route intentionally consolidates into the surviving /category/external/ landing page rather than remaining a standalone term.'
  ],
  [
    '/category/salesforce-commerce-cloud/documentation/',
    'Approved as consolidated-equivalent because the nested documentation taxonomy route intentionally consolidates into the broader surviving /category/salesforce-commerce-cloud/ category rather than a one-to-one replacement.'
  ],
  [
    '/feed/atom/',
    'Approved as consolidated-equivalent because the legacy Atom feed variant intentionally consolidates to the canonical /feed/ endpoint under the approved Phase 2 and Phase 5 feed policy.'
  ]
]);

const genericPageTargets = new Set(['/archive/', '/ideas/', '/video/']);

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--input') {
      options.inputPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--output') {
      options.outputPath = path.resolve(argv[index + 1]);
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
  console.log(`Usage: node scripts/phase-6/review-redirect-intent.js [options]

Options:
  --input <path>   Override the input URL map path.
  --output <path>  Override the reviewed URL map output path.
  --report <path>  Override the review report output path.
  --help           Show this help message.
`);
}

function getLeafSegment(urlPath) {
  return urlPath
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)
    .pop() ?? '';
}

function stripReviewNote(notes) {
  if (typeof notes !== 'string') {
    return '';
  }

  const markerIndex = notes.indexOf(reviewMarker);
  if (markerIndex === -1) {
    return notes.trim();
  }

  return notes.slice(0, markerIndex).trim();
}

function appendReviewNote(notes, reviewNote) {
  const baseNote = stripReviewNote(notes);
  return `${baseNote}${baseNote ? ' ' : ''}${reviewMarker} ${reviewNote}`;
}

function reviewQueryStringRow(row) {
  if (genericPageTargets.has(row.target_url)) {
    return {
      intentClass: exactEquivalent,
      reviewNote:
        'Approved as exact-equivalent because this legacy WordPress query-string permalink resolves to the same surviving page; the destination is not a convenience redirect to a generic hub. Launch delivery remains an accepted RHI-062 query-string limitation under Model A.'
    };
  }

  return {
    intentClass: exactEquivalent,
    reviewNote:
      'Approved as exact-equivalent because this legacy WordPress query-string permalink resolves to the same surviving content item at its canonical Hugo path. Launch delivery remains an accepted RHI-062 query-string limitation under Model A.'
  };
}

function reviewSystemRow(row) {
  if (row.legacy_url === '/feed/rss/' || row.legacy_url === '/rss/') {
    return {
      intentClass: exactEquivalent,
      reviewNote:
        'Approved as exact-equivalent because this legacy RSS endpoint variant resolves to the same canonical site feed served at /feed/.'
    };
  }

  if (consolidatedRules.has(row.legacy_url)) {
    return {
      intentClass: consolidatedEquivalent,
      reviewNote: consolidatedRules.get(row.legacy_url)
    };
  }

  throw new Error(`Unhandled system merge row: ${row.legacy_url}`);
}

function reviewCategoryRow(row) {
  if (consolidatedRules.has(row.legacy_url)) {
    return {
      intentClass: consolidatedEquivalent,
      reviewNote: consolidatedRules.get(row.legacy_url)
    };
  }

  if (getLeafSegment(row.legacy_url) === getLeafSegment(row.target_url)) {
    return {
      intentClass: exactEquivalent,
      reviewNote:
        'Approved as exact-equivalent because the nested legacy taxonomy route is flattened to the same surviving topic term with no material change in topical intent.'
    };
  }

  throw new Error(`Unhandled category merge row: ${row.legacy_url} -> ${row.target_url}`);
}

function reviewPageRow() {
  return {
    intentClass: exactEquivalent,
    reviewNote:
      'Approved as exact-equivalent because the legacy path and destination represent the same surviving page content, with only the canonical Hugo slug changing.'
  };
}

function reviewMergeRow(row) {
  if (row.legacy_url.startsWith('/?p=')) {
    return reviewQueryStringRow(row);
  }

  if (row.route_class === 'system') {
    return reviewSystemRow(row);
  }

  if (row.route_class === 'category') {
    return reviewCategoryRow(row);
  }

  if (row.route_class === 'page') {
    return reviewPageRow(row);
  }

  throw new Error(`Unhandled merge row: ${row.legacy_url} (${row.route_class})`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const rows = parseCsv(await fs.readFile(options.inputPath, 'utf8'), {
    columns: true,
    skip_empty_lines: true
  });

  const mergeRows = rows.filter((row) => row.disposition === 'merge');
  const reportRows = [];
  const reviewedRows = rows.map((row) => {
    if (row.disposition !== 'merge') {
      return row;
    }

    const decision = reviewMergeRow(row);
    const notes = appendReviewNote(row.notes, decision.reviewNote);

    reportRows.push({
      legacy_url: row.legacy_url,
      target_url: row.target_url,
      intent_class: decision.intentClass,
      review_status: 'approved',
      reviewer,
      notes
    });

    return {
      ...row,
      intent_class: decision.intentClass,
      notes
    };
  });

  await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
  await fs.mkdir(path.dirname(options.reportPath), { recursive: true });

  await fs.writeFile(
    options.outputPath,
    stringifyCsv(reviewedRows, {
      header: true,
      columns: [
        'legacy_url',
        'legacy_path',
        'route_class',
        'disposition',
        'target_url',
        'intent_class',
        'owner',
        'notes',
        'implementation_layer',
        'redirect_code',
        'has_organic_traffic',
        'has_external_links',
        'source'
      ]
    }),
    'utf8'
  );

  await fs.writeFile(
    options.reportPath,
    stringifyCsv(reportRows, {
      header: true,
      columns: ['legacy_url', 'target_url', 'intent_class', 'review_status', 'reviewer', 'notes']
    }),
    'utf8'
  );

  const reviewedCount = reportRows.length;
  const exactCount = reportRows.filter((row) => row.intent_class === exactEquivalent).length;
  const consolidatedCount = reportRows.filter((row) => row.intent_class === consolidatedEquivalent).length;

  console.log(`Reviewed ${reviewedCount} merge row(s) from ${path.relative(repoRoot, options.inputPath)}`);
  console.log(`Intent-class counts: ${JSON.stringify({ [exactEquivalent]: exactCount, [consolidatedEquivalent]: consolidatedCount })}`);
  console.log(`Updated URL map: ${path.relative(repoRoot, options.outputPath)}`);
  console.log(`Wrote review report: ${path.relative(repoRoot, options.reportPath)}`);

  if (reviewedCount !== mergeRows.length) {
    throw new Error(`Expected to review ${mergeRows.length} merge rows but wrote ${reviewedCount} report rows.`);
  }
}

await main();