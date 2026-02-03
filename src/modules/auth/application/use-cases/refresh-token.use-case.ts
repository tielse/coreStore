/**
 * Refresh Token UseCase (Application layer)
 * Trách nhiệm: refresh access token
 * - Verify refresh token
 * - Generate new access token (hoặc forward từ Keycloak)
 * - Update session TTL in Redis
 * - Publish token:refreshed event
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import type { ISessionRepository, IKeycloakPort, ICachePort } from '../ports';
import { SESSION_REPOSITORY, KEYCLOAK_PORT, CACHE_PORT } from '../ports';
import { RefreshTokenRequestDTO } from '../dtos/refresh-token.request.dto';
import { RefreshTokenResponseDTO } from '../dtos/refresh-token.response.dto';
import { now } from 'src/shared/utils/time.util';
@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);
  private readonly SESSION_TTL_SECONDS = 3600; // 60 minutes

  constructor(
    @Inject(SESSION_REPOSITORY)
    private sessionRepository: ISessionRepository,

    @Inject(KEYCLOAK_PORT)
    private keycloakPort: IKeycloakPort,

    @Inject(CACHE_PORT)
    private cachePort: ICachePort,
  ) {}

  /**
   * Execute refresh token flow
   */
  async execute(
    request: RefreshTokenRequestDTO,
  ): Promise<RefreshTokenResponseDTO> {
    try {
      // Step 1: Get session from cache
      this.logger.log(`Step 1: Fetching session ${request.sessionId}`);
      const sessionData = await this.cachePort.get(
        `session:${request.sessionId}`,
      );

      if (!sessionData) {
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Step 2: Verify that session hasn't expired
      const expiresAt = new Date(sessionData.expiresAt);
      if (expiresAt < now()) {
        await this.cachePort.delete(`session:${request.sessionId}`);
        throw new UnauthorizedException('Session expired');
      }

      // Step 3: Validate refresh token with Keycloak (optional but recommended)
      if (request.refreshToken) {
        this.logger.log('Step 3: Verifying refresh token with Keycloak');
        try {
          await this.keycloakPort.verifyToken(request.refreshToken);
        } catch (error) {
          throw new UnauthorizedException('Invalid refresh token');
        }
      }

      // Step 4: Extend session TTL in Redis
      this.logger.log('Step 4: Extending session TTL');
      const newExpiresAt = new Date(
        now().getTime() + this.SESSION_TTL_SECONDS * 1000,
      );
      await this.cachePort.set(
        `session:${request.sessionId}`,
        {
          ...sessionData,
          expiresAt: newExpiresAt.toISOString(),
        },
        this.SESSION_TTL_SECONDS,
      );

      // Step 5: Return new token
      return new RefreshTokenResponseDTO({
        sessionId: request.sessionId,
        accessToken: request.refreshToken || request.accessToken, // or issue new from Keycloak
        expiresAt: newExpiresAt,
      });
    } catch (error) {
      this.logger.error(`Refresh token failed: ${error.message}`);

      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new UnauthorizedException('Token refresh failed');
    }
  }
}
