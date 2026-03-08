import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { XMLParser } from "fast-xml-parser";
import { fetch } from "undici";
import { z } from "zod";

export const BASE_ORIGIN = "https://www.rhino-inquisitor.com";
const CANONICAL_HOST = "www.rhino-inquisitor.com";
const ALT_HOST = "rhino-inquisitor.com";

const XML_OPTIONS = {
	attributeNamePrefix: "@_",
	ignoreAttributes: false,
	parseTagValue: true,
	trimValues: true,
};

const REQUIRED_SITEMAPS = [
	"post-sitemap.xml",
	"page-sitemap.xml",
	"category-sitemap.xml",
	"video-sitemap.xml",
	"e-landing-page-sitemap.xml",
];

const URL_TYPE_BY_SITEMAP = {
	"post-sitemap.xml": "post",
	"page-sitemap.xml": "page",
	"category-sitemap.xml": "category",
	"video-sitemap.xml": "video",
	"e-landing-page-sitemap.xml": "landing",
};

const OUTPUT_SITEMAP_RAW = path.resolve("migration/url-inventory.sitemaps.raw.json");
const OUTPUT_RAW = path.resolve("migration/url-inventory.raw.json");
const OUTPUT_SUMMARY = path.resolve("migration/url-discovery.sitemaps.summary.json");

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

export const rawRecordSchema = z.object({
	url: z.string().url(),
	path: z.string().min(1),
	source: z.string().min(1),
	url_type: z.enum(URL_TYPE_VALUES),
	http_status: z.number().int().min(100).max(599).nullable(),
	canonical_target: z.string().url().nullable(),
	indexability_signal: z.string().min(1),
	in_sitemap: z.boolean(),
	lastmod: z.string().nullable(),
	has_external_links: z.boolean().nullable(),
	has_organic_traffic: z.boolean().nullable(),
});

const rawInventorySchema = z.array(rawRecordSchema);

function asArray(value) {
	if (Array.isArray(value)) {
		return value;
	}
	return value == null ? [] : [value];
}

function pickRoot(doc, candidates) {
	for (const candidate of candidates) {
		if (doc[candidate]) {
			return doc[candidate];
		}
	}
	return null;
}

function isInternalHost(hostname) {
	return hostname === CANONICAL_HOST || hostname === ALT_HOST;
}

export function toAbsoluteUrl(rawUrl, baseOrigin = BASE_ORIGIN) {
	const parsed = new URL(rawUrl, baseOrigin);
	parsed.hash = "";

	if (!isInternalHost(parsed.hostname)) {
		throw new Error(`External URL is out of scope for inventory: ${parsed.toString()}`);
	}

	return parsed.toString();
}

export function normalizeAbsoluteUrl(rawUrl, baseOrigin = BASE_ORIGIN) {
	const parsed = new URL(rawUrl, baseOrigin);

	if (!isInternalHost(parsed.hostname)) {
		throw new Error(`Cannot normalize external host: ${parsed.hostname}`);
	}

	parsed.protocol = "https:";
	parsed.hostname = CANONICAL_HOST;
	parsed.hash = "";

	let pathname = parsed.pathname
		.replace(/\/+/g, "/")
		.replace(/\/$/, "")
		.toLowerCase();

	if (pathname === "") {
		pathname = "/";
	}

	const hasExtension = /\.[a-z0-9]+$/i.test(pathname);
	if (pathname !== "/" && !hasExtension) {
		pathname = `${pathname}/`;
	}

	parsed.pathname = pathname;
	return parsed.toString();
}

export function inferUrlType(rawUrl, source = "") {
	const sourceType = URL_TYPE_BY_SITEMAP[source];
	if (sourceType) {
		return sourceType;
	}

	const parsed = new URL(rawUrl, BASE_ORIGIN);
	const pathname = parsed.pathname.toLowerCase();

	if (parsed.searchParams.has("attachment_id")) {
		return "attachment";
	}

	if (/\/page\/\d+\/$/.test(pathname)) {
		return "pagination";
	}

	if (
		pathname.startsWith("/wp-") ||
		pathname.startsWith("/author/") ||
		pathname.startsWith("/tag/") ||
		pathname.startsWith("/search/") ||
		pathname.endsWith("/feed/") ||
		pathname === "/feed/" ||
		pathname === "/comments/feed/" ||
		pathname === "/xmlrpc.php"
	) {
		return "system";
	}

	const ext = pathname.split(".").pop();
	if (ext && ext !== pathname && ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf", "mp4", "mov"].includes(ext)) {
		return "attachment";
	}

	return "unknown";
}

export function inferIndexabilitySignal(statusCode) {
	if (typeof statusCode !== "number") {
		return "unknown";
	}

	if (statusCode >= 200 && statusCode < 300) {
		return "indexable";
	}

	if ([301, 302, 303, 307, 308].includes(statusCode)) {
		return "redirect";
	}

	if (statusCode === 404) {
		return "not-found";
	}

	if (statusCode === 410) {
		return "gone";
	}

	if (statusCode >= 500) {
		return "server-error";
	}

	return "non-indexable";
}

function getPath(rawUrl) {
	const parsed = new URL(rawUrl);
	return `${parsed.pathname}${parsed.search}`;
}

