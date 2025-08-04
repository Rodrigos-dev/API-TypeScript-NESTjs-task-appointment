import { IsEmail, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { RoleEnum } from 'src/commom/enums/user-enums';
import { Type } from 'class-transformer';
import { AvatarDto } from './avatar.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
    email?: string;

    @ApiProperty({
        description: 'Somente usuários autorizados podem alterar esse dado',
        enum: RoleEnum,
    })
    @IsOptional()
    @IsEnum(RoleEnum, { message: 'Valor inválido para role' })
    role?: RoleEnum;

    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => AvatarDto)
    avatar?: AvatarDto;
}
