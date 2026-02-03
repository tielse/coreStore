export class RefreshTokenResponseDTO {
  sessionId: string;
  accessToken: string;
  expiresAt: Date;

  constructor(data: {
    sessionId: string;
    accessToken: string;
    expiresAt: Date;
  }) {
    this.sessionId = data.sessionId;
    this.accessToken = data.accessToken;
    this.expiresAt = data.expiresAt;
  }
}
