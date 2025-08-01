import { Global, Module } from '@nestjs/common';
import { RabbitService } from './rabbit.service';
import { RabbitController } from './rabbit.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { EmailSendService } from 'src/email-send/email-send.service';

@Global()
@Module({
  //quando for usar rabbitmq descomente aki e comente o abaixo ...esse 1 import conecta ao rabbitmq
  //import conect the cloud reabit
  imports: [
    process.env.ENVIRONMENT === 'production'
      ? RabbitMQModule.forRoot(RabbitMQModule, {
          uri: 'url rabbit mq em nuvem',
        })
      : RabbitMQModule.forRoot(RabbitMQModule),
  ],
  //import rabit conect docker
  // imports: [
  //   RabbitMQModule.forRoot(RabbitMQModule, {
  //     uri : 'amqp://admin:admin@localhost:5672' ,
  //   }),
  // ],
  controllers: [RabbitController],
  providers: [RabbitService, EmailSendService],
  exports: [RabbitMQModule],
})
export class RabbitModule {}