import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserTestBullQueueService } from './user-test-bull-queue.service';
import { CreateUserTestBullQueueDto } from './dto/create-user-test-bull-queue.dto';
import { UpdateUserTestBullQueueDto } from './dto/update-user-test-bull-queue.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('user-test-bull-queue')
export class UserTestBullQueueController {
  constructor(private readonly userTestBullQueueService: UserTestBullQueueService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserTestBullQueueDto) {
  //   return this.userTestBullQueueService.addUserByQueue(createUserDto);
  // }
  
}
