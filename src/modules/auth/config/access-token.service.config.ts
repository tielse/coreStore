import { AccessTokenPayload } from './access-token.config';

// Auth module

// JWT nội bộ

// Refresh token flow

export interface AccessTokenService {
  issueAccessToken(payload: AccessTokenPayload): Promise<string>;

  verifyAccessToken(token: string): Promise<AccessTokenPayload>;

  getAccessTokenExpiry(): Date;
}
