/**
 * Components API Integration Tests - Get, Update, Delete
 * Tests for GET, PATCH, DELETE /api/components/[id]
 */

import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from '../route';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import {
  uploadToStorage,
  downloadFromStorage,
  deleteFromStorage,
  validateFileSize,
} from '@/lib/api/storage';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/auth');
jest.mock('@/lib/api/rate-limit');
jest.mock('@/lib/api/storage');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockUploadToStorage = uploadToStorage as jest.MockedFunction<typeof uploadToStorage>;
const mockDownloadFromStorage = downloadFromStorage as jest.MockedFunction<
  typeof downloadFromStorage
>;
const mockDeleteFromStorage = deleteFromStorage as jest.MockedFunction<typeof deleteFromStorage>;
const mockValidateFileSize = validateFileSize as jest.MockedFunction<typeof validateFileSize>;

describe('GET /api/components/[id]', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as any;
  const mockComponent = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Button',
    component_type: 'button',
    framework: 'react',
    code_storage_path:
      '123e4567-e89b-12d3-a456-426614174000/123e4567-e89b-12d3-a456-426614174002.tsx',
    projects: {
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      is_public: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 119,
      resetAt: Date.now() + 60000,
    });

    mockDownloadFromStorage.mockResolvedValue(
      'export default function Button() { return <button>Click</button>; }'
    );

    mockValidateFileSize.mockReturnValue(true);
  });

  it('should return component with code for owner', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const mockChain: any = {};
    mockChain.select = jest.fn(() => mockChain);
    mockChain.eq = jest.fn(() => mockChain);
    mockChain.single = jest.fn().mockResolvedValueOnce({
      data: mockComponent,
      error: null,
    });

    const mockSupabase = {
      from: jest.fn(() => mockChain),
    };

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/comp-123');
    const response = await GET(request, {
      params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174002' }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data.component.name).toBe('Button');
    expect(result.data.component.code_content).toBeDefined();
    expect(mockDownloadFromStorage).toHaveBeenCalledWith(
      'project-files',
      '123e4567-e89b-12d3-a456-426614174000/123e4567-e89b-12d3-a456-426614174002.tsx',
      true
    );
  });

  it('should return 404 for non-existent component', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    });

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/invalid');
    const response = await GET(request, { params: Promise.resolve({ id: 'invalid' }) });

    expect(response.status).toBe(404);
    expect((await response.json()).error.message).toContain('Component');
  });

  it('should retrieve code from storage correctly', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: mockComponent,
      error: null,
    });

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/comp-123');
    await GET(request, { params: Promise.resolve({ id: 'comp-123' }) });

    expect(mockDownloadFromStorage).toHaveBeenCalledWith(
      'project-files',
      mockComponent.code_storage_path,
      true
    );
  });

  it('should allow access to public project component', async () => {
    mockVerifySession.mockResolvedValue({
      user: {
        id: 'other-user',
        email: 'other@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z',
      } as any,
    });

    const publicComponent = {
      ...mockComponent,
      projects: { user_id: 'user-123', is_public: true },
    };

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: publicComponent,
      error: null,
    });

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/comp-123');
    const response = await GET(request, {
      params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174002' }),
    });

    expect(response.status).toBe(200);
  });
});

