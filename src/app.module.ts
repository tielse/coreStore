// app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Shared
import { AuthContextMiddleware } from './shared/middleware/auth-context.middleware';
import { ResponseModule } from './shared/response/response.module';

// Infrastructure
import { KafkaService } from './shared/infrastructure/kafka/kafka.service';
import { RedisService } from './shared/infrastructure/redis/redis.service';

// Core modules
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';

// GraphQL demo resolvers
// import { CarResolver } from '../graphql/car.resolver';
// import { BikeResolver } from '../graphql/bike.resolver';
// import { MotoResolver } from '../graphql/moto.resolver';
import { GraphqlModule } from './modules/auth/presentation/graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
    PrismaModule,
    ResponseModule,

    AuthModule,
    UserModule,
    GraphqlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // ===== Shared Infrastructure =====
    KafkaService,
    RedisService,

    // ===== GraphQL demo =====
    // CarResolver,
    // BikeResolver,
    // MotoResolver,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthContextMiddleware).forRoutes('*');
  }
}
