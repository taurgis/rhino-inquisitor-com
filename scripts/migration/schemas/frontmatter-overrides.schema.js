import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1);

export const FrontMatterOverrideSchema = z
  .object({
    title: nonEmptyString.optional(),
    description: nonEmptyString.optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Each front matter override entry must define at least one field.'
  });

export const FrontMatterOverridesFileSchema = z.record(z.string().min(1), FrontMatterOverrideSchema);