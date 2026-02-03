// This file contains the AuthModule definition
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// ========================
// Controllers
// ========================
import { AuthController } from './presentation/controllers/auth.controller';

// ========================
// Presenters
// ========================
import { LoginPresenter } from './presentation/presenters/login.presenter';
import { LogoutPresenter } from './presentation/presenters/logout.presenter';

// ========================
// Use Cases
// ========================
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ClearSessionUseCase } from './application/use-cases/clear-session.use-case';

// ========================
// Adapters (Infrastructure)
// ========================
import { KeycloakAdapter } from './infrastructure/keycloak/keycloak.adapter';
import { RedisCacheAdapter } from './infrastructure/redis/redis-cache.adapter';
import { KafkaPublisherAdapter } from './infrastructure/kafka/kafka.publisher.adapter';
import { UserPrismaRepository } from './infrastructure/prisma/user.prisma.repository';
import { SessionPrismaRepository } from './infrastructure/prisma/session.prisma.repository';

// ========================
// Workers
// ========================
import { TokenRevocationWorker } from './infrastructure/workers/token-revocation.worker';

// ========================
// Ports (Symbols)
// ========================
import {
  USER_REPOSITORY,
  SESSION_REPOSITORY,
  KEYCLOAK_PORT,
  KAFKA_PORT,
  CACHE_PORT,
} from './application/ports';

// ========================
// Shared modules
// ========================
import { KafkaModule } from 'src/shared/infrastructure/kafka/kafka.module';
import { RedisModule } from 'src/shared/infrastructure/redis/redis.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

// ========================
// Adapters (Infrastructure)
// ========================
import { TokenVerifierService } from './infrastructure/token/token-verifier.service';

@Module({
  imports: [
    KafkaModule,
    RedisModule,
    PrismaModule,
    ScheduleModule.forRoot(), // Enable schedule for workers
  ],

  controllers: [AuthController],

  providers: [
    // ========================
    // Controllers and Presenters
    // ========================
    LoginPresenter,
    LogoutPresenter,

    // ========================
    // Use Cases (Application layer)
    // ========================
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    ClearSessionUseCase,

    // ========================
    // Adapters (Infrastructure layer)
    // ========================
    KeycloakAdapter,
    RedisCacheAdapter,
    KafkaPublisherAdapter,
    UserPrismaRepository,
    SessionPrismaRepository,
    TokenVerifierService,
    // Workers
    TokenRevocationWorker,

    // ========================
    // DI Container Bindings (Port → Implementation)
    // ========================
    {
      provide: KEYCLOAK_PORT,
      useClass: KeycloakAdapter,
    },
    {
      provide: CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
    {
      provide: KAFKA_PORT,
      useClass: KafkaPublisherAdapter,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: SessionPrismaRepository,
    },
  ],

  exports: [
    // Export for other modules
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    ClearSessionUseCase,
    TokenVerifierService,
    KEYCLOAK_PORT,
    CACHE_PORT,
    KAFKA_PORT,
  ],
})
export class AuthModule {}
