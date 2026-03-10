import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import matter from 'gray-matter';
import { z } from 'zod';

import {
  DiscoveryParamsSchema,
  derivedDiscoveryFieldKeys,
  discoveryFieldKeys
} from './migration/schemas/discovery-metadata.schema.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultContentRoot = path.join(repoRoot, 'src/content');
const canonicalOrigin = 'https://www.rhino-inquisitor.com';
const canonicalHost = 'www.rhino-inquisitor.com';
const urlPattern = /^\/(?:|[a-z0-9/-]*[a-z0-9-]\/?)$/;
const aliasPattern = /^\/(?:|[a-z0-9/-]*[a-z0-9-]\/?)$/;
const isoDateTimePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const nonEmptyString = z.string().trim().min(1);
const optionalString = z.string().optional();
const optionalBoolean = z.boolean().optional();
const dateTimeValue = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString() : value),
  nonEmptyString
);

const seoSchema = z
  .object({
    noindex: optionalBoolean,
    ogImage: optionalString,
    twitterCard: z.enum(['summary', 'summary_large_image']).optional()
  })
  .partial()
  .optional();

const indexableBaseSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
    url: nonEmptyString,
    draft: z.boolean(),
    heroImage: optionalString,
    canonical: optionalString,
    aliases: z.array(nonEmptyString).optional(),
    seo: seoSchema,
    params: DiscoveryParamsSchema.optional()
  })
  .passthrough();

const postSchema = indexableBaseSchema.extend({
  date: dateTimeValue,
  lastmod: dateTimeValue,
  categories: z.array(nonEmptyString).min(1),
  tags: z.array(z.string())
});

const pageSchema = indexableBaseSchema.extend({
  lastmod: dateTimeValue
});

const defaultSchema = indexableBaseSchema;

const categorySchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
    draft: z.boolean(),
    heroImage: optionalString,
    canonical: optionalString,
    seo: seoSchema,
    params: DiscoveryParamsSchema.optional()
  })
  .passthrough();

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--content-dir':
        parsed.contentRoot = path.resolve(argv[++index]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return {
    contentRoot: parsed.contentRoot ?? defaultContentRoot
  };
}

