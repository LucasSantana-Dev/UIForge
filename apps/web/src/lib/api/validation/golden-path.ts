import { z } from 'zod';

const goldenPathTypes = ['service', 'library', 'website', 'worker', 'api', 'package'] as const;

const goldenPathLifecycles = ['draft', 'beta', 'ga', 'deprecated'] as const;

export const goldenPathQuerySchema = z.object({
  search: z.string().max(200).optional(),
  type: z.enum(goldenPathTypes).optional(),
  lifecycle: z.enum(goldenPathLifecycles).optional(),
  framework: z.string().max(50).optional(),
  stack: z.string().max(50).optional(),
  language: z.string().max(50).optional(),
  tags: z.string().max(500).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const parameterSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['string', 'boolean', 'number', 'select']),
  required: z.boolean().optional(),
  default: z.unknown().optional(),
  description: z.string().max(500).optional(),
  options: z.array(z.string()).optional(),
});

const stepSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  action: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const createGoldenPathSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Name must be kebab-case (lowercase, hyphens only)'),
  display_name: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(goldenPathTypes),
  lifecycle: z.enum(goldenPathLifecycles).optional(),
  framework: z.string().min(1).max(50),
  language: z.string().min(1).max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  parameters: z.array(parameterSchema).max(20).optional(),
  steps: z.array(stepSchema).max(20).optional(),
  repository_url: z.string().url().optional(),
  documentation_url: z.string().url().optional(),
  icon: z.string().max(50).optional(),
});

export const updateGoldenPathSchema = createGoldenPathSchema.partial();

export type CreateGoldenPathInput = z.infer<typeof createGoldenPathSchema>;
export type UpdateGoldenPathInput = z.infer<typeof updateGoldenPathSchema>;
