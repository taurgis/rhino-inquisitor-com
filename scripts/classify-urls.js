import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stringify } from "csv-stringify/sync";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const INVENTORY_PATH = path.join(ROOT_DIR, "migration", "url-inventory.normalized.json");
const MANIFEST_JSON_PATH = path.join(ROOT_DIR, "migration", "url-manifest.json");
const MANIFEST_CSV_PATH = path.join(ROOT_DIR, "migration", "url-manifest.csv");
const APPROVAL_QUEUE_CSV_PATH = path.join(
	ROOT_DIR,
	"migration",
	"url-manifest.owner-review-queue.csv"
);
const APPROVAL_SUMMARY_CSV_PATH = path.join(
	ROOT_DIR,
	"migration",
	"url-manifest.owner-review-summary.csv"
);

const URL_CLASS = [
	"post",
	"page",
	"category",
	"video",
	"landing",
	"system",
	"attachment",
	"pagination"
];

const DISPOSITION = ["keep", "merge", "retire"];
const IMPLEMENTATION_LAYER = ["pages-static", "edge-cdn", "dns", "none"];
const PRIORITY = ["critical", "high", "medium", "low"];

const RECORD_SCHEMA = z
	.object({
		legacy_url: z.string().startsWith("/"),
		disposition: z.enum(DISPOSITION),
		target_url: z.string().startsWith("/").nullable(),
		redirect_code: z.union([z.literal(301), z.literal(308), z.null()]),
		reason: z.string().min(1),
		owner: z.string().min(1),
		priority: z.enum(PRIORITY),
		implementation_layer: z.enum(IMPLEMENTATION_LAYER),
		url_class: z.enum(URL_CLASS),
		source: z.string().min(1),
		has_organic_traffic: z.boolean(),
		has_external_links: z.boolean()
	})
	.superRefine((record, ctx) => {
		if (record.disposition === "keep") {
			if (record.target_url !== record.legacy_url) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "keep records must target themselves",
					path: ["target_url"]
				});
			}
			if (record.redirect_code !== null) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "keep records cannot have redirect_code",
					path: ["redirect_code"]
				});
			}
		}

		if (record.disposition === "merge") {
			if (!record.target_url || record.target_url === "/") {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "merge records need a non-homepage target",
					path: ["target_url"]
				});
			}
			if (record.redirect_code === null) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "merge records need redirect_code",
					path: ["redirect_code"]
				});
			}
		}

		if (record.disposition === "retire") {
			if (record.target_url !== null) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "retire records must have null target_url",
					path: ["target_url"]
				});
			}
			if (record.redirect_code !== null) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "retire records must have null redirect_code",
					path: ["redirect_code"]
				});
			}
		}
	});

const MANIFEST_SCHEMA = z.array(RECORD_SCHEMA);

function toPathWithQuery(absoluteUrl) {
	const parsed = new URL(absoluteUrl);
	const pathname = parsed.pathname || "/";
	const search = parsed.search || "";
	return `${pathname}${search}`;
}

function normalizeSource(sourceValues) {
	const normalized = [...new Set(sourceValues ?? [])].sort();
	return normalized.join("|");
}

function hasFileExtension(pathOnly) {
	return /\.[a-z0-9]+$/i.test(pathOnly);
}

function classifyUrlClass(entry, legacyPath) {
	const lowerPath = legacyPath.toLowerCase();
	const source = entry.source ?? [];

	if (source.includes("video-sitemap.xml")) {
		return "video";
	}

	if (lowerPath.includes("attachment_id=") || lowerPath.startsWith("/wp-content/uploads/")) {
		return "attachment";
	}

	if (/\/page\/\d+\/?(?:\?.*)?$/.test(lowerPath) || /^\/archive\/\d+\/?(?:\?.*)?$/.test(lowerPath)) {
		return "pagination";
	}

	if (entry.url_type && URL_CLASS.includes(entry.url_type)) {
		return entry.url_type;
	}

	if (
		lowerPath.includes("?p=") ||
		lowerPath.includes("?s=") ||
		lowerPath.startsWith("/wp-json") ||
		lowerPath.startsWith("/xmlrpc.php") ||
		lowerPath.startsWith("/feed") ||
		lowerPath.endsWith("/feed/") ||
		lowerPath.startsWith("/tag/") ||
		lowerPath.startsWith("/author/") ||
		lowerPath.startsWith("/cdn-cgi/")
	) {
		return "system";
	}

	if (hasFileExtension(lowerPath) && !lowerPath.endsWith(".php") && !lowerPath.endsWith(".xml")) {
		return "attachment";
	}

	return "page";
}

function defaultDisposition(urlClass) {
	if (["post", "page", "category", "video", "landing"].includes(urlClass)) {
		return "keep";
	}
	return "retire";
}

function determinePriority({ hasTraffic, hasLinks, urlClass }) {
	if (hasTraffic && hasLinks) {
		return "critical";
	}
	if (hasTraffic || hasLinks) {
		return "high";
	}
	if (["post", "page", "category", "video", "landing"].includes(urlClass)) {
		return "medium";
	}
	return "low";
}

