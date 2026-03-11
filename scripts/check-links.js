import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = process.env.CHECK_LINKS_PUBLIC_DIR
  ? path.resolve(process.env.CHECK_LINKS_PUBLIC_DIR)
  : path.join(repoRoot, "public");
const manifestPath = process.env.CHECK_LINKS_MANIFEST
  ? path.resolve(process.env.CHECK_LINKS_MANIFEST)
  : path.join(repoRoot, "migration", "url-manifest.json");
const allowManifestTargets = process.env.CHECK_LINKS_ALLOW_MANIFEST_TARGETS === "1";

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function routeFromHtmlPath(filePath) {
  const relativePath = toPosixPath(path.relative(publicDir, filePath));

  if (relativePath === "index.html") {
    return "/";
  }

  if (relativePath.endsWith("/index.html")) {
    return `/${relativePath.slice(0, -"index.html".length)}`;
  }

  return `/${relativePath}`;
}

function extractInternalHrefs(htmlSource) {
  const hrefs = [];
  const anchorPattern = /<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

  for (const match of htmlSource.matchAll(anchorPattern)) {
    const href = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (!href || href.startsWith("#") || href.startsWith("//")) {
      continue;
    }

    if (!href.startsWith("/")) {
      continue;
    }

    hrefs.push(href);
  }

  return hrefs;
}

function toTargetPathname(href) {
  try {
    const url = new URL(href, "https://www.rhino-inquisitor.com");
    return decodeURIComponent(url.pathname);
  } catch {
    return href.split("#", 1)[0]?.split("?", 1)[0] ?? href;
  }
}

function buildCandidatePaths(pathname) {
  if (pathname === "/") {
    return ["index.html"];
  }

  const normalizedPath = pathname.replace(/\/{2,}/g, "/");
  const trimmedPath = normalizedPath.replace(/^\//, "");

  if (normalizedPath.endsWith("/")) {
    return [`${trimmedPath}index.html`];
  }

  if (path.posix.extname(trimmedPath)) {
    return [trimmedPath];
  }

  return [trimmedPath, `${trimmedPath}.html`, `${trimmedPath}/index.html`];
}

async function loadAllowedManifestTargets() {
  if (!allowManifestTargets) {
    return new Set();
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const allowedTargets = new Set();

  for (const row of Array.isArray(manifest) ? manifest : []) {
    if (!["keep", "merge"].includes(row?.disposition)) {
      continue;
    }

    const targetUrl = typeof row?.target_url === "string" ? row.target_url.trim() : "";
    if (!targetUrl.startsWith("/")) {
      continue;
    }

    const normalizedTarget = targetUrl === "/"
      ? "/"
      : targetUrl.endsWith("/")
        ? targetUrl
        : `${targetUrl}/`;
    allowedTargets.add(normalizedTarget);
  }

  return allowedTargets;
}

async function main() {
  const allowedManifestTargets = await loadAllowedManifestTargets();
  const htmlFiles = await fg("**/*.html", {
    cwd: publicDir,
    absolute: true,
    dot: true
  });

  if (htmlFiles.length === 0) {
    throw new Error(`No HTML files found under ${publicDir}. Run a production build first.`);
  }

  const existingPaths = new Set(
    (
      await fg("**/*", {
        cwd: publicDir,
        onlyFiles: true,
        dot: true
      })
    ).map((entry) => toPosixPath(entry))
  );
  const failures = [];

  for (const htmlFile of htmlFiles) {
    const htmlSource = await readFile(htmlFile, "utf8");
    const sourceRoute = routeFromHtmlPath(htmlFile);

    for (const href of extractInternalHrefs(htmlSource)) {
      const pathname = toTargetPathname(href);
      const candidatePaths = buildCandidatePaths(pathname);
      const exists = candidatePaths.some((candidatePath) => existingPaths.has(candidatePath));

      const normalizedPathname = pathname === "/"
        ? "/"
        : pathname.endsWith("/")
          ? pathname
          : `${pathname}/`;

      if (!exists && allowManifestTargets && allowedManifestTargets.has(normalizedPathname)) {
        continue;
      }

      if (!exists) {
        failures.push({
          sourceRoute,
          href,
          expectedPaths: candidatePaths.map((candidatePath) => `public/${candidatePath}`)
        });
      }
    }
  }

  if (failures.length > 0) {
    console.error(`Broken internal links found: ${failures.length}`);
    for (const failure of failures) {
      console.error(`- ${failure.sourceRoute} -> ${failure.href}`);
      console.error(`  Expected one of: ${failure.expectedPaths.join(", ")}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Internal link check passed across ${htmlFiles.length} HTML files.`);
  if (allowManifestTargets) {
    console.log(`Manifest-backed unresolved targets were allowed using ${path.relative(repoRoot, manifestPath) || manifestPath}.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});