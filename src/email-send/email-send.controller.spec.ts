import { Test, TestingModule } from '@nestjs/testing';
import { EmailSendController } from './email-send.controller';
import { EmailSendService } from './email-send.service';

describe('EmailSendController', () => {
  let controller: EmailSendController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailSendController],
      providers: [EmailSendService],
    }).compile();

    controller = module.get<EmailSendController>(EmailSendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
