import { Test, TestingModule } from '@nestjs/testing';
import { RabbitController } from './rabbit.controller';
import { RabbitService } from './rabbit.service';

describe('RabbitController', () => {
  let controller: RabbitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RabbitController],
      providers: [RabbitService],
    }).compile();

    controller = module.get<RabbitController>(RabbitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
