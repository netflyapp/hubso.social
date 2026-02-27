import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import { PointReason } from '@prisma/client';

// ==================== Community Gamification Controller ====================

@Controller('communities/:communitySlug/gamification')
@UseGuards(AuthGuard('jwt'))
export class GamificationController {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService,
  ) {}

  private async getCommunityId(slug: string): Promise<string> {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!community) throw new Error('Community not found');
    return community.id;
  }

  // --- Leaderboard ---

  @Get('leaderboard')
  async getLeaderboard(
    @Param('communitySlug') communitySlug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.getLeaderboard(
      communityId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  // --- User Profile ---

  @Get('profile')
  async getMyProfile(
    @Param('communitySlug') communitySlug: string,
    @Request() req: any,
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.getGamificationProfile(req.user.id, communityId);
  }

  @Get('profile/:userId')
  async getUserProfile(
    @Param('communitySlug') communitySlug: string,
    @Param('userId') userId: string,
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.getGamificationProfile(userId, communityId);
  }

  // --- Points ---

  @Get('points')
  async getMyPoints(
    @Param('communitySlug') communitySlug: string,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.getPointHistory(
      req.user.id,
      communityId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  // --- Badges ---

  @Get('badges')
  async getBadges(@Param('communitySlug') communitySlug: string) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.getBadges(communityId);
  }

  @Get('badges/my')
  async getMyBadges(@Request() req: any) {
    return this.gamificationService.getUserBadges(req.user.id);
  }

  // --- Challenges ---

  @Get('challenges')
  async getChallenges(
    @Param('communitySlug') communitySlug: string,
    @Query('all') all?: string,
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.getChallenges(communityId, all !== 'true');
  }

  @Get('challenges/:challengeId')
  async getChallenge(@Param('challengeId') challengeId: string) {
    return this.gamificationService.getChallenge(challengeId);
  }

  @Post('challenges/:challengeId/join')
  async joinChallenge(
    @Param('challengeId') challengeId: string,
    @Request() req: any,
  ) {
    return this.gamificationService.joinChallenge(challengeId, req.user.id);
  }

  @Delete('challenges/:challengeId/leave')
  async leaveChallenge(
    @Param('challengeId') challengeId: string,
    @Request() req: any,
  ) {
    return this.gamificationService.leaveChallenge(challengeId, req.user.id);
  }

  @Get('challenges/my')
  async getMyChallenges(
    @Param('communitySlug') communitySlug: string,
    @Request() req: any,
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.getUserChallenges(req.user.id, communityId);
  }

  // --- Streak ---

  @Get('streak')
  async getMyStreak(@Request() req: any) {
    return this.gamificationService.getUserStreak(req.user.id);
  }

  // --- Stats (admin) ---

  @Get('stats')
  async getStats(@Param('communitySlug') communitySlug: string) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.getGamificationStats(communityId);
  }
}

// ==================== Admin Gamification Controller ====================

@Controller('communities/:communitySlug/gamification/admin')
@UseGuards(AuthGuard('jwt'))
export class GamificationAdminController {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService,
  ) {}

  private async getCommunityId(slug: string): Promise<string> {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!community) throw new Error('Community not found');
    return community.id;
  }

  // --- Badges CRUD ---

  @Post('badges')
  async createBadge(
    @Param('communitySlug') communitySlug: string,
    @Body() body: {
      name: string;
      slug: string;
      description?: string;
      iconUrl?: string;
      color?: string;
      category?: string;
      criteria?: Record<string, unknown>;
      pointsReward?: number;
      isAutomatic?: boolean;
      sortOrder?: number;
    },
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.createBadge(communityId, body);
  }

  @Patch('badges/:badgeId')
  async updateBadge(
    @Param('badgeId') badgeId: string,
    @Body() body: any,
  ) {
    return this.gamificationService.updateBadge(badgeId, body);
  }

  @Delete('badges/:badgeId')
  async deleteBadge(@Param('badgeId') badgeId: string) {
    return this.gamificationService.deleteBadge(badgeId);
  }

  @Post('badges/:badgeId/award/:userId')
  async awardBadge(
    @Param('badgeId') badgeId: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return this.gamificationService.awardBadge(userId, badgeId, req.user.id);
  }

  @Delete('badges/:badgeId/revoke/:userId')
  async revokeBadge(
    @Param('badgeId') badgeId: string,
    @Param('userId') userId: string,
  ) {
    return this.gamificationService.revokeBadge(userId, badgeId);
  }

  // --- Points Admin ---

  @Post('points/grant')
  async grantPoints(
    @Param('communitySlug') communitySlug: string,
    @Body() body: { userId: string; points: number; description?: string },
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.awardPoints(
      body.userId,
      communityId,
      PointReason.ADMIN_GRANT,
      body.points,
      undefined,
      undefined,
      body.description,
    );
  }

  @Post('points/deduct')
  async deductPoints(
    @Param('communitySlug') communitySlug: string,
    @Body() body: { userId: string; points: number; description?: string },
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.deductPoints(
      body.userId,
      communityId,
      body.points,
      body.description,
    );
  }

  // --- Challenges CRUD ---

  @Post('challenges')
  async createChallenge(
    @Param('communitySlug') communitySlug: string,
    @Body() body: {
      title: string;
      slug: string;
      description?: string;
      type?: string;
      durationDays?: number;
      goal?: Record<string, unknown>;
      pointsReward?: number;
      badgeReward?: string;
      maxParticipants?: number;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const communityId = await this.getCommunityId(communitySlug);
    return this.gamificationService.createChallenge(communityId, body);
  }

  @Patch('challenges/:challengeId')
  async updateChallenge(
    @Param('challengeId') challengeId: string,
    @Body() body: any,
  ) {
    return this.gamificationService.updateChallenge(challengeId, body);
  }

  @Delete('challenges/:challengeId')
  async deleteChallenge(@Param('challengeId') challengeId: string) {
    return this.gamificationService.deleteChallenge(challengeId);
  }
}
