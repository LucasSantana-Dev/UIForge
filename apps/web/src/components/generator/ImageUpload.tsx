'use client';

import { useState, useCallback, useRef } from 'react';
import { ImageIcon, XIcon } from 'lucide-react';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface ImageState {
  base64: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  name: string;
  previewUrl: string;
}

interface ImageUploadProps {
  image: ImageState | null;
  onImageChange: (image: ImageState | null) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ image, onImageChange }: ImageUploadProps) {
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setImageError(null);
      if (!ACCEPTED_TYPES.includes(file.type as any)) {
        setImageError('Only PNG, JPEG, and WebP images are supported.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setImageError('Image must be under 5MB.');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        onImageChange({
          base64,
          mimeType: file.type as ImageState['mimeType'],
          name: file.name,
          previewUrl: URL.createObjectURL(file),
        });
      } catch {
        setImageError('Failed to process image.');
      }
    },
    [onImageChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const removeImage = useCallback(() => {
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    onImageChange(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [image, onImageChange]);

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-3">
        <ImageIcon className="h-4 w-4" />
        <span>Reference Image</span>
        {image && <span className="text-xs text-green-600 font-medium ml-1">attached</span>}
      </label>

      {image ? (
        <div className="relative rounded-lg border border-surface-3 overflow-hidden">
          <img
            src={image.previewUrl}
            alt="Reference"
            className="w-full max-h-48 object-contain bg-surface-0"
          />
          <div className="flex items-center justify-between px-3 py-2 bg-surface-0 border-t border-surface-3">
            <span className="text-xs text-text-secondary truncate">{image.name}</span>
            <button
              type="button"
              onClick={removeImage}
              className="text-text-muted hover:text-red-500"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors w-full ${
            isDragOver ? 'border-blue-400 bg-brand/10' : 'border-surface-3 hover:border-surface-3'
          }`}
        >
          <ImageIcon className="h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-secondary">
            Drop a screenshot here, or <span className="text-brand">browse</span>
          </p>
          <p className="text-xs text-text-muted">PNG, JPEG, or WebP up to 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processFile(f);
            }}
            className="hidden"
          />
        </button>
      )}
      {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}
    </div>
  );
}
