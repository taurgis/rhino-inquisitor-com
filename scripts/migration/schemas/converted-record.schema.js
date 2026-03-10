import { z } from 'zod';

import { CanonicalRecordSchema } from './record.schema.js';

export const ConversionWarningSchema = z.strictObject({
  code: z.string().min(1).describe('Stable warning code emitted during Markdown conversion.'),
  message: z.string().min(1).describe('Human-readable warning message for maintainers and audit logs.')
});

export const ConvertedRecordSchema = CanonicalRecordSchema.extend({
  bodyMarkdown: z.string().describe('Goldmark-compatible Markdown body generated from bodyHtml.'),
  conversionStatus: z
    .enum(['converted', 'skipped'])
    .describe('Whether the record produced Markdown content or was skipped because the source body was empty.'),
  manualReviewRequired: z
    .boolean()
    .describe('Whether the record still contains a manual-review marker produced by a controlled fallback rule.'),
  fallbackTypes: z
    .array(z.string().min(1))
    .describe('Deterministic fallback categories emitted while converting the record.'),
  conversionWarnings: z
    .array(ConversionWarningSchema)
    .describe('Non-blocking conversion warnings such as missing image alt attributes.')
});

/** @typedef {z.infer<typeof ConversionWarningSchema>} ConversionWarning */
/** @typedef {z.infer<typeof ConvertedRecordSchema>} ConvertedRecord */