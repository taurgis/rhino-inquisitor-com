import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";
import { z } from "zod";

import {
	rawRecordSchema,
	normalizeAbsoluteUrl,
	inferUrlType,
} from "./parse-sitemap.js";

const INPUT_RAW = path.resolve("migration/url-inventory.raw.json");
const INPUT_NORMALIZED = path.resolve("migration/url-inventory.normalized.json");
const OUTPUT_RAW = path.resolve("migration/url-inventory.raw.json");
const OUTPUT_NORMALIZED = path.resolve("migration/url-inventory.normalized.json");
const OUTPUT_SUMMARY = path.resolve("migration/url-discovery.search-console.summary.json");
const OUTPUT_GAPS = path.resolve("migration/url-discovery.search-console.gaps.json");

const URL_TYPE_VALUES = [
	"post",
	"page",
	"category",
	"video",
	"landing",
	"system",
	"attachment",
	"pagination",
	"unknown",
];

const SOURCE_SCHEMA = z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]);

const normalizedRecordSchema = z.object({
	url: z.string().url(),
	path: z.string().min(1),
	source: z.array(z.string().min(1)).min(1),
	url_type: z.enum(URL_TYPE_VALUES),
	http_status: z.number().int().min(100).max(599).nullable(),
	canonical_target: z.string().url().nullable(),
	indexability_signal: z.string().min(1),
	in_sitemap: z.boolean(),
	lastmod: z.string().nullable(),
	has_external_links: z.boolean().nullable(),
	has_organic_traffic: z.boolean().nullable(),
});

const rawInventorySchema = z.array(rawRecordSchema.extend({ source: SOURCE_SCHEMA }));
const normalizedInventorySchema = z.array(normalizedRecordSchema);

const URL_TYPE_PRIORITY = [
	"page",
	"post",
	"category",
	"video",
	"landing",
	"pagination",
	"attachment",
	"system",
	"unknown",
];

function canonicalSort(values) {
	return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function asSourceList(value) {
	return Array.isArray(value) ? value : [value];
}

function toSourceValue(sourceList) {
	const sources = canonicalSort(sourceList);
	return sources.length === 1 ? sources[0] : sources;
}

function getPath(rawUrl) {
	const parsed = new URL(rawUrl);
	return `${parsed.pathname}${parsed.search}`;
}

function toNullableUrl(value) {
	return value ? value : null;
}

function pickMostSpecificType(types) {
	for (const candidate of URL_TYPE_PRIORITY) {
		if (types.includes(candidate)) {
			return candidate;
		}
	}
	return "unknown";
}

function selectLastmod(values) {
	const candidates = values.filter((value) => typeof value === "string" && value.trim() !== "");
	if (candidates.length === 0) {
		return null;
	}
	candidates.sort((a, b) => a.localeCompare(b));
	return candidates[candidates.length - 1];
}

function mergeNullableBoolean(a, b) {
	if (a === true || b === true) {
		return true;
	}
	if (a === false || b === false) {
		return false;
	}
	return null;
}

function parseInteger(value) {
	if (typeof value !== "string") {
		return 0;
	}
	const digits = value.replace(/[^\d-]/g, "");
	if (!digits || digits === "-") {
		return 0;
	}
	const parsed = Number.parseInt(digits, 10);
	return Number.isFinite(parsed) ? parsed : 0;
}

function parseCsvLine(line) {
	const out = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i += 1) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i += 1;
				continue;
			}
			inQuotes = !inQuotes;
			continue;
		}

		if (char === "," && !inQuotes) {
			out.push(current);
			current = "";
			continue;
		}

		current += char;
	}

	out.push(current);
	return out;
}

async function readCsv(filePath) {
	const text = await readFile(filePath, "utf8");
	const lines = text
		.replace(/^\uFEFF/, "")
		.split(/\r?\n/)
		.filter((line) => line.trim() !== "");

	if (lines.length === 0) {
		return { headers: [], rows: [] };
	}

	const headers = parseCsvLine(lines[0]).map((header) => header.trim());
	const rows = lines.slice(1).map((line) => {
		const cols = parseCsvLine(line);
		const row = {};
		for (let i = 0; i < headers.length; i += 1) {
			row[headers[i]] = (cols[i] ?? "").trim();
		}
		return row;
	});

	return { headers, rows };
}

