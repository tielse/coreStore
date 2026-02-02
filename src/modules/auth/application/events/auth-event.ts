export interface AuthEvent {
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH';
  username?: string;
  sessionId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
}
