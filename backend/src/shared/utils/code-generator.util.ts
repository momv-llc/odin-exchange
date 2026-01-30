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
