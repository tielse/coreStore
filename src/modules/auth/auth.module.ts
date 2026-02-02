import { Module } from '@nestjs/common';
import { AuthController } from './interfaces/controllers/auth.controller';

// ========================
// Use cases
// ========================
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';

// ========================
// Application services
// ========================
import { AuthEventServiceImpl } from './application/services/auth-event.service.impl';
import { AUTH_EVENT_SERVICE } from './application/events/auth-event.token';

// ========================
// Infrastructure
// ========================
import { RedisSessionService } from './infrastructure/redis/session.redis.repository';
import { TokenVerifierService } from './infrastructure/token/token-verifier.service';

// ========================
// Ports
// ========================
import { SESSION_REPOSITORY } from './application/ports/auth-session.repository';

// ========================
// Shared modules
// ========================
import { KafkaModule } from 'src/shared/infrastructure/kafka/kafka.module';
import { RedisModule } from 'src/shared/infrastructure/redis/redis.module';

// ========================
// Guards
// ========================
import { AuthGuard } from './interfaces/guards/auth-guard.service';

@Module({
  imports: [
    KafkaModule,
    RedisModule, // 🔥 BẮT BUỘC – để inject RedisService
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    // ========================
    // Use cases
    // ========================
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,

    // ========================
    // Application services
    // ========================
    {
      provide: AUTH_EVENT_SERVICE,
      useClass: AuthEventServiceImpl,
    },

    // ========================
    // Infrastructure
    // ========================
    TokenVerifierService,

    {
      provide: SESSION_REPOSITORY,
      useClass: RedisSessionService,
    },

    RedisSessionService,

    // ========================
    // Guards
    // ========================
    AuthGuard,
  ],

  exports: [
    // ========================
    // Cho module khác dùng
    // ========================
    AUTH_EVENT_SERVICE,
    TokenVerifierService,
    AuthGuard,
  ],
})
export class AuthModule {}
