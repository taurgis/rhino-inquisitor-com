import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pLimit from "p-limit";
import { fetch } from "undici";
import { z } from "zod";

import {
	BASE_ORIGIN,
	fetchSitemapInventory,
	inferIndexabilitySignal,
	inferUrlType,
	normalizeAbsoluteUrl,
	rawRecordSchema,
	toAbsoluteUrl,
} from "./parse-sitemap.js";

const CANONICAL_HOST = "www.rhino-inquisitor.com";
const ALT_HOST = "rhino-inquisitor.com";

const OUTPUT_RAW = path.resolve("migration/url-inventory.raw.json");
const OUTPUT_NORMALIZED = path.resolve("migration/url-inventory.normalized.json");
const OUTPUT_SUMMARY = path.resolve("migration/url-discovery.crawl.summary.json");

const DEFAULT_DEPTH = Number(process.env.RHI_CRAWL_DEPTH ?? "2");
const DEFAULT_CONCURRENCY = Number(process.env.RHI_CRAWL_CONCURRENCY ?? "6");
const DEFAULT_MAX_CRAWL_URLS = Number(process.env.RHI_CRAWL_MAX_URLS ?? "1800");
const REQUEST_TIMEOUT_MS = Number(process.env.RHI_REQUEST_TIMEOUT_MS ?? "12000");

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

const ROUTE_PROBES = [
	"/feed/",
	"/comments/feed/",
	"/wp-json/",
	"/xmlrpc.php",
	"/author/admin/",
	"/author/thomas-theunen/",
	"/search/sfcc/",
	"/page/2/",
	"/page/3/",
];

const ARCHIVE_SEEDS = ["/", "/blog/", "/archive/", "/archives/"];
const FOOTER_UTILITY_SEEDS = [
	"/about/",
	"/contact/",
	"/privacy-policy/",
	"/terms-of-service/",
	"/terms-and-conditions/",
	"/disclaimer/",
	"/video/",
];

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

const redirectStatuses = new Set([301, 302, 303, 307, 308]);

function isInternalHost(hostname) {
	return hostname === CANONICAL_HOST || hostname === ALT_HOST;
}

function canonicalSort(values) {
	return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function asSourceList(value) {
	return Array.isArray(value) ? value : [value];
}

function getPath(rawUrl) {
	const parsed = new URL(rawUrl);
	return `${parsed.pathname}${parsed.search}`;
}

function toUrlOrNull(value) {
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

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		return await fetch(url, {
			...options,
			signal: controller.signal,
			headers: {
				"user-agent": "rhino-inquisitor-url-inventory/0.1",
				accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
				...(options.headers ?? {}),
			},
		});
	} finally {
		clearTimeout(timer);
	}
}

