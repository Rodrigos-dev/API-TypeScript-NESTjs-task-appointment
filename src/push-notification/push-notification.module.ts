import { Global, Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationController } from './push-notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushNotification } from './entities/push-notification.entity';
import { DeviceRegister } from 'src/device-register/entities/device-register.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PushNotification, DeviceRegister])],
  controllers: [PushNotificationController],
  providers: [PushNotificationService],
  exports: [TypeOrmModule, PushNotificationService ],
})
export class PushNotificationModule {}



  