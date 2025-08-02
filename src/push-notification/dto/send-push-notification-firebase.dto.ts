import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"

class NotificationDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    body?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class SendPushNotificationFirebaseDto {
    @ApiProperty({ type: [String], description: 'Tokens FCM dos dispositivos de destino. Se vazio, envia para todos os devices registrados.' })
    @IsArray()
    @IsString({ each: true })
    tokens: string[];

    @ApiProperty({ type: NotificationDto })
    @ValidateNested()
    @Type(() => NotificationDto)
    @IsNotEmpty({ message: 'O campo notification é obrigatório.' })
    notification: NotificationDto;

    @ApiProperty({ required: false, description: 'Payload adicional' })
    @IsOptional()
    data?: {
        [key: string]: string;
    };

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    icon?: string;
}