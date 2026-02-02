export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;

  expiresIn: number;
  tokenType: 'Bearer';

  user: {
    id: string; // sys_user.id
    username: string; // sys_user.username
    email?: string; // sys_user.email
    fullName?: string; // sys_user.full_name
    phone?: string; // sys_user.phone
    avatarUrl?: string; // sys_user.avatar_url
    status: string; // sys_user.status
    groups: string[]; // sys_group.id
  };

  session: {
    sessionId: string; // sys_user_session.session_id
    expiresAt: string; // sys_user_session.expires_at
  };
}
