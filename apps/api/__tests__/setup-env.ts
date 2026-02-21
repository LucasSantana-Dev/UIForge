/**
 * Environment setup for tests
 * Sets required environment variables before modules are loaded
 */

// Set required env vars for test environment (only if not already set)
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key-for-ci';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key-for-ci';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
