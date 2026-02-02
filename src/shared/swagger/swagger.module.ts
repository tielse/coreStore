import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export class SwaggerConfigModule {
  static setup(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Vehicle Platform API')
      .setDescription('Admin & Third-party API for multi-branch vehicle system')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          	type: 'http',
			scheme: 'bearer',
			bearerFormat: 'JWT',
			name: 'Authorization',
			in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('swagger', app, document);
  }
}
