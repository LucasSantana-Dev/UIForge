/**
 * Zero-Cost AI API Routes
 * Replaces complex paid AI endpoints with simplified local AI service
 */

import { Router } from 'express';
import { generateComponent, streamComponentGeneration, getAIServiceStatus, healthCheck } from '../services/ai-generation-simplified';

const router = Router();

/**
 * Generate component using zero-cost local AI
 * POST /api/ai/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const result = await generateComponent(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Stream component generation using zero-cost local AI
 * POST /api/ai/stream
 */
router.post('/stream', async (req, res) => {
  try {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    });

    const stream = streamComponentGeneration(req.body);

    for await (const chunk of stream) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error('AI streaming error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Get AI service status
 * GET /api/ai/status
 */
router.get('/status', async (_req, res) => {
  try {
    const status = await getAIServiceStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Health check for AI service
 * GET /api/ai/health
 */
router.get('/health', async (_req, res) => {
  try {
    const health = await healthCheck();
    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

export default router;
