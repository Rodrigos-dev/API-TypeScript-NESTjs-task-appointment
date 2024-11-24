import { Module } from '@nestjs/common';
import { DeviceRegisterService } from './device-register.service';
import { DeviceRegisterController } from './device-register.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceRegister } from './entities/device-register.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceRegister])],
  controllers: [DeviceRegisterController],
  providers: [DeviceRegisterService],
  exports: [TypeOrmModule, DeviceRegisterService ],
})
export class DeviceRegisterModule {}
