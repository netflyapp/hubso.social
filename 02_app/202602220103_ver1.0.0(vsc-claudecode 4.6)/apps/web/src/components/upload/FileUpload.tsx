'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UploadedFile {
  id: string;
  url: string;
  type: string;
  storageKey: string;
}

export interface FileUploadProps {
  /** Called when upload completes successfully */
  onUploadComplete?: (file: UploadedFile) => void;
  /** Called when uploading starts */
  onUploadStart?: () => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Accepted file types */
  accept?: Accept;
  /** Max file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Community ID to associate file with */
  communityId?: string;
  /** Custom folder (default: auto from mime type) */
  folder?: string;
  /** Custom class name */
  className?: string;
  /** Children to render inside dropzone */
  children?: React.ReactNode;
  /** Show preview after upload */
  showPreview?: boolean;
  /** Circular preview (for avatars) */
  circular?: boolean;
  /** Current preview URL (for controlled mode) */
  previewUrl?: string;
  /** Disabled state */
  disabled?: boolean;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function FileUpload({
  onUploadComplete,
  onUploadStart,
  onError,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    'application/pdf': ['.pdf'],
    'video/*': ['.mp4', '.webm'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  communityId,
  folder,
  className,
  children,
  showPreview = true,
  circular = false,
  previewUrl,
  disabled = false,
}: FileUploadProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setStatus('uploading');
      setProgress(0);
      setErrorMessage(null);
      onUploadStart?.();

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setStatus('error');
        setErrorMessage('Musisz być zalogowany, aby przesyłać pliki.');
        onError?.('Not authenticated');
        return;
      }

      try {
        // Step 1: Get presigned URL
        const presignedParams = new URLSearchParams({
          filename: file.name,
          contentType: file.type,
          ...(folder && { folder }),
        });

        const presignedRes = await fetch(
          `${API_URL}/upload/presigned?${presignedParams}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!presignedRes.ok) {
          const err = await presignedRes.json();
          throw new Error(err.message || 'Nie udało się uzyskać URL uploadu');
        }

        const { uploadUrl, publicUrl, storageKey } = await presignedRes.json();

        // Step 2: Upload directly to S3/MinIO
        abortControllerRef.current = new AbortController();
        
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
          signal: abortControllerRef.current.signal,
        });

        if (!uploadRes.ok) {
          throw new Error('Błąd podczas przesyłania pliku');
        }

        setProgress(80);

        // Step 3: Confirm upload and create MediaFile record
        const confirmRes = await fetch(`${API_URL}/upload/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            storageKey,
            publicUrl,
            contentType: file.type,
            originalName: file.name,
            size: file.size,
            communityId,
          }),
        });

        if (!confirmRes.ok) {
          const err = await confirmRes.json();
          throw new Error(err.message || 'Nie udało się potwierdzić uploadu');
        }

        const uploadedFile: UploadedFile = await confirmRes.json();

        setProgress(100);
        setStatus('success');

        if (showPreview && file.type.startsWith('image/')) {
          setPreview(uploadedFile.url);
        }

        onUploadComplete?.(uploadedFile);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setStatus('idle');
          return;
        }
        setStatus('error');
        setErrorMessage((err as Error).message || 'Błąd podczas przesyłania pliku');
        onError?.((err as Error).message);
      }
    },
    [folder, communityId, showPreview, onUploadStart, onUploadComplete, onError]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: disabled || status === 'uploading',
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        setErrorMessage(`Plik jest za duży. Maksymalny rozmiar: ${Math.round(maxSize / 1024 / 1024)}MB`);
      } else if (error?.code === 'file-invalid-type') {
        setErrorMessage('Niedozwolony format pliku');
      } else {
        setErrorMessage(error?.message || 'Błąd podczas wybierania pliku');
      }
      setStatus('error');
    },
  });

  const cancelUpload = () => {
    abortControllerRef.current?.abort();
    setStatus('idle');
    setProgress(0);
  };

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setPreview(previewUrl || null);
    setErrorMessage(null);
  };

  // If children are provided, use custom render
  if (children) {
    return (
      <div {...getRootProps()} className={cn('cursor-pointer', className)}>
        <input {...getInputProps()} />
        {children}
      </div>
    );
  }

  // Default dropzone UI
  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          'hover:border-primary/50 hover:bg-muted/50',
          isDragActive && 'border-primary bg-primary/5',
          status === 'error' && 'border-destructive bg-destructive/5',
          status === 'success' && 'border-success bg-success/5',
          (disabled || status === 'uploading') && 'opacity-50 cursor-not-allowed',
          circular && 'rounded-full aspect-square flex items-center justify-center p-0'
        )}
      >
        <input {...getInputProps()} />

        {/* Preview */}
        {showPreview && preview && status !== 'uploading' && (
          <div
            className={cn(
              'absolute inset-0 overflow-hidden',
              circular ? 'rounded-full' : 'rounded-lg'
            )}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                Kliknij, aby zmienić
              </span>
            </div>
          </div>
        )}

        {/* Upload state indicators */}
        {status === 'uploading' && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Przesyłanie... {progress}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                cancelUpload();
              }}
            >
              Anuluj
            </Button>
          </div>
        )}

        {status === 'success' && !preview && (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <span className="text-sm text-success">
              Plik przesłany pomyślnie
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
            >
              Prześlij kolejny
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <span className="text-sm text-destructive text-center">
              {errorMessage}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
            >
              Spróbuj ponownie
            </Button>
          </div>
        )}

        {status === 'idle' && !preview && (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <span className="text-sm font-medium">
                {isDragActive ? 'Upuść plik tutaj' : 'Przeciągnij plik lub kliknij'}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Maks. {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
