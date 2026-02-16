/**
 * Environment Configuration
 * Validates and exports environment variables
 */

import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const envSchema = z.object({
  // API Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_URL: z.string().url().optional(),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Gemini API
  GEMINI_API_KEY: z.string().min(1),

  // CORS
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_URL_PROD: z.string().url().optional(),

  // Rate Limiting
  RATE_LIMIT_GENERATION: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_HOURS: z.coerce.number().default(1),
  RATE_LIMIT_WEBSOCKET_MESSAGES: z.coerce.number().default(100),

  // WebSocket
  WS_HEARTBEAT_INTERVAL: z.coerce.number().default(30000),
  WS_MAX_CONNECTIONS: z.coerce.number().default(1000),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    console.error(error.issues);
    // In test mode, throw instead of exiting to allow test runners to handle
    if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
      throw new Error(`Environment validation failed: ${JSON.stringify(error.issues)}`);
    }
    process.exit(1);
  }
  throw error;
}

export { env };
