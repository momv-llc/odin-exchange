import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

interface WhatsAppMessage {
  to: string;
  template?: string;
  text?: string;
  parameters?: Record<string, string>;
}

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private apiUrl: string;
  private apiToken: string;
  private phoneNumberId: string;
  private isEnabled: boolean;

  constructor(private config: ConfigService) {
    this.apiUrl = this.config.get('WHATSAPP_API_URL', 'https://graph.facebook.com/v18.0');
    this.apiToken = this.config.get('WHATSAPP_API_TOKEN', '');
    this.phoneNumberId = this.config.get('WHATSAPP_PHONE_NUMBER_ID', '');
    this.isEnabled = !!this.apiToken && !!this.phoneNumberId;
  }

  async onModuleInit() {
    if (this.isEnabled) {
      this.logger.log('WhatsApp Business API initialized');
    } else {
      this.logger.warn('WhatsApp is disabled (missing API token or phone number ID)');
    }
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn('WhatsApp is not configured, skipping message');
      return false;
    }

    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

      const body: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: this.formatPhoneNumber(message.to),
      };

      if (message.template) {
        body.type = 'template';
        body.template = {
          name: message.template,
          language: { code: 'en' },
          components: message.parameters ? [
            {
              type: 'body',
              parameters: Object.entries(message.parameters).map(([_, value]) => ({
                type: 'text',
                text: value,
              })),
            },
          ] : undefined,
        };
      } else if (message.text) {
        body.type = 'text';
        body.text = { body: message.text };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.error) {
        this.logger.error(`Failed to send WhatsApp message: ${result.error.message}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error sending WhatsApp message: ${error.message}`);
      return false;
    }
  }

  private formatPhoneNumber(phone: string): string {
    return phone.replace(/[^\d]/g, '');
  }

  async sendOrderCreatedNotification(phone: string, orderCode: string, amount: string): Promise<boolean> {
    return this.sendMessage({
      to: phone,
      template: 'order_created',
      parameters: {
        order_code: orderCode,
        amount: amount,
      },
    });
  }

  async sendOrderStatusNotification(phone: string, orderCode: string, status: string): Promise<boolean> {
    return this.sendMessage({
      to: phone,
      text: `Your ODIN Exchange order ${orderCode} status has been updated to: ${status}`,
    });
  }

  @OnEvent('order.created')
  async handleOrderCreated(payload: any) {
    if (payload.clientPhone) {
      await this.sendOrderCreatedNotification(
        payload.clientPhone,
        payload.code,
        `${payload.fromAmount} ${payload.fromCurrency}`
      );
    }
  }

  @OnEvent('order.status-changed')
  async handleOrderStatusChanged(payload: any) {
    if (payload.clientPhone) {
      await this.sendOrderStatusNotification(
        payload.clientPhone,
        payload.code,
        payload.toStatus
      );
    }
  }

  async linkAccount(userId: string, phone: string): Promise<boolean> {
    return true;
  }
}
