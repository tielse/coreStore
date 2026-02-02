import { AuthSession } from '../entities/auth-session.entity';

export interface AuthSessionRepository {
  save(session: AuthSession): Promise<void>;
  findById(sessionId: string): Promise<AuthSession | null>;
  revoke(sessionId: string): Promise<void>;
  revokeAll(userId: string): Promise<void>;
}
