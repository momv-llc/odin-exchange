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
