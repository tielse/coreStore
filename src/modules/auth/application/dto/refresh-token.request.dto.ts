export class RefreshTokenRequestDto {
  refreshToken: string;

  // optional – dùng để detect token theft
  ipAddress?: string;
  userAgent?: string;
}
