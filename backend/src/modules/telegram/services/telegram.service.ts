import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private botToken: string;
  private adminChatId: string;
  private isEnabled: boolean;

  constructor(
    private config: ConfigService,
    private events: EventEmitter2,
  ) {
    this.botToken = this.config.get('TELEGRAM_BOT_TOKEN', '');
    this.adminChatId = this.config.get('TELEGRAM_ADMIN_CHAT_ID', '');
    this.isEnabled = !!this.botToken && !!this.adminChatId;
  }

  async onModuleInit() {
    if (this.isEnabled) {
      this.logger.log('Telegram bot initialized');
    } else {
      this.logger.warn('Telegram bot is disabled (missing token or chat ID)');
    }
  }

  async sendMessage(message: TelegramMessage): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn('Telegram is not configured, skipping message');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chatId,
          text: message.text,
          parse_mode: message.parseMode || 'HTML',
        }),
      });

      const result = await response.json();
      if (!result.ok) {
        this.logger.error(`Failed to send Telegram message: ${result.description}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error sending Telegram message: ${error.message}`);
      return false;
    }
  }

  async sendAdminNotification(text: string): Promise<boolean> {
    return this.sendMessage({
      chatId: this.adminChatId,
      text,
    });
  }

  async sendToUser(chatId: string, text: string): Promise<boolean> {
    return this.sendMessage({ chatId, text });
  }

  @OnEvent('order.created')
  async handleOrderCreated(payload: any) {
    const message = `
<b>New Order Created</b>

Order Code: <code>${payload.code}</code>
From: ${payload.fromAmount} ${payload.fromCurrency}
To: ${payload.toAmount} ${payload.toCurrency}
Email: ${payload.clientEmail}
Wallet: <code>${payload.clientWallet}</code>

Status: PENDING
    `.trim();

    await this.sendAdminNotification(message);
  }

  @OnEvent('order.status-changed')
  async handleOrderStatusChanged(payload: any) {
    const message = `
<b>Order Status Changed</b>

Order Code: <code>${payload.code}</code>
Status: ${payload.fromStatus} → <b>${payload.toStatus}</b>
${payload.reason ? `Reason: ${payload.reason}` : ''}
    `.trim();

    await this.sendAdminNotification(message);

    if (payload.userTelegramId) {
      const userMessage = `
<b>Order Update</b>

Your order <code>${payload.code}</code> status has been updated to: <b>${payload.toStatus}</b>
${payload.reason ? `\nNote: ${payload.reason}` : ''}
      `.trim();
      await this.sendToUser(payload.userTelegramId, userMessage);
    }
  }

  @OnEvent('user.registered')
  async handleUserRegistered(payload: any) {
    const message = `
<b>New User Registered</b>

Email: ${payload.email}
User ID: <code>${payload.userId}</code>
    `.trim();

    await this.sendAdminNotification(message);
  }

  @OnEvent('review.created')
  async handleReviewCreated(payload: any) {
    const message = `
<b>New Review Submitted</b>

Author: ${payload.authorName}
Rating: ${'⭐'.repeat(payload.rating)}
Content: ${payload.content.substring(0, 100)}...

Status: PENDING MODERATION
    `.trim();

    await this.sendAdminNotification(message);
  }

  async linkAccount(userId: string, telegramId: string): Promise<boolean> {
    return true;
  }

  async getMe(): Promise<any> {
    if (!this.isEnabled) return null;

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/getMe`;
      const response = await fetch(url);
      return response.json();
    } catch {
      return null;
    }
  }
}
