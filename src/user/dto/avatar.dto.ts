import { ApiHideProperty, ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional } from "class-validator"

export class AvatarDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Nome do avatar deve ser enviado.' })
    avatarName: string

    @ApiProperty()
    @IsNotEmpty({ message: 'File em base 64 deve ser enviado.' })
    base64: string

    @ApiProperty()
    @IsNotEmpty({ message: 'MimeType do arquivo deve ser enviado.' })
    mimeType: string

    @ApiHideProperty()
    @IsOptional()
    urlAvatar: string
}
