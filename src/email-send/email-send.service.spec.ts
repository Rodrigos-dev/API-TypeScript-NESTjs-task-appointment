import { Test, TestingModule } from '@nestjs/testing';
import { EmailSendService } from './email-send.service';

describe('EmailSendService', () => {
  let service: EmailSendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailSendService],
    }).compile();

    service = module.get<EmailSendService>(EmailSendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
