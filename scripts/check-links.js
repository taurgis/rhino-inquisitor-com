import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = process.env.CHECK_LINKS_PUBLIC_DIR
  ? path.resolve(process.env.CHECK_LINKS_PUBLIC_DIR)
  : path.join(repoRoot, "public");

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

async function main() {
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
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});