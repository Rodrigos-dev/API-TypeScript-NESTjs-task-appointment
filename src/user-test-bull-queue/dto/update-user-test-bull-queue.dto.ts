import { PartialType } from '@nestjs/mapped-types';
import { CreateUserTestBullQueueDto } from './create-user-test-bull-queue.dto';

export class UpdateUserTestBullQueueDto extends PartialType(CreateUserTestBullQueueDto) {}