describe('PATCH /api/components/[id]', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as any;
  const mockComponent = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Button',
    component_type: 'button',
    framework: 'react',
    code_storage_path:
      '123e4567-e89b-12d3-a456-426614174000/123e4567-e89b-12d3-a456-426614174002.tsx',
    projects: {
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      framework: 'react',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 119,
      resetAt: Date.now() + 60000,
    });

    mockUploadToStorage.mockResolvedValue({
      path: 'project-123/comp-123.tsx',
    });

    mockValidateFileSize.mockReturnValue(true);
  });

  it('should update component for owner', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const updatedComponent = {
      ...mockComponent,
      name: 'UpdatedButton',
    };

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase.single
      .mockResolvedValueOnce({ data: mockComponent, error: null })
      .mockResolvedValueOnce({ data: updatedComponent, error: null });

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/comp-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    jest.spyOn(request, 'json').mockResolvedValue({ name: 'UpdatedButton' });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174002' }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data.component.name).toBe('UpdatedButton');
  });

  it('should reject non-owner updates', async () => {
    mockVerifySession.mockResolvedValue({
      user: {
        id: 'other-user',
        email: 'other@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z',
      } as any,
    });

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: mockComponent,
      error: null,
    });

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/comp-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    jest.spyOn(request, 'json').mockResolvedValue({ name: 'UpdatedButton' });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174002' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.message).toContain('do not own');
  });

  it('should update code in storage when changed', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const newCode = 'export default function NewButton() { return <button>New</button>; }';

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase.single
      .mockResolvedValueOnce({ data: mockComponent, error: null })
      .mockResolvedValueOnce({ data: mockComponent, error: null });

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/comp-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    jest.spyOn(request, 'json').mockResolvedValue({ code_content: newCode });

    await PATCH(request, { params: Promise.resolve({ id: 'comp-123' }) });

    expect(mockUploadToStorage).toHaveBeenCalledWith(
      'project-files',
      mockComponent.code_storage_path,
      newCode,
      'text/plain'
    );
  });

  it('should validate framework compatibility', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: mockComponent,
      error: null,
    });

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest(
      'http://localhost:3000/api/components/123e4567-e89b-12d3-a456-426614174002',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    jest.spyOn(request, 'json').mockResolvedValue({ framework: 'vue' });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174002' }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.message).toContain('framework must match');
  });
});

describe('DELETE /api/components/[id]', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as any;
  const mockComponent = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Button',
    component_type: 'button',
    framework: 'react',
    code_storage_path:
      '123e4567-e89b-12d3-a456-426614174000/123e4567-e89b-12d3-a456-426614174002.tsx',
    projects: {
      user_id: '123e4567-e89b-12d3-a456-426614174001',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 119,
      resetAt: Date.now() + 60000,
    });

    mockDeleteFromStorage.mockResolvedValue(undefined);

    mockValidateFileSize.mockReturnValue(true);
  });

  it('should delete component and storage file for owner', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const mockChain: any = {};
    mockChain.select = jest.fn(() => mockChain);
    mockChain.delete = jest.fn(() => mockChain);
    mockChain.eq = jest.fn(() => mockChain);
    mockChain.single = jest.fn().mockResolvedValueOnce({
      data: mockComponent,
      error: null,
    });

    let eqCallCount = 0;
    mockChain.eq = jest.fn(() => {
      eqCallCount++;
      if (eqCallCount === 2) {
        return Promise.resolve({ error: null });
      }
      return mockChain;
    });

    const mockSupabase = {
      from: jest.fn(() => mockChain),
    };

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/comp-123');
    const response = await DELETE(request, {
      params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174002' }),
    });

    expect(response.status).toBe(204);
    expect(mockDeleteFromStorage).toHaveBeenCalledWith(
      'project-files',
      mockComponent.code_storage_path
    );
  });

  it('should reject non-owner deletion', async () => {
    mockVerifySession.mockResolvedValue({
      user: {
        id: 'other-user',
        email: 'other@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z',
      } as any,
    });

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: mockComponent,
      error: null,
    });

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/comp-123');
    const response = await DELETE(request, {
      params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174002' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.message).toContain('do not own');
  });

  it('should handle missing storage file gracefully', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    mockDeleteFromStorage.mockRejectedValueOnce(new Error('File not found'));

    const mockChain: any = {};
    mockChain.select = jest.fn(() => mockChain);
    mockChain.delete = jest.fn(() => mockChain);
    mockChain.eq = jest.fn(() => mockChain);
    mockChain.single = jest.fn().mockResolvedValueOnce({
      data: mockComponent,
      error: null,
    });

    let eqCallCount = 0;
    mockChain.eq = jest.fn(() => {
      eqCallCount++;
      if (eqCallCount === 2) {
        return Promise.resolve({ error: null });
      }
      return mockChain;
    });

    const mockSupabase = {
      from: jest.fn(() => mockChain),
    };

    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/components/comp-123');
    const response = await DELETE(request, {
      params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174002' }),
    });

    // Should still succeed even if storage deletion fails
    expect(response.status).toBe(204);
  });
});
