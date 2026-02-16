/**
 * Health Check Route
 * Status endpoint for monitoring
 */

import { Router } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { supabase } from '../middleware/auth';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    supabase: 'connected' | 'disconnected';
    gemini: 'available' | 'unavailable' | 'not_configured';
    mcp: 'connected' | 'disconnected' | 'not_implemented';
    websocket: 'active' | 'inactive' | 'not_implemented';
  };
  version: string;
}

/**
 * GET /health
 * Health check endpoint (no auth required)
 */
router.get('/', async (_req, res) => {
  try {
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        supabase: 'disconnected',
        gemini: 'not_configured',
        mcp: 'not_implemented',
        websocket: 'not_implemented',
      },
      version: '0.1.0',
    };

    // Check Supabase connection
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      health.services.supabase = error ? 'disconnected' : 'connected';

      // If there's a query-level error, mark as degraded
      if (error) {
        health.status = 'degraded';
      }
    } catch (error) {
      logger.error('Supabase health check failed', error);
      health.services.supabase = 'disconnected';
      health.status = 'degraded';
    }

    // Check Gemini API key
    health.services.gemini = env.GEMINI_API_KEY ? 'available' : 'not_configured';

    // Determine overall status based on critical services
    if (health.services.supabase === 'disconnected') {
      health.status = 'unhealthy';
    } else if (!env.GEMINI_API_KEY) {
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

export default router;
