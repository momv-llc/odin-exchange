import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { HttpExceptionFilter } from './core/common/filters/http-exception.filter';
import { TransformInterceptor } from './core/common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());

  // === CORS (production-deterministic) ===
  const frontendUrl = config.get<string>('FRONTEND_URL');
  if (!frontendUrl) {
    throw new Error('FRONTEND_URL is not defined');
  }

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // === API versioning & prefix ===
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // === Global pipes / filters / interceptors ===
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // === Swagger (production only) ===
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ODIN Exchange API')
    .setDescription('API documentation for Odin Exchange')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('https://api.odineco.online', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // === Start server ===
  const port = config.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`🚀 API started on port ${port}`);
  logger.log(`📚 Swagger available at /docs`);
}

bootstrap();

