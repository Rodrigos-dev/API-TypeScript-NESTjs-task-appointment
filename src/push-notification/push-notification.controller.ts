import { Controller, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { SendPushNotificationFirebaseDto } from './dto/send-push-notification-firebase.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('push-notification')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  sendPushNotification(@Body() createPushNotificationDataBaseDto: SendPushNotificationFirebaseDto) {
    return this.pushNotificationService.sendPushNotification(createPushNotificationDataBaseDto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete()
  async delete(@Body() pushIds: [number]){
    return await this.pushNotificationService.delete(pushIds);
  }
}
