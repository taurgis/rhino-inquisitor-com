import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const entryFilePath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const lhciExecutable = path.join(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'lhci.cmd' : 'lhci'
);

const profileDefinitions = {
  mobile: {
    profile: 'mobile',
    extraArgs: []
  },
  desktop: {
    profile: 'desktop',
    extraArgs: ['--collect.settings.preset=desktop']
  }
};

function defaultOutputRoot() {
  return path.join(repoRoot, 'validation', 'lhci-report');
}

function profileOutputDir(outputRoot, profileName) {
  return path.join(outputRoot, profileName);
}

function parseArgs(argv) {
  const options = {
    profiles: ['mobile', 'desktop'],
    outputRoot: defaultOutputRoot()
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--profile') {
      const profile = String(argv[index + 1] ?? '').trim();
      if (!profileDefinitions[profile]) {
        throw new Error(`Unknown profile: ${profile}`);
      }
      options.profiles = [profile];
      index += 1;
      continue;
    }

    if (arg === '--output-root') {
      options.outputRoot = path.resolve(argv[index + 1]);
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
  console.log(`Usage: node scripts/phase-8/run-lhci.js [options]

Options:
  --profile <mobile|desktop>  Run only one Lighthouse profile.
  --output-root <path>        Override the LHCI filesystem report root.
  --help                      Show this help message.
`);
}

function runCommand(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(lhciExecutable, args, {
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env
    });

    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (signal) {
        reject(new Error(`LHCI process terminated with signal ${signal}`));
        return;
      }

      resolve(code ?? 1);
    });
  });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function runLhciProfiles(selectedProfiles = ['mobile', 'desktop'], { outputRoot = defaultOutputRoot() } = {}) {
  let exitCode = 0;

  for (const profileName of selectedProfiles) {
    const profile = profileDefinitions[profileName];
    const outputDir = profileOutputDir(outputRoot, profileName);
    const manifestPath = path.join(outputDir, 'manifest.json');

    await fs.rm(outputDir, { recursive: true, force: true });

    const args = [
      'autorun',
      '--config=./lighthouserc.json',
      `--upload.outputDir=${outputDir}`,
      ...profile.extraArgs
    ];

    console.log(`[RHI-088] Running Lighthouse CI for ${profile.profile} profile`);
    const profileExitCode = await runCommand(args);

    if (!(await fileExists(manifestPath))) {
      console.error(`[RHI-088] Missing Lighthouse manifest for ${profile.profile} profile at ${path.relative(repoRoot, manifestPath)}`);
      exitCode = 1;
      continue;
    }

    if (profileExitCode !== 0) {
      exitCode = 1;
    }
  }

  return exitCode;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  process.exitCode = await runLhciProfiles(options.profiles, { outputRoot: options.outputRoot });
}

if (entryFilePath === fileURLToPath(import.meta.url)) {
  await main();
}