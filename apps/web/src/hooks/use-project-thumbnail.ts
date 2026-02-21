'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useProjectThumbnail() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const uploadThumbnail = async (projectId: string, file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}-${Date.now()}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-thumbnails')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('project-thumbnails').getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload thumbnail';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteThumbnail = async (thumbnailUrl: string): Promise<boolean> => {
    try {
      setError(null);

      let url: URL;
      try {
        url = new URL(thumbnailUrl);
      } catch {
        return false;
      }

      const pathname = decodeURIComponent(url.pathname);
      const bucketPrefix = '/project-thumbnails/';
      const bucketIndex = pathname.indexOf(bucketPrefix);

      if (bucketIndex === -1) return false;

      const path = pathname.substring(bucketIndex + bucketPrefix.length).replace(/^\/+/, '');
      if (!path) return false;

      const { error: deleteError } = await supabase.storage
        .from('project-thumbnails')
        .remove([path]);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete thumbnail';
      setError(message);
      return false;
    }
  };

  return {
    uploadThumbnail,
    deleteThumbnail,
    uploading,
    error,
  };
}
