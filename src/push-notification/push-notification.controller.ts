import { Controller, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { SendPushNotificationFirebaseDto } from './dto/send-push-notification-firebase.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiTags('push-notification') 
@Controller('push-notification')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
    @ApiHeader({
      name: 'Authorization',
      description: 'Token JWT no formato: Bearer <token>',
      required: true,
    })
  @Post()
  sendPushNotification(@Body() createPushNotificationDataBaseDto: SendPushNotificationFirebaseDto) {
    return this.pushNotificationService.sendPushNotification(createPushNotificationDataBaseDto);
  }
  
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Delete()
  async delete(@Body() pushIds: number[]){
    return await this.pushNotificationService.delete(pushIds);
  }
}
