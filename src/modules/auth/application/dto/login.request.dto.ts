export class LoginRequestDto {
  // ===== Credentials =====
  username: string;
  password: string;

  // ===== Optional business flags =====
  rememberMe?: boolean; // ảnh hưởng expires_at (refresh token)
}
