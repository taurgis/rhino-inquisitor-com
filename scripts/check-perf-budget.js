import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const canonicalHost = "https://www.rhino-inquisitor.com";

const budgets = {
  jsBytes: 50 * 1024,
  cssBytes: 30 * 1024,
  imageBytes: 500 * 1024,
};

const representativeRoutes = [
  "/",
  "/phase-3-performance-baseline/",
  "/category/platform/",
];

function parseAttributes(tag) {
  const attributes = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  for (const match of tag.matchAll(pattern)) {
    const name = match[1]?.toLowerCase();
    if (!name || name === "/") {
      continue;
    }

    if (name === "script" || name === "img" || name === "link") {
      continue;
    }

    attributes[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }

  return attributes;
}

function collectTagAttributes(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  return Array.from(html.matchAll(pattern), (match) => parseAttributes(match[0]));
}

function routeToHtmlPath(route) {
  if (route === "/") {
    return path.join(publicDir, "index.html");
  }

  return path.join(publicDir, route.replace(/^\//, ""), "index.html");
}

function normalizeAssetSource(source) {
  if (!source || source.startsWith("data:")) {
    return { type: "inline", value: null };
  }

  if (source.startsWith("//")) {
    return { type: "external", value: source };
  }

  if (source.startsWith("http://") || source.startsWith("https://")) {
    const url = new URL(source);
    if (url.origin === canonicalHost) {
      return { type: "local", value: url.pathname };
    }

    return { type: "external", value: source };
  }

  if (source.startsWith("/")) {
    return { type: "local", value: source };
  }

  return { type: "relative", value: source };
}

function resolveRelativeAsset(pageRoute, source) {
  const pageDir = pageRoute === "/" ? "/" : pageRoute;
  return path.posix.normalize(path.posix.join(pageDir, source));
}

function assetPathFromSource(pageRoute, source) {
  const normalized = normalizeAssetSource(source);

  if (normalized.type === "inline") {
    return { type: "inline", filePath: null, source: null };
  }

  if (normalized.type === "external") {
    return { type: "external", filePath: null, source: normalized.value };
  }

  const pathname = normalized.type === "local"
    ? normalized.value
    : resolveRelativeAsset(pageRoute, normalized.value);

  return {
    type: "local",
    source: pathname,
    filePath: path.join(publicDir, decodeURIComponent(pathname.replace(/^\//, ""))),
  };
}

async function getFileSize(filePath) {
  const fileStat = await stat(filePath);
  return fileStat.size;
}

function formatKb(bytes) {
  return Number((bytes / 1024).toFixed(1));
}

async function validateImageDimensions(htmlFiles) {
  const failures = [];

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, "utf8");
    const images = collectTagAttributes(html, "img");

    for (const image of images) {
      if (!image.src) {
        failures.push(`${path.relative(publicDir, filePath)} has an <img> without src`);
        continue;
      }

      if (!image.width || !image.height) {
        failures.push(
          `${path.relative(publicDir, filePath)} has an <img> without explicit width/height (${image.src})`
        );
      }
    }
  }

  return failures;
}

async function validateRepresentativePage(route) {
  const htmlPath = routeToHtmlPath(route);
  const html = await readFile(htmlPath, "utf8");
  const scripts = collectTagAttributes(html, "script");
  const stylesheets = collectTagAttributes(html, "link").filter((link) =>
    (link.rel ?? "").toLowerCase().split(/\s+/).includes("stylesheet")
  );
  const images = collectTagAttributes(html, "img");

  let jsBytes = 0;
  let cssBytes = 0;
  let imageBytes = 0;
  const failures = [];

  const seenAssets = new Set();

  for (const script of scripts) {
    if (!script.src) {
      continue;
    }

    const asset = assetPathFromSource(route, script.src);
    if (asset.type === "external") {
      failures.push(`${route} references an external script (${asset.source})`);
      continue;
    }

    if (asset.type === "local") {
      if (!seenAssets.has(asset.filePath)) {
        jsBytes += await getFileSize(asset.filePath);
        seenAssets.add(asset.filePath);
      }
    }
  }

  for (const stylesheet of stylesheets) {
    if (!stylesheet.href) {
      continue;
    }

    const asset = assetPathFromSource(route, stylesheet.href);
    if (asset.type === "external") {
      failures.push(`${route} references an external stylesheet (${asset.source})`);
      continue;
    }

    if (asset.type === "local" && !seenAssets.has(asset.filePath)) {
      cssBytes += await getFileSize(asset.filePath);
      seenAssets.add(asset.filePath);
    }
  }

  for (const image of images) {
    if (!image.src) {
      continue;
    }

    const asset = assetPathFromSource(route, image.src);
    if (asset.type === "external") {
      failures.push(`${route} references an external image (${asset.source})`);
      continue;
    }

    if (asset.type === "local" && !seenAssets.has(asset.filePath)) {
      imageBytes += await getFileSize(asset.filePath);
      seenAssets.add(asset.filePath);
    }
  }

  if (jsBytes > budgets.jsBytes) {
    failures.push(`${route} exceeds JS budget (${formatKb(jsBytes)} KB > ${formatKb(budgets.jsBytes)} KB)`);
  }

  if (cssBytes > budgets.cssBytes) {
    failures.push(`${route} exceeds CSS budget (${formatKb(cssBytes)} KB > ${formatKb(budgets.cssBytes)} KB)`);
  }

  if (imageBytes > budgets.imageBytes) {
    failures.push(`${route} exceeds image budget (${formatKb(imageBytes)} KB > ${formatKb(budgets.imageBytes)} KB)`);
  }

  return {
    route,
    jsBytes,
    cssBytes,
    imageBytes,
    failures,
  };
}

async function validateScriptInventory(htmlFiles) {
  const failures = [];

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, "utf8");
    const scripts = collectTagAttributes(html, "script");

    for (const script of scripts) {
      if (!script.src) {
        continue;
      }

      const asset = assetPathFromSource("/", script.src);
      if (asset.type === "external") {
        failures.push(`${path.relative(publicDir, filePath)} references an external script (${asset.source})`);
      }
    }
  }

  return failures;
}

async function main() {
  const htmlFiles = await fg("**/*.html", { cwd: publicDir, absolute: true });
  const failures = [];

  failures.push(...await validateImageDimensions(htmlFiles));
  failures.push(...await validateScriptInventory(htmlFiles));

  const pageSummaries = [];
  for (const route of representativeRoutes) {
    const summary = await validateRepresentativePage(route);
    failures.push(...summary.failures);
    pageSummaries.push(summary);
  }

  console.log("[RHI-026] Representative page asset budgets");
  for (const summary of pageSummaries) {
    console.log(
      `- ${summary.route} :: JS ${formatKb(summary.jsBytes)} KB | CSS ${formatKb(summary.cssBytes)} KB | Images ${formatKb(summary.imageBytes)} KB`
    );
  }

  if (failures.length > 0) {
    console.error("[RHI-026] Performance budget validation failed:");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("[RHI-026] Asset budget and markup checks passed.");
}

main().catch((error) => {
  console.error(`[RHI-026] check-perf-budget failed: ${error.message}`);
  process.exitCode = 1;
});