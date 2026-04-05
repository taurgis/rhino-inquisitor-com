import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { load as loadHtml } from "cheerio";
import fg from "fast-glob";
import matter from "gray-matter";
import TurndownService from "turndown";
import { gfm } from "@joplin/turndown-plugin-gfm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

const defaults = {
  publicDir: path.join(repoRoot, "public"),
  llmsFullPath: path.join(repoRoot, "public", "llms-full.txt")
};

function parseArgs(argv) {
  const options = { ...defaults };
  options.keepNoindex = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--public-dir":
        options.publicDir = path.resolve(argv[++index]);
        options.llmsFullPath = path.join(options.publicDir, "llms-full.txt");
        break;
      case "--llms-full":
        options.llmsFullPath = path.resolve(argv[++index]);
        break;
      case "--keep-noindex":
        options.keepNoindex = true;
        break;
      case "--help":
        console.log("Usage: node scripts/seo/generate-llm-artifacts.js [--public-dir <path>] [--llms-full <path>] [--keep-noindex]");
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\r\n?/gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

function detectCodeLanguage(node) {
  const attributeSources = [
    node.getAttribute("class") ?? "",
    node.firstElementChild?.getAttribute?.("class") ?? ""
  ];

  for (const source of attributeSources) {
    const lowerSource = String(source).toLowerCase();
    const match = lowerSource.match(/(?:language-|lang-|brush:\s*)([a-z0-9#+-]+)/u);
    if (match) {
      return match[1];
    }
  }

  return "";
}

function chooseFence(textContent) {
  const maxBacktickRun = Math.max(0, ...[...textContent.matchAll(/`+/gu)].map((match) => match[0].length));
  return "`".repeat(Math.max(3, maxBacktickRun + 1));
}

function createTurndownService() {
  const service = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "```"
  });

  service.use(gfm);

  service.addRule("preformatted-code", {
    filter(node) {
      return node.nodeName?.toLowerCase() === "pre";
    },
    replacement(_content, node) {
      const textContent = normalizeWhitespace(node.textContent ?? "");
      if (!textContent) {
        return "\n\n";
      }

      const language = detectCodeLanguage(node);
      const fence = chooseFence(textContent);
      return `\n\n${fence}${language}\n${textContent}\n${fence}\n\n`;
    }
  });

  return service;
}

function getMetaContent($, key, value) {
  const selector = `meta[${key}="${value}"]`;
  return $(selector).attr("content")?.trim() ?? "";
}

function extractSummaryItems($) {
  return $(".article-summary__list li")
    .toArray()
    .map((item) => normalizeWhitespace($(item).text()))
    .filter(Boolean);
}

function extractArchiveBodyHtml($) {
  const archiveLayout = $(".archive-layout").first();
  if (!archiveLayout.length) {
    return "";
  }

  const description = normalizeWhitespace(archiveLayout.find(".archive-header > p").last().text());
  const resultSummary = normalizeWhitespace(archiveLayout.find(".archive-results__summary").first().text());
  const yearCoverage = archiveLayout.find(".archive-year-group").toArray()
    .map((group) => {
      const year = normalizeWhitespace($(group).find("h3").first().text());
      const count = normalizeWhitespace($(group).find(".archive-year-group__header .surface-note").first().text());

      if (!year) {
        return "";
      }

      return `${escapeHtml(year)}: ${escapeHtml(count || "entries")}`;
    })
    .filter(Boolean);

  const parts = [];

  if (description) {
    parts.push(`<p>${escapeHtml(description)}</p>`);
  }

  if (resultSummary) {
    parts.push(`<p>${escapeHtml(resultSummary)}</p>`);
  }

  if (yearCoverage.length > 0) {
    parts.push(`<h2>Archive Coverage</h2><ul>${yearCoverage.map((item) => `<li>${item}</li>`).join("")}</ul>`);
  }

  return parts.join("");
}

function extractBodyHtml(htmlSource) {
  const $ = loadHtml(htmlSource, { decodeEntities: false });
  const body = $("section.article-body").first();
  if (body.length) {
    const fragment = loadHtml(`<div data-rhi-root>${body.html() ?? ""}</div>`, { decodeEntities: false });
    const root = fragment("[data-rhi-root]");
    root.find("script, style, noscript").remove();
    root.find(".article-callout__label").remove();
    return root.html()?.trim() ?? "";
  }

  return extractArchiveBodyHtml($);
}

function buildContent({ summaryItems, bodyMarkdown }) {
  const parts = [];

  if (summaryItems.length > 0) {
    parts.push(["## Key Takeaways", ...summaryItems.map((item) => `- ${item}`)].join("\n"));
  }

  if (bodyMarkdown) {
    parts.push(bodyMarkdown);
  }

  return `${parts.join("\n\n").trim()}\n`;
}

function normalizeMarkdown(markdownSource) {
  return normalizeWhitespace(markdownSource)
    .replace(/\n{3,}/gu, "\n\n")
    .replace(/[ \t]+\n/gu, "\n")
    .trim();
}

function sortEntries(entries) {
  return [...entries].sort((left, right) => {
    const leftDate = Date.parse(left.data.date ?? 0) || 0;
    const rightDate = Date.parse(right.data.date ?? 0) || 0;

    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    return String(left.data.canonical_url ?? left.data.title).localeCompare(String(right.data.canonical_url ?? right.data.title));
  });
}

function renderLlmsFull(entries) {
  const sections = [];
  const header = [
    "# Rhino Inquisitor Full Corpus",
    "",
    "> Combined Markdown export of all indexable regular pages for large language model ingestion and retrieval.",
    "",
    "Use the canonical HTML URL for attribution. Markdown companion URLs are provided as machine-friendly alternates."
  ].join("\n");

  sections.push(header);

  for (const entry of sortEntries(entries)) {
    const lines = [
      "---",
      "",
      `## ${entry.data.title}`,
      "",
      `Canonical URL: ${entry.data.canonical_url}`,
      `Markdown URL: ${entry.data.markdown_url}`,
      `Content type: ${entry.data.content_type}`
    ];

    if (entry.data.date) {
      lines.push(`Published: ${entry.data.date}`);
    }

    if (entry.data.lastmod) {
      lines.push(`Updated: ${entry.data.lastmod}`);
    }

    if (entry.data.description) {
      lines.push(`Summary: ${entry.data.description}`);
    }

    if (Array.isArray(entry.data.categories) && entry.data.categories.length > 0) {
      lines.push(`Categories: ${entry.data.categories.join(", ")}`);
    }

    if (Array.isArray(entry.data.tags) && entry.data.tags.length > 0) {
      lines.push(`Tags: ${entry.data.tags.join(", ")}`);
    }

    lines.push("", entry.content);
    sections.push(lines.join("\n").trimEnd());
  }

  return `${sections.join("\n\n").trim()}\n`;
}

async function rewriteMarkdownCompanion(mdFilePath, turndownService, options) {
  const htmlFilePath = path.join(path.dirname(mdFilePath), "index.html");
  const [markdownSource, htmlSource] = await Promise.all([
    fs.readFile(mdFilePath, "utf8"),
    fs.readFile(htmlFilePath, "utf8")
  ]);

  const parsedMarkdown = matter(markdownSource);
  const $ = loadHtml(htmlSource, { decodeEntities: false });
  const robots = getMetaContent($, "name", "robots").toLowerCase();

  if (robots.includes("noindex") && !options.keepNoindex) {
    await fs.rm(mdFilePath, { force: true });
    return null;
  }

  const summaryItems = extractSummaryItems($);
  const bodyHtml = extractBodyHtml(htmlSource);
  const bodyMarkdown = normalizeMarkdown(turndownService.turndown(bodyHtml));
  const content = buildContent({ summaryItems, bodyMarkdown });
  const serialized = matter.stringify(content, parsedMarkdown.data);

  await fs.writeFile(mdFilePath, serialized, "utf8");

  return {
    data: parsedMarkdown.data,
    content: content.trim()
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const markdownFiles = (await fg(["**/index.md"], {
    cwd: options.publicDir,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  })).sort((left, right) => left.localeCompare(right));

  if (markdownFiles.length === 0) {
    throw new Error(`No Markdown companion files found under ${options.publicDir}.`);
  }

  const turndownService = createTurndownService();
  const entries = [];

  for (const markdownFile of markdownFiles) {
    const entry = await rewriteMarkdownCompanion(markdownFile, turndownService, options);
    if (entry) {
      entries.push(entry);
    }
  }

  await fs.writeFile(options.llmsFullPath, renderLlmsFull(entries), "utf8");
  console.log(`Generated ${entries.length} cleaned Markdown companion files and refreshed ${path.relative(repoRoot, options.llmsFullPath)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
