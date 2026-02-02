export class LogoutRequestDto {
  sessionId?: string; // revoke 1 session
  logoutAll?: boolean; // revoke all sys_user_session by user
}
