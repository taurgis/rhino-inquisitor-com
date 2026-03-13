import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const canonicalHost = "https://www.rhino-inquisitor.com";
const validationId = "RHI-054";

const budgets = {
  jsBytes: 50 * 1024,
};

const representativePages = [
  {
    route: "/",
    label: "homepage",
    expectedSchemas: ["WebSite"],
    requiredText: ["Featured Deep Dive", "Latest Posts"],
  },
  {
    route: "/sending-emails-from-sfcc/",
    label: "article",
    expectedSchemas: ["BlogPosting"],
    requiredText: ["Sending Emails from SFCC", "How to Send an Email Programmatically"],
  },
  {
    route: "/category/technical/",
    label: "category",
    expectedSchemas: [],
    requiredText: ["Technical", "archive entries"],
  },
];

const requiredMetaTags = [
  { name: "description", matcher: (tag) => (tag.name ?? "").toLowerCase() === "description" },
  { name: "canonical", matcher: (tag) => (tag.rel ?? "").toLowerCase().split(/\s+/).includes("canonical") && (tag.href ?? "").startsWith(canonicalHost) },
  { name: "og:title", matcher: (tag) => (tag.property ?? "").toLowerCase() === "og:title" },
  { name: "og:description", matcher: (tag) => (tag.property ?? "").toLowerCase() === "og:description" },
  { name: "og:url", matcher: (tag) => (tag.property ?? "").toLowerCase() === "og:url" },
];

const prohibitedLazyPatterns = [
  /data-src=/i,
  /data-lazy=/i,
  /data-lazy-src=/i,
  /data-lazyload=/i,
  /data-bg-src=/i,
];

const prohibitedFrameworkPatterns = [
  /react/i,
  /preact/i,
  /vue/i,
  /angular/i,
  /svelte/i,
  /solid/i,
  /alpine/i,
  /hydrateRoot/i,
  /createRoot/i,
];

function parseAttributes(tag) {
  const attributes = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  for (const match of tag.matchAll(pattern)) {
    const name = match[1]?.toLowerCase();
    if (!name || name === "/") {
      continue;
    }

    if (name === "script" || name === "img" || name === "link" || name === "meta") {
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

function collectScriptEntries(html) {
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  return Array.from(html.matchAll(pattern), (match) => ({
    attributes: parseAttributes(`<script${match[1]}>`),
    content: (match[2] ?? "").trim(),
  }));
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

function stripHtml(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSchemaType(typeValue) {
  if (Array.isArray(typeValue)) {
    return typeValue.flatMap((value) => normalizeSchemaType(value));
  }

  if (typeof typeValue === "string" && typeValue.trim() !== "") {
    return [typeValue.trim()];
  }

  return [];
}

function collectSchemaTypes(node, types) {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectSchemaTypes(item, types);
    }
    return;
  }

  if (!node || typeof node !== "object") {
    return;
  }

  for (const type of normalizeSchemaType(node["@type"])) {
    types.add(type);
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value) || (value && typeof value === "object")) {
      collectSchemaTypes(value, types);
    }
  }
}

function findContainerImageAttributes(html, className) {
  const pattern = new RegExp(
    `class=(?:"[^"]*${className}[^"]*"|'[^']*${className}[^']*'|[^\\s>]*${className}[^\\s>]*)[\\s\\S]*?<img\\b([^>]*)>`,
    "i"
  );
  const match = html.match(pattern);
  if (!match) {
    return null;
  }

  return parseAttributes(`<img${match[1]}>`);
}

async function validateScriptInventory(htmlFiles) {
  const failures = [];

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, "utf8");
    const scripts = collectScriptEntries(html);

    for (const script of scripts) {
      if (!script.attributes.src) {
        continue;
      }

      const asset = assetPathFromSource("/", script.attributes.src);
      if (asset.type === "external") {
        failures.push(`${path.relative(publicDir, filePath)} references an external script (${asset.source})`);
      }
    }
  }

  return failures;
}

function validateMetaCoverage(page, html, links, metaTags) {
  const failures = [];
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    failures.push(`${page.route} is missing a populated <title> tag`);
  }

  for (const requirement of requiredMetaTags) {
    const haystack = requirement.name === "canonical" ? links : metaTags;
    const matched = haystack.some((tag) => requirement.matcher(tag) && (tag.content ?? tag.href ?? "").trim() !== "");
    if (!matched) {
      failures.push(`${page.route} is missing ${requirement.name} in rendered HTML`);
    }
  }

  return failures;
}

function validatePrimaryContent(page, html) {
  const failures = [];

  for (const snippet of page.requiredText) {
    if (!html.includes(snippet)) {
      failures.push(`${page.route} is missing representative mobile-visible content snippet: ${snippet}`);
    }
  }

  if (page.label === "article") {
    const articleBodyMatch = html.match(/<section class=(?:"article-body"|'article-body'|article-body)>([\s\S]*?)<\/section>/i);
    const articleText = stripHtml(articleBodyMatch?.[1] ?? "");
    if (articleText.length < 250) {
      failures.push(`${page.route} article body is unexpectedly thin in the rendered HTML (${articleText.length} characters)`);
    }
  }

  if (page.label === "category") {
    const cardMatches = html.match(/class=(?:"[^"]*article-card[^"]*"|'[^']*article-card[^']*'|[^\s>]*article-card[^\s>]*)/g) ?? [];
    if (cardMatches.length === 0) {
      failures.push(`${page.route} category archive is missing visible article-card results in rendered HTML`);
    }
  }

  return failures;
}

