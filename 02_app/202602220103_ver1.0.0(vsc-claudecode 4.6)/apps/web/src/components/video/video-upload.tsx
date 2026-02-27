'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Upload,
  X,
  Film,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateVideo, useVideoStatus } from '@/lib/hooks/useVideo'
import { SmartVideoPlayer } from './video-player'

// ─── Types ────────────────────────────────────────────────────

interface VideoUploadProps {
  /** Callback when video is fully ready (encoded by Bunny) */
  onVideoReady?: (video: {
    videoId: string
    mediaId: string
    hlsUrl: string | null
    thumbnailUrl: string | null
    embedUrl: string | null
    duration: number | null
  }) => void
  /** Callback when video is created (before encoding) */
  onVideoCreated?: (videoId: string, mediaId: string) => void
  /** Community context for the upload */
  communityId?: string
  /** Max file size in MB (default 2048 = 2GB) */
  maxSizeMB?: number
  /** Accepted MIME types */
  accept?: string
  /** Additional class */
  className?: string
  /** Disabled state */
  disabled?: boolean
}

type UploadPhase =
  | 'idle'
  | 'creating' // creating video placeholder on Bunny
  | 'uploading' // TUS upload to Bunny CDN
  | 'processing' // Bunny encoding
  | 'ready' // done!
  | 'error'

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-matroska', // .mkv
]

/**
 * VideoUpload — Full upload flow component.
 *
 * 1. User selects file
 * 2. Creates video placeholder on Bunny via API
 * 3. Uploads file directly to Bunny via TUS protocol
 * 4. Polls processing status until ready
 */
