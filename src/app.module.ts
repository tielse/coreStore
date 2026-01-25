import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthContextMiddleware } from './infrastructure/middleware/auth-context.middleware';
import { PrismaModule } from './infrastructure/prisma.module';

import { AuthController } from './interfaces/rest/auth.controller';
import { AdminController } from './interfaces/rest/admin.controller';

import { KafkaService } from './infrastructure/kafka/kafka.service';
import { RedisService } from './infrastructure/redis/redis.service';

import {
  AuthEventService,
  SessionService,
  EventPublisherService,
} from './application/auth/auth-event.service';

import { TokenVerifierService } from './infrastructure/auth/token-verifier.service';
import { KeycloakAuthGuard } from './infrastructure/auth/keycloak.guard';
import { RolesGuard } from './infrastructure/auth/roles.guard';

// GraphQL modules (đề xuất tách module riêng sau)
import { CarResolver } from '../graphql/car.resolver';
import { BikeResolver } from '../graphql/bike.resolver';
import { MotoResolver } from '../graphql/moto.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PrismaModule,
  ],
  controllers: [AppController, AuthController, AdminController],
  providers: [
    AppService,

    // Infrastructure
    KafkaService,
    RedisService,

    // Auth / Event
    TokenVerifierService,
    SessionService,
    EventPublisherService,
    AuthEventService,

    // Guards
    KeycloakAuthGuard,
    RolesGuard,

    // GraphQL (nên tách module sau)
    CarResolver,
    BikeResolver,
    MotoResolver,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthContextMiddleware).forRoutes('*');
  }
}
