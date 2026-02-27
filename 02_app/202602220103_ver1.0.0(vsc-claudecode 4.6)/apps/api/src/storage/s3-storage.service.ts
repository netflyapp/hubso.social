import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  storageKey: string;
}

/**
 * S3StorageService — MinIO/S3-compatible storage with presigned URLs.
 * Supports both direct browser uploads (presigned PUT) and server-side uploads.
 */
@Injectable()
export class S3StorageService implements OnModuleInit {
  private readonly logger = new Logger(S3StorageService.name);
  private s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly publicEndpoint: string;
  private _available = false;

  constructor(private config: ConfigService) {
    this.endpoint =
      this.config.get<string>('MINIO_ENDPOINT') || 'http://localhost:9000';
    this.publicEndpoint =
      this.config.get<string>('MINIO_PUBLIC_ENDPOINT') || this.endpoint;
    this.bucket = this.config.get<string>('MINIO_BUCKET') || 'hubso-media';

    const accessKey =
      this.config.get<string>('MINIO_ACCESS_KEY') || 'minioadmin';
    const secretKey =
      this.config.get<string>('MINIO_SECRET_KEY') || 'minioadmin';

    this.s3 = new S3Client({
      endpoint: this.endpoint,
      region: 'us-east-1', // MinIO requires a region, but ignores it
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.logger.log(`S3 Storage endpoint: ${this.endpoint}, bucket: ${this.bucket}`);
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  get isAvailable(): boolean {
    return this._available;
  }

  /**
   * Ensure the bucket exists, create if not.
   */
  private async ensureBucket(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this._available = true;
      this.logger.log(`Bucket "${this.bucket}" is ready.`);
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
        try {
          await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
          this._available = true;
          this.logger.log(`Created bucket "${this.bucket}".`);
        } catch (createErr) {
          this.logger.error(`Failed to create bucket: ${createErr}`);
          this._available = false;
        }
      } else {
        this.logger.warn(`MinIO not available: ${error.name ?? err}`);
        this._available = false;
      }
    }
  }

  /**
   * Generate a presigned URL for direct browser upload.
   * @param folder Sub-folder (e.g., 'avatars', 'images', 'files')
   * @param filename Target filename
   * @param contentType MIME type
   * @param expiresIn URL expiry in seconds (default: 5 min)
   */
  async getPresignedUploadUrl(
    folder: string,
    filename: string,
    contentType: string,
    expiresIn = 300,
  ): Promise<PresignedUrlResult> {
    const storageKey = `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    const publicUrl = `${this.publicEndpoint}/${this.bucket}/${storageKey}`;

    return {
      uploadUrl,
      publicUrl,
      storageKey,
    };
  }

  /**
   * Generate a presigned URL for downloading/viewing a file.
   */
  async getPresignedDownloadUrl(
    storageKey: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  /**
   * Upload a file directly from the server (for server-side processing).
   * @param folder Sub-folder
   * @param filename Target filename
   * @param buffer File content
   * @param contentType MIME type
   */
  async uploadFile(
    folder: string,
    filename: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const storageKey = `${folder}/${filename}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    const publicUrl = `${this.publicEndpoint}/${this.bucket}/${storageKey}`;
    this.logger.log(`Uploaded ${storageKey} → ${publicUrl}`);
    return publicUrl;
  }

  /**
   * Delete a file by storage key.
   */
  async deleteFile(storageKey: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        }),
      );
      this.logger.log(`Deleted ${storageKey}`);
    } catch (err) {
      this.logger.warn(`Failed to delete ${storageKey}: ${err}`);
    }
  }

  /**
   * Delete a file by its public URL.
   */
  async deleteByUrl(publicUrl: string): Promise<void> {
    const prefix = `${this.publicEndpoint}/${this.bucket}/`;
    if (publicUrl.startsWith(prefix)) {
      const storageKey = publicUrl.slice(prefix.length);
      await this.deleteFile(storageKey);
    }
  }

  /**
   * Check if MinIO is healthy and accessible.
   */
  async healthCheck(): Promise<{ available: boolean; healthy: boolean }> {
    if (!this._available) {
      return { available: false, healthy: false };
    }

    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return { available: true, healthy: true };
    } catch {
      return { available: true, healthy: false };
    }
  }
}
