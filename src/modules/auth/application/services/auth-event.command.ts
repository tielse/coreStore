/* ========= Auth actions ========= */
export enum AuthAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
}

/* ========= Base ========= */
export interface BaseAuthEventCommand {
  userId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

/* ========= Login ========= */
export interface LoginEventCommand extends BaseAuthEventCommand {
  action: AuthAction.LOGIN;
  username: string;
  email?: string;
  expiresAt: Date;
}

/* ========= Token refresh ========= */
export interface TokenRefreshEventCommand extends BaseAuthEventCommand {
  action: AuthAction.TOKEN_REFRESH;
  expiresAt: Date;
}

/* ========= Logout ========= */
export interface LogoutEventCommand {
  action: AuthAction.LOGOUT;
  userId: string;
  sessionId?: string;
  logoutAll?: boolean;
}
