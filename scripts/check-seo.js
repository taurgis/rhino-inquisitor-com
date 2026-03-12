import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "public");
const canonicalHost = "https://www.rhino-inquisitor.com";

function parseAttributes(tag) {
  const attributes = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  for (const match of tag.matchAll(pattern)) {
    const name = match[1]?.toLowerCase();
    if (!name || name === "/") {
      continue;
    }

    if (name === "meta" || name === "link") {
      continue;
    }

    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attributes[name] = value;
  }

  return attributes;
}

function findTagAttributes(html, tagName, predicate) {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");

  for (const match of html.matchAll(pattern)) {
    const attributes = parseAttributes(match[0]);
    if (predicate(attributes)) {
      return attributes;
    }
  }

  return null;
}

function getMetaContent(html, key, value) {
  const attributes = findTagAttributes(
    html,
    "meta",
    (candidate) => (candidate[key] ?? "").toLowerCase() === value.toLowerCase()
  );

  return attributes?.content?.trim() ?? "";
}

function getLinkHref(html, relValue) {
  const attributes = findTagAttributes(
    html,
    "link",
    (candidate) => (candidate.rel ?? "").toLowerCase() === relValue.toLowerCase()
  );

  return attributes?.href?.trim() ?? "";
}

function routeFromHtmlPath(filePath) {
  const relativePath = path.relative(publicDir, filePath).replace(/\\/g, "/");

  if (relativePath === "index.html") {
    return "/";
  }

  if (relativePath.endsWith("/index.html")) {
    return `/${relativePath.slice(0, -"index.html".length)}`;
  }

  return `/${relativePath}`;
}

function normalizeRoute(route) {
  if (route === "/") {
    return route;
  }

  return route.endsWith("/") ? route : `${route}/`;
}

function hasMetaRefresh(html) {
  const attributes = findTagAttributes(
    html,
    "meta",
    (candidate) => (candidate["http-equiv"] ?? "").toLowerCase() === "refresh"
  );

  return Boolean(attributes);
}

function readJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script[^>]+type=(?:["']application\/ld\+json["']|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(pattern)) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }

    try {
      blocks.push(JSON.parse(raw));
    } catch (error) {
      throw new Error(`Invalid JSON-LD: ${error.message}`);
    }
  }

  return blocks;
}

function hasRawSchemaType(html, schemaType) {
  const escapedType = schemaType.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`"@type"\\s*:\\s*"${escapedType}"`);
  return pattern.test(html);
}

function flattenSchemaTypes(blocks) {
  return blocks.flatMap((block) => {
    if (Array.isArray(block)) {
      return flattenSchemaTypes(block);
    }

    return [block?.["@type"]].flat().filter(Boolean);
  });
}

function findSchema(blocks, schemaType) {
  for (const block of blocks) {
    if (Array.isArray(block)) {
      const nested = findSchema(block, schemaType);
      if (nested) {
        return nested;
      }
      continue;
    }

    const types = [block?.["@type"]].flat().filter(Boolean);
    if (types.includes(schemaType)) {
      return block;
    }
  }

  return null;
}

function isIsoDateTime(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}

function isIndexablePage(route, html) {
  if (route === "/404/" || route === "/404.html") {
    return false;
  }

  if (route.startsWith("/feed/")) {
    return false;
  }

  if (hasMetaRefresh(html)) {
    return false;
  }

  const robots = getMetaContent(html, "name", "robots").toLowerCase();
  return !robots.includes("noindex");
}

