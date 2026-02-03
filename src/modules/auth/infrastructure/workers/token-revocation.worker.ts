/**
 * Token Revocation Worker (Infrastructure layer)
 * Trách nhiệm: background job để cleanup expired sessions định kỳ
 *
 * Cơ chế:
 * 1. Listen trên Redis Keyspace Notifications (option 1 - real-time)
 * 2. Hoặc dùng cron job chạy every 5 minutes (option 2 - periodic)
 *
 * Bây giờ implement option 2 (cron job) vì đơn giản hơn
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from 'src/shared/infrastructure/redis/redis.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ClearSessionUseCase } from '../../application/use-cases/clear-session.use-case';

@Injectable()
export class TokenRevocationWorker {
  private readonly logger = new Logger(TokenRevocationWorker.name);

  constructor(
    private redisService: RedisService,
    private prismaService: PrismaService,
    private clearSessionUseCase: ClearSessionUseCase,
  ) {}

  /**
   * Cleanup expired sessions - runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupExpiredSessions(): Promise<void> {
    try {
      this.logger.debug('Starting expired session cleanup...');

      // Step 1: Find all expired sessions from Prisma
      const expiredSessions =
        await this.prismaService.sys_user_session.findMany({
          where: {
            expires_at: { lt: new Date() },
            revoked: false,
          },
        });

      if (expiredSessions.length === 0) {
        this.logger.debug('No expired sessions found');
        return;
      }

      this.logger.log(`Found ${expiredSessions.length} expired sessions`);

      // Step 2: Cleanup each expired session
      for (const session of expiredSessions) {
        try {
          await this.clearSessionUseCase.execute(
            session.session_id,
            session.user_id,
            session.refresh_token_hash, // Pass hash instead of actual token
          );
        } catch (error) {
          this.logger.error(
            `Failed to cleanup session ${session.session_id}: ${error.message}`,
          );
          // Continue with next session
        }
      }

      this.logger.log(
        `Session cleanup complete. Processed ${expiredSessions.length} sessions`,
      );
    } catch (error) {
      this.logger.error(`Session cleanup job failed: ${error.message}`);
    }
  }

  /**
   * Alternative: Listen on Redis Keyspace Notifications
   * This requires Redis config: notify-keyspace-events = "Ex"
   *
   * Advantages:
   * - Real-time cleanup (immediately when key expires)
   * - More efficient
   *
   * Disadvantages:
   * - Requires Redis config change
   * - More complex implementation
   *
   * Uncomment and use if needed (requires Redis module support)
   */
  // @OnEvent('redis:keyspace:expired:session:*')
  // async handleSessionExpired(key: string): Promise<void> {
  //   const sessionId = key.split(':')[2];
  //   const session = await this.prismaService.sys_user_session.findUnique({
  //     where: { session_id: sessionId },
  //   });
  //   if (session) {
  //     await this.clearSessionUseCase.execute(sessionId, session.user_id);
  //   }
  // }

  /**
   * Manual trigger (for testing or admin operations)
   */
  async triggerCleanup(): Promise<number> {
    return this.clearSessionUseCase.cleanupExpiredSessions();
  }
}
