export class LoginResponseDTO {
  sessionId: string;
  userId: string;
  email: string;
  username: string;
  fullName?: string;
  expiresAt: Date;
  accessToken: string;

  constructor(data: {
    sessionId: string;
    userId: string;
    email: string;
    username: string;
    fullName?: string;
    expiresAt: Date;
    accessToken: string;
  }) {
    this.sessionId = data.sessionId;
    this.userId = data.userId;
    this.email = data.email;
    this.username = data.username;
    this.fullName = data.fullName;
    this.expiresAt = data.expiresAt;
    this.accessToken = data.accessToken;
  }
}
