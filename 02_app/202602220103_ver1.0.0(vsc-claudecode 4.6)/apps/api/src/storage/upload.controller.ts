import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
  Query,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiOperation,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { S3StorageService } from './s3-storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
];

function extFromMime(mimetype: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'application/pdf': '.pdf',
  };
  return map[mimetype] ?? path.extname('file');
}

function mediaTypeFromMime(
  mimetype: string,
): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' {
  if (mimetype.startsWith('image/')) return 'IMAGE';
  if (mimetype.startsWith('video/')) return 'VIDEO';
  if (mimetype.startsWith('audio/')) return 'AUDIO';
  return 'FILE';
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly storage: StorageService,
    private readonly s3Storage: S3StorageService,
    private readonly prisma: PrismaService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Presigned URL endpoints for direct browser uploads to MinIO/S3
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('presigned')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get presigned URL for direct upload to S3/MinIO' })
  @ApiQuery({ name: 'filename', required: true, description: 'Original filename' })
  @ApiQuery({ name: 'contentType', required: true, description: 'MIME type' })
  @ApiQuery({ name: 'folder', required: false, description: 'Target folder (default: auto from mime)' })
  async getPresignedUrl(
    @Request() req: { user: { userId: string } },
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
    @Query('folder') folder?: string,
  ) {
    if (!filename || !contentType) {
      throw new BadRequestException('filename and contentType are required');
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new BadRequestException(
        `Niedozwolony format pliku. Dozwolone: ${ALLOWED_TYPES.join(', ')}`,
      );
    }

    const ext = extFromMime(contentType);
    const targetFolder = folder || mediaTypeFromMime(contentType).toLowerCase() + 's';
    const uniqueFilename = `${randomUUID()}${ext}`;

    const result = await this.s3Storage.getPresignedUploadUrl(
      targetFolder,
      uniqueFilename,
      contentType,
      300, // 5 minutes
    );

    return {
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
      storageKey: result.storageKey,
      expiresIn: 300,
    };
  }

  @Post('confirm')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm upload completed and create MediaFile record' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['storageKey', 'publicUrl', 'contentType'],
      properties: {
        storageKey: { type: 'string' },
        publicUrl: { type: 'string' },
        contentType: { type: 'string' },
        originalName: { type: 'string' },
        size: { type: 'number' },
        communityId: { type: 'string' },
      },
    },
  })
  async confirmUpload(
    @Request() req: { user: { userId: string } },
    @Body()
    body: {
      storageKey: string;
      publicUrl: string;
      contentType: string;
      originalName?: string;
      size?: number;
      communityId?: string;
    },
  ) {
    const { storageKey, publicUrl, contentType, originalName, size, communityId } = body;

    if (!storageKey || !publicUrl || !contentType) {
      throw new BadRequestException('storageKey, publicUrl, and contentType are required');
    }

    const media = await this.prisma.mediaFile.create({
      data: {
        uploadedById: req.user.userId,
        communityId: communityId || null,
        storageKey,
        cdnUrl: publicUrl,
        type: mediaTypeFromMime(contentType),
        status: 'READY',
        metadata: {
          originalName: originalName || 'unknown',
          size: size || 0,
          mimetype: contentType,
        },
      },
    });

    return {
      id: media.id,
      url: media.cdnUrl,
      type: media.type,
      storageKey: media.storageKey,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check S3/MinIO storage health' })
  async storageHealth() {
    return this.s3Storage.healthCheck();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Multipart upload endpoint (fallback / legacy)
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiQuery({ name: 'communityId', required: false })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Niedozwolony format pliku. Dozwolone: ${ALLOWED_TYPES.join(', ')}`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @Request() req: { user: { userId: string } },
    @UploadedFile() file: Express.Multer.File,
    @Query('communityId') communityId?: string,
  ) {
    if (!file)
      throw new BadRequestException('Wymagany jest plik do przesłania.');

    const ext = extFromMime(file.mimetype);
    const folder = mediaTypeFromMime(file.mimetype).toLowerCase() + 's'; // images, videos, files
    const filename = `${randomUUID()}${ext}`;
    const storageKey = `${folder}/${filename}`;

    const cdnUrl = await this.storage.uploadFile(
      folder,
      filename,
      file.buffer,
      file.mimetype,
    );

    const media = await this.prisma.mediaFile.create({
      data: {
        uploadedById: req.user.userId,
        communityId: communityId || null,
        storageKey,
        cdnUrl,
        type: mediaTypeFromMime(file.mimetype),
        status: 'READY',
        metadata: {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        },
      },
    });

    return {
      id: media.id,
      url: media.cdnUrl,
      type: media.type,
      storageKey: media.storageKey,
    };
  }
}