function extractInternalLinks(html, currentUrl) {
	const links = new Set();
	const hrefPattern = /href\s*=\s*(["'])(.*?)\1/gi;
	let match = hrefPattern.exec(html);

	while (match) {
		const href = match[2]?.trim();

		if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
			match = hrefPattern.exec(html);
			continue;
		}

		try {
			const absolute = new URL(href, currentUrl);
			absolute.hash = "";

			if (isInternalHost(absolute.hostname)) {
				links.add(absolute.toString());
			}
		} catch {
			// Ignore malformed href values.
		}

		match = hrefPattern.exec(html);
	}

	return [...links];
}

async function crawlInternalUrls(seeds, {
	maxDepth = DEFAULT_DEPTH,
	concurrency = DEFAULT_CONCURRENCY,
	maxUrls = DEFAULT_MAX_CRAWL_URLS,
} = {}) {
	const queue = seeds.map((url) => ({ url, depth: 0, source: "crawl:seed" }));
	const seenNormalized = new Set();
	const discovered = [];
	const limit = pLimit(concurrency);

	while (queue.length > 0 && discovered.length < maxUrls) {
		const batch = queue.splice(0, concurrency);
		const tasks = batch.map((item) =>
			limit(async () => {
				let normalized;
				try {
					normalized = normalizeAbsoluteUrl(item.url);
				} catch {
					return;
				}

				if (seenNormalized.has(normalized)) {
					return;
				}

				seenNormalized.add(normalized);
				discovered.push({
					url: item.url,
					source: item.source,
					depth: item.depth,
				});

				if (item.depth >= maxDepth) {
					return;
				}

				try {
					const response = await fetchWithTimeout(item.url, { redirect: "follow" });
					const contentType = response.headers.get("content-type") || "";

					if (!contentType.includes("text/html")) {
						return;
					}

					const html = await response.text();
					const links = extractInternalLinks(html, response.url || item.url);

					for (const link of links) {
						queue.push({ url: link, depth: item.depth + 1, source: `crawl:depth:${item.depth + 1}` });
					}
				} catch {
					// Probe failures are captured later by HTTP probing for inventory records.
				}

				await sleep(40 + Math.floor(Math.random() * 120));
			}),
		);

		await Promise.all(tasks);
	}

	return discovered;
}

async function probeUrl(url, { maxHops = 10 } = {}) {
	const visited = new Set();
	let current = url;
	let firstStatus = null;
	let finalStatus = null;
	let hopCount = 0;

	while (hopCount <= maxHops) {
		if (visited.has(current)) {
			break;
		}
		visited.add(current);

		const response = await fetchWithTimeout(current, {
			method: "GET",
			redirect: "manual",
		});

		const status = response.status;
		if (firstStatus == null) {
			firstStatus = status;
		}
		finalStatus = status;

		if (!redirectStatuses.has(status)) {
			break;
		}

		const location = response.headers.get("location");
		if (!location) {
			break;
		}

		const nextUrl = new URL(location, current).toString();
		current = nextUrl;
		hopCount += 1;
	}

	return {
		http_status: firstStatus,
		final_status: finalStatus,
		canonical_target: current,
		redirect_hops: hopCount,
	};
}

async function writeJson(filePath, data) {
	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function buildSeedUrlsFromSitemap(sitemapRecords) {
	const categories = sitemapRecords
		.filter((record) => record.source === "category-sitemap.xml")
		.map((record) => record.url);

	const recentPosts = [...sitemapRecords]
		.filter((record) => record.source === "post-sitemap.xml")
		.sort((a, b) => (b.lastmod || "").localeCompare(a.lastmod || ""))
		.slice(0, 15)
		.map((record) => record.url);

	const archiveSeeds = ARCHIVE_SEEDS.map((seed) => new URL(seed, BASE_ORIGIN).toString());
	const utilitySeeds = FOOTER_UTILITY_SEEDS.map((seed) => new URL(seed, BASE_ORIGIN).toString());

	return canonicalSort([
		...archiveSeeds,
		...utilitySeeds,
		...categories,
		...recentPosts,
	]);
}

function buildSystemProbeUrls() {
	return ROUTE_PROBES.map((probe) => new URL(probe, BASE_ORIGIN).toString());
}

function appendRawRecord(records, {
	url,
	source,
	inSitemap,
	lastmod = null,
	urlType,
}) {
	const absoluteUrl = toAbsoluteUrl(url);
	records.push(
		rawRecordSchema.parse({
			url: absoluteUrl,
			path: getPath(absoluteUrl),
			source,
			url_type: urlType || inferUrlType(absoluteUrl, inSitemap ? source : ""),
			http_status: null,
			canonical_target: null,
			indexability_signal: "unknown",
			in_sitemap: inSitemap,
			lastmod,
			has_external_links: null,
			has_organic_traffic: null,
		}),
	);
}

async function runUrlDiscoveryInventory() {
	const startedAt = new Date().toISOString();
	const { rawRecords: sitemapRawRecords, sitemapCounts } = await fetchSitemapInventory();

	const allRawRecords = [...sitemapRawRecords];

	const seedUrls = buildSeedUrlsFromSitemap(sitemapRawRecords);
	for (const seedUrl of seedUrls) {
		appendRawRecord(allRawRecords, {
			url: seedUrl,
			source: "seed:manual",
			inSitemap: false,
		});
	}

	const systemProbeUrls = buildSystemProbeUrls();
	for (const probeUrlValue of systemProbeUrls) {
		appendRawRecord(allRawRecords, {
			url: probeUrlValue,
			source: "probe:system-route",
			inSitemap: false,
			urlType: inferUrlType(probeUrlValue),
		});
	}

	const crawledUrls = await crawlInternalUrls(seedUrls, {
		maxDepth: DEFAULT_DEPTH,
		concurrency: DEFAULT_CONCURRENCY,
		maxUrls: DEFAULT_MAX_CRAWL_URLS,
	});

	for (const crawled of crawledUrls) {
		appendRawRecord(allRawRecords, {
			url: crawled.url,
			source: crawled.source,
			inSitemap: false,
		});
	}

	const uniqueProbeUrls = canonicalSort(allRawRecords.map((record) => record.url));
	const probeLimit = pLimit(DEFAULT_CONCURRENCY);
	const probeResults = new Map();

	await Promise.all(
		uniqueProbeUrls.map((url) =>
			probeLimit(async () => {
				try {
					const probe = await probeUrl(url);
					probeResults.set(url, probe);
				} catch {
					probeResults.set(url, {
						http_status: null,
						final_status: null,
						canonical_target: null,
						redirect_hops: 0,
					});
				}
			}),
		),
	);

	const rawWithProbe = allRawRecords.map((record) => {
		const probe = probeResults.get(record.url) || {
			http_status: null,
			final_status: null,
			canonical_target: null,
		};

		const statusForIndexability = probe.http_status ?? probe.final_status ?? null;
		return rawRecordSchema.parse({
			...record,
			http_status: probe.http_status,
			canonical_target: toUrlOrNull(probe.canonical_target),
			indexability_signal: inferIndexabilitySignal(statusForIndexability),
		});
	});

	rawInventorySchema.parse(rawWithProbe);

	const normalizedMap = new Map();
	for (const record of rawWithProbe) {
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

		const candidateTypes = canonicalSort([existing.url_type, record.url_type]);
		existing.url_type = pickMostSpecificType(candidateTypes);

		if (existing.http_status == null && record.http_status != null) {
			existing.http_status = record.http_status;
			existing.indexability_signal = record.indexability_signal;
		}

		if (!existing.canonical_target && normalizedCanonical) {
			existing.canonical_target = normalizedCanonical;
		}
	}

	const normalized = canonicalSort([...normalizedMap.keys()]).map((key) => {
		const value = normalizedMap.get(key);
		return normalizedRecordSchema.parse({
			...value,
			source: canonicalSort(value.source),
		});
	});

	normalizedInventorySchema.parse(normalized);

	const summary = {
		started_at: startedAt,
		completed_at: new Date().toISOString(),
		sitemap_counts: sitemapCounts,
		crawl_depth: DEFAULT_DEPTH,
		crawl_concurrency: DEFAULT_CONCURRENCY,
		max_crawl_urls: DEFAULT_MAX_CRAWL_URLS,
		seed_url_count: seedUrls.length,
		system_probe_count: systemProbeUrls.length,
		crawled_url_count: crawledUrls.length,
		unique_probe_url_count: uniqueProbeUrls.length,
		raw_record_count: rawWithProbe.length,
		normalized_record_count: normalized.length,
		required_system_routes_present: ROUTE_PROBES.map((route) => {
			const probe = new URL(route, BASE_ORIGIN).toString();
			const normalizedProbe = normalizeAbsoluteUrl(probe);
			return normalized.some((record) => record.url === normalizedProbe);
		}).every(Boolean),
		search_console_enrichment: {
			has_external_links: "pending",
			has_organic_traffic: "pending",
			note: "Set to null until Search Console export/API enrichment is completed.",
		},
	};

	await writeJson(OUTPUT_RAW, rawWithProbe);
	await writeJson(OUTPUT_NORMALIZED, normalized);
	await writeJson(OUTPUT_SUMMARY, summary);

	console.log(`[RHI-002] Seeds used: ${seedUrls.length}`);
	console.log(`[RHI-002] System probes: ${systemProbeUrls.length}`);
	console.log(`[RHI-002] Crawled URLs: ${crawledUrls.length}`);
	console.log(`[RHI-002] Raw records: ${rawWithProbe.length}`);
	console.log(`[RHI-002] Normalized records: ${normalized.length}`);
	console.log(`[RHI-002] Wrote ${OUTPUT_RAW}`);
	console.log(`[RHI-002] Wrote ${OUTPUT_NORMALIZED}`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
	runUrlDiscoveryInventory().catch((error) => {
		console.error(`[RHI-002] crawl-urls failed: ${error.message}`);
		process.exitCode = 1;
	});
}
