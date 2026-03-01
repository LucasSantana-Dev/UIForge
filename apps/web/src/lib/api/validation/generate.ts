import { z } from 'zod';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const generateSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters. Add more detail about your component.')
    .max(2000, 'Description is too long (max 2000 characters). Try to be more concise.'),
  framework: z.enum(['react', 'vue', 'angular', 'svelte']).default('react'),
  projectId: z.string().uuid('Invalid project ID').optional(),
  componentLibrary: z.enum(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).optional(),
  style: z.enum(['modern', 'minimal', 'colorful']).optional(),
  typescript: z.boolean().optional(),
  userApiKey: z.string().min(1).optional(),
  provider: z.enum(['google', 'openai', 'anthropic', 'siza']).default('siza'),
  model: z.string().min(1).optional(),
  useRag: z.boolean().optional(),
  imageBase64: z.string().max(MAX_IMAGE_SIZE, 'Image too large (max ~5MB)').optional(),
  imageMimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']).optional(),
  colorMode: z.enum(['dark', 'light', 'both']).optional(),
  primaryColor: z.string().regex(hexColorRegex, 'Must be a hex color (e.g. #7c3aed)').optional(),
  secondaryColor: z.string().regex(hexColorRegex, 'Must be a hex color (e.g. #7c3aed)').optional(),
  accentColor: z.string().regex(hexColorRegex, 'Must be a hex color (e.g. #7c3aed)').optional(),
  animation: z.enum(['none', 'subtle', 'standard', 'rich']).optional(),
  spacing: z.enum(['compact', 'default', 'spacious']).optional(),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']).optional(),
  typography: z.enum(['system', 'sans', 'serif', 'mono']).optional(),
  brandHeadingFont: z.string().max(100).optional(),
  brandBodyFont: z.string().max(100).optional(),
  brandSemanticColors: z
    .object({
      success: z.string().regex(hexColorRegex, 'Must be a hex color (e.g. #7c3aed)'),
      warning: z.string().regex(hexColorRegex, 'Must be a hex color (e.g. #7c3aed)'),
      error: z.string().regex(hexColorRegex, 'Must be a hex color (e.g. #7c3aed)'),
      info: z.string().regex(hexColorRegex, 'Must be a hex color (e.g. #7c3aed)'),
    })
    .optional(),
  skillIds: z
    .array(z.string().uuid('Invalid skill ID'))
    .max(3, 'You can select up to 3 skills')
    .optional(),
  skillParams: z.record(z.string(), z.any()).optional(),
  parentGenerationId: z.string().uuid('Invalid generation ID').optional(),
  previousCode: z.string().max(50000, 'Previous code is too large (max 50KB)').optional(),
  refinementPrompt: z
    .string()
    .min(3, 'Refinement prompt must be at least 3 characters')
    .max(1000, 'Refinement prompt is too long (max 1000 characters)')
    .optional(),
});

export type GenerateInput = z.infer<typeof generateSchema>;
