export class AuthSession {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public expiresAt: Date,
    public revokedAt?: Date,
  ) {}

  isExpired(now = new Date()): boolean {
    return this.expiresAt < now;
  }

  revoke() {
    this.revokedAt = new Date();
  }
}
