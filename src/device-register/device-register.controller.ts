import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeviceRegisterService } from './device-register.service';
import { CreateDeviceRegisterDto } from './dto/create-device-register.dto';
import { UpdateDeviceRegisterDto } from './dto/update-device-register.dto';

@Controller('device-register')
export class DeviceRegisterController {
  constructor(private readonly deviceRegisterService: DeviceRegisterService) {}

  @Post()
  create(@Body() createDeviceRegisterDto: CreateDeviceRegisterDto) {
    return this.deviceRegisterService.create(createDeviceRegisterDto);
  }

  @Get()
  findAll() {
    return this.deviceRegisterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceRegisterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceRegisterDto: UpdateDeviceRegisterDto) {
    return this.deviceRegisterService.update(+id, updateDeviceRegisterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceRegisterService.remove(+id);
  }
}
