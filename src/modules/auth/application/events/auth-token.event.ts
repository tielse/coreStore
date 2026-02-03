// unique symbol to identify the authentication event service
export const AUTH_EVENT_SERVICE = Symbol('AUTH_EVENT_SERVICE');

// interface representing an authentication event
export interface AuthEvent {
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH';
  username?: string;
  sessionId?: string;
  expiresAt?: Date;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  logoutAll?: boolean;
}
