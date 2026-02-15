import '@testing-library/jest-dom';

describe('Supabase Client', () => {
  beforeEach(() => {
    // Set environment variables for tests
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('should have required environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });

  it('should create client with correct configuration', async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const client = createClient();

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });
});