function buildReason({ disposition, urlClass, hasTraffic, hasLinks, targetPath, legacyPath }) {
	const approvalSuffix = hasTraffic || hasLinks ? " SEO owner approval required." : "";

	if (legacyPath === "/sample-page/") {
		return "WordPress default sample page is retired by policy.";
	}

	if (legacyPath === "/elementor-landing-page-1179/") {
		return "Elementor test landing page retired pending explicit owner keep approval.";
	}

	if (disposition === "keep") {
		return `Class ${urlClass} defaults to keep with canonical path preserved.`;
	}

	if (disposition === "merge") {
		return `Legacy URL redirects to ${targetPath}; map as merge without redirect chain.${approvalSuffix}`;
	}

	return `Class ${urlClass} defaults to retire with 404 behavior unless explicit override is approved.${approvalSuffix}`;
}

function toRecord(entry) {
	const legacyPath = toPathWithQuery(entry.url);
	const targetPath = entry.canonical_target ? toPathWithQuery(entry.canonical_target) : null;
	const urlClass = classifyUrlClass(entry, legacyPath);

	let disposition = defaultDisposition(urlClass);

	if (legacyPath === "/sample-page/" || legacyPath === "/elementor-landing-page-1179/") {
		disposition = "retire";
	}

	if (
		disposition === "retire" &&
		entry.indexability_signal === "redirect" &&
		targetPath &&
		targetPath !== legacyPath &&
		targetPath !== "/"
	) {
		disposition = "merge";
	}

	const hasTraffic = Boolean(entry.has_organic_traffic);
	const hasLinks = Boolean(entry.has_external_links);

	let targetUrl = null;
	let redirectCode = null;
	let implementationLayer = "none";

	if (disposition === "keep") {
		targetUrl = legacyPath;
	}

	if (disposition === "merge") {
		targetUrl = targetPath;
		redirectCode = entry.http_status === 308 ? 308 : 301;
		implementationLayer = "pages-static";
	}

	return {
		legacy_url: legacyPath,
		disposition,
		target_url: targetUrl,
		redirect_code: redirectCode,
		reason: buildReason({
			disposition,
			urlClass,
			hasTraffic,
			hasLinks,
			targetPath,
			legacyPath
		}),
		owner: hasTraffic || hasLinks ? "seo-owner" : "migration-engineer",
		priority: determinePriority({ hasTraffic, hasLinks, urlClass }),
		implementation_layer: implementationLayer,
		url_class: urlClass,
		source: normalizeSource(entry.source),
		has_organic_traffic: hasTraffic,
		has_external_links: hasLinks
	};
}

function validateCoverage(inventory, records) {
	if (inventory.length !== records.length) {
		throw new Error(
			`Coverage mismatch: inventory=${inventory.length}, manifest=${records.length}`
		);
	}

	const duplicates = new Set();
	const seen = new Set();
	for (const record of records) {
		if (seen.has(record.legacy_url)) {
			duplicates.add(record.legacy_url);
		}
		seen.add(record.legacy_url);
	}

	if (duplicates.size > 0) {
		throw new Error(`Duplicate legacy_url values detected: ${[...duplicates].join(", ")}`);
	}
}

function validateRedirectChains(records) {
	const byLegacy = new Map(records.map((record) => [record.legacy_url, record]));
	const chainViolations = [];

	for (const record of records) {
		if (record.disposition === "keep" || !record.target_url) {
			continue;
		}
		const targetRecord = byLegacy.get(record.target_url);
		if (targetRecord && targetRecord.disposition !== "keep") {
			chainViolations.push(`${record.legacy_url} -> ${record.target_url}`);
		}
	}

	if (chainViolations.length > 0) {
		throw new Error(`Redirect chain violations:\n${chainViolations.join("\n")}`);
	}
}

function collapseMergeTargets(records) {
	const byLegacy = new Map(records.map((record) => [record.legacy_url, record]));

	for (const record of records) {
		if (record.disposition !== "merge" || !record.target_url) {
			continue;
		}

		let resolvedTarget = record.target_url;
		const visited = new Set([record.legacy_url]);

		while (resolvedTarget) {
			if (visited.has(resolvedTarget)) {
				resolvedTarget = null;
				break;
			}

			visited.add(resolvedTarget);
			const targetRecord = byLegacy.get(resolvedTarget);

			if (!targetRecord || targetRecord.disposition === "keep") {
				break;
			}

			if (targetRecord.disposition === "retire" || !targetRecord.target_url) {
				resolvedTarget = null;
				break;
			}

			resolvedTarget = targetRecord.target_url;
		}

		if (!resolvedTarget || resolvedTarget === "/" || resolvedTarget === record.legacy_url) {
			record.disposition = "retire";
			record.target_url = null;
			record.redirect_code = null;
			record.implementation_layer = "none";
			record.reason = "Retired because redirect target could not be resolved to a final keep URL without chaining.";
			continue;
		}

		record.target_url = resolvedTarget;
	}
}

