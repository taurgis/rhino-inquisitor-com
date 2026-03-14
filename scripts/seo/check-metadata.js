import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { load as loadHtml } from "cheerio";
import { stringify as stringifyCsv } from "csv-stringify/sync";
import fg from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const canonicalHost = "https://www.rhino-inquisitor.com";

const defaults = {
  publicDir: path.join(repoRoot, "public"),
  reportPath: path.join(repoRoot, "migration", "reports", "phase-5-metadata-report.csv"),
  manifestPath: path.join(repoRoot, "migration", "url-manifest.json")
};

function printHelp() {
  console.log(`Usage: node scripts/seo/check-metadata.js [options]

Options:
  --public-dir <path>  Override the built public directory.
  --report <path>      Override the report CSV path.
  --manifest <path>    Override the manifest JSON path.
  --help               Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--public-dir") {
      options.publicDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--report") {
      options.reportPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--manifest") {
      options.manifestPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--help") {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function routeFromHtmlPath(filePath, publicDir) {
  const relativePath = toPosixPath(path.relative(publicDir, filePath));

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

  if (route === "/404.html") {
    return route;
  }

  return route.endsWith("/") ? route : `${route}/`;
}

function toAbsoluteUrl(route) {
  return new URL(route, `${canonicalHost}/`).toString();
}

function normalizeManifestPath(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) {
    return "";
  }

  return normalizeRoute(trimmed);
}

function parseSitemapRoutes(xmlSource) {
  return new Set(
    [...xmlSource.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
      const url = new URL(match[1].trim());
      return normalizeRoute(url.pathname);
    })
  );
}

function classifyTemplateFamily(route, $) {
  if (route === "/") {
    return "homepage";
  }

  if (route === "/404.html" || route === "/404/") {
    return "404";
  }

  if (/\/page\/\d+\/$/.test(route)) {
    return "pagination";
  }

  if (route.startsWith("/category/")) {
    return "category";
  }

  if ($('meta[property="og:type"]').attr("content") === "article") {
    return "post";
  }

  return "page";
}

function getCanonicalLinks($) {
  return $('link[rel]').filter((_, element) => {
    const rel = ($(element).attr("rel") ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    return rel.includes("canonical");
  });
}

function hasMetaRefresh($) {
  return $('meta[http-equiv]').toArray().some((element) => ($(element).attr("http-equiv") ?? "").toLowerCase() === "refresh");
}

function isIndexable(route, $) {
  if (route === "/404.html" || route === "/404/") {
    return false;
  }

  if (hasMetaRefresh($)) {
    return false;
  }

  const robots = ($('meta[name="robots"]').attr("content") ?? "").toLowerCase();
  return !robots.includes("noindex");
}

function formatMessages(messages) {
  return messages.join(" | ");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const sitemapPath = path.join(options.publicDir, "sitemap.xml");
  const htmlFiles = await fg(["**/*.html"], { cwd: options.publicDir, absolute: true, dot: true });
  if (htmlFiles.length === 0) {
    throw new Error(`No built HTML files found under ${path.relative(repoRoot, options.publicDir) || "."}. Run a production build first.`);
  }

  const manifest = JSON.parse(await readFile(options.manifestPath, "utf8"));
  const canonicalDisallowedPaths = new Set(
    (Array.isArray(manifest) ? manifest : [])
      .filter((entry) => ["merge", "retire"].includes(String(entry?.disposition ?? "")))
      .map((entry) => normalizeManifestPath(entry?.legacy_url))
      .filter(Boolean)
  );

  const sitemapRoutes = parseSitemapRoutes(await readFile(sitemapPath, "utf8"));
  const rows = [];
  const blockingMessages = [];
  const titlesByValue = new Map();
  const descriptionsByValue = new Map();

  for (const htmlFile of htmlFiles) {
    const htmlSource = await readFile(htmlFile, "utf8");
    const $ = loadHtml(htmlSource);
    const route = normalizeRoute(routeFromHtmlPath(htmlFile, options.publicDir));
    const family = classifyTemplateFamily(route, $);
    const title = $("title").first().text().trim();
    const description = ($('meta[name="description"]').attr("content") ?? "").trim();
    const robots = ($('meta[name="robots"]').attr("content") ?? "").trim();
    const canonicalLinks = getCanonicalLinks($);
    const canonicalCount = canonicalLinks.length;
    const canonical = canonicalLinks.first().attr("href")?.trim() ?? "";
    const ogTitle = ($('meta[property="og:title"]').attr("content") ?? "").trim();
    const ogDescription = ($('meta[property="og:description"]').attr("content") ?? "").trim();
    const ogType = ($('meta[property="og:type"]').attr("content") ?? "").trim();
    const ogUrl = ($('meta[property="og:url"]').attr("content") ?? "").trim();
    const ogImage = ($('meta[property="og:image"]').attr("content") ?? "").trim();
    const metaRefresh = hasMetaRefresh($);
    const indexable = isIndexable(route, $);
    const expectedCanonical = indexable ? toAbsoluteUrl(route) : route === "/404.html" ? toAbsoluteUrl(route) : "";
    const failures = [];
    const warnings = [];

    if (route === "/404.html") {
      if (sitemapRoutes.has(route)) {
        failures.push("404 route appears in sitemap.xml");
      }

      if (!robots.toLowerCase().includes("noindex")) {
        failures.push("404 route is missing a noindex robots directive");
      }

      if (canonical) {
        const canonicalRoute = normalizeRoute(new URL(canonical).pathname);
        if (sitemapRoutes.has(canonicalRoute) && canonicalRoute !== "/404.html") {
          failures.push(`404 canonical points to live sitemap URL (${canonical})`);
        }
      }
    }

    if (indexable) {
      if (!title) {
        failures.push("missing non-empty <title>");
      }

      if (!description) {
        failures.push("missing non-empty meta description");
      }

      if (canonicalCount !== 1) {
        failures.push(`expected exactly one canonical tag, found ${canonicalCount}`);
      }

      if (!canonical) {
        failures.push("missing canonical href");
      }

      if (canonical) {
        let canonicalUrl;
        try {
          canonicalUrl = new URL(canonical);
        } catch {
          failures.push(`canonical is not a valid absolute URL (${canonical})`);
        }

        if (canonicalUrl) {
          if (canonicalUrl.protocol !== "https:") {
            failures.push(`canonical is not HTTPS (${canonical})`);
          }

          if (`${canonicalUrl.protocol}//${canonicalUrl.host}` !== canonicalHost) {
            failures.push(`canonical host mismatch (${canonical})`);
          }

          if (canonical !== expectedCanonical) {
            failures.push(`canonical does not match page URL (${canonical} != ${expectedCanonical})`);
          }

          const canonicalRoute = normalizeRoute(canonicalUrl.pathname);
          if (canonicalDisallowedPaths.has(canonicalRoute)) {
            failures.push(`canonical points to redirected or retired manifest URL (${canonical})`);
          }

          if (!sitemapRoutes.has(canonicalRoute)) {
            failures.push(`canonical route is missing from sitemap.xml (${canonical})`);
          }
        }
      }

      if (!ogTitle) {
        failures.push("missing og:title");
      }
      if (!ogDescription) {
        failures.push("missing og:description");
      }
      if (!ogType) {
        failures.push("missing og:type");
      }
      if (!ogUrl) {
        failures.push("missing og:url");
      }
      if (!ogImage) {
        failures.push("missing og:image");
      }

      if (ogUrl && canonical && ogUrl !== canonical) {
        failures.push(`og:url does not match canonical (${ogUrl})`);
      }

      if (title) {
        const routes = titlesByValue.get(title) ?? [];
        routes.push(route);
        titlesByValue.set(title, routes);
      }

      if (description) {
        const routes = descriptionsByValue.get(description) ?? [];
        routes.push(route);
        descriptionsByValue.set(description, routes);
      }
    }

    rows.push({
      route,
      file_path: toPosixPath(path.relative(repoRoot, htmlFile)),
      template_family: family,
      indexable: indexable ? "yes" : "no",
      status: failures.length === 0 ? "pass" : "fail",
      blocking_failures: formatMessages(failures),
      warnings: formatMessages(warnings),
      title,
      description,
      canonical,
      expected_canonical: expectedCanonical,
      robots,
      og_title: ogTitle,
      og_description: ogDescription,
      og_type: ogType,
      og_url: ogUrl,
      og_image: ogImage,
      meta_refresh: metaRefresh ? "yes" : "no"
    });

    for (const failure of failures) {
      blockingMessages.push(`${route}: ${failure}`);
    }
  }

  for (const [title, routes] of titlesByValue.entries()) {
    if (routes.length < 2) {
      continue;
    }

    const duplicateMessage = `duplicate title across ${routes.length} routes (${routes.join(", ")})`;
    for (const row of rows) {
      if (row.title === title && row.indexable === "yes") {
        row.warnings = row.warnings ? `${row.warnings} | ${duplicateMessage}` : duplicateMessage;
      }
    }
  }

  for (const [description, routes] of descriptionsByValue.entries()) {
    if (routes.length < 2) {
      continue;
    }

    const duplicateMessage = `duplicate description across ${routes.length} routes (${routes.join(", ")})`;
    for (const row of rows) {
      if (row.description === description && row.indexable === "yes") {
        row.warnings = row.warnings ? `${row.warnings} | ${duplicateMessage}` : duplicateMessage;
      }
    }
  }

  await mkdir(path.dirname(options.reportPath), { recursive: true });
  await writeFile(
    options.reportPath,
    `${stringifyCsv(rows, {
      header: true,
      columns: [
        "route",
        "file_path",
        "template_family",
        "indexable",
        "status",
        "blocking_failures",
        "warnings",
        "title",
        "description",
        "canonical",
        "expected_canonical",
        "robots",
        "og_title",
        "og_description",
        "og_type",
        "og_url",
        "og_image",
        "meta_refresh"
      ]
    })}\n`,
    "utf8"
  );

  if (blockingMessages.length > 0) {
    console.error("Metadata validation failed:\n");
    for (const message of blockingMessages) {
      console.error(`- ${message}`);
    }
    console.error(`\nReport written to ${path.relative(repoRoot, options.reportPath)}.`);
    process.exitCode = 1;
    return;
  }

  const indexableCount = rows.filter((row) => row.indexable === "yes").length;
  const warningCount = rows.reduce((count, row) => count + (row.warnings ? row.warnings.split(" | ").length : 0), 0);
  console.log(`Metadata validation passed for ${indexableCount} indexable page(s).`);
  console.log(`Report written to ${path.relative(repoRoot, options.reportPath)}.`);
  if (warningCount > 0) {
    console.warn(`Warnings: ${warningCount}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
