import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const manifestPath = path.join(rootDir, "tmp", "lhci", "manifest.json");
const validationId = "RHI-054";

const representativeRoutes = new Set([
  "/",
  "/sending-emails-from-sfcc/",
  "/category/technical/",
]);

const perfWarnThreshold = 0.75;
const perfErrorThreshold = 0.6;

function normalizeRoute(urlValue) {
  const url = new URL(urlValue);
  if (url.pathname === "") {
    return "/";
  }

  return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
}

function formatScore(score) {
  return `${Math.round(score * 100)}`;
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const representativeRuns = manifest.filter((entry) => entry.isRepresentativeRun);
  const failures = [];
  const warnings = [];
  const seenRoutes = new Set();

  console.log(`[${validationId}] Lighthouse representative run summary`);

  for (const entry of representativeRuns) {
    const route = normalizeRoute(entry.url);
    if (!representativeRoutes.has(route)) {
      continue;
    }

    seenRoutes.add(route);
    const performanceScore = entry.summary?.performance;
    const accessibilityScore = entry.summary?.accessibility;

    console.log(
      `- ${route} :: performance ${formatScore(performanceScore ?? 0)} | accessibility ${formatScore(accessibilityScore ?? 0)}`
    );

    if (typeof performanceScore !== "number") {
      failures.push(`${route} is missing a Lighthouse performance score in tmp/lhci/manifest.json`);
      continue;
    }

    if (performanceScore < perfErrorThreshold) {
      failures.push(`${route} Lighthouse performance score ${formatScore(performanceScore)} is below the blocking threshold of 60`);
      continue;
    }

    if (performanceScore < perfWarnThreshold) {
      warnings.push(`${route} Lighthouse performance score ${formatScore(performanceScore)} is below the advisory threshold of 75`);
    }
  }

  for (const route of representativeRoutes) {
    if (!seenRoutes.has(route)) {
      failures.push(`Missing representative Lighthouse run for ${route}`);
    }
  }

  for (const warning of warnings) {
    console.warn(`[${validationId}] Warning: ${warning}`);
  }

  if (failures.length > 0) {
    console.error(`[${validationId}] Lighthouse report validation failed:`);
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`[${validationId}] Lighthouse report thresholds satisfied.`);
}

main().catch((error) => {
  console.error(`[${validationId}] check-perf-report failed: ${error.message}`);
  process.exitCode = 1;
});