function printHelp() {
  console.log(`Usage: node scripts/validate-frontmatter.js [options]

Options:
  --content-dir <path>  Override src/content validation root.
  --help                Show this help message.
`);
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function getContentType(relativePath) {
  const normalizedPath = toPosixPath(relativePath);

  if (normalizedPath.startsWith('posts/')) {
    return 'post';
  }

  if (normalizedPath.startsWith('pages/')) {
    return 'page';
  }

  if (normalizedPath.startsWith('categories/')) {
    return 'category';
  }

  return 'default';
}

function getSchema(contentType) {
  switch (contentType) {
    case 'post':
      return postSchema;
    case 'page':
      return pageSchema;
    case 'category':
      return categorySchema;
    default:
      return defaultSchema;
  }
}

function addError(errors, filePath, rule, message, field) {
  errors.push({ filePath, rule, message, field });
}

function isValidIsoDateTime(value) {
  return isoDateTimePattern.test(value) && !Number.isNaN(Date.parse(value));
}

function validateUrlValue(value) {
  return urlPattern.test(value) && !value.includes('//');
}

function validateCanonicalValue(value) {
  try {
    const canonicalUrl = new URL(value);

    return (
      canonicalUrl.protocol === 'https:' &&
      canonicalUrl.hostname === canonicalHost &&
      !canonicalUrl.search &&
      !canonicalUrl.hash &&
      value.startsWith(canonicalOrigin)
    );
  } catch {
    return false;
  }
}

function validateAliases(aliases, currentUrl, relativePath, errors) {
  if (!Array.isArray(aliases)) {
    return;
  }

  for (const alias of aliases) {
    if (!aliasPattern.test(alias) || alias.includes('//')) {
      addError(
        errors,
        relativePath,
        'alias_format',
        'aliases must be lowercase site-relative paths with leading and trailing slashes.',
        'aliases'
      );
      continue;
    }

    if (alias === currentUrl) {
      addError(
        errors,
        relativePath,
        'alias_self_reference',
        'aliases must not duplicate the primary url value.',
        'aliases'
      );
    }
  }
}

function validateAdditionalRules(contentType, data, relativePath, errors) {
  validateDiscoveryPlacement(data, relativePath, errors);

  if (contentType !== 'category') {
    if (!isValidIsoDateTime(data.lastmod)) {
      addError(
        errors,
        relativePath,
        'datetime_format',
        'lastmod must be a valid ISO 8601 datetime string.',
        'lastmod'
      );
    }
  }

  if (contentType === 'post' && !isValidIsoDateTime(data.date)) {
    addError(
      errors,
      relativePath,
      'datetime_format',
      'date must be a valid ISO 8601 datetime string.',
      'date'
    );
  }

  if (contentType !== 'category' && !validateUrlValue(data.url)) {
    addError(
      errors,
      relativePath,
      'url_format',
      'url must start and end with "/", be lowercase, and contain only a-z, 0-9, hyphens, and slashes.',
      'url'
    );
  }

  if (typeof data.canonical === 'string' && data.canonical.trim() !== '') {
    if (!validateCanonicalValue(data.canonical.trim())) {
      addError(
        errors,
        relativePath,
        'canonical_format',
        'canonical must be an absolute HTTPS URL on https://www.rhino-inquisitor.com with no query string or fragment.',
        'canonical'
      );
    }
  }

  if (contentType !== 'category') {
    validateAliases(data.aliases, data.url, relativePath, errors);
  }
}

function validateDiscoveryPlacement(data, relativePath, errors) {
  for (const fieldName of discoveryFieldKeys) {
    if (fieldName in data) {
      addError(
        errors,
        relativePath,
        'discovery_field_placement',
        `${fieldName} must live under params.${fieldName}, not as a top-level front matter field.`,
        fieldName
      );
    }
  }

  const params = data?.params;
  if (!params || typeof params !== 'object') {
    return;
  }

  for (const fieldName of derivedDiscoveryFieldKeys) {
    if (fieldName in params) {
      addError(
        errors,
        relativePath,
        'derived_field_authored',
        `${fieldName} remains Hugo-derived and must not be authored under params.`,
        `params.${fieldName}`
      );
    }
  }
}

function formatZodIssuePath(issuePath) {
  return issuePath.length === 0 ? 'front matter' : issuePath.join('.');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const markdownFiles = (await fg('**/*.md', {
    cwd: options.contentRoot,
    onlyFiles: true
  })).sort();

  if (markdownFiles.length === 0) {
    console.log(`No Markdown content found under ${toPosixPath(path.relative(repoRoot, options.contentRoot)) || '.'}. Front matter validation passed.`);
    return;
  }

  const errors = [];
  const urlToFiles = new Map();

  for (const relativePath of markdownFiles) {
    const absolutePath = path.join(options.contentRoot, relativePath);
    const normalizedPath = toPosixPath(relativePath);
    const contentType = getContentType(normalizedPath);
    const schema = getSchema(contentType);

    let parsed;

    try {
      parsed = matter.read(absolutePath);
    } catch (error) {
      addError(
        errors,
        normalizedPath,
        'frontmatter_parse',
        error instanceof Error ? error.message : 'Unable to parse front matter.'
      );
      continue;
    }

    const result = schema.safeParse(parsed.data);

    if (!result.success) {
      for (const issue of result.error.issues) {
        addError(
          errors,
          normalizedPath,
          'schema',
          issue.message,
          formatZodIssuePath(issue.path)
        );
      }
      continue;
    }

    const data = result.data;
    validateAdditionalRules(contentType, data, normalizedPath, errors);

    if (contentType !== 'category' && typeof data.url === 'string' && data.url.trim() !== '') {
      const currentFiles = urlToFiles.get(data.url) ?? [];
      currentFiles.push(normalizedPath);
      urlToFiles.set(data.url, currentFiles);
    }
  }

  for (const [urlValue, filePaths] of urlToFiles.entries()) {
    if (filePaths.length > 1) {
      for (const filePath of filePaths) {
        addError(
          errors,
          filePath,
          'url_collision',
          `url collides with another content file: ${urlValue}`,
          'url'
        );
      }
    }
  }

  if (errors.length > 0) {
    console.log(`Front matter validation failed with ${errors.length} error(s):`);

    for (const error of errors) {
      const fieldSuffix = error.field ? ` ${error.field}` : '';
      console.log(`- ${error.filePath} [${error.rule}]${fieldSuffix}: ${error.message}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log(`Front matter validation passed for ${markdownFiles.length} Markdown file(s).`);
}

await main();