import { IsEmail, IsOptional, ValidateNested } from 'class-validator';
import { RoleEnum } from 'src/commom/enums/user-enums';
import { Type } from 'class-transformer';
import { AvatarDto } from './avatar.dto';

export class UpdateUserDto {
    @IsOptional()
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
    email?: string;

    @IsOptional()
    role?: RoleEnum;

    @IsOptional()
    @ValidateNested()
    @Type(() => AvatarDto)
    avatar?: AvatarDto;
}
