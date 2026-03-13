import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { parse as parseCsv } from 'csv-parse/sync';

import {
  matchesExpectedMergeTarget,
  normalizeUrlLike
} from './url-validation-helpers.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const validatorPath = path.join(repoRoot, 'scripts/migration/validate-url-parity.js');

function createManifestEntry(overrides = {}) {
  return {
    legacy_url: '/wp-content/uploads/2026/03/fixture.pdf',
    disposition: 'keep',
    target_url: '/wp-content/uploads/2026/03/fixture.pdf',
    redirect_code: null,
    reason: 'Fixture for URL parity regression coverage.',
    owner: 'engineering-owner',
    priority: 'critical',
    implementation_layer: 'pages-static',
    url_class: 'attachment',
    source: 'fixture:test',
    has_organic_traffic: false,
    has_external_links: false,
    ...overrides
  };
}

function createContentFile(url = '/fixture-page/') {
  return `---
title: "Fixture Page"
url: "${url}"
---

Fixture content.
`;
}

async function writeFixtureFiles(root, files) {
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
  }
}

async function runValidatorFixture({
  manifestEntries,
  contentFiles,
  staticFiles = {},
  publicFiles = {}
}) {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'rhi-url-parity-test-'));
  const contentRoot = path.join(fixtureRoot, 'content');
  const staticRoot = path.join(fixtureRoot, 'static');
  const publicRoot = path.join(fixtureRoot, 'public');
  const manifestPath = path.join(fixtureRoot, 'url-manifest.json');
  const reportPath = path.join(fixtureRoot, 'url-parity-report.csv');

  try {
    await mkdir(contentRoot, { recursive: true });
    await mkdir(staticRoot, { recursive: true });
    await mkdir(publicRoot, { recursive: true });

    await writeFile(manifestPath, JSON.stringify(manifestEntries, null, 2));
    await writeFixtureFiles(contentRoot, contentFiles);
    await writeFixtureFiles(staticRoot, staticFiles);
    await writeFixtureFiles(publicRoot, publicFiles);

    const result = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [
        validatorPath,
        '--manifest', manifestPath,
        '--content-dir', contentRoot,
        '--static-dir', staticRoot,
        '--public-dir', publicRoot,
        '--report', reportPath
      ], {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk;
      });

      child.on('error', reject);
      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });
    });

    const reportSource = await readFile(reportPath, 'utf8');
    const rows = parseCsv(reportSource, {
      columns: true,
      skip_empty_lines: true
    });

    return {
      ...result,
      rows
    };
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}

test('treats /index.xml as an approved feed helper target for system routes targeting /feed/', () => {
  const entry = createManifestEntry({
    legacy_url: '/rss/',
    disposition: 'merge',
    target_url: '/feed/',
    redirect_code: 301,
    implementation_layer: 'pages-static',
    url_class: 'system',
    priority: 'high'
  });

  assert.equal(
    matchesExpectedMergeTarget(entry, normalizeUrlLike('/index.xml'), normalizeUrlLike('/feed/')),
    true
  );
  assert.equal(
    matchesExpectedMergeTarget(entry, normalizeUrlLike('/feed/'), normalizeUrlLike('/feed/')),
    true
  );
  assert.equal(
    matchesExpectedMergeTarget(entry, normalizeUrlLike('/some-other-target/'), normalizeUrlLike('/feed/')),
    false
  );
});

test('reports live-static-asset for kept attachments with source and public assets', async () => {
  const outcome = await runValidatorFixture({
    manifestEntries: [createManifestEntry()],
    contentFiles: {
      'posts/fixture-page.md': createContentFile()
    },
    staticFiles: {
      'wp-content/uploads/2026/03/fixture.pdf': 'fixture-pdf'
    },
    publicFiles: {
      'wp-content/uploads/2026/03/fixture.pdf': 'fixture-pdf'
    }
  });

  assert.equal(outcome.code, 0, outcome.stderr || outcome.stdout);
  assert.equal(outcome.rows.length, 1);
  assert.deepEqual(outcome.rows[0], {
    legacy_url: '/wp-content/uploads/2026/03/fixture.pdf',
    disposition: 'keep',
    expected_target: '/wp-content/uploads/2026/03/fixture.pdf',
    actual_outcome: 'live-static-asset',
    status: 'pass',
    severity: 'critical'
  });
});

