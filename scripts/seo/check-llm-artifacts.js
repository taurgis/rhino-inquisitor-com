import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const defaultPublicDir = path.join(repoRoot, "public");
const defaultReportPath = path.join(repoRoot, "validation", "llm-artifact-quality-report.json");

function parseArgs(argv) {
  const options = {
    publicDir: defaultPublicDir,
    reportPath: defaultReportPath
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--public-dir":
        options.publicDir = path.resolve(argv[++index]);
        break;
      case "--report":
        options.reportPath = path.resolve(argv[++index]);
        break;
      case "--help":
        console.log("Usage: node scripts/seo/check-llm-artifacts.js [--public-dir <path>] [--report <path>]");
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function countMatches(source, expression) {
  return [...source.matchAll(expression)].length;
}

async function writeReport(reportPath, report) {
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const failures = [];
  const llmsPath = path.join(options.publicDir, "llms.txt");
  const llmsFullPath = path.join(options.publicDir, "llms-full.txt");
  const markdownFiles = (await fg(["**/index.md"], {
    cwd: options.publicDir,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  })).sort((left, right) => left.localeCompare(right));

  const report = {
    generatedAt: new Date().toISOString(),
    publicDir: path.relative(repoRoot, options.publicDir),
    llms: {
      path: path.relative(repoRoot, llmsPath),
      present: false,
      hasFullCorpusReference: false
    },
    llmsFull: {
      path: path.relative(repoRoot, llmsFullPath),
      present: false,
      hasRawShortcodes: false
    },
    summary: {
      markdownCompanionCount: markdownFiles.length,
      filesWithFailures: 0,
      filesWithCodeBlocks: 0,
      filesWithImages: 0,
      filesWithBlockquotes: 0,
      filesWithLists: 0,
      sampledComplexRoutes: []
    },
    files: [],
    failures
  };

  const [llmsSource, llmsFullSource] = await Promise.all([
    readFile(llmsPath, "utf8"),
    readFile(llmsFullPath, "utf8")
  ]);

  report.llms.present = true;
  report.llmsFull.present = true;

  if (!llmsSource.includes("LLM Full Corpus")) {
    failures.push("public/llms.txt: missing LLM Full Corpus reference");
  } else {
    report.llms.hasFullCorpusReference = true;
  }

  if (/\{\{[%<]/u.test(llmsFullSource)) {
    failures.push("public/llms-full.txt: contains raw Hugo shortcode syntax");
    report.llmsFull.hasRawShortcodes = true;
  }

  if (markdownFiles.length === 0) {
    failures.push("public: no Markdown companion files were generated");
  }

  for (const markdownFile of markdownFiles) {
    const source = await readFile(markdownFile, "utf8");
    const relativePath = path.relative(repoRoot, markdownFile);
    const parsed = matter(source);
    const body = parsed.content.trim();
    const fileFindings = [];
    const metrics = {
      headingCount: countMatches(body, /^#{1,6}\s/gmu),
      listItemCount: countMatches(body, /^\s*-\s/gmu),
      blockquoteCount: countMatches(body, /^\s*>\s/gmu),
      codeFenceCount: countMatches(body, /^```/gmu) / 2,
      imageCount: countMatches(body, /!\[[^\]]*\]\([^)]*\)/gu),
      linkCount: countMatches(body, /\[[^\]]+\]\([^)]*\)/gu),
      bodyLength: body.length
    };

    if (/\{\{[%<]/u.test(source)) {
      failures.push(`${relativePath}: contains raw Hugo shortcode syntax`);
      fileFindings.push("raw shortcode syntax present");
    }

    if (!parsed.data.canonical_url) {
      failures.push(`${relativePath}: missing canonical_url front matter`);
      fileFindings.push("missing canonical_url front matter");
    }

    if (!parsed.data.markdown_url) {
      failures.push(`${relativePath}: missing markdown_url front matter`);
      fileFindings.push("missing markdown_url front matter");
    }

    if (!body) {
      failures.push(`${relativePath}: empty Markdown body`);
      fileFindings.push("empty Markdown body");
    }

    if (metrics.codeFenceCount > 0) {
      report.summary.filesWithCodeBlocks += 1;
    }

    if (metrics.imageCount > 0) {
      report.summary.filesWithImages += 1;
    }

    if (metrics.blockquoteCount > 0) {
      report.summary.filesWithBlockquotes += 1;
    }

    if (metrics.listItemCount > 0) {
      report.summary.filesWithLists += 1;
    }

    if (fileFindings.length > 0) {
      report.summary.filesWithFailures += 1;
    }

    report.files.push({
      path: relativePath,
      canonicalUrl: parsed.data.canonical_url ?? "",
      markdownUrl: parsed.data.markdown_url ?? "",
      title: parsed.data.title ?? "",
      findings: fileFindings,
      metrics
    });
  }

  report.summary.sampledComplexRoutes = [...report.files]
    .sort((left, right) => {
      const leftScore = left.metrics.codeFenceCount + left.metrics.imageCount + left.metrics.blockquoteCount + left.metrics.linkCount;
      const rightScore = right.metrics.codeFenceCount + right.metrics.imageCount + right.metrics.blockquoteCount + right.metrics.linkCount;
      return rightScore - leftScore;
    })
    .slice(0, 15)
    .map((entry) => ({
      path: entry.path,
      canonicalUrl: entry.canonicalUrl,
      metrics: entry.metrics,
      findings: entry.findings
    }));

  await writeReport(options.reportPath, report);

  if (failures.length > 0) {
    console.error("LLM artifact validation failed:\n");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    console.error(`\nReport written to ${path.relative(repoRoot, options.reportPath)}.`);
    process.exitCode = 1;
    return;
  }

  console.log(`LLM artifact quality report written to ${path.relative(repoRoot, options.reportPath)}.`);
  console.log(`LLM artifact validation passed for ${markdownFiles.length} Markdown companion file(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
