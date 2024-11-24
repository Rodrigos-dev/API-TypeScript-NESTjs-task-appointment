import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { UpdatePushNotificationDto } from './dto/update-push-notification.dto';

@Controller('push-notification')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post()
  create(@Body() createPushNotificationDto: CreatePushNotificationDto) {
    return this.pushNotificationService.create(createPushNotificationDto);
  }

  @Get()
  findAll() {
    return this.pushNotificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pushNotificationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePushNotificationDto: UpdatePushNotificationDto) {
    return this.pushNotificationService.update(+id, updatePushNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pushNotificationService.remove(+id);
  }
}
