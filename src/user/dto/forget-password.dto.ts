import { PartialType } from "@nestjs/mapped-types"
import { IsEmail, IsNotEmpty } from "class-validator"
import { CreateUserDto } from "./create-user.dto"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class ForgetPasswordDto {    

    @ApiProperty()
    @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório.' })    
    email:string         
}