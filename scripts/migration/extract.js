import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import { load as loadHtml } from 'cheerio';
import fg from 'fast-glob';
import { XMLParser } from 'fast-xml-parser';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const canonicalHost = 'https://www.rhino-inquisitor.com';
const contentBackedManifestClasses = new Set(['post', 'page', 'attachment', 'video', 'category', 'landing']);
const acceptedWxrPostTypes = new Set(['post', 'page', 'attachment', 'e-landing-page']);
const sqlSupplementPostTypes = new Set(['video']);
const supportedMediaExtensions = new Set([
  'avif',
  'gif',
  'jpg',
  'jpeg',
  'mov',
  'mp3',
  'mp4',
  'm4a',
  'ogg',
  'ogv',
  'pdf',
  'png',
  'svg',
  'wav',
  'webm',
  'webp',
  'wmv'
]);
const interestingSqlMetaKeys = new Set(['_thumbnail_id', '_yoast_wpseo_metadesc']);

async function main() {
  const options = await resolveOptions(process.argv.slice(2));
  const manifest = await readJsonFile(options.manifestFile, 'manifest');
  const inventory = await readJsonFile(options.inventoryFile, 'inventory');
  const manifestByUrl = new Map(manifest.map((entry) => [entry.legacy_url, entry]));
  const requestedSourceIds = await readSourceIds(options.sourceIdFile);
  const requestedPostTypes = normalizeRequestedPostTypes(options.postTypes);
  const selectionMode = requestedSourceIds.size > 0 || requestedPostTypes.size > 0 ? 'subset' : 'full';

  const sourceArtifacts = [];
  const quarantine = [];
  const recordsBySourceId = new Map();
  const excludedRecords = createCountBucket();
  const extractionMethods = [];

  const wxrStats = await extractFromWxr({
    wxrFile: options.wxrFile,
    manifestByUrl,
    requestedSourceIds,
    requestedPostTypes,
    quarantine,
    recordsBySourceId,
    excludedRecords,
    sourceArtifacts,
    extractionMethods
  });

  let sqlStats = createSqlStats();
  if (options.sqlFile) {
    sqlStats = await extractSqlSupplement({
      sqlFile: options.sqlFile,
      requestedSourceIds,
      requestedPostTypes,
      recordsBySourceId,
      quarantine,
      sourceArtifacts,
      extractionMethods
    });
  }

  let filesystemStats = createFilesystemStats();
  if (options.filesystemRoot) {
    filesystemStats = await applyFilesystemVerification({
      filesystemRoot: options.filesystemRoot,
      recordsBySourceId,
      sourceArtifacts,
      extractionMethods
    });
  }

  const sortedRecords = sortRecords([...recordsBySourceId.values()]).map(stabilizeRecord);
  const coverage = buildCoverageReport({
    records: sortedRecords,
    manifest,
    inventory,
    requestedSourceIds,
    requestedPostTypes,
    selectionMode,
    manifestByUrl
  });
  const reconciliation = buildSourceReconciliation(sortedRecords);
  const quarantineSummary = buildQuarantineSummary(quarantine, sortedRecords.length + quarantine.length);
  const summary = createSummary({
    selectionMode,
    requestedSourceIds,
    requestedPostTypes,
    sourceIdFile: options.sourceIdFile,
    sortedRecords,
    quarantineSummary,
    sourceArtifacts,
    extractionMethods,
    excludedRecords,
    coverage,
    reconciliation,
    wxrStats,
    sqlStats,
    filesystemStats,
    outputFiles: {
      records: toRepoRelative(options.outputRecords),
      summary: toRepoRelative(options.outputSummary),
      quarantine: toRepoRelative(options.outputQuarantine)
    }
  });

  await Promise.all([
    writeJsonFile(options.outputRecords, sortedRecords),
    writeJsonFile(options.outputSummary, summary),
    writeJsonFile(options.outputQuarantine, sortQuarantine(quarantine))
  ]);

  const validationErrors = [];
  if (quarantineSummary.rate > 0.05) {
    validationErrors.push(
      `Quarantine rate ${Math.round(quarantineSummary.rate * 10000) / 100}% exceeds the 5% escalation threshold.`
    );
  }

  if (coverage.missingManifestUrls.length > 0) {
    validationErrors.push(
      `Coverage failed: ${coverage.missingManifestUrls.length} source-backed keep/merge manifest URL(s) are missing from extracted records.`
    );
  }

  if (coverage.missingInventoryUrls.length > 0) {
    validationErrors.push(
      `Inventory reconciliation failed: ${coverage.missingInventoryUrls.length} source-backed inventory URL(s) are absent from extracted records.`
    );
  }

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(' '));
  }
}

