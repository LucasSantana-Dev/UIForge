import { z } from 'zod';
import { sanitizeText } from '@/lib/security/sanitize';

export const catalogEntryTypeEnum = z.enum([
  'domain',
  'system',
  'service',
  'component',
  'api',
  'library',
  'website',
]);

export const catalogLifecycleEnum = z.enum(['experimental', 'production', 'deprecated']);

export const createCatalogEntrySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
  display_name: z.string().min(1).max(200).transform(sanitizeText),
  type: catalogEntryTypeEnum,
  lifecycle: catalogLifecycleEnum,
  description: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : v)),
  team: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v ? sanitizeText(v) : v)),
  repository_url: z.string().url().optional().nullable(),
  documentation_url: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  dependencies: z
    .array(z.string().regex(/^[a-z0-9-]+$/))
    .max(50)
    .default([]),
  project_id: z.string().uuid().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const updateCatalogEntrySchema = createCatalogEntrySchema.partial();

export const catalogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['created_at', 'updated_at', 'name']).default('updated_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  type: catalogEntryTypeEnum.optional(),
  lifecycle: catalogLifecycleEnum.optional(),
  tags: z.string().optional(),
  parent_id: z.string().uuid().optional(),
});

export const importCatalogYamlSchema = z.object({
  yaml: z.string().min(1).max(50000),
  source: z.enum(['file', 'github']).default('file'),
});

export type CatalogEntryType = z.infer<typeof catalogEntryTypeEnum>;
export type CreateCatalogEntryInput = z.infer<typeof createCatalogEntrySchema>;
export type UpdateCatalogEntryInput = z.infer<typeof updateCatalogEntrySchema>;
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
