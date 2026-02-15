// Create a factory function for mock Supabase client
export const createMockSupabaseClient = () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
});

// Export a default instance for convenience
export const mockSupabaseClient = createMockSupabaseClient();

// Mock the Supabase client creation - will be called fresh for each component
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

export const resetSupabaseMocks = () => {
  Object.values(mockSupabaseClient.auth).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      (fn as jest.Mock).mockClear();
    }
  });
};
