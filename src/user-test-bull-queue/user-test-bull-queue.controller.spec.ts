import { Test, TestingModule } from '@nestjs/testing';
import { UserTestBullQueueController } from './user-test-bull-queue.controller';
import { UserTestBullQueueService } from './user-test-bull-queue.service';

describe('UserTestBullQueueController', () => {
  let controller: UserTestBullQueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTestBullQueueController],
      providers: [UserTestBullQueueService],
    }).compile();

    controller = module.get<UserTestBullQueueController>(UserTestBullQueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
