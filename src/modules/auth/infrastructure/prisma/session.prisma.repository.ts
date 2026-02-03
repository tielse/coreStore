/**
 * Session Prisma Repository (Infrastructure layer)
 * Implements ISessionRepository (for persistent storage)
 * Note: Session mutable store thường xuyên vào Redis, Prisma dùng cho audit trail
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ISessionRepository } from '../../application/ports/session.repository.port';

@Injectable()
export class SessionPrismaRepository implements ISessionRepository {
  private readonly logger = new Logger(SessionPrismaRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create new session
   */
  async createSession(session: {
    id: string;
    userId: string;
    sessionId: string;
    refreshTokenHash: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
    revoked?: boolean;
  }): Promise<any> {
    try {
      return await this.prisma.sys_user_session.create({
        data: {
          id: session.id,
          user_id: session.userId,
          session_id: session.sessionId,
          refresh_token_hash: session.refreshTokenHash,
          ip_address: session.ipAddress,
          user_agent: session.userAgent,
          expires_at: session.expiresAt,
          revoked: session.revoked || false,
          created_by: 'system',
        },
      });
    } catch (error) {
      this.logger.error(`Create session failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<any> {
    try {
      return await this.prisma.sys_user_session.findUnique({
        where: { session_id: sessionId },
        include: { user: true },
      });
    } catch (error) {
      this.logger.error(`Get session failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.prisma.sys_user_session.delete({
        where: { session_id: sessionId },
      });
      this.logger.debug(`Session deleted: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Delete session failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all sessions for a user
   */
  async listUserSessions(userId: string): Promise<any[]> {
    try {
      return await this.prisma.sys_user_session.findMany({
        where: { user_id: userId },
        orderBy: { created_time: 'desc' },
      });
    } catch (error) {
      this.logger.error(`List user sessions failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      await this.prisma.sys_user_session.update({
        where: { session_id: sessionId },
        data: { revoked: true },
      });
      this.logger.debug(`Session revoked: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Revoke session failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete all expired sessions
   */
  async deleteExpiredSessions(): Promise<number> {
    try {
      const result = await this.prisma.sys_user_session.deleteMany({
        where: {
          expires_at: { lt: new Date() },
        },
      });
      this.logger.log(`Deleted ${result.count} expired sessions`);
      return result.count;
    } catch (error) {
      this.logger.error(`Delete expired sessions failed: ${error.message}`);
      return 0;
    }
  }
}
