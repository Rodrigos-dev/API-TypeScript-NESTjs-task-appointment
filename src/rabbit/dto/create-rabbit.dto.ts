export enum TypeQueuRabbit{
    SEND_EMAIL_FORGET_PASSWORD = 'send-email-forget-password'
}

export class CreateRabbitDto {    
    message: string
    typeQueuRabbit: TypeQueuRabbit
}
