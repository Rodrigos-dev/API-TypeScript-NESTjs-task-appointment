export enum TypeQueueRabbit{
    SEND_EMAIL_FORGET_PASSWORD = 'send-email-forget-password'
}

export class CreateRabbitDto {    
    message: string
    typeQueueRabbit: TypeQueueRabbit
}
