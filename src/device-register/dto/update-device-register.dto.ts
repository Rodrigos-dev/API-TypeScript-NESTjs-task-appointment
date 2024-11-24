import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceRegisterDto } from './create-device-register.dto';

export class UpdateDeviceRegisterDto extends PartialType(CreateDeviceRegisterDto) {}
