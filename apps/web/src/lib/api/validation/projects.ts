/**
 * Project Validation Schemas
 * Zod schemas for project CRUD operations
 */

import { z } from 'zod';
import { sanitizeText } from '@/lib/security/sanitize';

export const frameworkEnum = z.enum(['react', 'vue', 'angular', 'svelte']);

export const componentLibraryEnum = z.enum([
  'none',
  'shadcn',
  'radix',
  'material',
  'chakra',
  'ant',
]);

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100).transform(sanitizeText),
  description: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v ? sanitizeText(v) : v)),
  framework: frameworkEnum,
  component_library: componentLibraryEnum.default('none'),
  is_public: z.boolean().default(false),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['created_at', 'updated_at', 'name']).default('updated_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  framework: frameworkEnum.optional(),
  is_public: z
    .preprocess((val) => (typeof val === 'string' ? val === 'true' : val), z.boolean())
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
