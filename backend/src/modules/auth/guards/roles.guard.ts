import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/core/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private r: Reflector) {}
  canActivate(ctx: ExecutionContext) { const roles = this.r.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]); if (!roles) return true; return roles.includes(ctx.switchToHttp().getRequest().user?.role); }
}
