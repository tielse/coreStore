/**
 * Logout UseCase (Application layer)
 * Trách nhiệm: logout user
 * - Revoke token via Keycloak
 * - Delete session from Redis
 * - Mark session as revoked in Prisma
 * - Publish logout event to Kafka
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import type {
  ISessionRepository,
  IKeycloakPort,
  IKafkaPort,
  ICachePort,
} from '../ports';
import {
  SESSION_REPOSITORY,
  KEYCLOAK_PORT,
  KAFKA_PORT,
  CACHE_PORT,
} from '../ports';
import { LogoutRequestDTO } from '../dtos/logout.request.dto';

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    @Inject(SESSION_REPOSITORY)
    private sessionRepository: ISessionRepository,

    @Inject(KEYCLOAK_PORT)
    private keycloakPort: IKeycloakPort,

    @Inject(KAFKA_PORT)
    private kafkaPort: IKafkaPort,

    @Inject(CACHE_PORT)
    private cachePort: ICachePort,
  ) {}

  /**
   * Execute logout flow
   */
  async execute(request: LogoutRequestDTO): Promise<void> {
    try {
      // Step 1: Get session from cache or DB
      this.logger.log(`Step 1: Fetching session ${request.sessionId}`);
      let sessionData = await this.cachePort.get(
        `session:${request.sessionId}`,
      );

      if (!sessionData) {
        sessionData = await this.sessionRepository.getSession(
          request.sessionId,
        );
      }

      if (!sessionData) {
        throw new NotFoundException('Session not found');
      }

      // Step 2: Revoke token with Keycloak
      this.logger.log('Step 2: Revoking token with Keycloak');
      if (request.refreshToken) {
        await this.keycloakPort.revokeToken(request.refreshToken, 'refresh');
      }
      if (request.accessToken) {
        await this.keycloakPort.revokeToken(request.accessToken, 'access');
      }

      // Step 3: Mark session as revoked in Prisma
      this.logger.log('Step 3: Marking session as revoked');
      await this.sessionRepository.revokeSession(request.sessionId);

      // Step 4: Delete session from Redis
      this.logger.log('Step 4: Deleting session from cache');
      await this.cachePort.delete(`session:${request.sessionId}`);

      // Step 5: Publish logout event
      this.logger.log('Step 5: Publishing logout event');
      await this.kafkaPort.publishLogoutEvent({
        userId: sessionData.userId,
        sessionId: request.sessionId,
        timestamp: new Date(),
      });

      this.logger.log(`Logout successful for session ${request.sessionId}`);
    } catch (error) {
      this.logger.error(`Logout failed: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Logout failed. Please try again.',
      );
    }
  }
}
