import { z } from 'zod';
import { frameworkEnum } from './projects';

export const templateCategoryEnum = z.enum([
  'landing',
  'dashboard',
  'auth',
  'ecommerce',
  'blog',
  'portfolio',
  'admin',
  'other',
]);

export const createTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  category: templateCategoryEnum,
  framework: frameworkEnum,
  code: z.object({
    files: z
      .array(
        z.object({
          path: z.string().min(1),
          content: z.string().min(1),
        })
      )
      .min(1),
  }),
});

export const templateQuerySchema = z.object({
  category: templateCategoryEnum.optional(),
  framework: frameworkEnum.optional(),
  search: z.string().optional(),
  sort: z.enum(['created_at', 'name']).default('created_at'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type TemplateQuery = z.infer<typeof templateQuerySchema>;
