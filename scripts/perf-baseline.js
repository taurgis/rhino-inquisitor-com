import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const OUTPUT_PATH = path.join(ROOT_DIR, "migration", "phase-1-performance-baseline.md");
const TEMP_OUTPUT_DIR = path.join(ROOT_DIR, "tmp", "phase-1-perf-baseline");

const CRUX_API_KEY = process.env.CRUX_API_KEY;

const TEMPLATE_URLS = [
	{
		template: "homepage",
		url: "https://www.rhino-inquisitor.com/",
		selectionRule: "Fixed homepage URL from ticket AC"
	},
	{
		template: "recent_article",
		url: "https://www.rhino-inquisitor.com/lag-to-riches-a-pwa-kit-developers-guide/",
		selectionRule:
			"Highest non-homepage URL by clicks from 28-day RHI-005 export (migration/phase-1-seo-baseline.md)"
	},
	{
		template: "archive",
		url: "https://www.rhino-inquisitor.com/archive/",
		selectionRule: "Fixed archive URL from ticket AC"
	},
	{
		template: "category",
		url: "https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/",
		selectionRule: "Fixed category URL from ticket AC"
	},
	{
		template: "video",
		url: "https://www.rhino-inquisitor.com/sfcc-introduction/",
		selectionRule: "Fixed video URL from ticket AC"
	}
];

const DEVICE_PROFILES = [
	{ device: "mobile", cruxFormFactor: "PHONE", lighthousePreset: null },
	{ device: "desktop", cruxFormFactor: "DESKTOP", lighthousePreset: "desktop" }
];

const CRUX_METRICS = [
	"largest_contentful_paint",
	"interaction_to_next_paint",
	"cumulative_layout_shift",
	"experimental_time_to_first_byte"
];

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function toKb(bytes) {
	if (!Number.isFinite(bytes)) {
		return null;
	}
	return Number((bytes / 1024).toFixed(1));
}

function toMs(value) {
	if (!Number.isFinite(value)) {
		return null;
	}
	return Number(value.toFixed(0));
}

function toScore(value) {
	if (!Number.isFinite(value)) {
		return null;
	}
	return Math.round(value * 100);
}

function metricP75(recordMetrics, metricName) {
	const metric = recordMetrics?.[metricName];
	if (!metric?.percentiles?.p75 && metric?.percentiles?.p75 !== 0) {
		return null;
	}
	return metric.percentiles.p75;
}

function formatValue(value, unit = "") {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "n/a";
	}
	return `${value}${unit}`;
}

function resourceBytes(item) {
	const transferSize = Number(item?.transferSize);
	if (Number.isFinite(transferSize)) {
		return transferSize;
	}

	const totalBytes = Number(item?.totalBytes);
	if (Number.isFinite(totalBytes)) {
		return totalBytes;
	}

	return 0;
}

