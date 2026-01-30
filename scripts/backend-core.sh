#!/bin/bash
cd "$(dirname "$0")/.."

echo "Creating backend core..."

#=== Prisma Module ===
cat > backend/src/core/database/prisma.module.ts << 'EOF'
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
EOF

cat > backend/src/core/database/prisma.service.ts << 'EOF'
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  async onModuleInit() { await this.$connect(); this.logger.log('Database connected'); }
  async onModuleDestroy() { await this.$disconnect(); }
}
EOF

#=== Redis Module ===
cat > backend/src/core/cache/redis.module.ts << 'EOF'
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({ providers: [RedisService], exports: [RedisService] })
export class RedisModule {}
EOF

cat > backend/src/core/cache/redis.service.ts << 'EOF'
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis({ host: config.get('REDIS_HOST'), port: config.get('REDIS_PORT') });
    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (e) => this.logger.error('Redis error', e));
  }

  getClient() { return this.client; }
  async get<T>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    if (!v) return null;
    try { return JSON.parse(v); } catch { return v as unknown as T; }
  }
  async set(key: string, value: any, ttl?: number) {
    const d = typeof value === 'string' ? value : JSON.stringify(value);
    ttl ? await this.client.setex(key, ttl, d) : await this.client.set(key, d);
  }
  async del(key: string) { await this.client.del(key); }
  async hset(key: string, field: string, value: any) {
    await this.client.hset(key, field, typeof value === 'string' ? value : JSON.stringify(value));
  }
  async hget<T>(key: string, field: string): Promise<T | null> {
    const v = await this.client.hget(key, field);
    if (!v) return null;
    try { return JSON.parse(v); } catch { return v as unknown as T; }
  }
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const data = await this.client.hgetall(key);
    const r: Record<string, T> = {};
    for (const [f, v] of Object.entries(data)) { try { r[f] = JSON.parse(v); } catch { r[f] = v as unknown as T; } }
    return r;
  }
  async expire(key: string, sec: number) { await this.client.expire(key, sec); }
  async onModuleDestroy() { await this.client.quit(); }
}
EOF

#=== Decorators ===
cat > backend/src/core/common/decorators/public.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
EOF

cat > backend/src/core/common/decorators/roles.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '@prisma/client';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
EOF

#=== Filter ===
cat > backend/src/core/common/filters/http-exception.filter.ts << 'EOF'
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR, message = 'Internal error', errors: any;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const r = exception.getResponse() as any;
      message = r.message || exception.message;
      if (Array.isArray(r.message)) { errors = r.message.map((m: string) => ({ message: m })); message = 'Validation failed'; }
    } else if (exception instanceof Error) { this.logger.error(exception.message, exception.stack); }
    res.status(status).json({ statusCode: status, message, errors, path: req.url, timestamp: new Date().toISOString() });
  }
}
EOF

#=== Interceptor ===
cat > backend/src/core/common/interceptors/transform.interceptor.ts << 'EOF'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => data?.data !== undefined ? data : { data, meta: { timestamp: new Date().toISOString() } }));
  }
}
EOF

#=== Code Generator ===
cat > backend/src/shared/utils/code-generator.util.ts << 'EOF'
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CodeGenerator {
  private readonly ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  private readonly secret: string;
  constructor(config: ConfigService) { this.secret = config.get('CODE_HMAC_SECRET') || 'default'; }
  generate() {
    const bytes = randomBytes(12);
    let code = '';
    for (let i = 0; i < bytes.length; i++) code += this.ALPHABET[bytes[i] % this.ALPHABET.length];
    const formatted = `ODIN-${code.slice(0, 6)}-${code.slice(6)}`;
    return { code: formatted, checksum: this.checksum(formatted) };
  }
  validate(code: string, checksum: string) {
    try { return timingSafeEqual(Buffer.from(checksum, 'hex'), Buffer.from(this.checksum(code), 'hex')); }
    catch { return false; }
  }
  private checksum(code: string) { return createHmac('sha256', this.secret).update(code).digest('hex').slice(0, 8); }
}
EOF

echo "Backend core created!"