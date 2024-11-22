import { PartialType } from "@nestjs/mapped-types"
import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from "class-validator"
import { CreateUserDto } from "./create-user.dto"

export class UpdatePasswordDto extends PartialType(CreateUserDto) {    
    @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório.' })
    email?:string  
    
    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    @Matches(/^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>/\\]).*$/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula, um número, um caractere especial (incluindo /) e ter no mínimo 6 caracteres.'
    })
    password: string;  

    @IsOptional()
    @MinLength(6, { message: 'A senha antiga deve ter no mínimo 6 caracteres.' })
    @Matches(/^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>/\\]).*$/, {
        message: 'A senha antiga deve conter pelo menos uma letra maiúscula, um número, um caractere especial (incluindo /) e ter no mínimo 6 caracteres.'
    })
    oldPassword?: string;    
}