function detectTrafficCsv(csvCandidates) {
	for (const csv of csvCandidates) {
		const firstHeader = (csv.headers[0] || "").toLowerCase();
		if (firstHeader.includes("toppagina") || firstHeader.includes("top page")) {
			return csv;
		}
	}

	return csvCandidates.find((csv) => csv.path.toLowerCase().includes("pagina")) ?? null;
}

function detectLinkTargetCsvs(csvCandidates) {
	return csvCandidates.filter((csv) => {
		const firstHeader = (csv.headers[0] || "").toLowerCase();
		return firstHeader.includes("doelpagina") || firstHeader.includes("target page");
	});
}

function buildTrafficMap(trafficCsv) {
	const firstHeader = trafficCsv.headers[0];
	const clicksHeader = trafficCsv.headers.find((header) => header.toLowerCase().includes("klik")) || "Aantal klikken";
	const impressionsHeader =
		trafficCsv.headers.find((header) => header.toLowerCase().includes("verton")) || "Vertoningen";

	const trafficMap = new Map();
	const badUrls = [];

	for (const row of trafficCsv.rows) {
		const urlRaw = (row[firstHeader] || "").trim();
		if (!urlRaw.startsWith("http")) {
			continue;
		}

		try {
			const normalized = normalizeAbsoluteUrl(urlRaw);
			const clicks = parseInteger(row[clicksHeader]);
			const impressions = parseInteger(row[impressionsHeader]);
			const hasTraffic = clicks > 0 || impressions > 0;

			const existing = trafficMap.get(normalized);
			if (!existing) {
				trafficMap.set(normalized, {
					has_organic_traffic: hasTraffic,
					clicks,
					impressions,
				});
				continue;
			}

			existing.clicks += clicks;
			existing.impressions += impressions;
			existing.has_organic_traffic = existing.has_organic_traffic || hasTraffic;
		} catch {
			badUrls.push(urlRaw);
		}
	}

	return {
		trafficMap,
		badUrls,
	};
}

function buildLinkMap(linkCsvs) {
	const linkMap = new Map();
	const badUrls = [];

	for (const csv of linkCsvs) {
		const firstHeader = csv.headers[0];
		const linksHeader = csv.headers.find((header) => header.toLowerCase().includes("inkomende")) || "Inkomende links";
		const sitesHeader =
			csv.headers.find((header) => header.toLowerCase().includes("sites met links")) ||
			"Sites met links naar jouw site";

		for (const row of csv.rows) {
			const urlRaw = (row[firstHeader] || "").trim();
			if (!urlRaw.startsWith("http")) {
				continue;
			}

			try {
				const normalized = normalizeAbsoluteUrl(urlRaw);
				const inboundLinks = parseInteger(row[linksHeader]);
				const linkingSites = parseInteger(row[sitesHeader]);
				const hasExternalLinks = inboundLinks > 0 || linkingSites > 0;

				const existing = linkMap.get(normalized);
				if (!existing) {
					linkMap.set(normalized, {
						has_external_links: hasExternalLinks,
						inbound_links: inboundLinks,
						linking_sites: linkingSites,
					});
					continue;
				}

				existing.has_external_links = existing.has_external_links || hasExternalLinks;
				existing.inbound_links = Math.max(existing.inbound_links, inboundLinks);
				existing.linking_sites = Math.max(existing.linking_sites, linkingSites);
			} catch {
				badUrls.push(urlRaw);
			}
		}
	}

	return {
		linkMap,
		badUrls,
	};
}

function buildNormalizedFromRaw(rawRecords) {
	const normalizedMap = new Map();

	for (const record of rawRecords) {
		const normalizedUrl = normalizeAbsoluteUrl(record.url);
		const normalizedCanonical = record.canonical_target
			? normalizeAbsoluteUrl(record.canonical_target)
			: null;
		const existing = normalizedMap.get(normalizedUrl);

		if (!existing) {
			normalizedMap.set(normalizedUrl, {
				url: normalizedUrl,
				path: getPath(normalizedUrl),
				source: asSourceList(record.source),
				url_type: record.url_type,
				http_status: record.http_status,
				canonical_target: normalizedCanonical,
				indexability_signal: record.indexability_signal,
				in_sitemap: record.in_sitemap,
				lastmod: record.lastmod,
				has_external_links: record.has_external_links,
				has_organic_traffic: record.has_organic_traffic,
			});
			continue;
		}

		existing.source = canonicalSort([...existing.source, ...asSourceList(record.source)]);
		existing.in_sitemap = existing.in_sitemap || record.in_sitemap;
		existing.lastmod = selectLastmod([existing.lastmod, record.lastmod]);
		existing.url_type = pickMostSpecificType(canonicalSort([existing.url_type, record.url_type]));

		if (existing.http_status == null && record.http_status != null) {
			existing.http_status = record.http_status;
			existing.indexability_signal = record.indexability_signal;
		}

		if (!existing.canonical_target && normalizedCanonical) {
			existing.canonical_target = normalizedCanonical;
		}

		existing.has_organic_traffic = mergeNullableBoolean(existing.has_organic_traffic, record.has_organic_traffic);
		existing.has_external_links = mergeNullableBoolean(existing.has_external_links, record.has_external_links);
	}

	return canonicalSort([...normalizedMap.keys()]).map((key) => {
		const value = normalizedMap.get(key);
		return normalizedRecordSchema.parse({
			...value,
			source: canonicalSort(value.source),
		});
	});
}

