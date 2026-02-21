/**
 * Environment setup for Jest tests
 * This file runs before any modules are imported to set required environment variables
 */

// Required environment variables for tests (mock values - not real credentials)
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key';
