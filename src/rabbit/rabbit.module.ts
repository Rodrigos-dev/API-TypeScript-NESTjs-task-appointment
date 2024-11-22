import { Global, Module } from '@nestjs/common';
import { RabbitService } from './rabbit.service';
import { RabbitController } from './rabbit.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { EmailSendService } from 'src/email-send/email-send.service';


@Global()
@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri : 'amqp://admin:admin@localhost:5672' })      
  ],
  controllers: [RabbitController],
  providers: [RabbitService, EmailSendService],
  exports: [RabbitMQModule]
})
export class RabbitModule {}
