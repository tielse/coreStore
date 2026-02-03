export interface LoginCommand {
  username: string;
  password: string;

  rememberMe?: boolean;

  ipAddress?: string;
  userAgent?: string;
}
