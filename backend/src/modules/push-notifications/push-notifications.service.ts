import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';

export interface PushSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceType?: string;
}

export interface SendNotificationDto {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  data?: Record<string, any>;
}

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private isConfigured = false;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.initWebPush();
  }

  private initWebPush() {
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidEmail = this.configService.get<string>('VAPID_EMAIL') || 'mailto:admin@odin-exchange.com';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
      this.isConfigured = true;
      this.logger.log('Web Push configured successfully');
    } else {
      this.logger.warn('VAPID keys not configured. Push notifications disabled.');
    }
  }

  // Subscribe user to push notifications
  async subscribe(userId: string, subscription: PushSubscriptionDto, userAgent?: string) {
    // Check if subscription already exists
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      // Update existing subscription
      return this.prisma.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent,
          deviceType: subscription.deviceType,
          lastUsedAt: new Date(),
          isActive: true,
        },
      });
    }

    return this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
        deviceType: subscription.deviceType,
      },
    });
  }

  // Unsubscribe user from push notifications
  async unsubscribe(userId: string, endpoint: string) {
    return this.prisma.pushSubscription.updateMany({
      where: { userId, endpoint },
      data: { isActive: false },
    });
  }

  // Send push notification to a specific user
  async sendToUser(userId: string, notification: SendNotificationDto) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
    });

    if (subscriptions.length === 0) {
      this.logger.log('No active subscriptions for user ' + userId);
      return { sent: 0, failed: 0 };
    }

    // Create notification record
    const notificationRecord = await this.prisma.pushNotification.create({
      data: {
        userId,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        image: notification.image,
        url: notification.url,
        data: notification.data,
      },
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await this.sendPush(sub, notification);
        sent++;
        
        // Update last used
        await this.prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { lastUsedAt: new Date() },
        });
      } catch (error) {
        failed++;
        this.logger.error('Failed to send push to ' + sub.endpoint + ': ' + error.message);
        
        // Disable invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          await this.prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { isActive: false },
          });
        }
      }
    }

    // Update notification record
    await this.prisma.pushNotification.update({
      where: { id: notificationRecord.id },
      data: {
        sentCount: sent,
        failedCount: failed,
        sentAt: new Date(),
      },
    });

    return { sent, failed, notificationId: notificationRecord.id };
  }

  // Send push notification to all users
  async sendToAll(notification: SendNotificationDto, excludeUserIds: string[] = []) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: {
        isActive: true,
        userId: { notIn: excludeUserIds },
      },
    });

    const notificationRecord = await this.prisma.pushNotification.create({
      data: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        image: notification.image,
        url: notification.url,
        data: notification.data,
      },
    });

    let sent = 0;
    let failed = 0;

    // Send in batches to avoid overwhelming the server
    const batchSize = 100;
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(sub => this.sendPush(sub, notification)),
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          sent++;
        } else {
          failed++;
          // Handle expired subscriptions
          const error = result.reason;
          if (error.statusCode === 410 || error.statusCode === 404) {
            this.prisma.pushSubscription.update({
              where: { id: batch[index].id },
              data: { isActive: false },
            }).catch(() => {});
          }
        }
      });
    }

    await this.prisma.pushNotification.update({
      where: { id: notificationRecord.id },
      data: {
        sentCount: sent,
        failedCount: failed,
        sentAt: new Date(),
      },
    });

    return { sent, failed, total: subscriptions.length, notificationId: notificationRecord.id };
  }

  private async sendPush(subscription: { endpoint: string; p256dh: string; auth: string }, notification: SendNotificationDto) {
    if (!this.isConfigured) {
      this.logger.warn('Push notifications not configured');
      return;
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      image: notification.image,
      data: {
        url: notification.url || '/',
        ...notification.data,
      },
    });

    return webpush.sendNotification(pushSubscription, payload);
  }

  // Get user's subscriptions
  async getUserSubscriptions(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        deviceType: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  // Get notification history
  async getNotificationHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.pushNotification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pushNotification.count(),
    ]);

    return { notifications, total, page, limit };
  }

  // Track notification click
  async trackClick(notificationId: string) {
    await this.prisma.pushNotification.update({
      where: { id: notificationId },
      data: { clickedCount: { increment: 1 } },
    });
  }

  // Get push notification stats
  async getStats() {
    const [
      totalSubscriptions,
      activeSubscriptions,
      totalNotifications,
      totalSent,
      totalClicked,
    ] = await Promise.all([
      this.prisma.pushSubscription.count(),
      this.prisma.pushSubscription.count({ where: { isActive: true } }),
      this.prisma.pushNotification.count(),
      this.prisma.pushNotification.aggregate({ _sum: { sentCount: true } }),
      this.prisma.pushNotification.aggregate({ _sum: { clickedCount: true } }),
    ]);

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalNotifications,
      totalSent: totalSent._sum.sentCount || 0,
      totalClicked: totalClicked._sum.clickedCount || 0,
      clickRate: totalSent._sum.sentCount 
        ? ((totalClicked._sum.clickedCount || 0) / totalSent._sum.sentCount * 100).toFixed(2) 
        : 0,
    };
  }

  // Generate VAPID keys (one-time setup)
  static generateVapidKeys() {
    return webpush.generateVAPIDKeys();
  }
}
