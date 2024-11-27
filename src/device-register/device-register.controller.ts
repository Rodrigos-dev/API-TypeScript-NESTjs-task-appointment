import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DeviceRegisterService } from './device-register.service';
import { CreateDeviceRegisterDto } from './dto/create-device-register.dto';
import { UpdateDeviceRegisterDto } from './dto/update-device-register.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('device-register')
export class DeviceRegisterController {
  constructor(private readonly deviceRegisterService: DeviceRegisterService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDeviceRegisterDto: CreateDeviceRegisterDto) {
    return this.deviceRegisterService.createOrUpdateRegisterToken(createDeviceRegisterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllTokenRegisters(@Query() query: { page: number; take: number; orderBy: 'ASC' | 'DESC' }) {
    return this.deviceRegisterService.findAllTokenRegisters(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userIdOwnerRegisterToken')
  getOneByUserOwnerRegisterId(@Param('userIdOwnerRegisterToken') userIdOwnerRegisterToken: number) {
    return this.deviceRegisterService.getOneByUserOwnerRegisterId(userIdOwnerRegisterToken);
  }  

  @UseGuards(JwtAuthGuard)
  @Delete(':userIdOwnerRegisterToken/')
  remove(@Param('userIdOwnerRegisterToken') userIdOwnerRegisterToken: number) {
    return this.deviceRegisterService.remove(userIdOwnerRegisterToken);
  }

}