function toCsv(records) {
	const columns = [
		"legacy_url",
		"disposition",
		"target_url",
		"redirect_code",
		"reason",
		"owner",
		"priority",
		"implementation_layer",
		"url_class",
		"source",
		"has_organic_traffic",
		"has_external_links"
	];

	return stringify(records, {
		header: true,
		columns
	});
}

function toApprovalQueue(records) {
	return records
		.filter(
			(record) =>
				["merge", "retire"].includes(record.disposition) &&
				(record.has_organic_traffic || record.has_external_links)
		)
		.map((record) => ({
			legacy_url: record.legacy_url,
			disposition: record.disposition,
			target_url: record.target_url,
			url_class: record.url_class,
			priority: record.priority,
			has_organic_traffic: record.has_organic_traffic ? "true" : "false",
			has_external_links: record.has_external_links ? "true" : "false",
			implementation_layer: record.implementation_layer,
			owner: record.owner,
			reason: record.reason
		}))
		.sort(
			(a, b) =>
				a.url_class.localeCompare(b.url_class) ||
				a.priority.localeCompare(b.priority) ||
				a.legacy_url.localeCompare(b.legacy_url)
		);
}

function toApprovalSummary(queueRecords) {
	const grouped = new Map();

	for (const record of queueRecords) {
		const key = `${record.url_class}|${record.priority}|${record.disposition}`;
		const current = grouped.get(key) ?? {
			url_class: record.url_class,
			priority: record.priority,
			disposition: record.disposition,
			record_count: 0,
			with_organic_traffic: 0,
			with_external_links: 0,
			with_both_signals: 0
		};

		current.record_count += 1;
		if (record.has_organic_traffic) {
			current.with_organic_traffic += 1;
		}
		if (record.has_external_links) {
			current.with_external_links += 1;
		}
		if (record.has_organic_traffic && record.has_external_links) {
			current.with_both_signals += 1;
		}

		grouped.set(key, current);
	}

	return [...grouped.values()].sort(
		(a, b) =>
			a.url_class.localeCompare(b.url_class) ||
			a.priority.localeCompare(b.priority) ||
			a.disposition.localeCompare(b.disposition)
	);
}

function toApprovalQueueCsv(records) {
	return stringify(records, {
		header: true,
		columns: [
			"legacy_url",
			"disposition",
			"target_url",
			"url_class",
			"priority",
			"has_organic_traffic",
			"has_external_links",
			"implementation_layer",
			"owner",
			"reason"
		]
	});
}

function toApprovalSummaryCsv(records) {
	return stringify(records, {
		header: true,
		columns: [
			"url_class",
			"priority",
			"disposition",
			"record_count",
			"with_organic_traffic",
			"with_external_links",
			"with_both_signals"
		]
	});
}

async function run() {
	const inventoryRaw = await fs.readFile(INVENTORY_PATH, "utf8");
	const inventory = JSON.parse(inventoryRaw);

	const records = inventory.map(toRecord);
	collapseMergeTargets(records);
	records.sort((a, b) => a.legacy_url.localeCompare(b.legacy_url));

	validateCoverage(inventory, records);
	validateRedirectChains(records);
	MANIFEST_SCHEMA.parse(records);

	await fs.writeFile(MANIFEST_JSON_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
	await fs.writeFile(MANIFEST_CSV_PATH, toCsv(records), "utf8");

	const approvalQueueRecords = toApprovalQueue(records);
	const approvalSummaryRecords = toApprovalSummary(approvalQueueRecords);

	await fs.writeFile(
		APPROVAL_QUEUE_CSV_PATH,
		toApprovalQueueCsv(approvalQueueRecords),
		"utf8"
	);
	await fs.writeFile(
		APPROVAL_SUMMARY_CSV_PATH,
		toApprovalSummaryCsv(approvalSummaryRecords),
		"utf8"
	);

	const dispositionCounts = records.reduce((acc, record) => {
		acc[record.disposition] = (acc[record.disposition] || 0) + 1;
		return acc;
	}, {});

	const classCounts = records.reduce((acc, record) => {
		acc[record.url_class] = (acc[record.url_class] || 0) + 1;
		return acc;
	}, {});

	const approvalQueue = records.filter(
		(record) =>
			["merge", "retire"].includes(record.disposition) &&
			(record.has_organic_traffic || record.has_external_links)
	).length;

	console.log(
		JSON.stringify(
			{
				generated: {
					json: path.relative(ROOT_DIR, MANIFEST_JSON_PATH),
					csv: path.relative(ROOT_DIR, MANIFEST_CSV_PATH),
					owner_review_queue_csv: path.relative(ROOT_DIR, APPROVAL_QUEUE_CSV_PATH),
					owner_review_summary_csv: path.relative(ROOT_DIR, APPROVAL_SUMMARY_CSV_PATH)
				},
				totals: {
					inventory: inventory.length,
					manifest: records.length,
					approval_queue: approvalQueue
				},
				disposition_counts: dispositionCounts,
				url_class_counts: classCounts
			},
			null,
			2
		)
	);
}

run().catch((error) => {
	console.error(`[RHI-004] classify-urls failed: ${error.message}`);
	process.exitCode = 1;
});
