import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AppValidationPipe } from './shared/pipe/validation.pipe';
import { HttpExceptionFilter } from './shared/exception/http-exception.filter';
import { HttpResponseInterceptor } from './shared/response/http-response.interceptor';

function parseCorsOrigins(): string[] {
  if (!process.env.CORS_ORIGIN) return [];
  return process.env.CORS_ORIGIN.split(',').map((o) => o.trim());
}

async function bootstrap() {
  console.log('BOOTSTRAP START');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 1️⃣ Security
  app.use(helmet());

  // 2️⃣ Validation
  app.useGlobalPipes(new AppValidationPipe());

  // 3️⃣ Filters & Interceptors
  app.useGlobalFilters(app.get(HttpExceptionFilter));
  app.useGlobalInterceptors(app.get(HttpResponseInterceptor));

  // 4️⃣ CORS
  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
  });

  // 5️⃣ Global prefix
  app.setGlobalPrefix('api');

  // 6️⃣ Swagger (⚠️ KHÔNG TRÙNG PREFIX)
  const config = new DocumentBuilder()
    .setTitle('Store Platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // 7️⃣ Shutdown
  app.enableShutdownHooks();

  await app.listen(1211);
}

void bootstrap();
