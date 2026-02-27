import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ─── Bunny Stream API Types ──────────────────────────────────────

export interface BunnyVideoCreateResponse {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  status: number; // 0 = created, 1 = uploaded, 2 = processing, 3 = transcoding, 4 = finished, 5 = error
  length: number;
  thumbnailFileName: string;
}

export interface BunnyVideoStatusResponse {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  status: number;
  encodeProgress: number; // 0-100
  storageSize: number;
  length: number; // seconds
  width: number;
  height: number;
  thumbnailFileName: string;
  availableResolutions: string; // "360p,480p,720p,1080p"
  framerate: number;
  hasMP4Fallback: boolean;
  captions: Array<{ srclang: string; label: string }>;
}

export interface BunnyUploadCredentials {
  videoId: string;
  libraryId: string;
  uploadUrl: string;
  tusEndpoint: string;
  authorizationSignature: string;
  authorizationExpire: number;
}

// Status mapping
const BUNNY_STATUS: Record<number, string> = {
  0: 'CREATED',
  1: 'UPLOADED',
  2: 'PROCESSING',
  3: 'TRANSCODING',
  4: 'FINISHED',
  5: 'ERROR',
  6: 'UPLOAD_FAILED',
};

@Injectable()
export class BunnyStreamService implements OnModuleInit {
  private readonly logger = new Logger(BunnyStreamService.name);

  private apiKey: string;
  private libraryId: string;
  private cdnHostname: string;
  private apiBase = 'https://video.bunnycdn.com';

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('BUNNY_STREAM_API_KEY', '');
    this.libraryId = this.config.get<string>('BUNNY_STREAM_LIBRARY_ID', '');
    this.cdnHostname = this.config.get<string>('BUNNY_STREAM_CDN_HOSTNAME', '');
  }

  onModuleInit() {
    if (!this.apiKey || !this.libraryId) {
      this.logger.warn(
        'Bunny Stream nie jest skonfigurowany (brak BUNNY_STREAM_API_KEY / BUNNY_STREAM_LIBRARY_ID). ' +
        'Upload wideo będzie niedostępny.',
      );
    } else {
      this.logger.log(
        `Bunny Stream skonfigurowany — Library: ${this.libraryId}, CDN: ${this.cdnHostname || 'default'}`,
      );
    }
  }

  /** Check if Bunny Stream is configured */
  isConfigured(): boolean {
    return !!(this.apiKey && this.libraryId);
  }

  // ─── Video Lifecycle ───────────────────────────────────────────

  /**
   * Create a video placeholder in Bunny Stream (step 1 of upload).
   * Returns a GUID that client uses for direct upload via TUS.
   */
  async createVideo(title: string): Promise<BunnyVideoCreateResponse> {
    const res = await this.fetch(`/library/${this.libraryId}/videos`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Bunny Stream createVideo failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Get TUS upload credentials for direct browser upload.
   * Client uses the TUS protocol to upload directly to Bunny.
   */
  getUploadCredentials(videoGuid: string): BunnyUploadCredentials {
    // TUS endpoint for direct upload
    const tusEndpoint = `https://video.bunnycdn.com/tusupload`;

    // For Bunny TUS upload, the Authorization header is the API key
    // and metadata includes the video library & video id
    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1h

    return {
      videoId: videoGuid,
      libraryId: this.libraryId,
      uploadUrl: `${this.apiBase}/library/${this.libraryId}/videos/${videoGuid}`,
      tusEndpoint,
      authorizationSignature: this.apiKey,
      authorizationExpire: expirationTime,
    };
  }

  /**
   * Upload video content directly from server (alternative to TUS).
   * Use for server-side uploads. The video must be created first.
   */
  async uploadVideoBuffer(videoGuid: string, buffer: Buffer): Promise<void> {
    const res = await fetch(
      `${this.apiBase}/library/${this.libraryId}/videos/${videoGuid}`,
      {
        method: 'PUT',
        headers: {
          AccessKey: this.apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: buffer as unknown as BodyInit,
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Bunny Stream upload failed (${res.status}): ${err}`);
    }
  }

  /**
   * Get video status and encoding progress.
   */
  async getVideoStatus(videoGuid: string): Promise<BunnyVideoStatusResponse> {
    const res = await this.fetch(
      `/library/${this.libraryId}/videos/${videoGuid}`,
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Bunny Stream getVideo failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Delete video from Bunny Stream.
   */
  async deleteVideo(videoGuid: string): Promise<void> {
    const res = await this.fetch(
      `/library/${this.libraryId}/videos/${videoGuid}`,
      { method: 'DELETE' },
    );

    if (!res.ok) {
      const err = await res.text();
      this.logger.warn(`Bunny Stream deleteVideo failed (${res.status}): ${err}`);
    }
  }

  /**
   * List videos in the library.
   */
  async listVideos(page = 1, itemsPerPage = 25): Promise<{
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    items: BunnyVideoStatusResponse[];
  }> {
    const res = await this.fetch(
      `/library/${this.libraryId}/videos?page=${page}&itemsPerPage=${itemsPerPage}&orderBy=date`,
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Bunny Stream listVideos failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  // ─── URL Builders ──────────────────────────────────────────────

  /**
   * Get the HLS playback URL for a video.
   */
  getHlsUrl(videoGuid: string): string {
    const host = this.cdnHostname || `iframe.mediadelivery.net`;
    return `https://${host}/${videoGuid}/playlist.m3u8`;
  }

  /**
   * Get the thumbnail URL.
   */
  getThumbnailUrl(videoGuid: string, fileName?: string): string {
    const host = this.cdnHostname || `vz-${this.libraryId}.b-cdn.net`;
    return `https://${host}/${videoGuid}/${fileName || 'thumbnail.jpg'}`;
  }

  /**
   * Get the preview GIF URL.
   */
  getPreviewUrl(videoGuid: string): string {
    const host = this.cdnHostname || `vz-${this.libraryId}.b-cdn.net`;
    return `https://${host}/${videoGuid}/preview.webp`;
  }

  /**
   * Get the embed/iframe URL (Bunny player).
   */
  getEmbedUrl(videoGuid: string): string {
    return `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoGuid}?autoplay=false&preload=true`;
  }

  /**
   * Get direct MP4 URL (if MP4 fallback enabled).
   */
  getMp4Url(videoGuid: string, resolution = '720p'): string {
    const host = this.cdnHostname || `vz-${this.libraryId}.b-cdn.net`;
    return `https://${host}/${videoGuid}/play_${resolution}.mp4`;
  }

  // ─── Helpers ───────────────────────────────────────────────────

  /** Map Bunny numeric status to string */
  mapStatus(status: number): string {
    return BUNNY_STATUS[status] || 'UNKNOWN';
  }

  /** Check if video encoding is complete */
  isFinished(status: number): boolean {
    return status === 4;
  }

  /** Check if video errored */
  isError(status: number): boolean {
    return status === 5 || status === 6;
  }

  private async fetch(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    return fetch(`${this.apiBase}${path}`, {
      ...init,
      headers: {
        AccessKey: this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(init?.headers || {}),
      },
    });
  }
}
