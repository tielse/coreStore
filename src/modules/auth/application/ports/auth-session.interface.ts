/**
 * Injection token
 */
export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

/**
 * Input khi tạo session
 */
export interface SessionCreateInput {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

/**
 * SessionRepository (Port)
 * ------------------------------------
 * - Application layer chỉ biết interface
 * - Không biết PostgreSQL / Redis / Prisma
 */
export interface SessionRepository {
  create(input: SessionCreateInput): Promise<void>;

  refresh(sessionId: string, expiresAt: Date): Promise<void>;

  destroy(sessionId: string): Promise<void>;

  destroyAll(userId: string): Promise<void>;
}
