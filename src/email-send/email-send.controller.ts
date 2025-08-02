import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmailSendService } from './email-send.service';
import { CreateEmailSendDto } from './dto/create-email-send.dto';

@Controller('email-send')
export class EmailSendController {
  constructor(private readonly emailSendService: EmailSendService) {}

  // @Post()
  // create(@Body() createEmailSendDto: CreateEmailSendDto) {
  //   return this.emailSendService.sendEmail(createEmailSendDto);
  // }  
}
