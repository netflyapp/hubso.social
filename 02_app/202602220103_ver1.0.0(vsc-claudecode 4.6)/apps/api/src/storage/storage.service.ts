import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * StorageService — local disk implementation.
 * Swap this for an S3/MinIO implementation by replacing uploadFile().
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    // Resolve uploads dir relative to the project root (apps/api)
    this.uploadsDir = path.resolve(process.cwd(), 'uploads');
    const apiUrl =
      this.config.get<string>('API_URL') || 'http://localhost:3001';
    this.baseUrl = apiUrl;
    this.ensureDir(this.uploadsDir);
    this.ensureDir(path.join(this.uploadsDir, 'avatars'));
    this.logger.log(`Storage dir: ${this.uploadsDir}`);
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Save a buffer to disk and return a public URL.
   * @param folder  sub-directory inside uploads/ (e.g. 'avatars')
   * @param filename  target filename (e.g. 'user-abc123.jpg')
   * @param buffer  file content
   * @param _mimetype  unused in disk impl, kept for API parity with S3
   */
  async uploadFile(
    folder: string,
    filename: string,
    buffer: Buffer,
    _mimetype: string,
  ): Promise<string> {
    const dir = path.join(this.uploadsDir, folder);
    this.ensureDir(dir);

    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `${this.baseUrl}/uploads/${folder}/${filename}`;
    this.logger.log(`Uploaded file → ${publicUrl}`);
    return publicUrl;
  }

  /**
   * Delete a file by its public URL (best-effort, no throw on missing).
   */
  deleteByUrl(publicUrl: string): void {
    try {
      const relative = publicUrl.replace(`${this.baseUrl}/uploads/`, '');
      const filePath = path.join(this.uploadsDir, relative);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e: unknown) {
      this.logger.warn(`Could not delete file: ${(e as Error).message ?? e}`);
    }
  }
}
