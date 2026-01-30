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
