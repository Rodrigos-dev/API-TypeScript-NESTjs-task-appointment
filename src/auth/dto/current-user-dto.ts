import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty } from "class-validator"

export class CurrentUserDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Sub obrigatório.' })
    sub: number 
    
    @ApiProperty()
    @IsNotEmpty({ message: 'username obrigatório.' })
    username: string 

    @ApiProperty()
    @IsNotEmpty({ message: 'email obrigatório.' })
    email: string

    @ApiProperty()
    @IsNotEmpty({ message: 'role obrigatório.' })
    role: string
}