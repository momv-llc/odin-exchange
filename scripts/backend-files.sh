#!/bin/bash
cd "$(dirname "$0")/.."

echo "Creating backend files..."

#=== package.json ===
cat > backend/package.json << 'EOF'
{
  "name": "odin-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@nestjs/bull": "^10.0.1",
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.3.0",
    "@nestjs/event-emitter": "^2.0.3",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/swagger": "^7.2.0",
    "@nestjs/terminus": "^10.2.0",
    "@nestjs/throttler": "^5.1.1",
    "@prisma/client": "^5.8.0",
    "argon2": "^0.31.2",
    "bull": "^4.12.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "joi": "^17.12.0",
    "otplib": "^12.0.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "qrcode": "^1.5.3",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.11.0",
    "@types/passport-jwt": "^4.0.0",
    "@types/qrcode": "^1.5.5",
    "@types/uuid": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "prettier": "^3.2.4",
    "prisma": "^5.8.0",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.3"
  }
}
EOF

#=== tsconfig.json ===
cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "paths": { "@/*": ["src/*"] }
  }
}
EOF

#=== nest-cli.json ===
cat > backend/nest-cli.json << 'EOF'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
EOF

#=== .env.example ===
cat > backend/.env.example << 'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/odin_exchange?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=super-secret-refresh-key-change-in-production-min-32
JWT_REFRESH_EXPIRES_IN=7d
TOTP_ISSUER=ODIN Exchange
CODE_HMAC_SECRET=hmac-secret-for-order-codes-minimum-32-characters
THROTTLE_TTL=60
THROTTLE_LIMIT=60
CORS_ORIGINS=http://localhost:3001
EOF

cp backend/.env.example backend/.env

#=== main.ts ===
cat > backend/src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/common/filters/http-exception.filter';
import { TransformInterceptor } from './core/common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({ origin: config.get('CORS_ORIGINS', '*').split(','), credentials: true });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder().setTitle('ODIN Exchange API').setVersion('1.0').addBearerAuth().build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  const port = config.get('PORT', 3000);
  await app.listen(port);
  logger.log(`🚀 API: http://localhost:${port}`);
  logger.log(`📚 Docs: http://localhost:${port}/docs`);
}
bootstrap();
EOF

#=== app.module.ts ===
cat > backend/src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './core/database/prisma.module';
import { RedisModule } from './core/cache/redis.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ([{ ttl: c.get('THROTTLE_TTL', 60) * 1000, limit: c.get('THROTTLE_LIMIT', 60) }]),
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ redis: { host: c.get('REDIS_HOST'), port: c.get('REDIS_PORT') } }),
    }),
    PrismaModule, RedisModule, OrdersModule, CurrenciesModule, ExchangeRatesModule,
    AuthModule, AdminModule, AuditModule, NotificationsModule, HealthModule,
  ],
})
export class AppModule {}
EOF

echo "Backend config files created!"