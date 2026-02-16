/**
 * Component Generation Route with Streaming
 * POST /api/generate - Stream component generation using Gemini AI
 */

import { Router } from 'express';
import { z } from 'zod';
import { streamComponentGeneration, hasCodePatterns, formatCode } from '../services/gemini';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimit';

const MAX_CODE_LENGTH = 100_000; // Maximum code length in characters

const router = Router();

// Request validation schema
const generateSchema = z.object({
  framework: z.enum(['react', 'vue', 'angular', 'svelte']),
  componentLibrary: z.enum(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).optional(),
  description: z.string().min(10).max(1000),
  style: z.enum(['modern', 'minimal', 'colorful']).optional(),
  typescript: z.boolean().optional(),
});

// Create rate limiters
const generateLimiter = createRateLimiter({ limit: 10, window: 60000 }); // 10 requests per minute
const validateLimiter = createRateLimiter({ limit: 50, window: 60000 }); // 50 requests per minute
const formatLimiter = createRateLimiter({ limit: 50, window: 60000 }); // 50 requests per minute

/**
 * POST /api/generate
 * Stream component generation with Server-Sent Events (SSE)
 */
router.post(
  '/generate',
  authMiddleware,
  generateLimiter,
  async (req, res) => {
    try {
      // Validate request body
      const validationResult = generateSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          error: {
            message: 'Invalid request body',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.issues,
          },
        });
        return;
      }

      const options = validationResult.data;

      logger.info('Starting component generation', {
        userId: req.user?.id,
        framework: options.framework,
        description: options.description.substring(0, 50),
      });

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

      // Send initial event
      res.write(`data: ${JSON.stringify({ type: 'start', timestamp: Date.now() })}\n\n`);

      let generatedCode = '';
      const controller = new AbortController();
      let clientDisconnected = false;

      // Handle client disconnect
      const onClose = () => {
        clientDisconnected = true;
        controller.abort();
        logger.info('Client disconnected during generation', { userId: req.user?.id });
      };
      res.on('close', onClose);

      // Stream generation
      try {
        for await (const chunk of streamComponentGeneration({ ...options, signal: controller.signal })) {
          if (clientDisconnected) break;

          generatedCode += chunk;

          // Send chunk as SSE event
          if (!clientDisconnected) {
            res.write(`data: ${JSON.stringify({
              type: 'chunk',
              content: chunk,
              timestamp: Date.now()
            })}\n\n`);
          }
        }

        if (!clientDisconnected) {
          // Send completion event
          res.write(`data: ${JSON.stringify({
            type: 'complete',
            totalLength: generatedCode.length,
            timestamp: Date.now()
          })}\n\n`);

          logger.info('Component generation completed', {
            userId: req.user?.id,
            codeLength: generatedCode.length,
          });

          res.end();
        }
      } catch (streamError: any) {
        // Don't treat abort as error
        if (streamError?.name === 'AbortError' || clientDisconnected) {
          logger.info('Generation aborted due to client disconnect');
          return;
        }

        logger.error('Streaming generation failed', streamError);

        // Send error event
        if (!clientDisconnected) {
          res.write(`data: ${JSON.stringify({
            type: 'error',
            message: 'Generation failed',
            timestamp: Date.now()
          })}\n\n`);

          res.end();
        }
      } finally {
        res.off('close', onClose);
      }
    } catch (error) {
      logger.error('Generation request failed', error);

      if (!res.headersSent) {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'GENERATION_ERROR',
          },
        });
      }
    }
  }
);

/**
 * POST /api/validate - Validate code patterns
 */
router.post(
  '/validate',
  validateLimiter,
  async (req, res) => {
    try {
      const { code, language } = req.body;

      if (!code || !language) {
        res.status(400).json({
          error: {
            message: 'Missing required fields: code, language',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      if (code.length > MAX_CODE_LENGTH) {
        res.status(413).json({
          error: {
            message: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`,
            code: 'PAYLOAD_TOO_LARGE',
          },
        });
        return;
      }

      // Validate code patterns
      const isValid = await hasCodePatterns(code, language);

      res.json({
        valid: isValid,
        language,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Code validation failed', error);
      res.status(500).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
        },
      });
    }
  }
);

/**
 * POST /api/format - Format generated code
 */
router.post(
  '/format',
  formatLimiter,
  async (req, res) => {
    try {
      const { code, language } = req.body;

      if (!code || !language) {
        res.status(400).json({
          error: {
            message: 'Missing required fields: code, language',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      if (code.length > MAX_CODE_LENGTH) {
        res.status(413).json({
          error: {
            message: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`,
            code: 'PAYLOAD_TOO_LARGE',
          },
        });
        return;
      }

      // Format code
      const formatted = await formatCode(code, language);

      res.json({
        code: formatted,
        language,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Code formatting failed', error);
      res.status(500).json({
        error: {
          message: 'Formatting failed',
          code: 'FORMATTING_ERROR',
        },
      });
    }
  }
);

export default router;
