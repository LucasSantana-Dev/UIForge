import { createClient } from './client';

/**
 * Storage utility functions for Supabase Storage
 * Handles file uploads, downloads, and deletions across all buckets
 */

export type StorageBucket = 'avatars' | 'project-thumbnails' | 'project-files' | 'user-uploads';

/**
 * Upload a file to Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path within bucket (e.g., "user_id/filename.png")
 * @param file - File to upload
 * @param options - Upload options (upsert, contentType, cacheControl)
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
  options?: {
    upsert?: boolean;
    contentType?: string;
    cacheControl?: string;
  }
) {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: options?.upsert ?? false,
    contentType: options?.contentType ?? file.type,
    cacheControl: options?.cacheControl ?? '3600',
  });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data;
}

/**
 * Download a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path within bucket
 */
export async function downloadFile(bucket: StorageBucket, path: string) {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  return data;
}

/**
 * Get public URL for a file in a public bucket
 * @param bucket - Storage bucket name (must be public)
 * @param path - File path within bucket
 */
export function getPublicUrl(bucket: StorageBucket, path: string) {
  const supabase = createClient();

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Create a signed URL for temporary access to a private file
 * @param bucket - Storage bucket name
 * @param path - File path within bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function createSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param paths - File path(s) to delete
 */
export async function deleteFile(bucket: StorageBucket, paths: string | string[]) {
  const supabase = createClient();

  const pathArray = Array.isArray(paths) ? paths : [paths];

  const { data, error } = await supabase.storage.from(bucket).remove(pathArray);

  if (error) {
    throw new Error(`Failed to delete file(s): ${error.message}`);
  }

  return data;
}

/**
 * List files in a bucket folder
 * @param bucket - Storage bucket name
 * @param path - Folder path (default: root)
 * @param options - List options (limit, offset, sortBy)
 */
export async function listFiles(
  bucket: StorageBucket,
  path: string = '',
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }
) {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).list(path, {
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
    sortBy: options?.sortBy ?? { column: 'name', order: 'asc' },
  });

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return data;
}

/**
 * Move or rename a file within a bucket
 * @param bucket - Storage bucket name
 * @param fromPath - Current file path
 * @param toPath - New file path
 */
export async function moveFile(bucket: StorageBucket, fromPath: string, toPath: string) {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).move(fromPath, toPath);

  if (error) {
    throw new Error(`Failed to move file: ${error.message}`);
  }

  return data;
}

/**
 * Copy a file within a bucket
 * @param bucket - Storage bucket name
 * @param fromPath - Source file path
 * @param toPath - Destination file path
 */
export async function copyFile(bucket: StorageBucket, fromPath: string, toPath: string) {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).copy(fromPath, toPath);

  if (error) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }

  return data;
}

/**
 * Upload avatar for current user
 * @param file - Avatar image file
 * @param userId - User ID
 */
export async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  return uploadFile('avatars', fileName, file, {
    upsert: true,
    cacheControl: '3600',
  });
}

/**
 * Upload project thumbnail
 * @param file - Thumbnail image file
 * @param userId - User ID
 * @param projectId - Project ID
 */
export async function uploadProjectThumbnail(file: File, userId: string, projectId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${projectId}/thumbnail.${fileExt}`;

  return uploadFile('project-thumbnails', fileName, file, {
    upsert: true,
    cacheControl: '3600',
  });
}

/**
 * Upload generated code file
 * @param content - Code content as string
 * @param userId - User ID
 * @param projectId - Project ID
 * @param componentId - Component ID
 * @param filename - File name
 */
export async function uploadCodeFile(
  content: string,
  userId: string,
  projectId: string,
  componentId: string,
  filename: string
) {
  const blob = new Blob([content], { type: 'text/plain' });
  const path = `${userId}/${projectId}/${componentId}/${filename}`;

  return uploadFile('project-files', path, blob, {
    upsert: true,
    contentType: 'text/plain',
  });
}

/**
 * Get avatar URL for user
 * @param userId - User ID
 * @param fileExt - File extension (default: 'png')
 */
export function getAvatarUrl(userId: string, fileExt: string = 'png') {
  return getPublicUrl('avatars', `${userId}/avatar.${fileExt}`);
}

/**
 * Get project thumbnail URL
 * @param userId - User ID
 * @param projectId - Project ID
 * @param fileExt - File extension (default: 'png')
 */
export function getProjectThumbnailUrl(userId: string, projectId: string, fileExt: string = 'png') {
  return getPublicUrl('project-thumbnails', `${userId}/${projectId}/thumbnail.${fileExt}`);
}
