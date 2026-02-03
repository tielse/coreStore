/**
 * Port: Session Repository (Domain-driven)
 * Định nghĩa contract cho Session persistence layer
 * Sessions có thể lưu ở Redis (cache) hoặc Prisma (persistent)
 */

export interface ISessionRepository {
  /**
   * Tạo session mới
   */
  createSession(session: {
    id: string;
    userId: string;
    sessionId: string;
    refreshTokenHash: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
    revoked?: boolean;
  }): Promise<any>;

  /**
   * Lấy session theo ID
   */
  getSession(sessionId: string): Promise<any>;

  /**
   * Xóa session
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * Lấy tất cả sessions của user
   */
  listUserSessions(userId: string): Promise<any[]>;

  /**
   * Revoke session (đánh dấu là revoked)
   */
  revokeSession(sessionId: string): Promise<void>;

  /**
   * Xóa tất cả sessions hết hạn
   */
  deleteExpiredSessions(): Promise<number>;
}

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');
