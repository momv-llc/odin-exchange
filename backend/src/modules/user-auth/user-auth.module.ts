import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserAuthService } from './services/user-auth.service';
import { UserAuthController } from './presentation/controllers/user-auth.controller';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { UserJwtAuthGuard } from './guards/user-jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'user-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '15m') },
      }),
    }),
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, UserJwtStrategy, UserJwtAuthGuard],
  exports: [UserAuthService, UserJwtAuthGuard],
})
export class UserAuthModule {}
