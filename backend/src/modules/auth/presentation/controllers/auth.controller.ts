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
