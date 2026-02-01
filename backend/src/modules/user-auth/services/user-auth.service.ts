import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '@/core/database/prisma.service';
import { RedisService } from '@/core/cache/redis.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from '../dto';

@Injectable()
export class UserAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
    private events: EventEmitter2,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        verifyToken,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    this.events.emit('user.registered', {
      userId: user.id,
      email: user.email,
      verifyToken,
    });

    return {
      message: 'Registration successful. Please verify your email.',
      user,
    };
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'BANNED') {
      throw new UnauthorizedException('Account is banned');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Account is inactive');
    }

    const validPassword = await argon2.verify(user.passwordHash, dto.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);

    const tokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress: ip,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExp },
      });

      this.events.emit('user.password-reset-requested', {
        userId: user.id,
        email: user.email,
        resetToken,
      });
    }

    return { message: 'If email exists, reset instructions will be sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(dto.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    await this.prisma.userSession.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Password reset successfully' };
  }

  async refreshTokens(refreshToken: string, ip: string, userAgent: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const session = await this.prisma.userSession.findFirst({
        where: {
          userId: payload.sub,
          tokenHash,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!session) {
        throw new UnauthorizedException('Session expired');
      }

      await this.prisma.userSession.delete({ where: { id: session.id } });

      const tokens = await this.generateTokens(session.user);

      const newTokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
      await this.prisma.userSession.create({
        data: {
          userId: session.user.id,
          tokenHash: newTokenHash,
          ipAddress: ip,
          userAgent,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.userSession.deleteMany({
      where: { userId, tokenHash },
    });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });
    return { message: 'Logged out from all devices' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        isVerified: true,
        preferredLang: true,
        telegramId: true,
        whatsappPhone: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        preferredLang: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validPassword = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!validPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    return { message: 'Password changed successfully. Please login again.' };
  }

  async getSessions(userId: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        deviceInfo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.userSession.deleteMany({
      where: { id: sessionId, userId },
    });
    return { message: 'Session revoked' };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'user',
    };

    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
