import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreatePushNotificationDto {
    @ApiProperty()
    @IsOptional()
    message?: string;    

    @ApiProperty()
    @IsOptional()
    title?: string;

    @ApiProperty()
    @IsOptional()
    imageUrl?: string;

    @ApiProperty()
    @IsOptional()
    allUsers?: boolean;  

    @ApiProperty()
    @IsOptional()
    icon?: string;  

    @ApiProperty()
    @IsOptional()
    userId?: number; 
}
