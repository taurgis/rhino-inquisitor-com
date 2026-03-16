import fs from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';

const defaultContentDir = path.join(path.resolve('.'), 'src/content');
const localVideoLinkPattern = /\[[^\]\n]+\]\((<[^>\n]+>|[^)\s]+)(?:\s+"[^"]*")?\)/gmu;
const localVideoExtensionPattern = /\.(?:mp4|mov)(?:$|[?#])/iu;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const markdownFiles = (await fg('**/*.md', {
    cwd: options.contentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  const findings = [];

  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    for (const match of source.matchAll(localVideoLinkPattern)) {
      const rawTarget = String(match[1] ?? '').trim().replace(/^<|>$/g, '');
      if (!rawTarget || isExternalTarget(rawTarget)) {
        continue;
      }
      if (!localVideoExtensionPattern.test(rawTarget)) {
        continue;
      }

      const line = offsetToLine(source, match.index ?? 0);
      findings.push({
        file: toRepoRelative(markdownFile),
        line,
        target: rawTarget
      });
    }
  }

  if (findings.length === 0) {
    console.log(`Checked ${markdownFiles.length} markdown file(s). No local markdown video links found.`);
    return;
  }

  console.error(`Found ${findings.length} local markdown video link(s) across ${markdownFiles.length} markdown file(s).`);
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} -> ${finding.target}`);
  }
  console.error('Use the local-video shortcode for bundle-local video embeds.');
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--content-dir':
        parsed.contentDir = path.resolve(argv[++index]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return {
    contentDir: parsed.contentDir ?? defaultContentDir
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/check-local-video-shortcodes.js [options]\n\nOptions:\n  --content-dir <path>  Override content directory (default: src/content).\n  --help                Show this help message.\n`);
}

function isExternalTarget(target) {
  return target.startsWith('http://')
    || target.startsWith('https://')
    || target.startsWith('/')
    || target.startsWith('#')
    || target.startsWith('mailto:')
    || target.startsWith('tel:');
}

function offsetToLine(source, offset) {
  const safeOffset = Math.max(0, Math.min(offset, source.length));
  return source.slice(0, safeOffset).split(/\r?\n/u).length;
}

function toRepoRelative(filePath) {
  return path.relative(path.resolve('.'), filePath).split(path.sep).join('/');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
