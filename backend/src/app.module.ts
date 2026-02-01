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
import { UserAuthModule } from './modules/user-auth/user-auth.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersAdminModule } from './modules/users-admin/users-admin.module';
import { PromoModule } from './modules/promo/promo.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';

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
    AuthModule, AdminModule, AuditModule, NotificationsModule, HealthModule, UserAuthModule, ReviewsModule,
    UsersAdminModule, PromoModule, TelegramModule, WhatsAppModule,
  ],
})
export class AppModule {}
