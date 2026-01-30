import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    
    this.client = new Redis({
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: this.config.get('REDIS_PORT', 6379),
      password: this.config.get('REDIS_PASSWORD') || undefined,
      tls: isProduction ? {} : undefined, // Upstash требует TLS
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err) => this.logger.error('Redis error', err));
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