async function resolveOptions(argv) {
  const parsed = {
    postTypes: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--wxr-file':
        parsed.wxrFile = path.resolve(argv[++index]);
        break;
      case '--sql-file':
        parsed.sqlFile = path.resolve(argv[++index]);
        break;
      case '--filesystem-root':
        parsed.filesystemRoot = path.resolve(argv[++index]);
        break;
      case '--manifest-file':
        parsed.manifestFile = path.resolve(argv[++index]);
        break;
      case '--inventory-file':
        parsed.inventoryFile = path.resolve(argv[++index]);
        break;
      case '--output-records':
        parsed.outputRecords = path.resolve(argv[++index]);
        break;
      case '--output-summary':
        parsed.outputSummary = path.resolve(argv[++index]);
        break;
      case '--output-quarantine':
        parsed.outputQuarantine = path.resolve(argv[++index]);
        break;
      case '--source-id-file':
        parsed.sourceIdFile = path.resolve(argv[++index]);
        break;
      case '--post-type':
        parsed.postTypes.push(...String(argv[++index]).split(',').map((value) => value.trim()).filter(Boolean));
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  const wxrFile = parsed.wxrFile ?? await resolveFirstFile([
    'migration/input/*.xml',
    'tmp/therhinoinquisitor.WordPress*.xml',
    'tmp/*.xml'
  ]);
  if (!wxrFile) {
    throw new Error('Unable to locate a WordPress WXR export. Use --wxr-file or place the file in migration/input/ or tmp/.');
  }

  const sqlFile = parsed.sqlFile ?? await resolveFirstFile([
    'migration/input/*.sql',
    'tmp/wordpress-database.sql'
  ]);
  const filesystemRoot = parsed.filesystemRoot ?? await resolveFirstDirectory([
    path.join(repoRoot, 'migration/input/website-wordpress-backup/wp-content'),
    path.join(repoRoot, 'tmp/website-wordpress-backup/wp-content')
  ]);

  return {
    wxrFile,
    sqlFile,
    filesystemRoot,
    sourceIdFile: parsed.sourceIdFile ?? null,
    postTypes: parsed.postTypes,
    manifestFile: parsed.manifestFile ?? path.join(repoRoot, 'migration/url-manifest.json'),
    inventoryFile: parsed.inventoryFile ?? path.join(repoRoot, 'migration/url-inventory.normalized.json'),
    outputRecords: parsed.outputRecords ?? path.join(repoRoot, 'migration/intermediate/extract-records.json'),
    outputSummary: parsed.outputSummary ?? path.join(repoRoot, 'migration/intermediate/extract-summary.json'),
    outputQuarantine: parsed.outputQuarantine ?? path.join(repoRoot, 'migration/intermediate/extract-quarantine.json')
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/extract.js [options]

Options:
  --wxr-file <path>          Explicit WordPress WXR export path.
  --sql-file <path>          Explicit WordPress SQL dump path.
  --filesystem-root <path>   Explicit wp-content root for filesystem verification.
  --source-id-file <path>    Text file with one sourceId per line for subset mode.
  --post-type <types>        Comma-separated post types for subset mode.
  --manifest-file <path>     Override migration/url-manifest.json.
  --inventory-file <path>    Override migration/url-inventory.normalized.json.
  --output-records <path>    Override extract-records output path.
  --output-summary <path>    Override extract-summary output path.
  --output-quarantine <path> Override extract-quarantine output path.
  --help                     Show this help message.
`);
}

async function resolveFirstFile(patterns) {
  const matches = await fg(patterns, {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
    dot: true
  });
  return matches.sort()[0] ?? null;
}

async function resolveFirstDirectory(candidates) {
  for (const candidate of candidates) {
    try {
      const stats = await fsp.stat(candidate);
      if (stats.isDirectory()) {
        return candidate;
      }
    } catch {
      // ignore missing candidates
    }
  }
  return null;
}

async function readJsonFile(filePath, label) {
  try {
    const fileContent = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Unable to read ${label} file at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

async function readSourceIds(sourceIdFile) {
  if (!sourceIdFile) {
    return new Set();
  }

  try {
    const fileContent = await fsp.readFile(sourceIdFile, 'utf8');
    return new Set(
      fileContent
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'))
    );
  } catch (error) {
    throw new Error(`Unable to read source ID file at ${toRepoRelative(sourceIdFile)}: ${error.message}`);
  }
}

function normalizeRequestedPostTypes(postTypes) {
  return new Set(postTypes.map((postType) => normalizePostType(postType)).filter(Boolean));
}

async function extractFromWxr({
  wxrFile,
  manifestByUrl,
  requestedSourceIds,
  requestedPostTypes,
  quarantine,
  recordsBySourceId,
  excludedRecords,
  sourceArtifacts,
  extractionMethods
}) {
  const xmlSource = await readTextFile(wxrFile, 'WXR export');
  const sourceTimestamp = await getFileTimestamp(wxrFile);
  sourceArtifacts.push({
    channel: 'wxr',
    path: toRepoRelative(wxrFile),
    timestamp: sourceTimestamp
  });
  extractionMethods.push({
    channel: 'wxr',
    summary: 'Parsed the WXR export with fast-xml-parser using CDATA-preserving options and deterministic array handling.'
  });

  let document;
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      cdataPropName: '__cdata',
      textNodeName: '__text',
      parseTagValue: false,
      trimValues: false,
      processEntities: false,
      isArray: (_, jPath) => new Set([
        'rss.channel.item',
        'rss.channel.wp:author',
        'rss.channel.wp:category',
        'rss.channel.wp:tag',
        'rss.channel.wp:term'
      ]).has(jPath) || jPath.endsWith('.category') || jPath.endsWith('.wp:postmeta')
    });
    document = parser.parse(xmlSource);
  } catch (error) {
    throw new Error(`Unable to parse the WXR export at ${toRepoRelative(wxrFile)}: ${error.message}`);
  }

  const channel = document?.rss?.channel;
  if (!channel) {
    throw new Error(`The WXR export at ${toRepoRelative(wxrFile)} did not contain rss.channel content.`);
  }

  const authors = buildAuthorMap(asArray(channel['wp:author']));
  const categoryDefinitions = buildCategoryDefinitions(asArray(channel['wp:category']));
  const itemStats = createCountBucket();
  const categoryStats = createCountBucket();

  for (const item of asArray(channel.item)) {
    const rawPostType = getNodeText(item['wp:post_type']);
    const normalizedPostType = normalizePostType(rawPostType);
    if (!acceptedWxrPostTypes.has(rawPostType)) {
      incrementBucket(excludedRecords, normalizedPostType ?? rawPostType ?? 'unknown');
      continue;
    }

    const sourceId = String(getNodeText(item['wp:post_id']) ?? '');
    if (!shouldIncludeRecord({ sourceId, postType: normalizedPostType, requestedSourceIds, requestedPostTypes })) {
      incrementBucket(excludedRecords, normalizedPostType);
      continue;
    }

    try {
      const record = buildWxrItemRecord({
        item,
        rawPostType,
        normalizedPostType,
        authors,
        sourceTimestamp,
        manifestByUrl
      });
      recordsBySourceId.set(record.sourceId, record);
      incrementBucket(itemStats, record.postType);
    } catch (error) {
      quarantine.push({
        sourceId: sourceId || null,
        errorType: 'wxr-item-parse-error',
        errorMessage: error.message,
        rawFragment: safeJsonFragment(item)
      });
    }
  }

  for (const definition of categoryDefinitions.values()) {
    if (!shouldIncludeRecord({
      sourceId: definition.sourceId,
      postType: 'category',
      requestedSourceIds,
      requestedPostTypes
    })) {
      continue;
    }

    try {
      const record = buildCategoryRecord(definition, sourceTimestamp);
      recordsBySourceId.set(record.sourceId, record);
      incrementBucket(categoryStats, 'category');
    } catch (error) {
      quarantine.push({
        sourceId: definition.sourceId,
        errorType: 'wxr-category-parse-error',
        errorMessage: error.message,
        rawFragment: safeJsonFragment(definition.raw)
      });
    }
  }

  return {
    itemCounts: sortObject(itemStats),
    categoryCounts: sortObject(categoryStats)
  };
}

function buildWxrItemRecord({ item, rawPostType, normalizedPostType, authors, sourceTimestamp, manifestByUrl }) {
  const sourceId = String(getNodeText(item['wp:post_id']) ?? '');
  const slug = getNodeText(item['wp:post_name']) ?? '';
  const attachmentUrl = normalizeSitePath(getNodeText(item['wp:attachment_url']));
  const postMetaValues = extractWxrPostMetaValues(item['wp:postmeta']);
  const linkUrl = normalizeSitePath(getNodeText(item.link));
  const guidUrl = normalizeSitePath(getNodeText(item.guid));
  const legacyUrl = chooseLegacyUrl({
    postType: normalizedPostType,
    slug,
    attachmentUrl,
    linkUrl,
    guidUrl,
    manifestByUrl
  });

  const bodyHtml = getNodeText(item['content:encoded']) ?? '';
  const excerptRaw = getNodeText(item['excerpt:encoded']) ?? '';
  const creatorLogin = getNodeText(item['dc:creator']) ?? null;
  const author = creatorLogin ? (authors.get(creatorLogin) ?? creatorLogin) : null;

  return {
    sourceId,
    sourceType: 'wxr',
    sourceChannels: ['wxr'],
    sourceTimestamp,
    slug,
    status: getNodeText(item['wp:status']) ?? 'unknown',
    postType: normalizedPostType,
    titleRaw: getNodeText(item.title) ?? '',
    excerptRaw,
    bodyHtml,
    publishedAt: normalizeDateValue(getNodeText(item['wp:post_date_gmt']) ?? getNodeText(item['wp:post_date']) ?? getNodeText(item.pubDate)),
    modifiedAt: normalizeDateValue(getNodeText(item['wp:post_modified_gmt']) ?? getNodeText(item['wp:post_modified'])),
    author,
    categories: extractTerms(asArray(item.category), 'category'),
    tags: extractTerms(asArray(item.category), 'post_tag'),
    legacyUrl,
    mediaRefs: collectMediaRefs(bodyHtml, attachmentUrl ? [absoluteSiteUrl(attachmentUrl)] : []),
    _raw: {
      sourcePostType: rawPostType,
      link: linkUrl,
      guid: guidUrl,
      attachmentUrl,
      thumbnailId: postMetaValues.get('_thumbnail_id') ?? null,
      metaDescription: postMetaValues.get('_yoast_wpseo_metadesc') ?? null,
      postParent: getNodeText(item['wp:post_parent']) ?? null,
      postMetaCount: asArray(item['wp:postmeta']).length
    }
  };
}

function extractWxrPostMetaValues(postMetaNodes) {
  const values = new Map();

  for (const postMetaNode of asArray(postMetaNodes)) {
    const metaKey = getNodeText(postMetaNode?.['wp:meta_key']);
    if (!metaKey || !interestingSqlMetaKeys.has(metaKey)) {
      continue;
    }

    const metaValue = getNodeText(postMetaNode?.['wp:meta_value']);
    values.set(metaKey, metaValue == null ? null : metaValue.trim() || null);
  }

  return values;
}

function buildAuthorMap(authorNodes) {
  const authorMap = new Map();
  for (const authorNode of authorNodes) {
    const login = getNodeText(authorNode['wp:author_login']);
    if (!login) {
      continue;
    }
    authorMap.set(login, getNodeText(authorNode['wp:author_display_name']) ?? login);
  }
  return authorMap;
}

function buildCategoryDefinitions(categoryNodes) {
  const bySlug = new Map();
  for (const categoryNode of categoryNodes) {
    const slug = getNodeText(categoryNode['wp:category_nicename']);
    if (!slug) {
      continue;
    }
    const definition = {
      sourceId: `category:${getNodeText(categoryNode['wp:term_id']) ?? slug}`,
      slug,
      name: getNodeText(categoryNode['wp:cat_name']) ?? slug,
      description: getNodeText(categoryNode['wp:category_description']) ?? '',
      parentSlug: getNodeText(categoryNode['wp:category_parent']) ?? '',
      raw: categoryNode
    };
    bySlug.set(slug, definition);
  }

  const resolvePath = (slug, stack = new Set()) => {
    const definition = bySlug.get(slug);
    if (!definition) {
      return slug;
    }
    if (!definition.parentSlug) {
      return slug;
    }
    if (stack.has(slug)) {
      throw new Error(`Circular category parent reference detected for ${slug}.`);
    }

    const nextStack = new Set(stack);
    nextStack.add(slug);
    return `${resolvePath(definition.parentSlug, nextStack)}/${slug}`;
  };

  for (const definition of bySlug.values()) {
    definition.pathSuffix = resolvePath(definition.slug);
  }

  return bySlug;
}

function buildCategoryRecord(definition, sourceTimestamp) {
  const description = definition.description ?? '';
  return {
    sourceId: definition.sourceId,
    sourceType: 'wxr',
    sourceChannels: ['wxr'],
    sourceTimestamp,
    slug: definition.slug,
    status: 'publish',
    postType: 'category',
    titleRaw: definition.name,
    excerptRaw: description,
    bodyHtml: description,
    publishedAt: null,
    modifiedAt: null,
    author: null,
    categories: [],
    tags: [],
    legacyUrl: `/category/${definition.pathSuffix}/`,
    mediaRefs: collectMediaRefs(description),
    _raw: {
      parentSlug: definition.parentSlug || null
    }
  };
}

async function extractSqlSupplement({
  sqlFile,
  requestedSourceIds,
  requestedPostTypes,
  recordsBySourceId,
  quarantine,
  sourceArtifacts,
  extractionMethods
}) {
  const sourceTimestamp = await getFileTimestamp(sqlFile);
  sourceArtifacts.push({
    channel: 'sql',
    path: toRepoRelative(sqlFile),
    timestamp: sourceTimestamp
  });

  const stats = createSqlStats();
  const userMap = new Map();
  const termMap = new Map();
  const taxonomyMap = new Map();
  const relationships = new Map();
  const postMetaByPostId = new Map();
  const sqlPosts = new Map();

  const stream = fs.createReadStream(sqlFile, { encoding: 'utf8' });
  const reader = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let pendingStatement = '';

  for await (const line of reader) {
    const trimmedLine = line.trim();
    if (!pendingStatement && !trimmedLine.startsWith('INSERT INTO `')) {
      continue;
    }

    pendingStatement = pendingStatement ? `${pendingStatement}\n${line}` : line;
    if (!trimmedLine.endsWith(';')) {
      continue;
    }

    let parsedLine;
    try {
      parsedLine = parseInsertLine(pendingStatement);
    } catch (error) {
      quarantine.push({
        sourceId: null,
        errorType: 'sql-parse-error',
        errorMessage: error.message,
        rawFragment: trimFragment(pendingStatement)
      });
      pendingStatement = '';
      continue;
    }

    pendingStatement = '';

    if (!parsedLine) {
      continue;
    }

    const tableSuffix = parsedLine.table.replace(/^.*_/, '');
    switch (tableSuffix) {
      case 'users':
        for (const row of parsedLine.rows) {
          userMap.set(String(row[0]), String(row[9] ?? row[1] ?? ''));
        }
        break;
      case 'terms':
        for (const row of parsedLine.rows) {
          termMap.set(String(row[0]), {
            name: String(row[1] ?? ''),
            slug: String(row[2] ?? '')
          });
        }
        break;
      case 'term_taxonomy':
        for (const row of parsedLine.rows) {
          taxonomyMap.set(String(row[0]), {
            termId: String(row[1]),
            taxonomy: String(row[2] ?? ''),
            description: String(row[3] ?? ''),
            parent: String(row[4] ?? '')
          });
        }
        break;
      case 'term_relationships':
        for (const row of parsedLine.rows) {
          const objectId = String(row[0]);
          const bucket = relationships.get(objectId) ?? [];
          bucket.push(String(row[1]));
          relationships.set(objectId, bucket);
        }
        break;
      case 'postmeta':
        for (const row of parsedLine.rows) {
          const metaKey = String(row[2] ?? '');
          if (!interestingSqlMetaKeys.has(metaKey)) {
            continue;
          }
          const postId = String(row[1]);
          const bucket = postMetaByPostId.get(postId) ?? new Map();
          bucket.set(metaKey, row[3] == null ? null : String(row[3]));
          postMetaByPostId.set(postId, bucket);
        }
        break;
      case 'posts':
        for (const row of parsedLine.rows) {
          const sourcePostType = String(row[20] ?? '');
          if (!sqlSupplementPostTypes.has(sourcePostType)) {
            continue;
          }
          const normalizedPostType = normalizePostType(sourcePostType);
          const sourceId = String(row[0]);
          if (!shouldIncludeRecord({ sourceId, postType: normalizedPostType, requestedSourceIds, requestedPostTypes })) {
            continue;
          }
          sqlPosts.set(sourceId, row);
          incrementBucket(stats.byPostType, normalizedPostType);
          incrementBucket(stats.byStatus, String(row[7] ?? 'unknown'));
        }
        break;
      default:
        break;
    }
  }

  if (sqlPosts.size > 0) {
    extractionMethods.push({
      channel: 'sql',
      summary: 'Recovered missing custom post type records from the SQL dump and joined term relationships for taxonomy fidelity.'
    });
  }

  for (const [sourceId, row] of sqlPosts.entries()) {
    try {
      const record = buildSqlRecord({
        row,
        sourceTimestamp,
        userMap,
        termMap,
        taxonomyMap,
        relationships,
        postMetaByPostId
      });
      const existingRecord = recordsBySourceId.get(sourceId);
      if (existingRecord) {
        recordsBySourceId.set(sourceId, mergeSupplementalRecord(existingRecord, record));
      } else {
        recordsBySourceId.set(sourceId, record);
      }
      stats.recovered += 1;
    } catch (error) {
      quarantine.push({
        sourceId,
        errorType: 'sql-record-parse-error',
        errorMessage: error.message,
        rawFragment: trimFragment(JSON.stringify(row))
      });
    }
  }

  return {
    recovered: stats.recovered,
    byPostType: sortObject(stats.byPostType),
    byStatus: sortObject(stats.byStatus)
  };
}

