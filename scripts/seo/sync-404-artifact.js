#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const options = { publicDir: 'public' };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--public-dir') {
      options.publicDir = argv[index + 1];
      index += 1;
    }
  }

  return options;
}

function rewriteRoot404(html) {
  const rootNote = '<p>This synced root 404 artifact exists so GitHub Pages serves the authoritative <code>404.html</code> error document while <code>/404/</code> remains available for validation and internal QA checks.</p>';

  let next = html.replace(
    /<p>This content-backed route exists so validation can assert a non-indexable\s*<code>\/404\/<\/code>\s*page while\s*<code>404\.html<\/code>\s*remains the authoritative GitHub Pages error document\.<\/p>/,
    rootNote
  );
  next = next.replace(/https?:\/\/[^"'\s<]+\/404\//g, (match) => match.replace(/\/404\/$/, '/404.html'));
  return next;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const publicDir = path.resolve(options.publicDir);
  const sourcePath = path.join(publicDir, '404', 'index.html');
  const destinationPath = path.join(publicDir, '404.html');

  const html = await fs.readFile(sourcePath, 'utf8');
  const rewritten = rewriteRoot404(html);
  await fs.writeFile(destinationPath, rewritten, 'utf8');

  console.log(`Synced ${path.relative(process.cwd(), destinationPath)} from ${path.relative(process.cwd(), sourcePath)}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});