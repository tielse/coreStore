/**
 * Login UseCase (Application layer)
 * Trách nhiệm: orchestrate login flow
 * - Verify token via Keycloak
 * - Sync/create/update user in local DB
 * - Create session and store in Redis
 * - Publish login event to Kafka
 *
 * SOLID principles:
 * - Single Responsibility: only handles login logic
 * - Open/Closed: extensible via dependency injection
 * - Liskov Substitution: depends on abstractions (ports)
 * - Interface Segregation: minimal interface IXxxPort
 * - Dependency Inversion: depends on abstractions, not implementations
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

import type {
  IUserRepository,
  ISessionRepository,
  IKeycloakPort,
  IKafkaPort,
  ICachePort,
} from '../ports';
import {
  USER_REPOSITORY,
  SESSION_REPOSITORY,
  KEYCLOAK_PORT,
  KAFKA_PORT,
  CACHE_PORT,
} from '../ports';

import { LoginRequestDTO } from '../dtos/login.request.dto';
import { LoginResponseDTO } from '../dtos/login.response.dto';
import { now } from 'src/shared/utils/time.util';
@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);
  private readonly SESSION_TTL_SECONDS = 3600; // 60 minutes

  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,

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
   * Execute login flow
   * @param request - Contains Keycloak access token
   * @returns LoginResponseDTO with session and user info
   */
  async execute(request: LoginRequestDTO): Promise<LoginResponseDTO> {
    try {
      // Step 1: Verify token from Keycloak
      this.logger.log('Step 1: Verifying token with Keycloak');
      const keycloakPayload = await this.keycloakPort.verifyToken(
        request.token,
      );

      if (!keycloakPayload.sub || !keycloakPayload.email) {
        throw new BadRequestException(
          'Invalid token: missing sub or email claim',
        );
      }

      // Step 2: Check local DB for existing user
      this.logger.log(
        `Step 2: Checking local DB for user ${keycloakPayload.sub}`,
      );
      let user = await this.userRepository.findByKeycloakId(
        keycloakPayload.sub,
      );

      // Step 3a: Create user if first-time login
      if (!user) {
        this.logger.log(
          `First-time login: creating local user for ${keycloakPayload.email}`,
        );
        user = await this.userRepository.create({
          id: uuidv4(),
          keycloak_user_id: keycloakPayload.sub,
          username: keycloakPayload.preferred_username || keycloakPayload.email,
          email: keycloakPayload.email,
          full_name: keycloakPayload.name,
          status: 'ACTIVE',
          created_by: 'keycloak-sync',
        });

        // Publish user.created event
        await this.kafkaPort.publishUserCreatedEvent({
          userId: user.id,
          email: user.email,
          keycloakId: user.keycloak_user_id,
          username: user.username,
          timestamp: now(),
        });
      } else {
        // Step 3b: Update user if profile changed
        const changes = this.detectProfileChanges(user, keycloakPayload);
        if (Object.keys(changes).length > 0) {
          this.logger.log(
            `Updating user profile: ${user.id} with changes: ${JSON.stringify(changes)}`,
          );
          user = await this.userRepository.update(user.id, {
            ...changes,
            modified_by: 'keycloak-sync',
          });

          // Publish user.updated event
          await this.kafkaPort.publishUserUpdatedEvent({
            userId: user.id,
            changes,
            timestamp: now(),
          });
        }
      }

      // Step 4: Create session
      this.logger.log(`Step 4: Creating session for user ${user.id}`);
      const sessionId = uuidv4();
      const expiresAt = new Date(
        now().getTime() + this.SESSION_TTL_SECONDS * 1000,
      );

      const sessionData = {
        id: uuidv4(),
        userId: user.id,
        sessionId,
        refreshTokenHash: this.hashToken(request.token),
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        expiresAt,
      };

      // Step 5: Store session in both Prisma (audit) and Redis (cache)
      this.logger.log('Step 5: Storing session');
      await Promise.all([
        this.sessionRepository.createSession(sessionData),
        this.cachePort.set(
          `session:${sessionId}`,
          {
            sessionId,
            userId: user.id,
            email: user.email,
            expiresAt: expiresAt.toISOString(),
          },
          this.SESSION_TTL_SECONDS,
        ),
      ]);

      // Also store a user -> sessions index for quick lookup
      await this.cachePort.set(
        `user_sessions:${user.id}`,
        [sessionId],
        this.SESSION_TTL_SECONDS,
      );

      // Step 6: Publish login event to Kafka
      this.logger.log('Step 6: Publishing login event');
      await this.kafkaPort.publishLoginEvent({
        userId: user.id,
        email: user.email,
        keycloakId: user.keycloak_user_id,
        sessionId,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        timestamp: new Date(),
      });

      // Step 7: Clear old sessions from cache (optional optimization)
      await this.cachePort.deletePattern(`user_sessions:${user.id}:*`);

      // Step 8: Return response
      return new LoginResponseDTO({
        sessionId,
        userId: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        expiresAt,
        accessToken: request.token, // Return token as-is or issue new one
      });
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Login failed. Please try again.');
    }
  }

  /**
   * Helper: Detect changes in user profile from Keycloak payload
   */
  private detectProfileChanges(
    localUser: any,
    keycloakPayload: any,
  ): Record<string, any> {
    const changes: Record<string, any> = {};

    if (localUser.email !== keycloakPayload.email) {
      changes.email = keycloakPayload.email;
    }

    if (localUser.full_name !== keycloakPayload.name && keycloakPayload.name) {
      changes.full_name = keycloakPayload.name;
    }

    if (
      localUser.username !== keycloakPayload.preferred_username &&
      keycloakPayload.preferred_username
    ) {
      changes.username = keycloakPayload.preferred_username;
    }

    return changes;
  }

  /**
   * Helper: Hash token for secure storage
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
