/**
 * Storage Integration Utilities
 * Handles file operations with Supabase Storage
 */

import { createClient } from '@/lib/supabase/server';

export interface StorageUploadResult {
  path: string;
  publicUrl?: string;
}

export interface StorageError {
  message: string;
  code?: string;
}

/**
 * Upload file content to Supabase Storage
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  content: string | Buffer,
  contentType: string = 'text/plain'
): Promise<StorageUploadResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, content, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Get public URL if bucket is public
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    path: data.path,
    publicUrl,
  };
}

/**
 * Download file content from Supabase Storage
 */
export async function downloadFromStorage(
  bucket: string,
  path: string,
  asText: boolean = true
): Promise<string | Blob> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Storage download failed: ${error.message}`);
  }

  // Convert blob to text if requested, otherwise return raw blob
  if (asText) {
    const text = await data.text();
    return text;
  }
  return data;
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Storage deletion failed: ${error.message}`);
  }
}

/**
 * Generate a unique storage path for component code
 */
export function generateComponentStoragePath(
  projectId: string,
  componentId: string,
  framework: string
): string {
  // Validate and sanitize inputs to prevent path traversal
  const pathTraversalPattern = /\.\.|\/|\\|\0/;

  if (pathTraversalPattern.test(projectId)) {
    throw new Error('Invalid projectId: contains forbidden characters');
  }

  if (pathTraversalPattern.test(componentId)) {
    throw new Error('Invalid componentId: contains forbidden characters');
  }

  // Additional validation: only allow alphanumeric, hyphen, underscore
  const validIdPattern = /^[a-zA-Z0-9_-]+$/;

  if (!validIdPattern.test(projectId)) {
    throw new Error('Invalid projectId: must contain only alphanumeric characters, hyphens, and underscores');
  }

  if (!validIdPattern.test(componentId)) {
    throw new Error('Invalid componentId: must contain only alphanumeric characters, hyphens, and underscores');
  }

  const extension = getFileExtension(framework);
  return `${projectId}/${componentId}.${extension}`;
}

/**
 * Get file extension based on framework
 */
function getFileExtension(framework: string): string {
  const extensions: Record<string, string> = {
    react: 'tsx',
    nextjs: 'tsx',
    vue: 'vue',
    angular: 'ts',
    svelte: 'svelte',
    html: 'html',
  };

  return extensions[framework] || 'txt';
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(
  content: string | Buffer,
  maxSizeBytes: number
): boolean {
  const size =
    typeof content === 'string'
      ? Buffer.byteLength(content, 'utf8')
      : content.length;

  return size <= maxSizeBytes;
}

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  PROJECT_FILES: 'project-files',
  AVATARS: 'avatars',
  THUMBNAILS: 'project-thumbnails',
  USER_UPLOADS: 'user-uploads',
} as const;

/**
 * Storage size limits (in bytes)
 */
export const STORAGE_LIMITS = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  THUMBNAIL: 5 * 1024 * 1024, // 5MB
  CODE_FILE: 10 * 1024 * 1024, // 10MB
  USER_UPLOAD: 10 * 1024 * 1024, // 10MB
} as const;