function buildSqlRecord({ row, sourceTimestamp, userMap, termMap, taxonomyMap, relationships, postMetaByPostId }) {
  const sourceId = String(row[0]);
  const slug = String(row[11] ?? '').trim();
  const authorId = String(row[1] ?? '');
  const categories = [];
  const tags = [];

  for (const taxonomyId of relationships.get(sourceId) ?? []) {
    const taxonomy = taxonomyMap.get(taxonomyId);
    if (!taxonomy) {
      continue;
    }
    const term = termMap.get(taxonomy.termId);
    if (!term) {
      continue;
    }
    if (taxonomy.taxonomy === 'category') {
      categories.push({ name: term.name, slug: term.slug });
    }
    if (taxonomy.taxonomy === 'post_tag') {
      tags.push({ name: term.name, slug: term.slug });
    }
  }

  const metaValues = postMetaByPostId.get(sourceId) ?? new Map();
  const bodyHtml = String(row[4] ?? '');
  const thumbnailId = metaValues.get('_thumbnail_id');

  return {
    sourceId,
    sourceType: 'sql',
    sourceChannels: ['sql'],
    sourceTimestamp,
    slug,
    status: String(row[7] ?? 'unknown'),
    postType: normalizePostType(String(row[20] ?? 'video')),
    titleRaw: String(row[5] ?? ''),
    excerptRaw: String(row[6] ?? ''),
    bodyHtml,
    publishedAt: normalizeDateValue(String(row[3] ?? row[2] ?? '')),
    modifiedAt: normalizeDateValue(String(row[15] ?? row[14] ?? '')),
    author: (userMap.get(authorId) ?? authorId) || null,
    categories: sortTerms(categories),
    tags: sortTerms(tags),
    legacyUrl: slug ? `/${slug}/` : normalizeSitePath(String(row[18] ?? '')),
    mediaRefs: collectMediaRefs(bodyHtml),
    _raw: {
      guid: normalizeSitePath(String(row[18] ?? '')),
      sourcePostType: String(row[20] ?? ''),
      thumbnailId: thumbnailId ?? null,
      metaDescription: metaValues.get('_yoast_wpseo_metadesc') ?? null
    }
  };
}

