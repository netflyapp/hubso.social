import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  Query,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BunnyStreamService } from './bunny-stream.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Video')
@Controller('video')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);

  constructor(
    private readonly bunny: BunnyStreamService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Upload Flow ───────────────────────────────────────────────

  /**
   * Step 1: Create video placeholder — returns TUS upload credentials.
   * Client uploads directly to Bunny via TUS protocol.
   */
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create video and get TUS upload credentials' })
  async createVideo(
    @Request() req: { user: { userId: string } },
    @Body() body: { title: string; communityId?: string },
  ) {
    if (!this.bunny.isConfigured()) {
      throw new BadRequestException(
        'Bunny Stream nie jest skonfigurowany. Skontaktuj się z administratorem.',
      );
    }

    const { title, communityId } = body;
    if (!title) throw new BadRequestException('Tytuł jest wymagany');

    // Create video on Bunny
    const bunnyVideo = await this.bunny.createVideo(title);

    // Create MediaFile record in DB
    const media = await this.prisma.mediaFile.create({
      data: {
        uploadedById: req.user.userId,
        communityId: communityId || null,
        storageKey: `bunny:${bunnyVideo.guid}`,
        cdnUrl: this.bunny.getEmbedUrl(bunnyVideo.guid),
        type: 'VIDEO',
        status: 'PROCESSING',
        bunnyVideoId: bunnyVideo.guid,
        thumbnailUrl: this.bunny.getThumbnailUrl(bunnyVideo.guid),
        hlsUrl: this.bunny.getHlsUrl(bunnyVideo.guid),
        previewUrl: this.bunny.getPreviewUrl(bunnyVideo.guid),
        processingProgress: 0,
        metadata: {
          title,
          bunnyLibraryId: bunnyVideo.videoLibraryId,
          bunnyStatus: bunnyVideo.status,
        },
      },
    });

    // Get TUS upload credentials
    const credentials = this.bunny.getUploadCredentials(bunnyVideo.guid);

    return {
      mediaId: media.id,
      videoId: bunnyVideo.guid,
      tusEndpoint: credentials.tusEndpoint,
      tusAuthToken: credentials.authorizationSignature,
      tusExpirationTime: String(credentials.authorizationExpire),
      libraryId: credentials.libraryId,
    };
  }

  // ─── Status ────────────────────────────────────────────────────

  /**
   * Get video processing status (poll this after upload).
   */
  @Get(':videoId/status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get video processing status' })
  async getVideoStatus(@Param('videoId') videoId: string) {
    if (!this.bunny.isConfigured()) {
      throw new BadRequestException('Bunny Stream nie jest skonfigurowany');
    }

    const media = await this.prisma.mediaFile.findUnique({
      where: { bunnyVideoId: videoId },
    });

    if (!media) throw new NotFoundException('Wideo nie znalezione');

    // Fetch fresh status from Bunny
    const bunnyStatus = await this.bunny.getVideoStatus(videoId);
    const isFinished = this.bunny.isFinished(bunnyStatus.status);
    const isError = this.bunny.isError(bunnyStatus.status);

    // Update local DB
    const updatedMedia = await this.prisma.mediaFile.update({
      where: { bunnyVideoId: videoId },
      data: {
        status: isFinished ? 'READY' : isError ? 'FAILED' : 'PROCESSING',
        processingProgress: bunnyStatus.encodeProgress,
        duration: bunnyStatus.length || null,
        thumbnailUrl: this.bunny.getThumbnailUrl(videoId, bunnyStatus.thumbnailFileName),
        metadata: {
          ...(typeof media.metadata === 'object' && media.metadata !== null ? media.metadata : {}),
          bunnyStatus: bunnyStatus.status,
          statusLabel: this.bunny.mapStatus(bunnyStatus.status),
          width: bunnyStatus.width,
          height: bunnyStatus.height,
          storageSize: bunnyStatus.storageSize,
          framerate: bunnyStatus.framerate,
          availableResolutions: bunnyStatus.availableResolutions,
          hasMP4Fallback: bunnyStatus.hasMP4Fallback,
        },
      },
    });

    return {
      mediaId: updatedMedia.id,
      videoId,
      status: updatedMedia.status,
      statusLabel: this.bunny.mapStatus(bunnyStatus.status),
      progress: bunnyStatus.encodeProgress,
      duration: bunnyStatus.length,
      width: bunnyStatus.width,
      height: bunnyStatus.height,
      thumbnailUrl: updatedMedia.thumbnailUrl,
      hlsUrl: updatedMedia.hlsUrl,
      previewUrl: updatedMedia.previewUrl,
      embedUrl: this.bunny.getEmbedUrl(videoId),
      resolutions: bunnyStatus.availableResolutions,
      isReady: isFinished,
      isError,
    };
  }

  /**
   * Get video info (from local DB, no external call).
   */
  @Get(':videoId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get video info' })
  async getVideo(@Param('videoId') videoId: string) {
    const media = await this.prisma.mediaFile.findUnique({
      where: { bunnyVideoId: videoId },
    });

    if (!media) throw new NotFoundException('Wideo nie znalezione');

    return {
      mediaId: media.id,
      videoId: media.bunnyVideoId,
      status: media.status,
      progress: media.processingProgress,
      duration: media.duration,
      thumbnailUrl: media.thumbnailUrl,
      hlsUrl: media.hlsUrl,
      previewUrl: media.previewUrl,
      embedUrl: media.bunnyVideoId ? this.bunny.getEmbedUrl(media.bunnyVideoId) : null,
      cdnUrl: media.cdnUrl,
      isReady: media.status === 'READY',
      createdAt: media.createdAt,
    };
  }

  // ─── Delete ────────────────────────────────────────────────────

  @Delete(':videoId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete video from Bunny and DB' })
  async deleteVideo(
    @Request() req: { user: { userId: string } },
    @Param('videoId') videoId: string,
  ) {
    const media = await this.prisma.mediaFile.findUnique({
      where: { bunnyVideoId: videoId },
    });

    if (!media) throw new NotFoundException('Wideo nie znalezione');

    // Only owner can delete
    if (media.uploadedById !== req.user.userId) {
      throw new BadRequestException('Nie masz uprawnień do usunięcia tego wideo');
    }

    // Delete from Bunny
    if (this.bunny.isConfigured()) {
      await this.bunny.deleteVideo(videoId);
    }

    // Delete from DB
    await this.prisma.mediaFile.delete({
      where: { bunnyVideoId: videoId },
    });

    return { deleted: true };
  }

  // ─── Library (admin list) ──────────────────────────────────────

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all videos (with optional community filter)' })
  async listVideos(
    @Query('communityId') communityId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(1, parseInt(page || '1', 10));
    const l = Math.min(50, Math.max(1, parseInt(limit || '20', 10)));

    const where = {
      type: 'VIDEO' as const,
      ...(communityId ? { communityId } : {}),
    };

    const [videos, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
        include: { uploadedBy: { select: { id: true, displayName: true, avatarUrl: true } } },
      }),
      this.prisma.mediaFile.count({ where }),
    ]);

    return {
      data: videos.map((v) => ({
        mediaId: v.id,
        videoId: v.bunnyVideoId,
        status: v.status,
        progress: v.processingProgress,
        duration: v.duration,
        thumbnailUrl: v.thumbnailUrl,
        hlsUrl: v.hlsUrl,
        embedUrl: v.bunnyVideoId ? this.bunny.getEmbedUrl(v.bunnyVideoId) : null,
        uploadedBy: (v as unknown as Record<string, unknown>).uploadedBy,
        createdAt: v.createdAt,
        metadata: v.metadata,
      })),
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  // ─── Bunny Webhook ─────────────────────────────────────────────

  /**
   * Webhook endpoint for Bunny Stream encoding notifications.
   * Configure in Bunny dashboard: POST https://your-api.com/video/webhook
   */
  @Post('webhook')
  @ApiOperation({ summary: 'Bunny Stream webhook for encoding status' })
  async handleWebhook(
    @Body()
    body: {
      VideoGuid?: string;
      VideoLibraryId?: number;
      Status?: number;
      EncodeProgress?: number;
    },
  ) {
    const { VideoGuid, Status, EncodeProgress } = body;

    if (!VideoGuid) {
      this.logger.warn('Webhook received without VideoGuid');
      return { ok: true };
    }

    this.logger.log(
      `Bunny webhook: video=${VideoGuid}, status=${Status}, progress=${EncodeProgress}%`,
    );

    const media = await this.prisma.mediaFile.findUnique({
      where: { bunnyVideoId: VideoGuid },
    });

    if (!media) {
      this.logger.warn(`Webhook for unknown video: ${VideoGuid}`);
      return { ok: true };
    }

    const isFinished = Status === 4;
    const isError = Status === 5 || Status === 6;

    const updateData: Record<string, unknown> = {
      processingProgress: EncodeProgress ?? media.processingProgress,
      status: isFinished ? 'READY' : isError ? 'FAILED' : 'PROCESSING',
    };

    // When finished, fetch full details
    if (isFinished && this.bunny.isConfigured()) {
      try {
        const details = await this.bunny.getVideoStatus(VideoGuid);
        updateData.duration = details.length || null;
        updateData.thumbnailUrl = this.bunny.getThumbnailUrl(
          VideoGuid,
          details.thumbnailFileName,
        );
        updateData.metadata = {
          ...(typeof media.metadata === 'object' && media.metadata !== null ? media.metadata : {}),
          bunnyStatus: Status,
          statusLabel: this.bunny.mapStatus(Status!),
          width: details.width,
          height: details.height,
          storageSize: details.storageSize,
          framerate: details.framerate,
          availableResolutions: details.availableResolutions,
          hasMP4Fallback: details.hasMP4Fallback,
        };
      } catch (err) {
        this.logger.error(`Failed to fetch details for ${VideoGuid}: ${err}`);
      }
    }

    await this.prisma.mediaFile.update({
      where: { bunnyVideoId: VideoGuid },
      data: updateData,
    });

    return { ok: true };
  }

  // ─── Health ────────────────────────────────────────────────────

  @Get('health')
  @ApiOperation({ summary: 'Check Bunny Stream integration status' })
  async health() {
    return {
      configured: this.bunny.isConfigured(),
      provider: 'bunny-stream',
    };
  }
}