test('reports missing-source-asset when a kept attachment is absent from src/static', async () => {
  const outcome = await runValidatorFixture({
    manifestEntries: [createManifestEntry()],
    contentFiles: {
      'posts/fixture-page.md': createContentFile()
    },
    publicFiles: {
      'wp-content/uploads/2026/03/fixture.pdf': 'fixture-pdf'
    }
  });

  assert.equal(outcome.code, 1, outcome.stderr || outcome.stdout);
  assert.equal(outcome.rows.length, 1);
  assert.equal(outcome.rows[0].actual_outcome, 'missing-source-asset');
  assert.equal(outcome.rows[0].status, 'fail');
  assert.match(outcome.stdout, /Critical failures: 1/u);
});

test('reports missing-public-asset when a kept attachment is not published', async () => {
  const outcome = await runValidatorFixture({
    manifestEntries: [createManifestEntry()],
    contentFiles: {
      'posts/fixture-page.md': createContentFile()
    },
    staticFiles: {
      'wp-content/uploads/2026/03/fixture.pdf': 'fixture-pdf'
    }
  });

  assert.equal(outcome.code, 1, outcome.stderr || outcome.stdout);
  assert.equal(outcome.rows.length, 1);
  assert.equal(outcome.rows[0].actual_outcome, 'missing-public-asset');
  assert.equal(outcome.rows[0].status, 'fail');
  assert.match(outcome.stdout, /Critical failures: 1/u);
});

test('keeps HTML route validation on the live-page path for non-attachment keep entries', async () => {
  const outcome = await runValidatorFixture({
    manifestEntries: [createManifestEntry({
      legacy_url: '/fixture-page/',
      target_url: '/fixture-page/',
      url_class: 'post'
    })],
    contentFiles: {
      'posts/fixture-page.md': createContentFile('/fixture-page/')
    },
    publicFiles: {
      'fixture-page/index.html': '<!doctype html><html><head><title>Fixture</title></head><body>Fixture</body></html>'
    }
  });

  assert.equal(outcome.code, 0, outcome.stderr || outcome.stdout);
  assert.equal(outcome.rows.length, 1);
  assert.equal(outcome.rows[0].actual_outcome, 'live-page');
  assert.equal(outcome.rows[0].status, 'pass');
});

test('reports generated-system-file for non-HTML keep routes published as assets', async () => {
  const outcome = await runValidatorFixture({
    manifestEntries: [createManifestEntry({
      legacy_url: '/robots.txt',
      target_url: '/robots.txt',
      implementation_layer: 'none',
      url_class: 'system',
      priority: 'high'
    })],
    contentFiles: {
      'posts/fixture-page.md': createContentFile('/fixture-page/')
    },
    publicFiles: {
      'robots.txt': 'User-agent: *\nAllow: /\n'
    }
  });

  assert.equal(outcome.code, 0, outcome.stderr || outcome.stdout);
  assert.equal(outcome.rows.length, 1);
  assert.deepEqual(outcome.rows[0], {
    legacy_url: '/robots.txt',
    disposition: 'keep',
    expected_target: '/robots.txt',
    actual_outcome: 'generated-system-file',
    status: 'pass',
    severity: 'warning'
  });
});

test('accepts feed compatibility helpers that point directly to /index.xml for /feed/ manifest targets', async () => {
  const outcome = await runValidatorFixture({
    manifestEntries: [createManifestEntry({
      legacy_url: '/rss/',
      disposition: 'merge',
      target_url: '/feed/',
      redirect_code: 308,
      implementation_layer: 'pages-static',
      url_class: 'system',
      priority: 'high'
    })],
    contentFiles: {
      'posts/fixture-page.md': createContentFile('/fixture-page/')
    },
    publicFiles: {
      'rss/index.html': '<!doctype html><html><head><link rel="canonical" href="/index.xml"><meta http-equiv="refresh" content="0; url=/index.xml"></head></html>'
    }
  });

  assert.equal(outcome.code, 0, outcome.stderr || outcome.stdout);
  assert.equal(outcome.rows.length, 1);
  assert.equal(outcome.rows[0].actual_outcome, 'meta-refresh');
  assert.equal(outcome.rows[0].status, 'pass');
});