export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

export interface RefreshTokenService {
  /**
   * Issue refresh token
   */
  issue(payload: RefreshTokenPayload): Promise<string>;

  /**
   * Verify refresh token
   * Throw error if invalid / revoked
   */
  verify(token: string): Promise<RefreshTokenPayload>;

  /**
   * Rotate refresh token
   */
  rotate(oldToken: string): Promise<string>;

  /**
   * Revoke by session
   */
  revoke(sessionId: string): Promise<void>;

  /**
   * Revoke all sessions of user
   */
  revokeAll(userId: string): Promise<void>;
}