function isImageUrl(url) {
	return /\.(avif|gif|jpe?g|png|svg|webp)(?:\?|#|$)/i.test(url);
}

function isScriptUrl(url) {
	return /\.(m?js)(?:\?|#|$)/i.test(url);
}

function countPayloadBytes(items, matcher) {
	if (!Array.isArray(items)) {
		return 0;
	}

	return items.reduce((total, item) => {
		const url = String(item?.url ?? "");
		if (!matcher(url, item)) {
			return total;
		}

		return total + resourceBytes(item);
	}, 0);
}

function getOrigin(url) {
	return new URL(url).origin;
}

async function fetchCruxRecord({ query, formFactor, queryType }) {
	if (!CRUX_API_KEY) {
		return { found: false, reason: "CRUX_API_KEY not provided" };
	}

	const queryField = queryType === "origin" ? { origin: query } : { url: query };
	const requestPayload = {
		...queryField,
		...(formFactor ? { formFactor } : {}),
		metrics: CRUX_METRICS
	};

	const response = await fetch(
		`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(CRUX_API_KEY)}`,
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(requestPayload)
		}
	);

	if (response.status === 404) {
		return { found: false, reason: "CrUX data not found" };
	}

	if (!response.ok) {
		const errorText = await response.text();
		return { found: false, reason: `CrUX API error ${response.status}: ${errorText.slice(0, 80)}` };
	}

	const payload = await response.json();
	return { found: true, payload };
}

async function fetchCruxWithFallback(url, formFactor) {
	const urlResult = await fetchCruxRecord({ query: url, formFactor, queryType: "url" });
	if (urlResult.found) {
		return {
			scope: "url",
			query: url,
			payload: urlResult.payload,
			fallbackReason: null
		};
	}

	const origin = getOrigin(url);
	const originResult = await fetchCruxRecord({ query: origin, formFactor, queryType: "origin" });
	if (originResult.found) {
		return {
			scope: "origin",
			query: origin,
			payload: originResult.payload,
			fallbackReason: "URL-level CrUX data unavailable; used origin-level data"
		};
	}

	const originAggregateResult = await fetchCruxRecord({ query: origin, queryType: "origin" });
	if (originAggregateResult.found) {
		return {
			scope: "origin-aggregate",
			query: origin,
			payload: originAggregateResult.payload,
			fallbackReason:
				"URL-level and form-factor origin CrUX data unavailable; used aggregate origin data (no form factor)"
		};
	}

	return {
		scope: "unavailable",
		query: origin,
		payload: null,
		fallbackReason: originAggregateResult.reason ?? originResult.reason ?? urlResult.reason ?? "CrUX data unavailable"
	};
}

async function runLighthouse(url, { template, device, lighthousePreset }) {
	await fs.mkdir(TEMP_OUTPUT_DIR, { recursive: true });
	const outputFile = path.join(TEMP_OUTPUT_DIR, `${template}-${device}.json`);

	const args = [
		"lighthouse",
		url,
		"--only-categories=performance,accessibility,best-practices,seo",
		"--output=json",
		`--output-path=${outputFile}`,
		"--quiet",
		"--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
		"--no-enable-error-reporting"
	];

	if (lighthousePreset) {
		args.push(`--preset=${lighthousePreset}`);
	}

	await execFile("npx", args, {
		cwd: ROOT_DIR,
		maxBuffer: 1024 * 1024 * 16,
		env: process.env
	});

	const raw = await fs.readFile(outputFile, "utf8");
	const report = JSON.parse(raw);
	const audits = report.audits ?? {};
	const categories = report.categories ?? {};

	const totalBytesAudit = audits["total-byte-weight"];
	const totalBytesItems = totalBytesAudit?.details?.items ?? [];
	const totalBytes = Number(totalBytesAudit?.numericValue);
	const jsBytes = countPayloadBytes(totalBytesItems, (url) => isScriptUrl(url));
	const imageBytes = countPayloadBytes(totalBytesItems, (url) => isImageUrl(url));

	return {
		finalUrl: report.finalUrl ?? url,
		scores: {
			performance: toScore(categories.performance?.score),
			accessibility: toScore(categories.accessibility?.score),
			bestPractices: toScore(categories["best-practices"]?.score),
			seo: toScore(categories.seo?.score)
		},
		metrics: {
			lcpMs: toMs(audits["largest-contentful-paint"]?.numericValue),
			inpMs: toMs(
				audits["interaction-to-next-paint"]?.numericValue ??
					audits["experimental-interaction-to-next-paint"]?.numericValue
			),
			fidMs: toMs(audits["max-potential-fid"]?.numericValue),
			cls: Number.isFinite(audits["cumulative-layout-shift"]?.numericValue)
				? Number(audits["cumulative-layout-shift"].numericValue.toFixed(3))
				: null,
			ttfbMs: toMs(audits["server-response-time"]?.numericValue),
			totalKb: toKb(Number.isFinite(totalBytes) ? totalBytes : jsBytes + imageBytes),
			jsKb: toKb(jsBytes),
			imageKb: toKb(imageBytes)
		}
	};
}

async function runAccessibilityQuickPass(url) {
	const response = await fetch(url, { redirect: "follow" });
	const html = await response.text();

	const hasMain = /<main(\s|>)/i.test(html);
	const hasNav = /<nav(\s|>)/i.test(html);
	const hasHeader = /<header(\s|>)/i.test(html);
	const hasFooter = /<footer(\s|>)/i.test(html);

	const headingMatches = [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
	const startsAtH1 = headingMatches.length > 0 && headingMatches[0] === 1;
	const noSkippedLevels = headingMatches.every((level, index) => {
		if (index === 0) {
			return true;
		}
		const previous = headingMatches[index - 1];
		return level - previous <= 1;
	});

	const headingHierarchyOk = startsAtH1 && noSkippedLevels;

	const imageMatches = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
	const missingAltCount = imageMatches.reduce((count, imgTag) => {
		const altMatch = imgTag.match(/\balt\s*=\s*(["'])(.*?)\1/i);
		if (!altMatch) {
			return count + 1;
		}
		return altMatch[2].trim().length === 0 ? count + 1 : count;
	}, 0);

	const navSection = html.match(/<nav[\s\S]*?<\/nav>/i)?.[0] ?? "";
	const keyboardPathOk = /<a\b/i.test(navSection);

	return {
		url,
		landmarksPass: hasMain && hasNav && hasHeader && hasFooter,
		headingHierarchyPass: headingHierarchyOk,
		missingAltCount,
		keyboardPathPass: keyboardPathOk,
		notes:
			"Keyboard path is a static HTML spot-check for focusable nav links; full keyboard traversal remains a manual follow-up."
	};
}

function collectTemplatePainPoints(rows, a11y) {
	const points = [];
	const worstLcp = Math.max(...rows.map((row) => row.lcpMs ?? 0));
	const worstInp = Math.max(...rows.map((row) => row.inpMs ?? row.fidMs ?? 0));
	const worstCls = Math.max(...rows.map((row) => row.cls ?? 0));
	const worstTtfb = Math.max(...rows.map((row) => row.ttfbMs ?? 0));
	const worstPerfScore = Math.min(...rows.map((row) => row.performanceScore ?? 100));
	const maxJsKb = Math.max(...rows.map((row) => row.jsKb ?? 0));

	if (worstLcp > 2500) {
		points.push(`LCP exceeds good threshold (${worstLcp}ms); prioritize render-path and media optimization.`);
	}

	if (worstInp > 200) {
		points.push(`INP/FID above responsiveness target (${worstInp}ms); reduce main-thread blocking JS.`);
	}

	if (worstCls > 0.1) {
		points.push(`CLS exceeds stability threshold (${worstCls}); reserve media/component dimensions.`);
	}

	if (worstTtfb > 800) {
		points.push(`TTFB is elevated (${worstTtfb}ms); optimize backend/cache response path.`);
	}

	if (maxJsKb > 350) {
		points.push(`JavaScript payload is heavy (${maxJsKb}KB); defer non-critical scripts.`);
	}

	if (!a11y.landmarksPass || !a11y.headingHierarchyPass || a11y.missingAltCount > 0 || !a11y.keyboardPathPass) {
		points.push("Accessibility quick-pass found issues; fix landmarks/headings/alt text/nav focus order.");
	}

	if (worstPerfScore < 70) {
		points.push(`Performance score is low (${worstPerfScore}); prioritize above-the-fold critical path.`);
	}

	while (points.length < 3) {
		points.push("Monitor template in Phase 3 optimization sprint; no critical blocker detected in baseline snapshot.");
	}

	return points.slice(0, 3);
}

function buildMarkdown({ generatedAt, templateRows, a11yByTemplate, painPointsByTemplate }) {
	const header = [
		"# Phase 1 Performance and UX Baseline",
		"",
		`Date captured: ${generatedAt.slice(0, 10)}`,
		"Method: Lighthouse CLI (lab metrics + category scores), CrUX API (field metrics), HTML quick-pass probes",
		"",
		"## Immutability note",
		"",
		"This report is a pre-migration baseline snapshot. After owner sign-off, do not overwrite historical values in this file. Add dated comparison notes instead.",
		"",
		"## Representative URL set",
		"",
		"| Template | URL | Selection rule |",
		"|---|---|---|"
	];

	for (const target of TEMPLATE_URLS) {
		header.push(`| ${target.template} | ${target.url} | ${target.selectionRule} |`);
	}

	const metricsSection = [
		"",
		"## Baseline metrics (lab + field)",
		"",
		"| Template | Device | Measured URL | Final URL | LCP (ms) | INP (ms) | FID fallback (ms) | CLS | TTFB (ms) | Total KB | JS KB | Image KB | Perf | A11y | BP | SEO | CrUX scope | CrUX query | CrUX LCP p75 | CrUX INP p75 | CrUX CLS p75 | CrUX TTFB p75 | CrUX period | Notes |",
		"|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---:|---:|---:|---:|---|---|"
	];

	for (const row of templateRows) {
		metricsSection.push(
			`| ${row.template} | ${row.device} | ${row.measuredUrl} | ${row.finalUrl} | ${formatValue(row.lcpMs)} | ${formatValue(row.inpMs)} | ${formatValue(row.fidMs)} | ${formatValue(row.cls)} | ${formatValue(row.ttfbMs)} | ${formatValue(row.totalKb)} | ${formatValue(row.jsKb)} | ${formatValue(row.imageKb)} | ${formatValue(row.performanceScore)} | ${formatValue(row.accessibilityScore)} | ${formatValue(row.bestPracticesScore)} | ${formatValue(row.seoScore)} | ${row.cruxScope} | ${row.cruxQuery} | ${formatValue(row.cruxLcpP75)} | ${formatValue(row.cruxInpP75)} | ${formatValue(row.cruxClsP75)} | ${formatValue(row.cruxTtfbP75)} | ${row.cruxPeriod ?? "n/a"} | ${row.notes} |`
		);
	}

	const a11ySection = [
		"",
		"## Accessibility quick-pass",
		"",
		"| Template | URL | Landmarks (`main`, `nav`, `header`, `footer`) | Heading hierarchy starts at h1 and no skips | Missing alt images | Keyboard nav spot-check | Notes |",
		"|---|---|---|---|---:|---|---|"
	];

	for (const [template, quickPass] of Object.entries(a11yByTemplate)) {
		a11ySection.push(
			`| ${template} | ${quickPass.url} | ${quickPass.landmarksPass ? "pass" : "fail"} | ${quickPass.headingHierarchyPass ? "pass" : "fail"} | ${quickPass.missingAltCount} | ${quickPass.keyboardPathPass ? "pass" : "fail"} | ${quickPass.notes} |`
		);
	}

	const painPointsSection = [
		"",
		"## Top 3 performance pain points by template",
		""
	];

	for (const [template, points] of Object.entries(painPointsByTemplate)) {
		painPointsSection.push(`### ${template}`);
		painPointsSection.push("");
		painPointsSection.push(`1. ${points[0]}`);
		painPointsSection.push(`2. ${points[1]}`);
		painPointsSection.push(`3. ${points[2]}`);
		painPointsSection.push("");
	}

	const methodology = [
		"## Methodology and caveats",
		"",
		"- Lab metrics and category scores were generated with local Lighthouse CLI (mobile profile + desktop preset).",
		"- CrUX data uses URL-level records first, then origin with form factor, then aggregate origin without form factor.",
		"- CrUX form factors queried: `PHONE` for mobile and `DESKTOP` for desktop.",
		"- TTFB field metric is captured from CrUX `experimental_time_to_first_byte` when available.",
		"- CrUX `NOT_FOUND` is treated as a valid no-data condition per official docs, not a script failure.",
		"- Accessibility quick-pass is a lightweight static check; full keyboard traversal and WCAG conformance remain out of scope for this ticket.",
		"- Raw Lighthouse JSON snapshots are stored in `tmp/phase-1-perf-baseline/` for audit traceability.",
		""
	];

	return [...header, ...metricsSection, ...a11ySection, ...painPointsSection, ...methodology].join("\n");
}

async function main() {
	if (!CRUX_API_KEY) {
		console.warn("[RHI-006] CRUX_API_KEY not set. CrUX field metrics will be marked unavailable.");
	}

	const generatedAt = new Date().toISOString();
	const metricRows = [];
	const a11yByTemplate = {};

	for (const templateEntry of TEMPLATE_URLS) {
		a11yByTemplate[templateEntry.template] = await runAccessibilityQuickPass(templateEntry.url);

		for (const deviceProfile of DEVICE_PROFILES) {
			const lighthouse = await runLighthouse(templateEntry.url, {
				template: templateEntry.template,
				device: deviceProfile.device,
				lighthousePreset: deviceProfile.lighthousePreset
			});
			await sleep(120);
			const crux = await fetchCruxWithFallback(templateEntry.url, deviceProfile.cruxFormFactor);
			await sleep(120);

			const cruxMetrics = crux.payload?.record?.metrics ?? {};
			const collectionPeriod = crux.payload?.record?.collectionPeriod;
			const period =
				collectionPeriod?.firstDate && collectionPeriod?.lastDate
					? `${collectionPeriod.firstDate.year}-${String(collectionPeriod.firstDate.month).padStart(2, "0")}-${String(collectionPeriod.firstDate.day).padStart(2, "0")} to ${collectionPeriod.lastDate.year}-${String(collectionPeriod.lastDate.month).padStart(2, "0")}-${String(collectionPeriod.lastDate.day).padStart(2, "0")}`
					: null;

			metricRows.push({
				template: templateEntry.template,
				device: deviceProfile.device,
				measuredUrl: templateEntry.url,
				finalUrl: lighthouse.finalUrl,
				lcpMs: lighthouse.metrics.lcpMs,
				inpMs: lighthouse.metrics.inpMs,
				fidMs: lighthouse.metrics.inpMs === null ? lighthouse.metrics.fidMs : null,
				cls: lighthouse.metrics.cls,
				ttfbMs: lighthouse.metrics.ttfbMs,
				totalKb: lighthouse.metrics.totalKb,
				jsKb: lighthouse.metrics.jsKb,
				imageKb: lighthouse.metrics.imageKb,
				performanceScore: lighthouse.scores.performance,
				accessibilityScore: lighthouse.scores.accessibility,
				bestPracticesScore: lighthouse.scores.bestPractices,
				seoScore: lighthouse.scores.seo,
				cruxScope: crux.scope,
				cruxQuery: crux.query,
				cruxLcpP75: metricP75(cruxMetrics, "largest_contentful_paint"),
				cruxInpP75: metricP75(cruxMetrics, "interaction_to_next_paint"),
				cruxClsP75: metricP75(cruxMetrics, "cumulative_layout_shift"),
				cruxTtfbP75: metricP75(cruxMetrics, "experimental_time_to_first_byte"),
				cruxPeriod: period,
				notes: crux.fallbackReason ?? "Lab metrics from local Lighthouse CLI"
			});
		}
	}

	const painPointsByTemplate = {};
	for (const template of TEMPLATE_URLS.map((entry) => entry.template)) {
		const rows = metricRows.filter((row) => row.template === template);
		painPointsByTemplate[template] = collectTemplatePainPoints(rows, a11yByTemplate[template]);
	}

	const markdown = buildMarkdown({
		generatedAt,
		templateRows: metricRows,
		a11yByTemplate,
		painPointsByTemplate
	});

	await fs.writeFile(OUTPUT_PATH, markdown, "utf8");

	console.log("[RHI-006] Performance baseline generated.");
	console.log(`Output: ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
	console.log(`Rows captured: ${metricRows.length}`);
}

main().catch((error) => {
	console.error(`[RHI-006] perf-baseline failed: ${error.message}`);
	process.exitCode = 1;
});