function validateSchema(page, scripts) {
  const failures = [];
  const schemaTypes = new Set();

  for (const script of scripts) {
    if ((script.attributes.type ?? "").toLowerCase() !== "application/ld+json") {
      continue;
    }

    try {
      const parsed = JSON.parse(script.content);
      collectSchemaTypes(parsed, schemaTypes);
    } catch (error) {
      failures.push(`${page.route} has invalid JSON-LD: ${error.message}`);
    }
  }

  for (const schemaType of page.expectedSchemas) {
    if (!schemaTypes.has(schemaType)) {
      failures.push(`${page.route} is missing required JSON-LD type ${schemaType}`);
    }
  }

  return failures;
}

function validateImagePolicy(page, html) {
  const failures = [];

  for (const pattern of prohibitedLazyPatterns) {
    if (pattern.test(html)) {
      failures.push(`${page.route} uses a lazy-load data attribute pattern that can hide mobile content from crawlers`);
      break;
    }
  }

  if (page.label !== "article") {
    return failures;
  }

  const heroImage = findContainerImageAttributes(html, "page-article__hero");
  if (!heroImage) {
    failures.push(`${page.route} is missing the article hero image block in rendered HTML`);
    return failures;
  }

  if (!heroImage.width || !heroImage.height) {
    failures.push(`${page.route} hero image is missing explicit width/height attributes`);
  }

  if ((heroImage.loading ?? "").toLowerCase() === "lazy") {
    failures.push(`${page.route} hero image must not use loading="lazy"`);
  }

  if (!heroImage.srcset || !heroImage.srcset.includes(",")) {
    failures.push(`${page.route} hero image is missing responsive srcset candidates`);
  }

  if (!heroImage.sizes) {
    failures.push(`${page.route} hero image is missing a sizes attribute`);
  }

  return failures;
}

function validateJavaScriptPolicy(page, scripts) {
  const failures = [];

  for (const script of scripts) {
    const scriptIdentifier = script.attributes.src || script.content.slice(0, 80);
    const haystacks = [script.attributes.src ?? "", script.content];

    for (const haystack of haystacks) {
      if (!haystack) {
        continue;
      }

      if (prohibitedFrameworkPatterns.some((pattern) => pattern.test(haystack))) {
        failures.push(`${page.route} appears to load framework-like runtime JS (${scriptIdentifier})`);
        break;
      }
    }
  }

  return failures;
}

async function validateRepresentativePage(page) {
  const htmlPath = routeToHtmlPath(page.route);
  const html = await readFile(htmlPath, "utf8");
  const scripts = collectScriptEntries(html);
  const stylesheets = collectTagAttributes(html, "link").filter((link) =>
    (link.rel ?? "").toLowerCase().split(/\s+/).includes("stylesheet")
  );
  const images = collectTagAttributes(html, "img");
  const links = collectTagAttributes(html, "link");
  const metaTags = collectTagAttributes(html, "meta");

  let jsBytes = 0;
  const failures = [];
  const seenAssets = new Set();

  for (const script of scripts) {
    if (!script.attributes.src) {
      jsBytes += Buffer.byteLength(script.content, "utf8");
      continue;
    }

    const asset = assetPathFromSource(page.route, script.attributes.src);
    if (asset.type === "external") {
      failures.push(`${page.route} references an external script (${asset.source})`);
      continue;
    }

    if (asset.type === "local" && !seenAssets.has(asset.filePath)) {
      jsBytes += await getFileSize(asset.filePath);
      seenAssets.add(asset.filePath);
    }
  }

  for (const stylesheet of stylesheets) {
    if (!stylesheet.href) {
      continue;
    }

    const asset = assetPathFromSource(page.route, stylesheet.href);
    if (asset.type === "external") {
      failures.push(`${page.route} references an external stylesheet (${asset.source})`);
      continue;
    }

    if (asset.type === "local" && !seenAssets.has(asset.filePath)) {
      seenAssets.add(asset.filePath);
    }
  }

  for (const image of images) {
    if (!image.src) {
      continue;
    }

    const asset = assetPathFromSource(page.route, image.src);
    if (asset.type === "external") {
      failures.push(`${page.route} references an external image (${asset.source})`);
      continue;
    }

    if (asset.type === "local" && !seenAssets.has(asset.filePath)) {
      seenAssets.add(asset.filePath);
    }
  }

  if (jsBytes > budgets.jsBytes) {
    failures.push(`${page.route} exceeds JS budget (${formatKb(jsBytes)} KB > ${formatKb(budgets.jsBytes)} KB)`);
  }

  failures.push(...validateMetaCoverage(page, html, links, metaTags));
  failures.push(...validatePrimaryContent(page, html));
  failures.push(...validateSchema(page, scripts));
  failures.push(...validateImagePolicy(page, html));
  failures.push(...validateJavaScriptPolicy(page, scripts));

  return {
    route: page.route,
    label: page.label,
    jsBytes,
    failures,
  };
}

async function main() {
  const htmlFiles = await fg("**/*.html", { cwd: publicDir, absolute: true });
  const failures = [];

  failures.push(...await validateScriptInventory(htmlFiles));

  const pageSummaries = [];
  for (const page of representativePages) {
    const summary = await validateRepresentativePage(page);
    failures.push(...summary.failures);
    pageSummaries.push(summary);
  }

  console.log(`[${validationId}] Representative page asset budgets and mobile parity checks`);
  for (const summary of pageSummaries) {
    console.log(
      `- ${summary.label} ${summary.route} :: JS ${formatKb(summary.jsBytes)} KB`
    );
  }

  if (failures.length > 0) {
    console.error(`[${validationId}] Performance budget validation failed:`);
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`[${validationId}] Asset budget, mobile parity, and markup checks passed.`);
}

main().catch((error) => {
  console.error(`[${validationId}] check-perf-budget failed: ${error.message}`);
  process.exitCode = 1;
});