async function writeJson(filePath, data) {
	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function runSearchConsoleEnrichment() {
	const startedAt = new Date().toISOString();

	const raw = rawInventorySchema.parse(
		JSON.parse(await readFile(INPUT_RAW, "utf8")),
	);
	const normalizedBefore = normalizedInventorySchema.parse(
		JSON.parse(await readFile(INPUT_NORMALIZED, "utf8")),
	);
	const normalizedBeforeSet = new Set(normalizedBefore.map((record) => record.url));

	const csvFilePaths = await fg("tmp/search-console/*.csv", {
		absolute: true,
		cwd: path.resolve("."),
	});
	if (csvFilePaths.length === 0) {
		throw new Error("No CSV files found under tmp/search-console");
	}

	const csvCandidates = [];
	for (const csvFilePath of csvFilePaths) {
		const parsed = await readCsv(csvFilePath);
		csvCandidates.push({
			path: csvFilePath,
			name: path.basename(csvFilePath),
			headers: parsed.headers,
			rows: parsed.rows,
		});
	}

	const trafficCsv = detectTrafficCsv(csvCandidates);
	if (!trafficCsv) {
		throw new Error("Could not detect Search Console Pages traffic CSV");
	}

	const linkCsvs = detectLinkTargetCsvs(csvCandidates);
	if (linkCsvs.length === 0) {
		throw new Error("Could not detect Search Console Top target pages CSV for links");
	}

	const { trafficMap, badUrls: badTrafficUrls } = buildTrafficMap(trafficCsv);
	const { linkMap, badUrls: badLinkUrls } = buildLinkMap(linkCsvs);

	const enrichedRaw = [];
	const rawNormalizedSet = new Set();

	for (const record of raw) {
		const normalizedUrl = normalizeAbsoluteUrl(record.url);
		rawNormalizedSet.add(normalizedUrl);

		const sourceList = asSourceList(record.source);
		const traffic = trafficMap.get(normalizedUrl);
		const links = linkMap.get(normalizedUrl);

		if (traffic) {
			sourceList.push("search-console:pages");
		}

		if (links?.has_external_links) {
			sourceList.push("search-console:links");
		}

		enrichedRaw.push(
			rawRecordSchema
				.extend({ source: SOURCE_SCHEMA })
				.parse({
					...record,
					source: toSourceValue(sourceList),
					has_organic_traffic: traffic
						? traffic.has_organic_traffic
						: (record.has_organic_traffic ?? false),
					has_external_links: links?.has_external_links
						? true
						: record.has_external_links,
				}),
		);
	}

	const scOnlyPages = [];
	const scOnlyLinkTargets = [];

	for (const [url, traffic] of trafficMap.entries()) {
		if (rawNormalizedSet.has(url)) {
			continue;
		}

		rawNormalizedSet.add(url);
		scOnlyPages.push(url);
		const links = linkMap.get(url);

		enrichedRaw.push(
			rawRecordSchema
				.extend({ source: SOURCE_SCHEMA })
				.parse({
					url,
					path: getPath(url),
					source: toSourceValue([
						"search-console:pages",
						...(links?.has_external_links ? ["search-console:links"] : []),
					]),
					url_type: inferUrlType(url),
					http_status: null,
					canonical_target: null,
					indexability_signal: "unknown",
					in_sitemap: false,
					lastmod: null,
					has_external_links: links?.has_external_links ? true : null,
					has_organic_traffic: traffic.has_organic_traffic,
				}),
		);
	}

	for (const [url] of linkMap.entries()) {
		if (rawNormalizedSet.has(url)) {
			continue;
		}

		rawNormalizedSet.add(url);
		scOnlyLinkTargets.push(url);

		enrichedRaw.push(
			rawRecordSchema
				.extend({ source: SOURCE_SCHEMA })
				.parse({
					url,
					path: getPath(url),
					source: "search-console:links",
					url_type: inferUrlType(url),
					http_status: null,
					canonical_target: null,
					indexability_signal: "unknown",
					in_sitemap: false,
					lastmod: null,
					has_external_links: true,
					has_organic_traffic: false,
				}),
		);
	}

	rawInventorySchema.parse(enrichedRaw);
	const normalizedAfter = buildNormalizedFromRaw(enrichedRaw);
	normalizedInventorySchema.parse(normalizedAfter);

	const normalizedAfterSet = new Set(normalizedAfter.map((record) => record.url));

	const summary = {
		started_at: startedAt,
		completed_at: new Date().toISOString(),
		csv_files_detected: csvCandidates.map((csv) => csv.name),
		traffic_csv: trafficCsv.name,
		link_csvs: linkCsvs.map((csv) => csv.name),
		traffic_urls_detected: trafficMap.size,
		link_target_urls_detected: linkMap.size,
		raw_records_before: raw.length,
		raw_records_after: enrichedRaw.length,
		normalized_records_before: normalizedBefore.length,
		normalized_records_after: normalizedAfter.length,
		matched_traffic_urls_before: [...trafficMap.keys()].filter((url) => normalizedBeforeSet.has(url)).length,
		matched_link_urls_before: [...linkMap.keys()].filter((url) => normalizedBeforeSet.has(url)).length,
		sc_only_pages_added: scOnlyPages.length,
		sc_only_link_targets_added: scOnlyLinkTargets.length,
		bad_traffic_urls: badTrafficUrls,
		bad_link_urls: badLinkUrls,
		field_population: {
			has_organic_traffic: {
				true: normalizedAfter.filter((r) => r.has_organic_traffic === true).length,
				false: normalizedAfter.filter((r) => r.has_organic_traffic === false).length,
				null: normalizedAfter.filter((r) => r.has_organic_traffic == null).length,
			},
			has_external_links: {
				true: normalizedAfter.filter((r) => r.has_external_links === true).length,
				false: normalizedAfter.filter((r) => r.has_external_links === false).length,
				null: normalizedAfter.filter((r) => r.has_external_links == null).length,
			},
		},
	};

	const gaps = {
		traffic_urls_not_in_inventory_before: [...trafficMap.keys()].filter((url) => !normalizedBeforeSet.has(url)),
		link_target_urls_not_in_inventory_before: [...linkMap.keys()].filter((url) => !normalizedBeforeSet.has(url)),
		added_urls_not_in_inventory_before: [...normalizedAfterSet].filter((url) => !normalizedBeforeSet.has(url)),
	};

	await writeJson(OUTPUT_RAW, enrichedRaw);
	await writeJson(OUTPUT_NORMALIZED, normalizedAfter);
	await writeJson(OUTPUT_SUMMARY, summary);
	await writeJson(OUTPUT_GAPS, gaps);

	console.log(`[RHI-002] Search Console traffic file: ${trafficCsv.name}`);
	console.log(`[RHI-002] Search Console link files: ${linkCsvs.map((csv) => csv.name).join(", ")}`);
	console.log(`[RHI-002] Raw records: ${raw.length} -> ${enrichedRaw.length}`);
	console.log(`[RHI-002] Normalized records: ${normalizedBefore.length} -> ${normalizedAfter.length}`);
	console.log(`[RHI-002] has_organic_traffic=true: ${summary.field_population.has_organic_traffic.true}`);
	console.log(`[RHI-002] has_external_links=true: ${summary.field_population.has_external_links.true}`);
	console.log(`[RHI-002] Added SC-only normalized URLs: ${gaps.added_urls_not_in_inventory_before.length}`);
	console.log(`[RHI-002] Wrote ${OUTPUT_RAW}`);
	console.log(`[RHI-002] Wrote ${OUTPUT_NORMALIZED}`);
	console.log(`[RHI-002] Wrote ${OUTPUT_SUMMARY}`);
	console.log(`[RHI-002] Wrote ${OUTPUT_GAPS}`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
	runSearchConsoleEnrichment().catch((error) => {
		console.error(`[RHI-002] enrich-search-console failed: ${error.message}`);
		process.exitCode = 1;
	});
}
