import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength, ValidateNested } from "class-validator";
import { AvatarDto } from "./avatar.dto";

export class CreateUserDto {
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    name: string;

    @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório.' })
    email: string;

    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    @Matches(/^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>/\\]).*$/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula, um número, um caractere especial (incluindo /) e ter no mínimo 6 caracteres.'
    })
    password: string;

    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>/\\]).*$/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial (incluindo /), e ter no mínimo 6 caracteres.'
    })
    confirmPassword: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => AvatarDto)
    avatar?: AvatarDto;
}





