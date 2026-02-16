/**
 * Component Validation Schemas
 * Zod schemas for component CRUD operations
 */

import { z } from 'zod';
import { frameworkEnum } from './projects';

export const componentTypeEnum = z.enum([
  'button',
  'card',
  'form',
  'input',
  'modal',
  'navbar',
  'sidebar',
  'table',
  'custom',
]);

export const createComponentSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  component_type: componentTypeEnum,
  framework: frameworkEnum,
  code_content: z.string(),
  props: z.record(z.string(), z.any()).default({}),
});

export const updateComponentSchema = createComponentSchema
  .omit({ project_id: true })
  .partial();

export const componentQuerySchema = z.object({
  project_id: z.string().uuid(),
});

export type CreateComponentInput = z.infer<typeof createComponentSchema>;
export type UpdateComponentInput = z.infer<typeof updateComponentSchema>;
export type ComponentQuery = z.infer<typeof componentQuerySchema>;
