/**
 * Clear Session UseCase (Application layer)
 * Trách nhiệm: clear session sau khi hết hạn (called by worker)
 * - Revoke token với Keycloak
 * - Xóa session từ Redis và Prisma
 * - Publish logout event
 *
 * Điểm khác Logout: ClearSessionUseCase được gọi bởi background worker
 * (không từ user request), khi session hết hạn sau 60 phút
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import type {
  ISessionRepository,
  IKeycloakPort,
  IKafkaPort,
  ICachePort,
} from '../ports';
import {
  SESSION_REPOSITORY,
  KEYCLOAK_PORT,
  KAFKA_PORT,
  CACHE_PORT,
} from '../ports';

@Injectable()
export class ClearSessionUseCase {
  private readonly logger = new Logger(ClearSessionUseCase.name);

  constructor(
    @Inject(SESSION_REPOSITORY)
    private sessionRepository: ISessionRepository,

    @Inject(KEYCLOAK_PORT)
    private keycloakPort: IKeycloakPort,

    @Inject(KAFKA_PORT)
    private kafkaPort: IKafkaPort,

    @Inject(CACHE_PORT)
    private cachePort: ICachePort,
  ) {}

  /**
   * Execute clear session flow (called by worker/scheduler)
   */
  async execute(
    sessionId: string,
    userId: string,
    refreshToken?: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Clearing expired session: ${sessionId} for user: ${userId}`,
      );

      // Step 1: Revoke refresh token with Keycloak
      if (refreshToken) {
        try {
          await this.keycloakPort.revokeToken(refreshToken, 'refresh');
          this.logger.debug(`Token revoked for session ${sessionId}`);
        } catch (error) {
          this.logger.warn(`Failed to revoke token: ${error.message}`);
          // Continue with cleanup even if revocation fails
        }
      }

      // Step 2: Delete session from Prisma
      try {
        await this.sessionRepository.deleteSession(sessionId);
        this.logger.debug(`Session deleted from DB: ${sessionId}`);
      } catch (error) {
        this.logger.warn(`Failed to delete session from DB: ${error.message}`);
      }

      // Step 3: Delete session from Redis
      await this.cachePort.delete(`session:${sessionId}`);

      // Step 4: Publish session cleared event
      await this.kafkaPort.publishLogoutEvent({
        userId,
        sessionId,
        timestamp: new Date(),
      });

      this.logger.log(`Session cleared successfully: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Clear session failed: ${error.message}`);
      // Don't throw - this is a background task
    }
  }

  /**
   * Cleanup all expired sessions (called by scheduler)
   * Mục đích: định kỳ xóa tất cả sessions hết hạn từ DB
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      this.logger.log('Starting cleanup of expired sessions');
      const deletedCount = await this.sessionRepository.deleteExpiredSessions();
      this.logger.log(
        `Cleanup complete: deleted ${deletedCount} expired sessions`,
      );
      return deletedCount;
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`);
      return 0;
    }
  }
}