function mergeSupplementalRecord(primaryRecord, supplementalRecord) {
  const mergedRecord = { ...primaryRecord };
  mergedRecord.sourceChannels = [...new Set([...primaryRecord.sourceChannels, ...supplementalRecord.sourceChannels])].sort();
  mergedRecord.sourceTimestamp = [primaryRecord.sourceTimestamp, supplementalRecord.sourceTimestamp].filter(Boolean).sort().at(-1) ?? null;
  mergedRecord.categories = sortTerms([...primaryRecord.categories, ...supplementalRecord.categories]);
  mergedRecord.tags = sortTerms([...primaryRecord.tags, ...supplementalRecord.tags]);
  mergedRecord.mediaRefs = [...new Set([...primaryRecord.mediaRefs, ...supplementalRecord.mediaRefs])].sort();
  mergedRecord._raw = {
    ...primaryRecord._raw,
    supplemental: supplementalRecord._raw
  };

  for (const key of ['excerptRaw', 'bodyHtml', 'publishedAt', 'modifiedAt', 'author', 'legacyUrl']) {
    if (isMissingValue(mergedRecord[key]) && !isMissingValue(supplementalRecord[key])) {
      mergedRecord[key] = supplementalRecord[key];
    }
  }

  if (primaryRecord.postType === 'attachment' && supplementalRecord._raw?.thumbnailId) {
    mergedRecord._raw.thumbnailId = supplementalRecord._raw.thumbnailId;
  }

  return mergedRecord;
}

