import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from "class-validator";

export class UpdatePasswordEmailCodeDto {
    @ApiProperty()
    @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório.' })
    email:string  
    
    @ApiProperty()
    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    @Matches(/^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>/\\]).*$/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula, um número, um caractere especial (incluindo /) e ter no mínimo 6 caracteres.'
    })
    password: string;       
    
    @ApiHideProperty()
    @IsOptional()
    @MinLength(6, { message: 'A senha antiga deve ter no mínimo 6 caracteres.' })
    @Matches(/^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>/\\]).*$/, {
        message: 'A senha antiga deve conter pelo menos uma letra maiúscula, um número, um caractere especial (incluindo /) e ter no mínimo 6 caracteres.'
    })
    oldPassword?: string;
}