import { forwardRef, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueBullModule } from 'src/commom/bull-queue/bull.module';
import { User } from 'src/user/entities/user.entity';
import { UserTestBullQueueController } from './user-test-bull-queue.controller';
import { UserTestBullQueueService } from './user-test-bull-queue.service';


@Module({
  imports: [forwardRef(() => QueueBullModule), TypeOrmModule.forFeature([User])],
  controllers: [UserTestBullQueueController],
  providers: [UserTestBullQueueService],
  exports: [TypeOrmModule, UserTestBullQueueService],
})
export class UserTestBullQueueModule { }
