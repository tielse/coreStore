import { AuthService } from './auth.service.interface';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  LogoutRequestDto,
} from '../dto/index.dto';

import { IdentityProvider } from '../../config/identity-provider.config';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { AuthSessionRepository } from '../../domain/repositories/auth-session.repository';
import { AccessTokenService } from '../../config/access-token.service.config';
import { RefreshTokenService } from '../../config/refresh-token.config';
import { AuthSession } from '../../domain/entities/auth-session.entity';

export class AuthServiceImpl implements AuthService {
  constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly userRepo: AuthUserRepository,
    private readonly sessionRepo: AuthSessionRepository,
    private readonly tokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  // ========================= LOGIN =========================
  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // 1. Authenticate with Keycloak
    const identity = await this.identityProvider.authenticate(
      dto.username,
      dto.password,
    );

    // 2. Upsert local user
    const user = await this.userRepo.upsertFromIdentity(identity);

    // 3. Load groups (sys_group.id)
    const userWithGroups = await this.userRepo.findWithGroups(user.id);
    if (!userWithGroups) {
      throw new Error('USER_NOT_FOUND');
    }

    // 4. Create session
    const expiresAt = this.tokenService.getAccessTokenExpiry();
    const session = new AuthSession(crypto.randomUUID(), user.id, expiresAt);

    await this.sessionRepo.save(session);

    // 5. Issue tokens
    const accessToken = await this.tokenService.issueAccessToken({
      userId: user.id,
      username: user.username,
      sessionId: session.sessionId,
      // 👉 group KHÔNG trả ra DTO, chỉ dùng cho token
      groups: userWithGroups.groups,
    });

    const refreshToken = await this.refreshTokenService.issue({
      userId: user.id,
      sessionId: session.sessionId,
    });

    // 6. expiresIn (seconds)
    const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',

      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        status: user.status,
        groups: userWithGroups.groups, // map group.id
      },

      session: {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt.toISOString(),
      },
    };
  }

  // ========================= REFRESH TOKEN =========================
  async refreshToken(
    dto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    // 1. Validate refresh token
    const payload = await this.refreshTokenService.verify(dto.refreshToken);

    // 2. Check session
    const session = await this.sessionRepo.findById(payload.sessionId);
    if (!session || session.isExpired()) {
      throw new Error('SESSION_EXPIRED');
    }

    // 3. Rotate refresh token
    const newRefreshToken = await this.refreshTokenService.rotate(
      dto.refreshToken,
    );

    // 4. Issue new access token
    const accessToken = await this.tokenService.issueAccessToken({
      userId: payload.userId,
      sessionId: payload.sessionId,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
      tokenType: 'Bearer',
      session: {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt.toISOString(),
      },
    };
  }

  // ========================= LOGOUT =========================
  async logout(dto: LogoutRequestDto, userId: string): Promise<void> {
    if (dto.logoutAll) {
      // revoke all sessions
      await this.sessionRepo.revokeAll(userId);
      await this.refreshTokenService.revokeAll(userId);
      return;
    }

    if (!dto.sessionId) {
      throw new Error('SESSION_ID_REQUIRED');
    }

    // revoke single session
    await this.sessionRepo.revoke(dto.sessionId);
    await this.refreshTokenService.revoke(dto.sessionId);
  }
}
