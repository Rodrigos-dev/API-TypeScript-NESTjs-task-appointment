import { IsNotEmpty, IsOptional } from "class-validator"

export class AvatarDto {
    @IsNotEmpty({ message: 'Nome do avatar deve ser enviado.' })
    avatarName: string

    @IsNotEmpty({ message: 'File em base 64 deve ser enviado.' })
    base64: string

    @IsNotEmpty({ message: 'MimeType do arquivo deve ser enviado.' })
    mimeType: string

    @IsOptional()
    urlAvatar: string
}