async function applyFilesystemVerification({ filesystemRoot, recordsBySourceId, sourceArtifacts, extractionMethods }) {
  const stats = createFilesystemStats();
  const rootTimestamp = await getFileTimestamp(filesystemRoot);
  sourceArtifacts.push({
    channel: 'filesystem',
    path: toRepoRelative(filesystemRoot),
    timestamp: rootTimestamp
  });

  for (const record of recordsBySourceId.values()) {
    const candidateUrls = [];
    if (record.postType === 'attachment' && record.legacyUrl.startsWith('/wp-content/uploads/')) {
      candidateUrls.push(record.legacyUrl);
    }
    for (const mediaRef of record.mediaRefs) {
      const normalizedPath = normalizeSitePath(mediaRef);
      if (normalizedPath?.startsWith('/wp-content/uploads/')) {
        candidateUrls.push(normalizedPath);
      }
    }

    for (const candidateUrl of new Set(candidateUrls)) {
      const relativeUploadPath = candidateUrl.replace(/^\/wp-content\/uploads\//, 'uploads/');
      const absoluteCandidate = resolveWithinRoot(filesystemRoot, relativeUploadPath);
      try {
        const candidateStats = await fsp.stat(absoluteCandidate);
        if (candidateStats.isFile()) {
          if (!record.sourceChannels.includes('filesystem')) {
            record.sourceChannels.push('filesystem');
            record.sourceChannels.sort();
          }
          stats.verified += 1;
        }
      } catch {
        stats.missing += 1;
      }
    }
  }

  if (stats.verified > 0 || stats.missing > 0) {
    extractionMethods.push({
      channel: 'filesystem',
      summary: 'Verified attachment and body-media upload references against the approved filesystem snapshot when uploads paths were available.'
    });
  }

  return stats;
}

function buildCoverageReport({ records, manifest, inventory, requestedSourceIds, requestedPostTypes, selectionMode, manifestByUrl }) {
  const extractedPaths = new Set(records.map((record) => record.legacyUrl).filter(Boolean));
  const sourceBackedManifestEntries = manifest.filter((entry) => {
    if (!isSourceBackedManifestEntry(entry)) {
      return false;
    }
    if (selectionMode === 'subset') {
      if (requestedPostTypes.size > 0 && !requestedPostTypes.has(normalizePostType(entry.url_class))) {
        return false;
      }
      if (requestedSourceIds.size > 0) {
        const matchingRecord = records.find((record) => record.legacyUrl === entry.legacy_url);
        return matchingRecord ? requestedSourceIds.has(matchingRecord.sourceId) : false;
      }
    }
    return entry.disposition === 'keep' || entry.disposition === 'merge';
  });

  const missingManifestUrls = sourceBackedManifestEntries
    .filter((entry) => !extractedPaths.has(entry.legacy_url))
    .map((entry) => ({
      legacyUrl: entry.legacy_url,
      disposition: entry.disposition,
      urlClass: entry.url_class,
      targetUrl: entry.target_url
    }))
    .sort(sortByLegacyUrl);

  const nonContentKeepMergeUrls = manifest
    .filter((entry) => (entry.disposition === 'keep' || entry.disposition === 'merge') && !isSourceBackedManifestEntry(entry))
    .map((entry) => ({
      legacyUrl: entry.legacy_url,
      urlClass: entry.url_class,
      disposition: entry.disposition
    }))
    .sort(sortByLegacyUrl);

  const missingInventoryUrls = inventory
    .map((entry) => ({ ...entry, manifest: manifestByUrl.get(entry.path) ?? null }))
    .filter((entry) => entry.manifest && isSourceBackedManifestEntry(entry.manifest) && (entry.manifest.disposition === 'keep' || entry.manifest.disposition === 'merge'))
    .filter((entry) => !extractedPaths.has(entry.path))
    .map((entry) => ({
      path: entry.path,
      urlType: entry.url_type,
      manifestClass: entry.manifest.url_class
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  return {
    scope: 'source-backed-content-only',
    scopeRules: [
      'Posts, pages except the homepage, uploads-backed attachments, category term routes, and content detail custom types are blocking coverage targets.',
      'System, feed, query, pagination, homepage, and synthetic index routes are reported separately and do not block extraction completeness.'
    ],
    contentBackedManifestCount: sourceBackedManifestEntries.length,
    matchedManifestCount: sourceBackedManifestEntries.length - missingManifestUrls.length,
    missingManifestUrls,
    reportedNonContentKeepMergeUrls: nonContentKeepMergeUrls,
    missingInventoryUrls
  };
}

function buildSourceReconciliation(records) {
  const byChannel = {};
  for (const record of records) {
    for (const channel of record.sourceChannels) {
      const channelBucket = byChannel[channel] ?? { byPostType: {}, byStatus: {} };
      incrementBucket(channelBucket.byPostType, record.postType);
      incrementBucket(channelBucket.byStatus, record.status);
      byChannel[channel] = channelBucket;
    }
  }

  return Object.fromEntries(
    Object.entries(byChannel)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([channel, value]) => [
        channel,
        {
          byPostType: sortObject(value.byPostType),
          byStatus: sortObject(value.byStatus)
        }
      ])
  );
}

function createSummary({
  selectionMode,
  requestedSourceIds,
  requestedPostTypes,
  sourceIdFile,
  sortedRecords,
  quarantineSummary,
  sourceArtifacts,
  extractionMethods,
  excludedRecords,
  coverage,
  reconciliation,
  wxrStats,
  sqlStats,
  filesystemStats,
  outputFiles
}) {
  return {
    mode: selectionMode,
    selection: {
      sourceIdFileUsed: requestedSourceIds.size > 0,
      sourceIdFile: sourceIdFile ? toRepoRelative(sourceIdFile) : null,
      sourceIdCount: requestedSourceIds.size,
      postTypes: [...requestedPostTypes].sort(),
      recordCount: sortedRecords.length
    },
    selectedSourceChannels: [...new Set(sortedRecords.flatMap((record) => record.sourceChannels))].sort(),
    sourceArtifacts: sourceArtifacts.sort((left, right) => left.channel.localeCompare(right.channel)),
    extractionMethods,
    totals: {
      byPostType: summarizeByKey(sortedRecords, 'postType'),
      byStatus: summarizeByKey(sortedRecords, 'status')
    },
    quarantine: quarantineSummary,
    excludedWxrPostTypes: sortObject(excludedRecords),
    reconciliation,
    coverage,
    sourceDetails: {
      wxr: wxrStats,
      sql: sqlStats,
      filesystem: filesystemStats
    },
    outputFiles
  };
}

function summarizeByKey(records, key) {
  const bucket = createCountBucket();
  for (const record of records) {
    incrementBucket(bucket, record[key] ?? 'unknown');
  }
  return sortObject(bucket);
}

function buildQuarantineSummary(quarantine, processedCount) {
  const reasons = createCountBucket();
  for (const item of quarantine) {
    incrementBucket(reasons, item.errorType);
  }
  return {
    count: quarantine.length,
    rate: processedCount === 0 ? 0 : quarantine.length / processedCount,
    reasons: sortObject(reasons)
  };
}

function shouldIncludeRecord({ sourceId, postType, requestedSourceIds, requestedPostTypes }) {
  if (requestedSourceIds.size > 0 && !requestedSourceIds.has(sourceId)) {
    return false;
  }
  if (requestedPostTypes.size > 0 && !requestedPostTypes.has(postType)) {
    return false;
  }
  return true;
}

function normalizePostType(postType) {
  if (!postType) {
    return null;
  }
  if (postType === 'e-landing-page') {
    return 'landing';
  }
  return String(postType).trim().toLowerCase();
}

function extractTerms(termNodes, domain) {
  return sortTerms(
    termNodes
      .filter((termNode) => String(termNode?.['@_domain'] ?? '') === domain)
      .map((termNode) => ({
        name: getNodeText(termNode) ?? '',
        slug: String(termNode?.['@_nicename'] ?? '').trim()
      }))
      .filter((term) => term.name || term.slug)
  );
}

function sortTerms(terms) {
  return [...new Map(
    terms
      .filter((term) => term && (term.name || term.slug))
      .map((term) => [term.slug || term.name.toLowerCase(), { name: term.name, slug: term.slug }])
  ).values()].sort((left, right) => `${left.slug}:${left.name}`.localeCompare(`${right.slug}:${right.name}`));
}

function collectMediaRefs(bodyHtml, supplementalRefs = []) {
  const mediaRefs = new Set(supplementalRefs.filter(Boolean));
  if (!bodyHtml) {
    return [...mediaRefs].sort();
  }

  const $ = loadHtml(`<body>${bodyHtml}</body>`);
  $('img[src], source[src], video[src], audio[src], iframe[src], [poster], a[href]').each((_, element) => {
    const attributes = element.attribs ?? {};
    for (const value of [attributes.src, attributes.poster, attributes.href]) {
      if (!value) {
        continue;
      }
      const normalized = normalizeMediaUrl(value);
      if (normalized) {
        mediaRefs.add(normalized);
      }
    }
  });

  return [...mediaRefs].sort();
}

function normalizeMediaUrl(value) {
  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }
  const normalizedPath = normalizeSitePath(trimmed);
  if (normalizedPath?.startsWith('/wp-content/uploads/')) {
    return absoluteSiteUrl(normalizedPath);
  }

  try {
    const parsed = new URL(trimmed, canonicalHost);
    if (!parsed.pathname) {
      return null;
    }
    const extension = parsed.pathname.split('.').pop()?.toLowerCase();
    if (!extension || !supportedMediaExtensions.has(extension)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function chooseLegacyUrl({ postType, slug, attachmentUrl, linkUrl, guidUrl, manifestByUrl }) {
  const candidates = [];
  if (postType === 'attachment') {
    candidates.push(attachmentUrl, linkUrl, guidUrl);
  } else {
    candidates.push(linkUrl, slug ? `/${slug}/` : null, guidUrl);
  }

  for (const candidate of candidates.filter(Boolean)) {
    if (manifestByUrl.has(candidate)) {
      return candidate;
    }
  }

  return candidates.find(Boolean) ?? (slug ? `/${slug}/` : null);
}

function normalizeSitePath(value) {
  if (!value) {
    return null;
  }
  try {
    const parsed = new URL(String(value), canonicalHost);
    const pathname = parsed.pathname || '/';
    const search = parsed.search || '';
    if (pathname === '/') {
      return search ? `/${search}` : '/';
    }
    if (pathname.endsWith('/') || isFileLikePath(pathname) || search) {
      return `${pathname}${search}`;
    }
    return `${pathname}/${search}`;
  } catch {
    return null;
  }
}

function absoluteSiteUrl(pathname) {
  return pathname.startsWith('http://') || pathname.startsWith('https://')
    ? pathname
    : `${canonicalHost}${pathname}`;
}

function isFileLikePath(pathname) {
  return /\/[^/]+\.[a-z0-9]+$/iu.test(pathname);
}

function normalizeDateValue(value) {
  if (!value) {
    return null;
  }
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === '0000-00-00 00:00:00') {
    return null;
  }
  if (/^[A-Z][a-z]{2},/u.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  const parsed = new Date(trimmed.includes('T') || /[+-]\d\d:?\d\d$/u.test(trimmed) ? trimmed : `${trimmed.replace(' ', 'T')}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function isSourceBackedManifestEntry(entry) {
  if (!contentBackedManifestClasses.has(entry.url_class)) {
    return false;
  }

  const source = String(entry.source ?? '');

  if (entry.legacy_url === '/') {
    return false;
  }

  if (entry.url_class === 'category') {
    return /^\/category\/[^/].*[^/]\/$/u.test(entry.legacy_url) && !entry.legacy_url.endsWith('/feed/');
  }

  if (entry.url_class === 'attachment') {
    return entry.legacy_url.startsWith('/wp-content/uploads/');
  }

  if (entry.url_class === 'page') {
    return source.includes('page-sitemap.xml') && !entry.legacy_url.endsWith('/feed/');
  }

  if (entry.url_class === 'landing') {
    return source.includes('e-landing-page-sitemap.xml');
  }

  if (entry.url_class === 'video') {
    return (source.includes('video-sitemap.xml') || source.includes('post-sitemap.xml')) && !entry.legacy_url.endsWith('/feed/');
  }

  if (entry.url_class === 'post') {
    return source.includes('post-sitemap.xml') && !entry.legacy_url.endsWith('/feed/');
  }

  return !entry.legacy_url.endsWith('/feed/');
}

function parseInsertLine(line) {
  const match = /^INSERT INTO `([^`]+)` VALUES ([\s\S]*);$/u.exec(line);
  if (!match) {
    return null;
  }

  const table = match[1];
  const valuesSection = match[2];
  const rows = [];
  let row = null;
  let field = '';
  let inString = false;
  let isEscaped = false;

  for (let index = 0; index < valuesSection.length; index += 1) {
    const character = valuesSection[index];

    if (inString) {
      if (isEscaped) {
        field += decodeSqlEscape(character);
        isEscaped = false;
        continue;
      }

      if (character === '\\') {
        isEscaped = true;
        continue;
      }

      if (character === "'") {
        if (valuesSection[index + 1] === "'") {
          field += "'";
          index += 1;
          continue;
        }

        inString = false;
        continue;
      }

      field += character;
      continue;
    }

    if (character === "'") {
      inString = true;
      continue;
    }

    if (character === '(') {
      row = [];
      field = '';
      continue;
    }

    if (!row) {
      continue;
    }

    if (character === ',') {
      row.push(parseSqlValue(field));
      field = '';
      continue;
    }

    if (character === ')') {
      row.push(parseSqlValue(field));
      rows.push(row);
      row = null;
      field = '';
      continue;
    }

    field += character;
  }

  return { table, rows };
}

function parseSqlValue(rawValue) {
  const trimmed = rawValue.trim();
  if (trimmed === 'NULL') {
    return null;
  }
  if (/^-?\d+$/u.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
}

function decodeSqlEscape(character) {
  switch (character) {
    case '0':
      return '\0';
    case 'b':
      return '\b';
    case 'n':
      return '\n';
    case 'r':
      return '\r';
    case 't':
      return '\t';
    case 'Z':
      return '\x1a';
    default:
      return character;
  }
}

async function readTextFile(filePath, label) {
  try {
    return await fsp.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read ${label} at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

async function getFileTimestamp(filePath) {
  const stats = await fsp.stat(filePath);
  return stats.mtime.toISOString();
}

async function writeJsonFile(filePath, value) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function resolveWithinRoot(rootPath, relativePath) {
  const absoluteRoot = path.resolve(rootPath);
  const candidate = path.resolve(absoluteRoot, relativePath);
  if (candidate !== absoluteRoot && !candidate.startsWith(`${absoluteRoot}${path.sep}`)) {
    throw new Error(`Resolved filesystem path escapes the approved root: ${relativePath}`);
  }
  return candidate;
}

function getNodeText(value) {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    if (typeof value.__cdata === 'string') {
      return value.__cdata;
    }
    if (typeof value.__text === 'string') {
      return value.__text;
    }
  }
  return null;
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null) {
    return [];
  }
  return [value];
}

function isMissingValue(value) {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0);
}

function createCountBucket() {
  return Object.create(null);
}

function incrementBucket(bucket, key) {
  const normalizedKey = key ?? 'unknown';
  bucket[normalizedKey] = (bucket[normalizedKey] ?? 0) + 1;
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

function createSqlStats() {
  return {
    recovered: 0,
    byPostType: createCountBucket(),
    byStatus: createCountBucket()
  };
}

function createFilesystemStats() {
  return {
    verified: 0,
    missing: 0
  };
}

function sortRecords(records) {
  return records.sort((left, right) => {
    const pathDelta = String(left.legacyUrl ?? '').localeCompare(String(right.legacyUrl ?? ''));
    if (pathDelta !== 0) {
      return pathDelta;
    }
    return String(left.sourceId).localeCompare(String(right.sourceId));
  });
}

function stabilizeRecord(record) {
  return {
    ...record,
    sourceChannels: [...record.sourceChannels].sort(),
    categories: sortTerms(record.categories),
    tags: sortTerms(record.tags),
    mediaRefs: [...new Set(record.mediaRefs)].sort()
  };
}

function sortQuarantine(quarantine) {
  return [...quarantine].sort((left, right) => {
    const sourceIdDelta = String(left.sourceId ?? '').localeCompare(String(right.sourceId ?? ''));
    if (sourceIdDelta !== 0) {
      return sourceIdDelta;
    }
    return left.errorType.localeCompare(right.errorType);
  });
}

function sortByLegacyUrl(left, right) {
  return left.legacyUrl.localeCompare(right.legacyUrl);
}

function safeJsonFragment(value) {
  try {
    return trimFragment(JSON.stringify(value));
  } catch {
    return '[unserializable]';
  }
}

function trimFragment(value, limit = 1200) {
  const stringValue = String(value ?? '');
  return stringValue.length > limit ? `${stringValue.slice(0, limit)}...` : stringValue;
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

main().catch((error) => {
  console.error(`Extraction failed: ${error.message}`);
  process.exitCode = 1;
});