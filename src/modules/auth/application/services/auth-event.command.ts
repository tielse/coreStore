export type AuthAction = 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH';

export interface AuthEventCommand {
  userId: string;
  username: string;
  email?: string;
  sessionId: string;
  expiresAt: Date;
  action: 'LOGIN' | 'TOKEN_REFRESH';
  ipAddress?: string;
  userAgent?: string;
}
