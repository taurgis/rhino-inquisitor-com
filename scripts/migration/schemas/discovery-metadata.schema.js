import { z } from 'zod';

export const discoveryFieldKeys = [
  'primaryTopic',
  'secondaryTopics',
  'contentType',
  'difficulty',
  'series',
  'summary',
  'relatedContent',
  'featuredHome'
];

export const derivedDiscoveryFieldKeys = ['readingTime', 'updateStatus'];
export const relatedContentBucketKeys = ['nextInTopic', 'adjacentTopic', 'foundational'];

const nonEmptyString = z.string().trim().min(1);
const siteRelativePathSchema = z
  .string()
  .trim()
  .regex(/^\/(?:|[a-z0-9/-]*[a-z0-9-]\/?)$/, 'Must be a lowercase site-relative path with leading slash and optional trailing slash.')
  .transform((value) => (value === '/' ? value : value.endsWith('/') ? value : `${value}/`));

function hasUniqueValues(values) {
  return new Set(values).size === values.length;
}

export const DiscoverySeriesSchema = z
  .object({
    id: nonEmptyString,
    title: nonEmptyString,
    position: z.number().int().positive().optional(),
    total: z.number().int().positive().optional(),
    landingPage: siteRelativePathSchema.optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.position && value.total && value.position > value.total) {
      ctx.addIssue({
        code: 'custom',
        path: ['position'],
        message: 'series.position must be less than or equal to series.total.'
      });
    }
  });

export const RelatedContentItemSchema = z
  .object({
    path: siteRelativePathSchema,
    title: nonEmptyString.optional(),
    description: nonEmptyString.optional()
  })
  .strict();

export const RelatedContentBucketsSchema = z
  .object({
    nextInTopic: z.array(RelatedContentItemSchema).min(1).optional(),
    adjacentTopic: z.array(RelatedContentItemSchema).min(1).optional(),
    foundational: z.array(RelatedContentItemSchema).min(1).optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    const bucketCount = relatedContentBucketKeys.filter((bucketKey) => Array.isArray(value[bucketKey])).length;
    if (bucketCount === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'relatedContent must define at least one curated bucket when present.'
      });
    }

    for (const bucketKey of relatedContentBucketKeys) {
      const bucket = value[bucketKey];
      if (!bucket) {
        continue;
      }

      const paths = bucket.map((entry) => entry.path);
      if (!hasUniqueValues(paths)) {
        ctx.addIssue({
          code: 'custom',
          path: [bucketKey],
          message: `${bucketKey} contains duplicate path values.`
        });
      }
    }
  });

export const DiscoveryParamsSchema = z
  .object({
    primaryTopic: nonEmptyString.optional(),
    secondaryTopics: z.array(nonEmptyString).min(1).refine(hasUniqueValues, 'secondaryTopics must not contain duplicates.').optional(),
    contentType: z.enum(['article', 'video', 'external', 'podcast']).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    series: DiscoverySeriesSchema.optional(),
    summary: z.array(nonEmptyString).min(1).optional(),
    relatedContent: RelatedContentBucketsSchema.optional(),
    featuredHome: z.boolean().optional()
  })
  .passthrough()
  .superRefine((value, ctx) => {
    for (const derivedField of derivedDiscoveryFieldKeys) {
      if (derivedField in value) {
        ctx.addIssue({
          code: 'custom',
          path: [derivedField],
          message: `${derivedField} remains Hugo-derived and must not be authored under params.`
        });
      }
    }
  });

export const DiscoveryMetadataCurationFileSchema = z.record(z.string().min(1), DiscoveryParamsSchema);
