export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface SessionCreateInput {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

export interface SessionRepository {
  create(input: SessionCreateInput): Promise<void>;
  refresh(sessionId: string, expiresAt: Date): Promise<void>;
  destroy(sessionId: string): Promise<void>;
  destroyAll(userId: string): Promise<void>;
}
