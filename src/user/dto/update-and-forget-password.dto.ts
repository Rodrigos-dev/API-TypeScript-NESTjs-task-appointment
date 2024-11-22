import { PartialType } from "@nestjs/mapped-types"
import { IsEmail, IsNotEmpty } from "class-validator"
import { CreateUserDto } from "./create-user.dto"

export class UpdateForgetPasswordDto extends PartialType(CreateUserDto) {    

    @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório.' })
    email?:string 
         
}