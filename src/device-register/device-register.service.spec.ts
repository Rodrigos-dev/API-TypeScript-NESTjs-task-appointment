import { Test, TestingModule } from '@nestjs/testing';
import { DeviceRegisterService } from './device-register.service';

describe('DeviceRegisterService', () => {
  let service: DeviceRegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceRegisterService],
    }).compile();

    service = module.get<DeviceRegisterService>(DeviceRegisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
