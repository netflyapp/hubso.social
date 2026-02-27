'use client'

import { useState, useCallback } from 'react'
import { Play, AlertCircle, Loader2, Maximize2, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────

interface VideoPlayerProps {
  /** Bunny Stream video GUID */
  videoId: string
  /** Bunny embed URL (iframe.mediadelivery.net) */
  embedUrl?: string | null
  /** HLS playback URL */
  hlsUrl?: string | null
  /** Thumbnail/poster URL */
  thumbnailUrl?: string | null
  /** Video title (for accessibility) */
  title?: string
  /** Aspect ratio */
  aspectRatio?: '16/9' | '4/3' | '1/1'
  /** Additional class */
  className?: string
  /** Auto-play on load */
  autoPlay?: boolean
  /** Show controls */
  controls?: boolean
}

/**
 * VideoPlayer — Bunny Stream embed player.
 *
 * Uses Bunny's iframe embed for reliable HLS playback with
 * adaptive bitrate, built-in controls, and CDN delivery.
 */
export function VideoPlayer({
  videoId,
  embedUrl,
  hlsUrl,
  thumbnailUrl,
  title = 'Wideo',
  aspectRatio = '16/9',
  className,
  autoPlay = false,
  controls = true,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleIframeError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  // Build iframe src with params
  const iframeSrc = embedUrl
    ? `${embedUrl}?autoplay=${autoPlay ? 'true' : 'false'}&preload=true&responsive=true`
    : null

  // Error state
  if (hasError) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center rounded-lg bg-muted',
          className,
        )}
        style={{ aspectRatio }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm">Nie udało się załadować wideo</p>
        </div>
      </div>
    )
  }

  // Pre-play poster (click-to-play)
  if (!isPlaying && !autoPlay && thumbnailUrl) {
    return (
      <div
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-lg bg-black',
          className,
        )}
        style={{ aspectRatio }}
        onClick={handlePlay}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
        aria-label={`Odtwórz: ${title}`}
      >
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
            <Play className="ml-1 h-7 w-7 text-slate-900" fill="currentColor" />
          </div>
        </div>
      </div>
    )
  }

  // Player (iframe embed)
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-black',
        className,
      )}
      style={{ aspectRatio }}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      )}

      {/* Bunny iframe player */}
      {iframeSrc && (
        <iframe
          src={iframeSrc}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ border: 'none' }}
        />
      )}

      {/* Fallback: direct HLS via native video */}
      {!iframeSrc && hlsUrl && (
        <video
          src={hlsUrl}
          poster={thumbnailUrl || undefined}
          controls={controls}
          autoPlay={autoPlay}
          className="absolute inset-0 h-full w-full"
          onLoadedData={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        >
          Twoja przeglądarka nie obsługuje odtwarzania wideo.
        </video>
      )}

      {/* No source available */}
      {!iframeSrc && !hlsUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-white/60">Brak źródła wideo</p>
        </div>
      )}
    </div>
  )
}

// ─── Processing Status Overlay ────────────────────────────────

interface VideoProcessingProps {
  progress: number
  statusLabel?: string
  className?: string
}

/**
 * Shows video processing progress while Bunny encodes.
 */
export function VideoProcessing({
  progress,
  statusLabel = 'Przetwarzanie...',
  className,
}: VideoProcessingProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-lg bg-muted',
        className,
      )}
      style={{ aspectRatio: '16/9' }}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-foreground">{statusLabel}</p>
          <p className="text-xs text-muted-foreground">{progress}% ukończone</p>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted-foreground/20">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Smart Player (auto-detects state) ────────────────────────

interface SmartVideoPlayerProps {
  videoId: string
  embedUrl?: string | null
  hlsUrl?: string | null
  thumbnailUrl?: string | null
  status: 'PROCESSING' | 'READY' | 'FAILED' | string
  progress?: number
  statusLabel?: string
  title?: string
  className?: string
}

/**
 * SmartVideoPlayer — auto-switches between processing, ready, and error states.
 */
export function SmartVideoPlayer({
  videoId,
  embedUrl,
  hlsUrl,
  thumbnailUrl,
  status,
  progress = 0,
  statusLabel,
  title,
  className,
}: SmartVideoPlayerProps) {
  if (status === 'FAILED') {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center rounded-lg bg-destructive/10',
          className,
        )}
        style={{ aspectRatio: '16/9' }}
      >
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm font-medium">Przetwarzanie wideo nie powiodło się</p>
          <p className="text-xs text-muted-foreground">
            Spróbuj przesłać plik ponownie
          </p>
        </div>
      </div>
    )
  }

  if (status === 'PROCESSING') {
    return (
      <VideoProcessing
        progress={progress}
        statusLabel={statusLabel}
        className={className}
      />
    )
  }

  return (
    <VideoPlayer
      videoId={videoId}
      embedUrl={embedUrl}
      hlsUrl={hlsUrl}
      thumbnailUrl={thumbnailUrl}
      title={title}
      className={className}
    />
  )
}
