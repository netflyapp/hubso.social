import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PointReason,
  UserLevelTitle,
  ChallengeParticipationStatus,
  Prisma,
} from '@prisma/client';

// Level thresholds: points needed to reach each level
const LEVEL_THRESHOLDS: { level: number; title: UserLevelTitle; threshold: number }[] = [
  { level: 1, title: UserLevelTitle.NEWBIE, threshold: 0 },
  { level: 2, title: UserLevelTitle.BEGINNER, threshold: 100 },
  { level: 3, title: UserLevelTitle.INTERMEDIATE, threshold: 300 },
  { level: 4, title: UserLevelTitle.ADVANCED, threshold: 700 },
  { level: 5, title: UserLevelTitle.PRO, threshold: 1500 },
  { level: 6, title: UserLevelTitle.MASTER, threshold: 3000 },
  { level: 7, title: UserLevelTitle.LEGEND, threshold: 6000 },
];

// Default point values for each action
const POINT_VALUES: Partial<Record<PointReason, number>> = {
  [PointReason.POST_CREATED]: 10,
  [PointReason.COMMENT_CREATED]: 5,
  [PointReason.REACTION_RECEIVED]: 2,
  [PointReason.REACTION_GIVEN]: 1,
  [PointReason.DAILY_LOGIN]: 3,
  [PointReason.COURSE_COMPLETED]: 50,
  [PointReason.LESSON_COMPLETED]: 5,
  [PointReason.CHALLENGE_COMPLETED]: 25,
  [PointReason.BADGE_EARNED]: 10,
  [PointReason.STREAK_BONUS]: 5,
};

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==================== Points ====================

  async awardPoints(
    userId: string,
    communityId: string,
    reason: PointReason,
    customPoints?: number,
    referenceType?: string,
    referenceId?: string,
    description?: string,
  ) {
    const points = customPoints ?? POINT_VALUES[reason] ?? 0;
    if (points === 0) return null;

    const transaction = await this.prisma.pointTransaction.create({
      data: {
        userId,
        communityId,
        points,
        reason,
        referenceType,
        referenceId,
        description,
      },
    });

    // Update user level
    await this.recalculateLevel(userId, communityId);

    // Update streak if it's a daily login
    if (reason === PointReason.DAILY_LOGIN) {
      await this.updateStreak(userId, communityId);
    }

    // Check automatic badges
    await this.checkAutoBadges(userId, communityId);

    this.logger.log(`Awarded ${points} points to user ${userId} for ${reason}`);
    return transaction;
  }

  async deductPoints(
    userId: string,
    communityId: string,
    points: number,
    description?: string,
  ) {
    const transaction = await this.prisma.pointTransaction.create({
      data: {
        userId,
        communityId,
        points: -Math.abs(points),
        reason: PointReason.ADMIN_DEDUCT,
        description,
      },
    });

    await this.recalculateLevel(userId, communityId);
    return transaction;
  }

  async getUserPoints(userId: string, communityId: string): Promise<number> {
    const result = await this.prisma.pointTransaction.aggregate({
      where: { userId, communityId },
      _sum: { points: true },
    });
    return result._sum.points ?? 0;
  }

  async getPointHistory(
    userId: string,
    communityId: string,
    page = 1,
    limit = 20,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where: { userId, communityId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pointTransaction.count({ where: { userId, communityId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // ==================== Levels ====================

  async recalculateLevel(userId: string, communityId: string) {
    const totalPoints = await this.getUserPoints(userId, communityId);

    // Find the appropriate level
    let currentLevel = LEVEL_THRESHOLDS[0]!;
    let nextThreshold = LEVEL_THRESHOLDS[1]?.threshold ?? 100;

    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalPoints >= LEVEL_THRESHOLDS[i]!.threshold) {
        currentLevel = LEVEL_THRESHOLDS[i]!;
        nextThreshold = LEVEL_THRESHOLDS[i + 1]?.threshold ?? currentLevel.threshold + 1000;
        break;
      }
    }

    const userLevel = await this.prisma.userLevel.upsert({
      where: { userId },
      create: {
        userId,
        communityId,
        level: currentLevel.level,
        title: currentLevel.title,
        totalPoints,
        currentLevelPoints: totalPoints - currentLevel.threshold,
        nextLevelThreshold: nextThreshold,
      },
      update: {
        level: currentLevel.level,
        title: currentLevel.title,
        totalPoints,
        currentLevelPoints: totalPoints - currentLevel.threshold,
        nextLevelThreshold: nextThreshold,
      },
    });

    return userLevel;
  }

  async getUserLevel(userId: string) {
    return this.prisma.userLevel.findUnique({
      where: { userId },
    });
  }

  // ==================== Leaderboard ====================

  async getLeaderboard(communityId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.userLevel.findMany({
        where: { communityId },
        orderBy: { totalPoints: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.userLevel.count({ where: { communityId } }),
    ]);

    return {
      data: data.map((entry, index) => ({
        rank: (page - 1) * limit + index + 1,
        ...entry,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getUserRank(userId: string, communityId: string): Promise<number> {
    const userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) return 0;

    const rank = await this.prisma.userLevel.count({
      where: {
        communityId,
        totalPoints: { gt: userLevel.totalPoints },
      },
    });

    return rank + 1;
  }

  // ==================== Streaks ====================

  async updateStreak(userId: string, communityId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await this.prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      return this.prisma.userStreak.create({
        data: {
          userId,
          communityId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
          streakStartDate: today,
        },
      });
    }

    const lastActive = streak.lastActiveDate
      ? new Date(streak.lastActiveDate)
      : null;

    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) {
        // Already logged in today — no change
        return streak;
      }

      if (diffDays === 1) {
        // Consecutive day — increment streak
        const newStreak = streak.currentStreak + 1;
        const longestStreak = Math.max(newStreak, streak.longestStreak);

        // Award streak bonus every 7 days
        if (newStreak % 7 === 0) {
          await this.awardPoints(
            userId,
            communityId,
            PointReason.STREAK_BONUS,
            newStreak, // bonus = streak length
            'streak',
            streak.id,
            `${newStreak}-day streak bonus!`,
          );
        }

        return this.prisma.userStreak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak,
            lastActiveDate: today,
          },
        });
      }

      // Streak broken — reset
      return this.prisma.userStreak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActiveDate: today,
          streakStartDate: today,
        },
      });
    }

    return this.prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        lastActiveDate: today,
        streakStartDate: today,
      },
    });
  }

  async getUserStreak(userId: string) {
    return this.prisma.userStreak.findUnique({
      where: { userId },
    });
  }

  // ==================== Badges ====================

  async createBadge(communityId: string, data: {
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
  }) {
    return this.prisma.badge.create({
      data: {
        communityId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        iconUrl: data.iconUrl,
        color: data.color ?? '#3B82F6',
        category: (data.category as any) ?? 'ACHIEVEMENT',
        criteria: (data.criteria ?? {}) as Prisma.InputJsonValue,
        pointsReward: data.pointsReward ?? 0,
        isAutomatic: data.isAutomatic ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async updateBadge(badgeId: string, data: Partial<{
    name: string;
    description: string;
    iconUrl: string;
    color: string;
    category: string;
    criteria: Record<string, unknown>;
    pointsReward: number;
    isAutomatic: boolean;
    isActive: boolean;
    sortOrder: number;
  }>) {
    return this.prisma.badge.update({
      where: { id: badgeId },
      data: data as any,
    });
  }

  async deleteBadge(badgeId: string) {
    return this.prisma.badge.delete({ where: { id: badgeId } });
  }

  async getBadges(communityId: string) {
    return this.prisma.badge.findMany({
      where: { communityId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { userBadges: true } },
      },
    });
  }

  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
  }

  async awardBadge(userId: string, badgeId: string, awardedBy?: string) {
    // Check if already awarded
    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (existing) return existing;

    const badge = await this.prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new NotFoundException('Badge not found');

    const userBadge = await this.prisma.userBadge.create({
      data: {
        userId,
        badgeId,
        awardedBy: awardedBy ?? 'system',
      },
      include: { badge: true },
    });

    // Award bonus points for earning badge
    if (badge.pointsReward > 0) {
      await this.awardPoints(
        userId,
        badge.communityId,
        PointReason.BADGE_EARNED,
        badge.pointsReward,
        'badge',
        badgeId,
        `Earned badge: ${badge.name}`,
      );
    }

    this.logger.log(`Awarded badge "${badge.name}" to user ${userId}`);
    return userBadge;
  }

  async revokeBadge(userId: string, badgeId: string) {
    return this.prisma.userBadge.delete({
      where: { userId_badgeId: { userId, badgeId } },
    });
  }

  async checkAutoBadges(userId: string, communityId: string) {
    const badges = await this.prisma.badge.findMany({
      where: { communityId, isAutomatic: true, isActive: true },
    });

    const totalPoints = await this.getUserPoints(userId, communityId);

    for (const badge of badges) {
      const criteria = badge.criteria as Record<string, any>;
      if (!criteria || !criteria.type) continue;

      // Check if already awarded
      const existing = await this.prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (existing) continue;

      let eligible = false;

      switch (criteria.type) {
        case 'points':
          eligible = totalPoints >= (criteria.threshold ?? 0);
          break;

        case 'posts': {
          const postCount = await this.prisma.post.count({
            where: { authorId: userId },
          });
          eligible = postCount >= (criteria.count ?? 0);
          break;
        }

        case 'comments': {
          const commentCount = await this.prisma.comment.count({
            where: { authorId: userId },
          });
          eligible = commentCount >= (criteria.count ?? 0);
          break;
        }

        case 'streak': {
          const streak = await this.prisma.userStreak.findUnique({
            where: { userId },
          });
          eligible = (streak?.longestStreak ?? 0) >= (criteria.days ?? 0);
          break;
        }

        case 'courses_completed': {
          const completedCourses = await this.prisma.enrollment.count({
            where: { userId, status: 'COMPLETED' },
          });
          eligible = completedCourses >= (criteria.count ?? 0);
          break;
        }

        case 'level':
          eligible = (await this.getUserLevel(userId))?.level
            ? ((await this.getUserLevel(userId))!.level >= (criteria.level ?? 0))
            : false;
          break;
      }

      if (eligible) {
        await this.awardBadge(userId, badge.id, 'system');
      }
    }
  }

  // ==================== Challenges ====================

  async createChallenge(communityId: string, data: {
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
  }) {
    return this.prisma.challenge.create({
      data: {
        communityId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        type: (data.type as any) ?? 'STREAK',
        durationDays: data.durationDays ?? 7,
        goal: (data.goal ?? {}) as Prisma.InputJsonValue,
        pointsReward: data.pointsReward ?? 50,
        badgeReward: data.badgeReward,
        maxParticipants: data.maxParticipants,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        _count: { select: { participants: true } },
      },
    });
  }

  async updateChallenge(challengeId: string, data: Partial<{
    title: string;
    description: string;
    type: string;
    durationDays: number;
    goal: Record<string, unknown>;
    pointsReward: number;
    badgeReward: string;
    maxParticipants: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>) {
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.type) updateData.type = data.type;

    return this.prisma.challenge.update({
      where: { id: challengeId },
      data: updateData,
      include: {
        _count: { select: { participants: true } },
      },
    });
  }

  async deleteChallenge(challengeId: string) {
    return this.prisma.challenge.delete({ where: { id: challengeId } });
  }

  async getChallenges(communityId: string, activeOnly = true) {
    return this.prisma.challenge.findMany({
      where: {
        communityId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { participants: true } },
      },
    });
  }

  async getChallenge(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        _count: { select: { participants: true } },
        participants: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
          orderBy: { progress: 'desc' },
          take: 20,
        },
      },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async joinChallenge(challengeId: string, userId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { _count: { select: { participants: true } } },
    });

    if (!challenge) throw new NotFoundException('Challenge not found');
    if (!challenge.isActive) throw new BadRequestException('Challenge is not active');

    if (challenge.maxParticipants && challenge._count.participants >= challenge.maxParticipants) {
      throw new BadRequestException('Challenge is full');
    }

    return this.prisma.challengeParticipation.create({
      data: { challengeId, userId },
      include: { challenge: true },
    });
  }

  async leaveChallenge(challengeId: string, userId: string) {
    return this.prisma.challengeParticipation.update({
      where: { challengeId_userId: { challengeId, userId } },
      data: { status: ChallengeParticipationStatus.ABANDONED },
    });
  }

  async updateChallengeProgress(challengeId: string, userId: string, increment = 1) {
    const participation = await this.prisma.challengeParticipation.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
      include: { challenge: true },
    });

    if (!participation) throw new NotFoundException('Not participating');
    if (participation.status !== ChallengeParticipationStatus.ACTIVE) return participation;

    const newProgress = participation.progress + increment;
    const goal = participation.challenge.goal as Record<string, any>;
    const targetCount = goal?.count ?? participation.challenge.durationDays;
    const isComplete = newProgress >= targetCount;

    const updated = await this.prisma.challengeParticipation.update({
      where: { challengeId_userId: { challengeId, userId } },
      data: {
        progress: newProgress,
        ...(isComplete
          ? {
              status: ChallengeParticipationStatus.COMPLETED,
              completedAt: new Date(),
            }
          : {}),
      },
      include: { challenge: true },
    });

    // Award rewards on completion
    if (isComplete) {
      const challenge = participation.challenge;

      if (challenge.pointsReward > 0) {
        await this.awardPoints(
          userId,
          challenge.communityId,
          PointReason.CHALLENGE_COMPLETED,
          challenge.pointsReward,
          'challenge',
          challengeId,
          `Completed challenge: ${challenge.title}`,
        );
      }

      if (challenge.badgeReward) {
        await this.awardBadge(userId, challenge.badgeReward, 'system');
      }

      this.logger.log(`User ${userId} completed challenge "${challenge.title}"`);
    }

    return updated;
  }

  async getUserChallenges(userId: string, communityId: string) {
    return this.prisma.challengeParticipation.findMany({
      where: {
        userId,
        challenge: { communityId },
      },
      include: {
        challenge: {
          include: { _count: { select: { participants: true } } },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  // ==================== Gamification Profile (aggregate) ====================

  async getGamificationProfile(userId: string, communityId: string) {
    const [level, streak, badges, rank, recentPoints] = await Promise.all([
      this.getUserLevel(userId),
      this.getUserStreak(userId),
      this.getUserBadges(userId),
      this.getUserRank(userId, communityId),
      this.getPointHistory(userId, communityId, 1, 5),
    ]);

    return {
      level,
      streak,
      badges,
      rank,
      recentPoints: recentPoints.data,
    };
  }

  // ==================== Admin Stats ====================

  async getGamificationStats(communityId: string) {
    const [totalPoints, totalBadges, totalChallenges, activeChallenges, activeParticipants] =
      await Promise.all([
        this.prisma.pointTransaction.aggregate({
          where: { communityId, points: { gt: 0 } },
          _sum: { points: true },
        }),
        this.prisma.badge.count({ where: { communityId } }),
        this.prisma.challenge.count({ where: { communityId } }),
        this.prisma.challenge.count({ where: { communityId, isActive: true } }),
        this.prisma.challengeParticipation.count({
          where: {
            challenge: { communityId },
            status: ChallengeParticipationStatus.ACTIVE,
          },
        }),
      ]);

    return {
      totalPointsAwarded: totalPoints._sum.points ?? 0,
      totalBadges,
      totalChallenges,
      activeChallenges,
      activeParticipants,
    };
  }
}
