import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import {
  ResponseInterceptor,
  GlobalExceptionFilter,
  ResponseBuilder,
} from './shared/response';

function parseCorsOrigins(): string[] {
  if (!process.env.CORS_ORIGIN) return [];
  return process.env.CORS_ORIGIN.split(',').map((o) => o.trim());
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // ✅ Security
  app.use(helmet());

  // ✅ Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ CORS
  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // ✅ Global prefix
  app.setGlobalPrefix('api');

  // ✅ Swagger with OAuth2 Keycloak
  const config = new DocumentBuilder()
    .setTitle('Store Platform API')
    .setDescription('The Platform API - Car/Bike/Moto Sales System')
    .setVersion('1.0')
    .setContact('LCTNOV', 'https://github.com/lctnov', 'chauthoi1211@gmail.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Keycloak JWT Token',
      },
      'JWT',
    )
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          implicit: {
            authorizationUrl: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth`,
            scopes: {
              'openid profile email': 'OpenID Connect Profile',
              'roles:view': 'View roles',
              'roles:manage': 'Manage roles',
            },
          },
        },
      },
      'OAuth2',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.SWAGGER_PATH || 'api/docs', app, document);

  // ✅ Global Response Interceptor & Exception Filter (SOLID: Single Responsibility)
  const responseBuilder = new ResponseBuilder();
  app.useGlobalInterceptors(new ResponseInterceptor(responseBuilder));
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ✅ Graceful shutdown (Kafka / Prisma / Redis)
  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 6666;
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/api`);
}

void bootstrap();
