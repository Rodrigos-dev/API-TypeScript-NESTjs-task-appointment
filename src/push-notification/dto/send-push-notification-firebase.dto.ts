import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMaxSize, IsUrl } from "class-validator"

class NotificationDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'O título da notificação é obrigatório.' })
    @IsString()
    title: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'O corpo (body) da notificação é obrigatório.' })
    @IsString()
    body: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl({ require_protocol: true, protocols: ['https'] }, { message: 'A URL da imagem deve ser válida e começar com https://.' })
    @IsString()
    imageUrl?: string;
}

export class SendPushNotificationFirebaseDto {
    @ApiProperty({ type: [String], description: 'Tokens FCM dos dispositivos de destino. Se vazio, envia para todos os devices registrados.' })
    @IsArray()
    @ArrayMaxSize(500, { message: 'Apenas 500 tokens por vez.' })
    @IsString({ each: true })
    @IsOptional()
    tokens: string[] = []; // Inicializar como array vazio para evitar problemas

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