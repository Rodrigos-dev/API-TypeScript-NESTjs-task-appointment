import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RabbitService } from './rabbit.service';
import { CreateRabbitDto } from './dto/create-rabbit.dto';

@Controller('rabbit')
export class RabbitController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post()
  create(@Body() createRabbitDto: CreateRabbitDto) {
    return this.rabbitService.create(createRabbitDto);
  }
  
}
