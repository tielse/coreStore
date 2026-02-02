export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;

  expiresIn: number;
  tokenType: 'Bearer';

  session: {
    sessionId: string;
    expiresAt: string;
  };
}
