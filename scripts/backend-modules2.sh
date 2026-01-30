#!/bin/bash
cd "$(dirname "$0")/.."

echo "Creating remaining backend modules..."

#=== Currencies ===
cat > backend/src/modules/currencies/currencies.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { CurrencyService } from './application/services/currency.service';
import { CurrencyController } from './presentation/controllers/currency.controller';

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrenciesModule {}
EOF

cat > backend/src/modules/currencies/application/services/currency.service.ts << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}
  async findAll(active = true) { return this.prisma.currency.findMany({ where: active ? { isActive: true } : {}, orderBy: { code: 'asc' } }); }
  async findByCode(code: string) { const c = await this.prisma.currency.findUnique({ where: { code } }); if (!c) throw new NotFoundException(); return c; }
}
EOF

cat > backend/src/modules/currencies/presentation/controllers/currency.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/core/common/decorators/public.decorator';
import { CurrencyService } from '../../application/services/currency.service';

@ApiTags('currencies')
@Controller({ path: 'currencies', version: '1' })
export class CurrencyController {
  constructor(private svc: CurrencyService) {}
  @Get() @Public() findAll() { return this.svc.findAll(); }
}
EOF

#=== Exchange Rates ===
cat > backend/src/modules/exchange-rates/exchange-rates.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { RateService } from './application/services/rate.service';
import { RateController } from './presentation/controllers/rate.controller';

@Module({ controllers: [RateController], providers: [RateService], exports: [RateService] })
export class ExchangeRatesModule {}
EOF

cat > backend/src/modules/exchange-rates/application/services/rate.service.ts << 'EOF'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/core/database/prisma.service';
import { RedisService } from '@/core/cache/redis.service';

@Injectable()
export class RateService implements OnModuleInit {
  private readonly logger = new Logger(RateService.name);
  private readonly KEY = 'rates';
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async onModuleInit() { await this.fetchRates(); }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async fetchRates() {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT"]');
      if (!res.ok) throw new Error(`${res.status}`);
      const tickers: { symbol: string; price: string }[] = await res.json();
      for (const t of tickers) {
        const rate = parseFloat(t.price), spread = 0.5, eff = rate * (1 - spread / 100);
        await this.redis.hset(this.KEY, t.symbol, { rate, effectiveRate: eff, spreadPercent: spread, fetchedAt: new Date().toISOString() });
        await this.updateDb(t.symbol, rate, spread);
      }
      await this.redis.expire(this.KEY, 120);
      this.logger.debug(`Fetched ${tickers.length} rates`);
    } catch (e) { this.logger.error('Fetch failed', e); }
  }

  private async updateDb(sym: string, rate: number, spread: number) {
    const code = sym.replace('USDT', '');
    const [from, to] = await Promise.all([this.prisma.currency.findFirst({ where: { code } }), this.prisma.currency.findFirst({ where: { code: 'USD' } })]);
    if (!from || !to) return;
    await this.prisma.exchangeRate.upsert({
      where: { fromCurrencyId_toCurrencyId: { fromCurrencyId: from.id, toCurrencyId: to.id } },
      update: { rate, spreadPercent: spread, effectiveRate: rate * (1 - spread / 100), fetchedAt: new Date() },
      create: { fromCurrencyId: from.id, toCurrencyId: to.id, rate, spreadPercent: spread, effectiveRate: rate * (1 - spread / 100), source: 'binance', fetchedAt: new Date() },
    });
  }

  async getRate(from: string, to: string) {
    const c = await this.redis.hget<any>(this.KEY, `${from}USDT`);
    if (c) return c;
    const [f, t] = await Promise.all([this.prisma.currency.findFirst({ where: { code: from } }), this.prisma.currency.findFirst({ where: { code: to } })]);
    if (!f || !t) return null;
    const r = await this.prisma.exchangeRate.findUnique({ where: { fromCurrencyId_toCurrencyId: { fromCurrencyId: f.id, toCurrencyId: t.id } } });
    return r ? { rate: Number(r.rate), effectiveRate: Number(r.effectiveRate), spreadPercent: Number(r.spreadPercent), fetchedAt: r.fetchedAt.toISOString() } : null;
  }

  async getAllRates() {
    const c = await this.redis.hgetall<any>(this.KEY);
    if (Object.keys(c).length) return Object.entries(c).map(([s, d]) => ({ symbol: s, ...d }));
    const rates = await this.prisma.exchangeRate.findMany({ include: { fromCurrency: true, toCurrency: true } });
    return rates.map(r => ({ symbol: `${r.fromCurrency.code}${r.toCurrency.code}`, rate: Number(r.rate), effectiveRate: Number(r.effectiveRate), spreadPercent: Number(r.spreadPercent), fetchedAt: r.fetchedAt.toISOString() }));
  }
}
EOF

cat > backend/src/modules/exchange-rates/presentation/controllers/rate.controller.ts << 'EOF'
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/core/common/decorators/public.decorator';
import { RateService } from '../../application/services/rate.service';

@ApiTags('rates')
@Controller({ path: 'rates', version: '1' })
export class RateController {
  constructor(private svc: RateService) {}
  @Get() @Public() getAll() { return this.svc.getAllRates(); }
  @Get('pair') @Public() getPair(@Query('from') from: string, @Query('to') to: string) {
    return this.svc.getRate(from?.toUpperCase(), to?.toUpperCase()).then(r => r ? { from, to, ...r } : { error: 'Not available' });
  }
}
EOF

#=== Auth ===
cat > backend/src/modules/auth/auth.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.get('JWT_SECRET'), signOptions: { expiresIn: c.get('JWT_EXPIRES_IN', '15m') } }) }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
EOF

