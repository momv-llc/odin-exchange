import { OrderStatus } from '@prisma/client';

export class OrderResponseDto {
  id: string; code: string; fromCurrency: string; toCurrency: string;
  fromAmount: string; toAmount: string; lockedRate: string;
  status: OrderStatus; expiresAt: Date; createdAt: Date;
  clientEmail?: string; clientPhone?: string; clientWallet?: string; adminNotes?: string;

  static fromEntity(e: any, priv = false): OrderResponseDto {
    const d = new OrderResponseDto();
    d.id = e.id; d.code = e.code;
    d.fromCurrency = e.fromCurrency?.code || e.fromCurrencyId;
    d.toCurrency = e.toCurrency?.code || e.toCurrencyId;
    d.fromAmount = e.fromAmount.toString(); d.toAmount = e.toAmount.toString();
    d.lockedRate = e.lockedRate.toString(); d.status = e.status;
    d.expiresAt = e.expiresAt; d.createdAt = e.createdAt;
    if (priv) { d.clientEmail = e.clientEmail; d.clientPhone = e.clientPhone; d.clientWallet = e.clientWallet; d.adminNotes = e.adminNotes; }
    return d;
  }
}
