import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DeviceRegisterService } from './device-register.service';
import { CreateDeviceRegisterDto } from './dto/create-device-register.dto';
import { UpdateDeviceRegisterDto } from './dto/update-device-register.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiTags('device-register')
@Controller('device-register')
export class DeviceRegisterController {
  constructor(private readonly deviceRegisterService: DeviceRegisterService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Post()
  create(@Body() createDeviceRegisterDto: CreateDeviceRegisterDto) {
    return this.deviceRegisterService.createOrUpdateRegisterToken(createDeviceRegisterDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Get()
  findAllTokenRegisters(@Query() query: { page: number; take: number; orderBy: 'ASC' | 'DESC' }) {
    return this.deviceRegisterService.findAllTokenRegisters(query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Get(':userIdOwnerRegisterToken')
  getOneByUserOwnerRegisterId(@Param('userIdOwnerRegisterToken') userIdOwnerRegisterToken: number) {
    return this.deviceRegisterService.getOneByUserOwnerRegisterId(userIdOwnerRegisterToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Delete(':userIdOwnerRegisterToken/')
  remove(@Param('userIdOwnerRegisterToken') userIdOwnerRegisterToken: number) {
    return this.deviceRegisterService.remove(userIdOwnerRegisterToken);
  }

}
