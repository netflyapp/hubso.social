'use client';

import React from 'react';
import { FileUpload, UploadedFile } from './FileUpload';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarUploadProps {
  /** Current avatar URL */
  currentAvatarUrl?: string | null;
  /** Called when new avatar is uploaded */
  onAvatarChange?: (file: UploadedFile) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
};

export function AvatarUpload({
  currentAvatarUrl,
  onAvatarChange,
  size = 'lg',
  disabled = false,
  className,
}: AvatarUploadProps) {
  return (
    <FileUpload
      accept={{
        'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      }}
      maxSize={5 * 1024 * 1024} // 5MB for avatars
      folder="avatars"
      showPreview={true}
      circular={true}
      previewUrl={currentAvatarUrl || undefined}
      onUploadComplete={onAvatarChange}
      disabled={disabled}
      className={cn(sizeClasses[size], className)}
    >
      <div
        className={cn(
          'relative w-full h-full rounded-full overflow-hidden',
          'border-2 border-dashed border-muted-foreground/30',
          'hover:border-primary/50 hover:bg-muted/50 transition-colors',
          'flex items-center justify-center',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {currentAvatarUrl ? (
          <>
            <img
              src={currentAvatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium text-center px-2">
                Kliknij, aby zmienić
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <User className="h-8 w-8" />
            <span className="text-xs">Dodaj zdjęcie</span>
          </div>
        )}
      </div>
    </FileUpload>
  );
}
