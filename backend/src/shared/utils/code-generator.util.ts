import { Injectable } from '@nestjs/common';

@Injectable()
export class CodeGenerator {
  /**
   * Generate a random alphanumeric code
   */
  static generate(length: number = 8, prefix: string = ''): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }

  /**
   * Generate a numeric code
   */
  static generateNumeric(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * Generate order code with prefix
   */
  static generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = this.generate(4);
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Generate transaction code
   */
  static generateTransactionCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = this.generate(6);
    return `TXN-${timestamp}-${random}`;
  }
}