function validateHtmlPage(route, html) {
  const failures = [];
  const title = (html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "").trim();
  const description = getMetaContent(html, "name", "description");
  const canonical = getLinkHref(html, "canonical");
  const robots = getMetaContent(html, "name", "robots");
  const ogTitle = getMetaContent(html, "property", "og:title");
  const ogDescription = getMetaContent(html, "property", "og:description");
  const ogType = getMetaContent(html, "property", "og:type");
  const ogUrl = getMetaContent(html, "property", "og:url");
  const ogImage = getMetaContent(html, "property", "og:image");
  const twitterCard = getMetaContent(html, "name", "twitter:card");
  const twitterTitle = getMetaContent(html, "name", "twitter:title");
  const twitterDescription = getMetaContent(html, "name", "twitter:description");
  const twitterImage = getMetaContent(html, "name", "twitter:image");

  if (!title) failures.push("missing <title>");
  if (!description) failures.push("missing meta description");
  if (!canonical) failures.push("missing canonical");
  if (!robots) failures.push("missing robots meta");
  if (!ogTitle) failures.push("missing og:title");
  if (!ogDescription) failures.push("missing og:description");
  if (!ogType) failures.push("missing og:type");
  if (!ogUrl) failures.push("missing og:url");
  if (!ogImage) failures.push("missing og:image");
  if (!twitterCard) failures.push("missing twitter:card");
  if (!twitterTitle) failures.push("missing twitter:title");
  if (!twitterDescription) failures.push("missing twitter:description");
  if (!twitterImage) failures.push("missing twitter:image");

  if (canonical && !canonical.startsWith(canonicalHost)) {
    failures.push(`canonical host mismatch (${canonical})`);
  }

  if (ogUrl && canonical && ogUrl !== canonical) {
    failures.push("og:url does not match canonical");
  }

  if (ogImage && !ogImage.startsWith(canonicalHost)) {
    failures.push(`og:image host mismatch (${ogImage})`);
  }

  if (twitterImage && !twitterImage.startsWith(canonicalHost)) {
    failures.push(`twitter:image host mismatch (${twitterImage})`);
  }

  let jsonLdBlocks = [];
  try {
    jsonLdBlocks = readJsonLdBlocks(html);
  } catch (error) {
    failures.push(error.message);
    return failures;
  }

  const schemaTypes = flattenSchemaTypes(jsonLdBlocks);
  const websiteSchema = findSchema(jsonLdBlocks, "WebSite");
  const articleSchema = findSchema(jsonLdBlocks, "BlogPosting");
  const breadcrumbSchema = findSchema(jsonLdBlocks, "BreadcrumbList");

  if (route === "/") {
    if (!websiteSchema) {
      const schemaTypeSummary = schemaTypes.length > 0 ? schemaTypes.join(", ") : "none";
      const rawWebsiteMarker = hasRawSchemaType(html, "WebSite") ? "present" : "absent";
      failures.push(`missing WebSite JSON-LD on homepage (schema types: ${schemaTypeSummary}; raw WebSite marker: ${rawWebsiteMarker})`);
    }
    if (articleSchema) {
      failures.push("BlogPosting JSON-LD emitted on homepage");
    }
  }

  if (ogType === "article") {
    if (!articleSchema) {
      failures.push("missing BlogPosting JSON-LD on article page");
    }
    if (websiteSchema) {
      failures.push("WebSite JSON-LD emitted on article page");
    }

    if (articleSchema) {
      if (!isIsoDateTime(articleSchema.datePublished ?? "")) {
        failures.push("BlogPosting datePublished is not ISO 8601 with timezone");
      }
      if (!isIsoDateTime(articleSchema.dateModified ?? "")) {
        failures.push("BlogPosting dateModified is not ISO 8601 with timezone");
      }
    }
  }

  if (route.startsWith("/category/") && route !== "/category/") {
    if (!breadcrumbSchema) {
      failures.push("missing BreadcrumbList JSON-LD on category term page");
    }
    if (schemaTypes.includes("BlogPosting")) {
      failures.push("BlogPosting JSON-LD emitted on category term page");
    }
  }

  return failures;
}

async function main() {
  const failures = [];
  const htmlFiles = await fg(["**/*.html"], { cwd: publicDir, absolute: true });

  if (htmlFiles.length === 0) {
    throw new Error("No built HTML files found under public/.");
  }

  const indexableRoutes = new Set();

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    const route = normalizeRoute(routeFromHtmlPath(htmlFile));

    if (!isIndexablePage(route, html)) {
      continue;
    }

    indexableRoutes.add(route);
    const pageFailures = validateHtmlPage(route, html);
    for (const failure of pageFailures) {
      failures.push(`${route}: ${failure}`);
    }
  }

  const robotsPath = path.join(publicDir, "robots.txt");
  const robots = await readFile(robotsPath, "utf8");
  if (!robots.includes(`Sitemap: ${canonicalHost}/sitemap.xml`)) {
    failures.push("robots.txt: missing canonical sitemap directive");
  }
  if (/^Disallow:\s*\/\s*$/mi.test(robots)) {
    failures.push("robots.txt: production robots.txt blocks the entire site");
  }

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  const sitemap = await readFile(sitemapPath, "utf8");
  const sitemapMatches = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  const sitemapRoutes = new Set(
    sitemapMatches.map((loc) => {
      const url = new URL(loc);
      if (`${url.protocol}//${url.host}` !== canonicalHost) {
        failures.push(`sitemap.xml: non-canonical host ${loc}`);
      }
      return normalizeRoute(url.pathname);
    })
  );

  for (const route of indexableRoutes) {
    if (!sitemapRoutes.has(route)) {
      failures.push(`sitemap.xml: missing route ${route}`);
    }
  }

  for (const route of sitemapRoutes) {
    if (!indexableRoutes.has(route)) {
      failures.push(`sitemap.xml: unexpected route ${route}`);
    }
  }

  if (failures.length > 0) {
    console.error("SEO validation failed:\n");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`SEO validation passed for ${indexableRoutes.size} indexable route(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});