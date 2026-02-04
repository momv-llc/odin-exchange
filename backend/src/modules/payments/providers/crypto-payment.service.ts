import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

interface CryptoAddress {
  currency: string;
  network: string;
  address: string;
  qrCode?: string;
}

@Injectable()
export class CryptoPaymentService {
  private readonly logger = new Logger(CryptoPaymentService.name);

  private readonly hotWallets: Record<string, CryptoAddress> = {
    BTC: {
      currency: 'BTC',
      network: 'bitcoin',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    },
    ETH: {
      currency: 'ETH',
      network: 'ethereum',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5bEA2',
    },
    USDT_ERC20: {
      currency: 'USDT',
      network: 'ethereum',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5bEA2',
    },
    USDT_TRC20: {
      currency: 'USDT',
      network: 'tron',
      address: 'TN3W4H6rK2ce4vX9YnFQHwKE2Y8KnD7aXH',
    },
    LTC: {
      currency: 'LTC',
      network: 'litecoin',
      address: 'ltc1qzvcgmntglcuv4smv3lzj6k8szcvsrmvk0phrr9',
    },
    SOL: {
      currency: 'SOL',
      network: 'solana',
      address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    },
  };

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async createPaymentAddress(params: {
    amount: number;
    currency: string;
    paymentId: string;
  }) {
    const currencyUpper = params.currency.toUpperCase();
    const walletKey = this.getWalletKey(currencyUpper);
    const wallet = this.hotWallets[walletKey];

    if (!wallet) {
      throw new Error('Unsupported cryptocurrency: ' + currencyUpper);
    }

    const qrCodeData = this.generateQRData(wallet, params.amount);
    const now = new Date();
    const externalId = 'CRYPTO_' + params.paymentId + '_' + now.getTime();

    await this.prisma.cryptoWallet.upsert({
      where: { address: wallet.address },
      update: {},
      create: {
        currency: wallet.currency,
        network: wallet.network,
        address: wallet.address,
        label: 'Hot Wallet - ' + wallet.currency,
        isHot: true,
        isActive: true,
      },
    });

    return {
      externalId,
      address: wallet.address,
      network: wallet.network,
      amount: params.amount,
      currency: wallet.currency,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      qrCodeData,
    };
  }

  private getWalletKey(currency: string): string {
    if (currency === 'USDT' || currency === 'USDT_ERC20') return 'USDT_ERC20';
    if (currency === 'USDT_TRC20') return 'USDT_TRC20';
    return currency;
  }

  private generateQRData(wallet: CryptoAddress, amount: number): string {
    switch (wallet.network) {
      case 'bitcoin':
        return 'bitcoin:' + wallet.address + '?amount=' + amount;
      case 'ethereum':
        return 'ethereum:' + wallet.address + '?value=' + amount;
      case 'litecoin':
        return 'litecoin:' + wallet.address + '?amount=' + amount;
      default:
        return wallet.address;
    }
  }

  async checkTransaction(txHash: string, network: string) {
    this.logger.log('Checking transaction ' + txHash + ' on ' + network);
    return { confirmed: false, confirmations: 0, amount: 0 };
  }

  async monitorPendingPayments() {
    const pendingTxs = await this.prisma.cryptoTransaction.findMany({
      where: { status: 'PENDING' },
      include: { wallet: true },
    });

    for (const tx of pendingTxs) {
      if (tx.txHash) {
        const status = await this.checkTransaction(tx.txHash, tx.wallet.network);
        if (status.confirmations >= tx.requiredConfs) {
          await this.prisma.cryptoTransaction.update({
            where: { id: tx.id },
            data: { status: 'CONFIRMED', confirmations: status.confirmations },
          });
        }
      }
    }
  }

  async getWalletBalance(currency: string, network: string) {
    const wallet = await this.prisma.cryptoWallet.findFirst({
      where: { currency, network, isActive: true },
    });
    return wallet?.balance || 0;
  }

  async recordTransaction(params: {
    walletId: string;
    userId?: string;
    txHash: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'INTERNAL';
    amount: number;
    fromAddress?: string;
    toAddress: string;
  }) {
    return this.prisma.cryptoTransaction.create({
      data: {
        walletId: params.walletId,
        userId: params.userId,
        txHash: params.txHash,
        type: params.type,
        amount: params.amount,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        status: 'PENDING',
        requiredConfs: params.type === 'DEPOSIT' ? 3 : 1,
      },
    });
  }
}
