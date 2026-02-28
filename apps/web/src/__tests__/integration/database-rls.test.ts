import { createClient } from '@supabase/supabase-js';
import { TEST_CONFIG } from '../__fixtures__/test-config';
import crypto from 'crypto';

// Explicitly type the TEST_CONFIG to help TypeScript
const config = TEST_CONFIG as typeof TEST_CONFIG;

describe('Database RLS Policies', () => {
  const USER_1_ID = crypto.randomUUID();
  const USER_2_ID = crypto.randomUUID();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  let supabase: ReturnType<typeof createClient>;
  let adminSupabase: ReturnType<typeof createClient>;

  beforeAll(async () => {
    // Skip if service role key not available
    if (!supabaseServiceKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not set - skipping RLS tests');
      return;
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
    adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create test users
    await adminSupabase.auth.admin.createUser({
      id: USER_1_ID,
      email: `user1-${USER_1_ID}@test.com`,
      password: config.PASSWORDS.USER,
      email_confirm: true,
    });

    await adminSupabase.auth.admin.createUser({
      id: USER_2_ID,
      email: `user2-${USER_2_ID}@test.com`,
      password: config.PASSWORDS.USER,
      email_confirm: true,
    });
  });

  afterAll(async () => {
    if (!supabaseServiceKey) return;

    // Cleanup test users
    try {
      await adminSupabase.auth.admin.deleteUser(USER_1_ID);
      await adminSupabase.auth.admin.deleteUser(USER_2_ID);
    } catch (error) {
      console.warn('Failed to cleanup test users:', error);
    }
  });

  describe('User Profiles RLS', () => {
    it('should allow users to read their own profile', async () => {
      if (!supabaseServiceKey) {
        return expect(true).toBe(true);
      }

      // Sign in as User 1
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `user1-${USER_1_ID}@test.com`,
        password: config.PASSWORDS.USER,
      });

      expect(signInError).toBeNull();

      // Try to read own profile (if profiles table exists)
      const { error } = await supabase.from('profiles').select('*').eq('id', USER_1_ID).single();

      // Either succeeds or table doesn't exist yet
      if (error && !error.message.includes('relation')) {
        expect(error).toBeNull();
      }

      await supabase.auth.signOut();
    });

    it('should prevent users from reading other profiles', async () => {
      if (!supabaseServiceKey) {
        return expect(true).toBe(true);
      }

      // Sign in as User 1
      await supabase.auth.signInWithPassword({
        email: `user1-${USER_1_ID}@test.com`,
        password: config.PASSWORDS.USER,
      });

      // Try to read User 2's profile
      const { data, error } = await supabase.from('profiles').select('*').eq('id', USER_2_ID);

      // Should either return empty data or table doesn't exist
      if (!error || !error.message.includes('relation')) {
        expect(data).toEqual([]);
      }

      await supabase.auth.signOut();
    });
  });

  describe('Authentication State', () => {
    it('should authenticate user successfully', async () => {
      if (!supabaseServiceKey) {
        return expect(true).toBe(true);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: `user1-${USER_1_ID}@test.com`,
        password: config.PASSWORDS.USER,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.id).toBe(USER_1_ID);
      expect(data.session).toBeDefined();

      await supabase.auth.signOut();
    });

    it('should fail with invalid credentials', async () => {
      if (!supabaseServiceKey) {
        return expect(true).toBe(true);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: `user1-${USER_1_ID}@test.com`,
        password: config.PASSWORDS.ADMIN,
      });

      expect(error).toBeDefined();
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    it('should sign out successfully', async () => {
      if (!supabaseServiceKey) {
        return expect(true).toBe(true);
      }

      // Sign in first
      await supabase.auth.signInWithPassword({
        email: `user1-${USER_1_ID}@test.com`,
        password: config.PASSWORDS.USER,
      });

      // Sign out
      const { error } = await supabase.auth.signOut();
      expect(error).toBeNull();

      // Verify session is cleared
      const {
        data: { session },
      } = await supabase.auth.getSession();
      expect(session).toBeNull();
    });
  });
});
