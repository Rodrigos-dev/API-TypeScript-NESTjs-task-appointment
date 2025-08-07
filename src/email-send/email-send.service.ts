import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEmailSendDto } from './dto/create-email-send.dto';
import { MailerService } from '@nestjs-modules/mailer';
import exceptions from 'src/commom/utils/exceptions';
import loggers from 'src/commom/utils/loggers';

@Injectable()
export class EmailSendService {

  constructor(private readonly mailerService: MailerService) { }

  async sendEmail(sendEmailBody: CreateEmailSendDto, data?: any): Promise<void> {

    try {

      sendEmailBody.emailTo = sendEmailBody.emailTo.toLowerCase()

      if ((!sendEmailBody.emailTo) || (sendEmailBody.emailTo && !sendEmailBody.emailTo.includes('@'))) {
        throw new HttpException('Email não enviado ou inválido!', HttpStatus.BAD_REQUEST);
      }

      const sendEmail = await this.mailerService.sendMail({
        from: process.env.EMAIL_FROM_OR_LOGIN,
        to: sendEmailBody.emailTo,
        subject: sendEmailBody.subject,
        text: sendEmailBody.text,
      })

      console.log(sendEmail)

      return sendEmail

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }

  }


}
