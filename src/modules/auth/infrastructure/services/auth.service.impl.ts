import {
  AuthService,
  AuthIdentity,
} from '../../application/ports/auth.service.interface';

import { IdentityProvider } from '../../config/identity-provider.config';
import { AccessTokenService } from '../../config/access-token.service.config';
import { RefreshTokenService } from '../../config/refresh-token.config';

export class AuthServiceImpl implements AuthService {
  constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * ========================= AUTHENTICATE =========================
   * 👉 ONLY authenticate against Identity Provider (Keycloak)
   * 👉 NO local DB, NO session, NO token issuing
   */
  async authenticate(
    username: string,
    password: string,
  ): Promise<AuthIdentity> {
    const identityUser = await this.identityProvider.authenticate(
      username,
      password,
    );
    return {
      id: identityUser.externalId,
      username: identityUser.username,
      email: identityUser.email,
      groups: identityUser.groups,
    };
  }

  /**
   * ========================= VERIFY REFRESH TOKEN =========================
   * 👉 Low-level token verification only
   */
  async verifyRefreshToken(refreshToken: string) {
    return this.refreshTokenService.verify(refreshToken);
  }

  /**
   * ========================= ISSUE ACCESS TOKEN =========================
   */
  async issueAccessToken(payload: {
    userId: string;
    username?: string;
    sessionId: string;
    groups?: string[];
  }): Promise<string> {
    return this.accessTokenService.issueAccessToken(payload);
  }

  /**
   * ========================= ISSUE REFRESH TOKEN =========================
   */
  async issueRefreshToken(payload: {
    userId: string;
    sessionId: string;
    rememberMe?: boolean;
  }): Promise<string> {
    return this.refreshTokenService.issue(payload);
  }
}
