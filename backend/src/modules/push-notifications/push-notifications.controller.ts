import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { PushNotificationsService, PushSubscriptionDto, SendNotificationDto } from './push-notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../admin-auth/guards/admin-auth.guard';

@Controller('push')
export class PushNotificationsController {
  constructor(private readonly pushService: PushNotificationsService) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(
    @Req() req: any,
    @Body() subscription: PushSubscriptionDto,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.pushService.subscribe(req.user.id, subscription, userAgent);
  }

  @Delete('unsubscribe')
  @UseGuards(JwtAuthGuard)
  unsubscribe(@Req() req: any, @Body() body: { endpoint: string }) {
    return this.pushService.unsubscribe(req.user.id, body.endpoint);
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard)
  getMySubscriptions(@Req() req: any) {
    return this.pushService.getUserSubscriptions(req.user.id);
  }

  @Post('track-click/:id')
  trackClick(@Param('id') id: string) {
    return this.pushService.trackClick(id);
  }
}

@Controller('admin/push')
@UseGuards(AdminAuthGuard)
export class AdminPushController {
  constructor(private readonly pushService: PushNotificationsService) {}

  @Get('stats')
  getStats() {
    return this.pushService.getStats();
  }

  @Get('history')
  getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pushService.getNotificationHistory(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('send/user/:userId')
  sendToUser(
    @Param('userId') userId: string,
    @Body() notification: SendNotificationDto,
  ) {
    return this.pushService.sendToUser(userId, notification);
  }

  @Post('send/all')
  sendToAll(@Body() body: SendNotificationDto & { excludeUserIds?: string[] }) {
    const { excludeUserIds, ...notification } = body;
    return this.pushService.sendToAll(notification, excludeUserIds);
  }
}
