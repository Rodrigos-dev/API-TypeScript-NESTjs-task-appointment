import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty } from "class-validator"

export class CreateEmailSendDto {  
    @ApiProperty()
    @IsNotEmpty({ message: 'subject deve ser enviado.' })
    subject: string
    
    @ApiProperty()
    @IsNotEmpty({ message: 'emailTo deve ser enviado.' })
    emailTo: string    

    @ApiProperty()
    @IsNotEmpty({ message: 'text deve ser enviado.' })
    text: string
}
