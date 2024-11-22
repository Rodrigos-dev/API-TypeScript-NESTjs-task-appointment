import { Injectable } from '@nestjs/common';
import { CreateRabbitDto } from './dto/create-rabbit.dto';
import { AmqpConnection, RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { EmailSendService } from 'src/email-send/email-send.service';
import loggers from 'src/commom/utils/loggers';

@Injectable()
export class RabbitService {

  constructor(private amqpConnection: AmqpConnection, private emailSendService: EmailSendService) { }

  async create(createRabbitDto?: CreateRabbitDto,) {

    const messageFila = {    
      message: createRabbitDto.message,
      typeQueuRabbit: createRabbitDto.typeQueuRabbit
    };

    const addedInQueue = await this.amqpConnection.publish('amq.direct', `${createRabbitDto.typeQueuRabbit}`, messageFila)

    return addedInQueue
  }

  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'send-email-forget-password',
    queue: 'send-email-forget-password',     
  })
  async consume(msg: any) {
    try {
      await this.emailSendService.sendEmail(JSON.parse(msg.message))      

      loggers.loggerMessage('info', 'Email enviado com sussesso')

      return new Nack(false);
    } catch (err) {      
         
      loggers.loggerMessage('error', err)     

      return new Nack(false);
    }
  }
  
}
