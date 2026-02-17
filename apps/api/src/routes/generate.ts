/**
 * Component Generation Route with Streaming
 * POST /api/generate - Stream component generation using Gemini AI
 */

import { Router } from 'express';
import { z } from 'zod';
import { streamComponentGeneration } from '../services/ai-generation';
import { hasCodePatterns, formatCode } from '../services/gemini';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimit';

const MAX_CODE_LENGTH = 100_000; // Maximum code length in characters

const router = Router();

// Request validation schema
const generateSchema = z.object({
  framework: z.enum(['react', 'vue', 'angular', 'svelte']),
  componentLibrary: z.enum(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).optional(),
  description: z.string().min(1).max(1000),
  style: z.enum(['modern', 'minimal', 'colorful']).optional(),
  typescript: z.boolean().optional(),
  aiProvider: z.enum(['openai', 'anthropic', 'google', 'auto']).optional(),
  useUserKey: z.boolean().optional(),
  userApiKey: z.string().optional(),
});

// Apply middleware
router.use(authMiddleware);
router.use(createRateLimiter({ limit: 10, window: 60 * 60 * 1000 })); // 10 requests per hour

/**
 * POST /api/generate
 * Stream component generation
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validation = generateSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid request body',
        details: validation.error.issues,
      });
      return;
    }

    const options = validation.data;

    logger.info('Starting component generation', {
      framework: options.framework,
      library: options.componentLibrary,
      aiProvider: options.aiProvider,
      useUserKey: options.useUserKey,
    });

    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Start streaming generation
    try {
      let fullCode = '';
      
      for await (const chunk of streamComponentGeneration(options)) {
        fullCode += chunk;
        
        // Send chunk to client
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }

      // Validate generated code
      const isValidCode = await hasCodePatterns(fullCode, options.typescript ? 'typescript' : 'javascript');
      
      if (!isValidCode) {
        res.write(`data: ${JSON.stringify({ 
          type: 'warning', 
          message: 'Generated code may not be valid' 
        })}\n\n`);
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        code: fullCode,
        isValid: isValidCode
      })}\n\n`);

      logger.info('Component generation completed', {
        framework: options.framework,
        codeLength: fullCode.length,
        isValid: isValidCode,
      });

    } catch (generationError) {
      logger.error('Generation failed', generationError);
      
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: generationError instanceof Error ? generationError.message : 'Unknown error'
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    logger.error('Route error', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } else {
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: 'Internal server error'
      })}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/validate
 * Validate generated code
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, language = 'typescript' } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        error: 'Code is required and must be a string',
      });
      return;
    }

    if (code.length > MAX_CODE_LENGTH) {
      res.status(400).json({
        error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`,
      });
      return;
    }

    const isValid = await hasCodePatterns(code, language);

    res.json({
      isValid,
      language,
      length: code.length,
    });

  } catch (error) {
    logger.error('Validation error', error);
    res.status(500).json({
      error: 'Validation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/format
 * Format code using AI
 */
router.post('/format', async (req, res) => {
  try {
    const { code, language = 'typescript', apiKey, useUserKey = false } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        error: 'Code is required and must be a string',
      });
      return;
    }

    if (code.length > MAX_CODE_LENGTH) {
      res.status(400).json({
        error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`,
      });
      return;
    }

    const formattedCode = await formatCode(code, language, apiKey, useUserKey);

    res.json({
      originalCode: code,
      formattedCode,
      language,
    });

  } catch (error) {
    logger.error('Formatting error', error);
    res.status(500).json({
      error: 'Formatting failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;