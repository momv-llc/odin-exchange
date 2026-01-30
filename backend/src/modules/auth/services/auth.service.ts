import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '@/core/database/prisma.service';
import { RedisService } from '@/core/cache/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async login(email: string, password: string) {
    const a = await this.prisma.admin.findUnique({ where: { email } });

    if (!a || !a.isActive) {
      throw new UnauthorizedException('Invalid');
    }

    if (a.lockedUntil && a.lockedUntil > new Date()) {
      throw new UnauthorizedException('Locked');
    }

    const validPassword = await argon2.verify(a.passwordHash, password);
    if (!validPassword) {
      await this.prisma.admin.update({
        where: { id: a.id },
        data: {
          failedAttempts: { increment: 1 },
          ...(a.failedAttempts >= 4 && {
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
          }),
        },
      });
      throw new UnauthorizedException('Invalid');
    }

    await this.prisma.admin.update({
      where: { id: a.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    if (a.is2faEnabled) {
      return {
        requiresTwoFactor: true,
        tempToken: this.jwt.sign(
          { sub: a.id, temp: true },
          { expiresIn: '5m' },
        ),
      };
    }

    return this.tokens(a);
  }

  async verify2FA(id: string, code: string) {
    const a = await this.prisma.admin.findUnique({ where: { id } });

    if (!a?.totpSecret) {
      throw new UnauthorizedException('No 2FA');
    }

    if (!authenticator.verify({ token: code, secret: a.totpSecret })) {
      throw new UnauthorizedException('Invalid');
    }

    return this.tokens(a, true);
  }

  private tokens(a: any, twoFa = false) {
    const payload = {
      sub: a.id,
      email: a.email,
      role: a.role,
      twoFactorVerified: twoFa,
    };

    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(
        { sub: a.id, type: 'refresh' },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      ),
      expiresIn: 900,
    };
  }

  async setup2FA(id: string) {
    const a = await this.prisma.admin.findUnique({ where: { id } });

    if (!a) {
      throw new NotFoundException('Admin not found');
    }

    if (a.is2faEnabled) {
      throw new BadRequestException('Already');
    }

    const secret = authenticator.generateSecret();
    await this.redis.set(`2fa:${id}`, secret, 600);

    return {
      secret,
      qrCode: await QRCode.toDataURL(
        authenticator.keyuri(
          a.email,
          this.config.get('TOTP_ISSUER', 'ODIN'),
          secret,
        ),
      ),
    };
  }

  async confirm2FA(id: string, code: string) {
    const secret = await this.redis.get<string>(`2fa:${id}`);

    if (!secret) {
      throw new BadRequestException('Expired');
    }

    if (!authenticator.verify({ token: code, secret })) {
      throw new BadRequestException('Invalid');
    }

    await this.prisma.admin.update({
      where: { id },
      data: {
        totpSecret: secret,
        is2faEnabled: true,
      },
    });

    await this.redis.del(`2fa:${id}`);

    return { message: 'Enabled' };
  }

  async getProfile(id: string) {
    return this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        is2faEnabled: true,
        lastLoginAt: true,
      },
    });
  }
}