async function fetchText(url, { timeoutMs = 12000, maxAttempts = 3 } = {}) {
	let attempt = 0;
	let lastError = null;

	while (attempt < maxAttempts) {
		attempt += 1;
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const response = await fetch(url, {
				headers: { accept: "application/xml,text/xml;q=0.9,*/*;q=0.8" },
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			return await response.text();
		} catch (error) {
			lastError = error;

			if (attempt < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
			}
		} finally {
			clearTimeout(timer);
		}
	}

	throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? "unknown error"}`);
}

function parseSitemapIndex(xml) {
	const parser = new XMLParser(XML_OPTIONS);
	const doc = parser.parse(xml);
	const root = pickRoot(doc, ["sitemapindex", "ns:sitemapindex"]);

	if (!root) {
		throw new Error("sitemap_index.xml did not contain a sitemapindex root element");
	}

	return asArray(root.sitemap).map((item) => {
		const loc = typeof item.loc === "string" ? item.loc.trim() : "";
		return {
			loc,
			lastmod: typeof item.lastmod === "string" ? item.lastmod.trim() : null,
			name: loc ? path.posix.basename(new URL(loc).pathname) : "",
		};
	});
}

function parseUrlSet(xml) {
	const parser = new XMLParser(XML_OPTIONS);
	const doc = parser.parse(xml);
	const root = pickRoot(doc, ["urlset", "ns:urlset"]);

	if (!root) {
		throw new Error("Sitemap payload did not contain a urlset root element");
	}

	return asArray(root.url).map((item) => {
		const loc = typeof item.loc === "string" ? item.loc.trim() : "";
		return {
			loc,
			lastmod: typeof item.lastmod === "string" ? item.lastmod.trim() : null,
		};
	});
}

async function writeJson(filePath, data) {
	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function fetchSitemapInventory({
	baseOrigin = BASE_ORIGIN,
	sitemapIndexPath = "/sitemap_index.xml",
} = {}) {
	const sitemapIndexUrl = new URL(sitemapIndexPath, baseOrigin).toString();
	const sitemapIndexXml = await fetchText(sitemapIndexUrl);
	const indexEntries = parseSitemapIndex(sitemapIndexXml);

	const requiredSet = new Set(REQUIRED_SITEMAPS);
	const availableRequired = indexEntries.filter((entry) => requiredSet.has(entry.name));
	const missingRequired = REQUIRED_SITEMAPS.filter(
		(required) => !availableRequired.some((entry) => entry.name === required),
	);

	if (missingRequired.length > 0) {
		throw new Error(`Missing required sitemap files: ${missingRequired.join(", ")}`);
	}

	const sitemapCounts = {};
	const rawRecords = [];

	for (const sitemapEntry of availableRequired) {
		const sitemapXml = await fetchText(sitemapEntry.loc);
		const urlEntries = parseUrlSet(sitemapXml);
		sitemapCounts[sitemapEntry.name] = urlEntries.length;

		for (const urlEntry of urlEntries) {
			if (!urlEntry.loc) {
				continue;
			}

			const absoluteUrl = toAbsoluteUrl(urlEntry.loc, baseOrigin);
			const record = {
				url: absoluteUrl,
				path: getPath(absoluteUrl),
				source: sitemapEntry.name,
				url_type: inferUrlType(absoluteUrl, sitemapEntry.name),
				http_status: null,
				canonical_target: null,
				indexability_signal: "unknown",
				in_sitemap: true,
				lastmod: urlEntry.lastmod ?? sitemapEntry.lastmod ?? null,
				has_external_links: null,
				has_organic_traffic: null,
			};

			rawRecords.push(rawRecordSchema.parse(record));
		}
	}

	return {
		sitemapIndexUrl,
		sitemapCounts,
		rawRecords,
	};
}

export async function runParseSitemap() {
	const startedAt = new Date().toISOString();
	const { sitemapIndexUrl, sitemapCounts, rawRecords } = await fetchSitemapInventory();

	rawInventorySchema.parse(rawRecords);

	const totalRaw = rawRecords.length;
	const uniqueSitemapUrls = new Set(rawRecords.map((record) => normalizeAbsoluteUrl(record.url))).size;

	const summary = {
		started_at: startedAt,
		completed_at: new Date().toISOString(),
		sitemap_index: sitemapIndexUrl,
		required_sitemaps: REQUIRED_SITEMAPS,
		sitemap_counts: sitemapCounts,
		total_raw_records: totalRaw,
		unique_normalized_urls: uniqueSitemapUrls,
	};

	await writeJson(OUTPUT_SITEMAP_RAW, rawRecords);
	await writeJson(OUTPUT_RAW, rawRecords);
	await writeJson(OUTPUT_SUMMARY, summary);

	console.log(`[RHI-002] Parsed ${Object.keys(sitemapCounts).length} sitemap files.`);
	for (const [name, count] of Object.entries(sitemapCounts)) {
		console.log(`  - ${name}: ${count}`);
	}
	console.log(`[RHI-002] Raw sitemap records: ${totalRaw}`);
	console.log(`[RHI-002] Unique normalized sitemap URLs: ${uniqueSitemapUrls}`);
	console.log(`[RHI-002] Wrote ${OUTPUT_SITEMAP_RAW}`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
	runParseSitemap().catch((error) => {
		console.error(`[RHI-002] parse-sitemap failed: ${error.message}`);
		process.exitCode = 1;
	});
}
