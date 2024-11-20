import { Test, TestingModule } from '@nestjs/testing';
import { UserTestBullQueueService } from './user-test-bull-queue.service';

describe('UserTestBullQueueService', () => {
  let service: UserTestBullQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserTestBullQueueService],
    }).compile();

    service = module.get<UserTestBullQueueService>(UserTestBullQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
