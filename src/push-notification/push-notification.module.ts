import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationController } from './push-notification.controller';

@Module({
  controllers: [PushNotificationController],
  providers: [PushNotificationService],
})
export class PushNotificationModule {}
