import { Test, TestingModule } from '@nestjs/testing';
import { DeviceRegisterController } from './device-register.controller';
import { DeviceRegisterService } from './device-register.service';

describe('DeviceRegisterController', () => {
  let controller: DeviceRegisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceRegisterController],
      providers: [DeviceRegisterService],
    }).compile();

    controller = module.get<DeviceRegisterController>(DeviceRegisterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
