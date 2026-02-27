import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

const ONLINE_KEY = 'hubso:online';
const TTL_SECONDS = 60; // auto-expire after 60s (heartbeat required)

@Injectable()
export class PresenceService implements OnModuleDestroy {
  private readonly logger = new Logger(PresenceService.name);
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
    });

    this.redis.on('error', (err) => {
      this.logger.warn(`[Redis] Connection error: ${err.message} (presence degraded)`);
    });

    this.redis.connect().catch((err) => {
      this.logger.warn(`[Redis] Could not connect: ${err.message} (presence disabled)`);
    });
  }

  async onModuleDestroy() {
    await this.redis.quit().catch(() => {});
  }

  /**
   * Mark user as online (auto-expires after TTL_SECONDS)
   */
  async setOnline(userId: string): Promise<void> {
    try {
      await this.redis.setex(`${ONLINE_KEY}:${userId}`, TTL_SECONDS, Date.now().toString());
      // Also add to sorted set for expiry tracking
      await this.redis.zadd(ONLINE_KEY, Date.now(), userId);
    } catch {
      // Redis unavailable — fail silently
    }
  }

  /**
   * Mark user as offline (remove from online set)
   */
  async setOffline(userId: string): Promise<void> {
    try {
      await this.redis.del(`${ONLINE_KEY}:${userId}`);
      await this.redis.zrem(ONLINE_KEY, userId);
    } catch {
      // Redis unavailable — fail silently
    }
  }

  /**
   * Check if a user is online
   */
  async isOnline(userId: string): Promise<boolean> {
    try {
      const val = await this.redis.get(`${ONLINE_KEY}:${userId}`);
      return val !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get online status for multiple users at once
   * Returns: { userId: boolean }
   */
  async getPresence(userIds: string[]): Promise<Record<string, boolean>> {
    if (userIds.length === 0) return {};

    try {
      const pipeline = this.redis.pipeline();
      for (const id of userIds) {
        pipeline.exists(`${ONLINE_KEY}:${id}`);
      }
      const results = await pipeline.exec();
      const presence: Record<string, boolean> = {};
      userIds.forEach((id, i) => {
        const result = results?.[i];
        if (result) {
          const [err, val] = result;
          presence[id] = !err && val === 1;
        } else {
          presence[id] = false;
        }
      });
      return presence;
    } catch {
      return Object.fromEntries(userIds.map((id) => [id, false]));
    }
  }

  /**
   * Refresh TTL (heartbeat — called every ~30s by client via socket)
   */
  async heartbeat(userId: string): Promise<void> {
    try {
      const exists = await this.redis.exists(`${ONLINE_KEY}:${userId}`);
      if (exists) {
        await this.redis.expire(`${ONLINE_KEY}:${userId}`, TTL_SECONDS);
        await this.redis.zadd(ONLINE_KEY, Date.now(), userId);
      }
    } catch {
      // fail silently
    }
  }

  /**
   * Get all currently online user IDs
   */
  async getOnlineUserIds(): Promise<string[]> {
    try {
      // Clean stale entries (older than TTL)
      const cutoff = Date.now() - TTL_SECONDS * 1000;
      await this.redis.zremrangebyscore(ONLINE_KEY, '-inf', cutoff);
      return await this.redis.zrange(ONLINE_KEY, 0, -1);
    } catch {
      return [];
    }
  }
}