export function VideoUpload({
  onVideoReady,
  onVideoCreated,
  communityId,
  maxSizeMB = 2048,
  accept = 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska',
  className,
  disabled = false,
}: VideoUploadProps) {
  const [phase, setPhase] = useState<UploadPhase>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [mediaId, setMediaId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<XMLHttpRequest | null>(null)

  const createVideo = useCreateVideo()

  // Poll status after upload
  const { data: statusData } = useVideoStatus(
    videoId || '',
    phase === 'processing',
  )

  // When status becomes ready, fire callback
  if (statusData?.isReady && phase === 'processing') {
    setPhase('ready')
    onVideoReady?.({
      videoId: statusData.videoId,
      mediaId: statusData.mediaId,
      hlsUrl: statusData.hlsUrl,
      thumbnailUrl: statusData.thumbnailUrl,
      embedUrl: statusData.embedUrl,
      duration: statusData.duration,
    })
  }

  if (statusData?.isError && phase === 'processing') {
    setPhase('error')
    setError('Bunny Stream nie mógł przetworzyć tego wideo. Spróbuj innego formatu.')
  }

  // ─── File Selection ──────────────────────────────────────

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate type
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        setError(`Nieobsługiwany format: ${file.type}. Dozwolone: MP4, WebM, MOV, AVI, MKV.`)
        setPhase('error')
        return
      }

      // Validate size
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        setError(`Plik jest za duży (${(file.size / 1024 / 1024).toFixed(0)} MB). Maksymalnie: ${maxSizeMB} MB.`)
        setPhase('error')
        return
      }

      setFileName(file.name)
      setError(null)
      setPhase('creating')
      setProgress(0)

      try {
        // Step 1: Create video placeholder
        const title = file.name.replace(/\.[^.]+$/, '')
        const result = await createVideo.mutateAsync({ title, communityId })

        setVideoId(result.videoId)
        setMediaId(result.mediaId)
        onVideoCreated?.(result.videoId, result.mediaId)

        // Step 2: Upload via TUS
        setPhase('uploading')
        await uploadViaTus(file, result)

        // Step 3: Wait for processing
        setPhase('processing')
      } catch (err) {
        console.error('Video upload error:', err)
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas przesyłania wideo')
        setPhase('error')
      }
    },
    [communityId, createVideo, maxSizeMB, onVideoCreated],
  )

  // ─── TUS Upload ──────────────────────────────────────────

  const uploadViaTus = useCallback(
    async (
      file: File,
      credentials: {
        tusEndpoint: string
        tusAuthToken: string
        videoId: string
        libraryId: string
      },
    ) => {
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        abortRef.current = xhr

        // TUS requires creating upload
        xhr.open('PUT', `${credentials.tusEndpoint}/${credentials.videoId}`, true)
        xhr.setRequestHeader('AuthorizationSignature', credentials.tusAuthToken)
        xhr.setRequestHeader('AuthorizationExpire', String(Math.floor(Date.now() / 1000) + 3600))
        xhr.setRequestHeader('VideoId', credentials.videoId)
        xhr.setRequestHeader('LibraryId', credentials.libraryId)
        xhr.setRequestHeader('Content-Type', 'application/octet-stream')

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setProgress(pct)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100)
            resolve()
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.onabort = () => reject(new Error('Upload aborted'))

        xhr.send(file)
      })
    },
    [],
  )

  // ─── Drop & DnD Handlers ─────────────────────────────────

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled || phase !== 'idle') return

      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [disabled, phase, handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileSelect(file)
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [handleFileSelect],
  )

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
    setPhase('idle')
    setProgress(0)
    setError(null)
    setFileName(null)
    setVideoId(null)
    setMediaId(null)
  }, [])

  const handleReset = useCallback(() => {
    setPhase('idle')
    setProgress(0)
    setError(null)
    setFileName(null)
    setVideoId(null)
    setMediaId(null)
  }, [])

  // ─── Render ───────────────────────────────────────────────

  // Ready state — show player
  if (phase === 'ready' && videoId && statusData) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <SmartVideoPlayer
          videoId={videoId}
          embedUrl={statusData.embedUrl}
          hlsUrl={statusData.hlsUrl}
          thumbnailUrl={statusData.thumbnailUrl}
          status="READY"
          title={fileName || 'Wideo'}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Wideo gotowe do odtwarzania</span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Zmień wideo
          </button>
        </div>
      </div>
    )
  }

  // Processing state
  if (phase === 'processing') {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <SmartVideoPlayer
          videoId={videoId || ''}
          status="PROCESSING"
          progress={statusData?.progress || 0}
          statusLabel={statusData?.statusLabel || 'Przetwarzanie wideo...'}
          thumbnailUrl={null}
        />
        <p className="text-center text-xs text-muted-foreground">
          Bunny Stream przetwarza wideo. To może potrwać kilka minut.
        </p>
      </div>
    )
  }

  // Uploading state
  if (phase === 'uploading' || phase === 'creating') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8',
          className,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium">
            {phase === 'creating' ? 'Przygotowywanie...' : 'Przesyłanie wideo...'}
          </p>
          {fileName && (
            <p className="text-xs text-muted-foreground">{fileName}</p>
          )}
        </div>
        {phase === 'uploading' && (
          <>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{progress}%</p>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <X className="h-3 w-3" />
              Anuluj
            </button>
          </>
        )}
      </div>
    )
  }

  // Error state
  if (phase === 'error') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-destructive/30 bg-destructive/5 p-8',
          className,
        )}
      >
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-center text-sm text-destructive">{error}</p>
        <button
          onClick={handleReset}
          className="rounded-md bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/20"
        >
          Spróbuj ponownie
        </button>
      </div>
    )
  }

  // Idle — Drop zone
  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 transition-colors hover:border-primary/50 hover:bg-primary/5',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !disabled && fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        e.key === 'Enter' && !disabled && fileInputRef.current?.click()
      }
    >
      <Film className="h-10 w-10 text-muted-foreground" />
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium">
          Przeciągnij wideo tutaj lub{' '}
          <span className="text-primary">wybierz plik</span>
        </p>
        <p className="text-xs text-muted-foreground">
          MP4, WebM, MOV, AVI, MKV • maks. {maxSizeMB >= 1024 ? `${(maxSizeMB / 1024).toFixed(0)} GB` : `${maxSizeMB} MB`}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  )
}
