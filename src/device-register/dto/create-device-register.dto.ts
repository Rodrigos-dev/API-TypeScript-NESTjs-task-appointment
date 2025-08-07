import { ApiProperty } from "@nestjs/swagger";
import { SystemType } from "../entities/device-register.entity";
import { IsEnum, IsOptional } from "class-validator";

export class CreateDeviceRegisterDto {
    @ApiProperty()
    @IsOptional()
    userId?: number;

    @ApiProperty()
    @IsOptional()
    token?: string;

    @ApiProperty()
    @IsOptional()
    @IsEnum(SystemType, { message: 'Tipo de sistema inválido.' })
    systemType?: SystemType;
}
