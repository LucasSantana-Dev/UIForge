/**
 * UIForge Express API Server
 * Main entry point for the API
 */

import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import healthRouter from './routes/health';
import generateRouter from './routes/generate';
import aiSimplifiedRouter from './routes/ai-simplified';

const app = express();

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging with privacy controls
const enableIpLogging = process.env.ENABLE_IP_LOGGING === 'true';
const ipTransform = (ip: string | undefined): string => {
  if (!ip) return 'unknown';
  // Hash or truncate IP for privacy (truncate last octet for IPv4)
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return 'redacted';
};

app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  const logData: any = {
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
  };

  if (enableIpLogging) {
    logData.ip = ipTransform(req.ip);
  }

  logger.info(`${req.method} ${req.path}`, logData);
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/api', generateRouter);
app.use('/api/ai', aiSimplifiedRouter); // Zero-cost AI routes

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Export for Cloudflare Workers
export default app;
