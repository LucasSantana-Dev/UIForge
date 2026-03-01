import { z } from 'zod';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const generateSchema = z.object({
  description: z.string().min(10).max(2000),
  framework: z.enum(['react', 'vue', 'angular', 'svelte']).default('react'),
  projectId: z.string().uuid().optional(),
  componentLibrary: z.enum(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).optional(),
  style: z.enum(['modern', 'minimal', 'colorful']).optional(),
  typescript: z.boolean().optional(),
  userApiKey: z.string().min(1).optional(),
  provider: z.enum(['google', 'openai', 'anthropic', 'siza']).default('google'),
  model: z.string().min(1).optional(),
  useRag: z.boolean().optional(),
  imageBase64: z.string().max(MAX_IMAGE_SIZE, 'Image too large (max ~5MB)').optional(),
  imageMimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']).optional(),
  colorMode: z.enum(['dark', 'light', 'both']).optional(),
  primaryColor: z.string().regex(hexColorRegex).optional(),
  secondaryColor: z.string().regex(hexColorRegex).optional(),
  accentColor: z.string().regex(hexColorRegex).optional(),
  animation: z.enum(['none', 'subtle', 'standard', 'rich']).optional(),
  spacing: z.enum(['compact', 'default', 'spacious']).optional(),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']).optional(),
  typography: z.enum(['system', 'sans', 'serif', 'mono']).optional(),
  brandHeadingFont: z.string().max(100).optional(),
  brandBodyFont: z.string().max(100).optional(),
  brandSemanticColors: z
    .object({
      success: z.string().regex(hexColorRegex),
      warning: z.string().regex(hexColorRegex),
      error: z.string().regex(hexColorRegex),
      info: z.string().regex(hexColorRegex),
    })
    .optional(),
  skillIds: z.array(z.string().uuid()).max(3).optional(),
  skillParams: z.record(z.string(), z.any()).optional(),
  parentGenerationId: z.string().uuid().optional(),
  previousCode: z.string().max(50000).optional(),
  refinementPrompt: z.string().min(3).max(1000).optional(),
});

export type GenerateInput = z.infer<typeof generateSchema>;
