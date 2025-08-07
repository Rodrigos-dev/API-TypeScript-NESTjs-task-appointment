import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateDeviceRegisterDto } from './create-device-register.dto';
import { SystemType } from '../entities/device-register.entity';

describe('CreateDeviceRegisterDto', () => {
  // Teste de Sucesso
  it('deve passar a validação com um DTO válido e completo', async () => {
    const validDto = {
      userId: 1,
      token: 'some-valid-token',
      systemType: SystemType.ANDROID,
    };
    const dto = plainToInstance(CreateDeviceRegisterDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com um DTO vazio, já que todos os campos são opcionais', async () => {
    const emptyDto = {};
    const dto = plainToInstance(CreateDeviceRegisterDto, emptyDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // Teste de Falha
  it('deve falhar se `systemType` tiver um valor inválido', async () => {
    const invalidDto = {
      systemType: 'INVALID_SYSTEM',
    };
    const dto = plainToInstance(CreateDeviceRegisterDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });
});