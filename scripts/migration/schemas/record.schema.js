import { z } from 'zod';

const sourceChannelSchema = z.enum(['wxr', 'rest', 'sql', 'filesystem', 'fallback']);
const canonicalStatusSchema = z.enum(['publish', 'draft', 'private', 'trash']);
const dispositionSchema = z.enum(['keep', 'merge', 'retire']);
const isoUtcDateTimeSchema = z
  .iso.datetime({ offset: true })
  .refine((value) => value.endsWith('Z'), 'Must be normalized to a UTC timestamp.')
  .describe('ISO 8601 UTC timestamp.');

function isRelativePath(value) {
  return typeof value === 'string'
    && value.startsWith('/')
    && !value.startsWith('//')
    && !/^https?:\/\//iu.test(value);
}

function isAbsoluteHttpUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function hasUniqueValues(values) {
  return new Set(values).size === values.length;
}

const relativePathSchema = z
  .string()
  .min(1)
  .refine(isRelativePath, 'Must be a relative path beginning with /.')
  .describe('Canonical relative path or query-style legacy path.');

const mediaUrlSchema = z
  .string()
  .min(1)
  .refine(isAbsoluteHttpUrl, 'Must be an absolute http(s) URL.')
  .describe('Absolute media URL referenced by the source HTML.');

export const CanonicalTaxonomyTermSchema = z.strictObject({
  name: z.string().describe('Human-readable taxonomy label.'),
  slug: z.string().min(1).describe('Lowercase normalized taxonomy slug.')
});

export const CanonicalRecordSchema = z
  .strictObject({
    sourceId: z.string().min(1).describe('Unique WordPress source record identifier.'),
    sourceType: sourceChannelSchema.describe('Primary source channel used for the canonical record.'),
    sourceChannels: z
      .array(sourceChannelSchema)
      .min(1)
      .refine(hasUniqueValues, 'Duplicate source channels are not allowed.')
      .describe('All source channels that contributed to the record.'),
    postType: z.string().min(1).describe('Normalized WordPress post type or custom content type.'),
    status: canonicalStatusSchema.describe('Canonical publication lifecycle status.'),
    titleRaw: z.string().describe('Original title text after entity decoding and UTF-8 cleanup.'),
    excerptRaw: z.string().describe('Original excerpt text after entity decoding and UTF-8 cleanup.'),
    bodyHtml: z.string().describe('Raw HTML body retained for downstream conversion.'),
    slug: z.string().describe('Normalized WordPress slug used for deterministic file naming.'),
    publishedAt: isoUtcDateTimeSchema,
    modifiedAt: isoUtcDateTimeSchema,
    author: z.string().min(1).describe('Author display name or deterministic fallback identifier.'),
    categories: z.array(CanonicalTaxonomyTermSchema).describe('Normalized category terms.'),
    tags: z.array(CanonicalTaxonomyTermSchema).describe('Normalized tag terms.'),
    legacyUrl: relativePathSchema.describe('Original legacy WordPress path used to join the URL manifest.'),
    targetUrl: relativePathSchema.nullable().describe('Final Hugo target path; null only for retire records.'),
    disposition: dispositionSchema.describe('Approved URL disposition from the manifest.'),
    aliasUrls: z
      .array(relativePathSchema)
      .refine(hasUniqueValues, 'Duplicate alias URLs are not allowed.')
      .describe('Approved legacy URLs that should redirect to targetUrl.'),
    mediaRefs: z
      .array(mediaUrlSchema)
      .refine(hasUniqueValues, 'Duplicate media references are not allowed.')
      .describe('Absolute media asset URLs referenced by the body HTML.'),
    _raw: z
      .record(z.string(), z.unknown())
      .describe('Traceability payload preserving raw source fields and normalization notes.')
  })
  .superRefine((record, ctx) => {
    if (record.disposition === 'retire' && record.targetUrl !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['targetUrl'],
        message: 'Retire records must emit targetUrl: null.'
      });
    }

    if ((record.disposition === 'keep' || record.disposition === 'merge') && record.targetUrl == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['targetUrl'],
        message: 'Keep and merge records require a non-null targetUrl.'
      });
    }

    if (record.targetUrl && record.aliasUrls.includes(record.targetUrl)) {
      ctx.addIssue({
        code: 'custom',
        path: ['aliasUrls'],
        message: 'Alias URLs must not include the canonical targetUrl.'
      });
    }
  });

/** @typedef {z.infer<typeof CanonicalTaxonomyTermSchema>} CanonicalTaxonomyTerm */
/** @typedef {z.infer<typeof CanonicalRecordSchema>} CanonicalRecord */
