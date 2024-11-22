import { Module } from '@nestjs/common';
import { EmailSendService } from './email-send.service';
import { EmailSendController } from './email-send.controller';
import { MailerModule } from '@nestjs-modules/mailer';			

@Module({
  imports: [
    MailerModule.forRoot({								
      transport: {
        service: 'gmail',                
        auth: {										
          user: 'para.uso.apis@gmail.com',//email da apk paraenvio de emails			
          pass: 'rqhz vudw ffkx oyjz',//password gerado no app criado no email							
        },
      },
    }),
  ],  
  controllers: [EmailSendController],
  providers: [EmailSendService],
  exports: [EmailSendService]
})
export class EmailSendModule { }