cat > backend/src/modules/auth/services/auth.service.ts << 'EOF'
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '@/core/database/prisma.service';
import { RedisService } from '@/core/cache/redis.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService, private redis: RedisService) {}

  async login(email: string, password: string) {
    const a = await this.prisma.admin.findUnique({ where: { email } });
    if (!a || !a.isActive) throw new UnauthorizedException('Invalid');
    if (a.lockedUntil && a.lockedUntil > new Date()) throw new UnauthorizedException('Locked');
    if (!(await argon2.verify(a.passwordHash, password))) {
      await this.prisma.admin.update({ where: { id: a.id }, data: { failedAttempts: { increment: 1 }, ...(a.failedAttempts >= 4 && { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) }) } });
      throw new UnauthorizedException('Invalid');
    }
    await this.prisma.admin.update({ where: { id: a.id }, data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } });
    if (a.is2faEnabled) return { requiresTwoFactor: true, tempToken: this.jwt.sign({ sub: a.id, temp: true }, { expiresIn: '5m' }) };
    return this.tokens(a);
  }

  async verify2FA(id: string, code: string) {
    const a = await this.prisma.admin.findUnique({ where: { id } });
    if (!a?.totpSecret) throw new UnauthorizedException('No 2FA');
    if (!authenticator.verify({ token: code, secret: a.totpSecret })) throw new UnauthorizedException('Invalid');
    return this.tokens(a, true);
  }

  private tokens(a: any, twoFa = false) {
    const p = { sub: a.id, email: a.email, role: a.role, twoFactorVerified: twoFa };
    return { accessToken: this.jwt.sign(p), refreshToken: this.jwt.sign({ sub: a.id, type: 'refresh' }, { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d') }), expiresIn: 900 };
  }

  async setup2FA(id: string) {
    const a = await this.prisma.admin.findUnique({ where: { id } });
    if (a.is2faEnabled) throw new BadRequestException('Already');
    const secret = authenticator.generateSecret();
    await this.redis.set(`2fa:${id}`, secret, 600);
    return { secret, qrCode: await QRCode.toDataURL(authenticator.keyuri(a.email, this.config.get('TOTP_ISSUER', 'ODIN'), secret)) };
  }

  async confirm2FA(id: string, code: string) {
    const secret = await this.redis.get<string>(`2fa:${id}`);
    if (!secret) throw new BadRequestException('Expired');
    if (!authenticator.verify({ token: code, secret })) throw new BadRequestException('Invalid');
    await this.prisma.admin.update({ where: { id }, data: { totpSecret: secret, is2faEnabled: true } });
    await this.redis.del(`2fa:${id}`);
    return { message: 'Enabled' };
  }

  async getProfile(id: string) { return this.prisma.admin.findUnique({ where: { id }, select: { id: true, email: true, role: true, is2faEnabled: true, lastLoginAt: true } }); }
}
EOF

cat > backend/src/modules/auth/strategies/jwt.strategy.ts << 'EOF'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(c: ConfigService, private prisma: PrismaService) { super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: c.get('JWT_SECRET') }); }
  async validate(p: any) {
    if (p.temp) return { id: p.sub, temp: true };
    const a = await this.prisma.admin.findUnique({ where: { id: p.sub }, select: { id: true, email: true, role: true, isActive: true, is2faEnabled: true } });
    if (!a?.isActive) throw new UnauthorizedException();
    return { ...a, twoFactorVerified: p.twoFactorVerified || false };
  }
}
EOF

cat > backend/src/modules/auth/guards/jwt-auth.guard.ts << 'EOF'
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/core/common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private r: Reflector) { super(); }
  canActivate(ctx: ExecutionContext) { if (this.r.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()])) return true; return super.canActivate(ctx); }
  handleRequest(e: any, u: any) { if (e || !u) throw e || new UnauthorizedException(); return u; }
}
EOF

cat > backend/src/modules/auth/guards/roles.guard.ts << 'EOF'
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/core/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private r: Reflector) {}
  canActivate(ctx: ExecutionContext) { const roles = this.r.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]); if (!roles) return true; return roles.includes(ctx.switchToHttp().getRequest().user?.role); }
}
EOF

cat > backend/src/modules/auth/presentation/controllers/auth.controller.ts << 'EOF'
import { Controller, Post, Get, Body, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../../services/auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '@/core/common/decorators/public.decorator';

@ApiTags('auth')
@Controller({ path: 'admin/auth', version: '1' })
export class AuthController {
  constructor(private svc: AuthService) {}
  @Post('login') @Public() @Throttle({ default: { limit: 5, ttl: 300000 } }) @HttpCode(HttpStatus.OK)
  login(@Body() b: { email: string; password: string }) { return this.svc.login(b.email, b.password); }
  @Post('2fa/verify') @UseGuards(JwtAuthGuard) @ApiBearerAuth() @HttpCode(HttpStatus.OK)
  verify(@Body() b: { code: string }, @Request() r: any) { return this.svc.verify2FA(r.user.id, b.code); }
  @Post('2fa/setup') @UseGuards(JwtAuthGuard) @ApiBearerAuth() setup(@Request() r: any) { return this.svc.setup2FA(r.user.id); }
  @Post('2fa/confirm') @UseGuards(JwtAuthGuard) @ApiBearerAuth() confirm(@Body() b: { code: string }, @Request() r: any) { return this.svc.confirm2FA(r.user.id, b.code); }
  @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth() me(@Request() r: any) { return this.svc.getProfile(r.user.id); }
}
EOF

echo "Auth module created!"