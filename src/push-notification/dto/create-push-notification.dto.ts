export class CreatePushNotificationDto {
    
    tokens: string[]
        
    notification: {        
        title?: string        
        body?: string       
        imageUrl?: string
    }
    
    data?: {
        [key: string]: string
    }

    icon?: string
}
