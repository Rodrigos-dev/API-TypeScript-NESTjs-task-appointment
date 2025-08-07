import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateRabbitDto } from './create-rabbit.dto';
import { TypeQueue } from '../../commom/enums/queue-enum';

describe('CreateRabbitDto', () => {
  // DTO base válido para facilitar a criação de payloads de teste
  const validDto = {
    message: 'Olá, esta é uma mensagem de teste.',
    typeQueueRabbit: TypeQueue.SEND_EMAIL_FORGET_PASSWORD,
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(CreateRabbitDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it.each([
    ['message', { ...validDto, message: '' }, 'isNotEmpty'],
    ['message', { ...validDto, message: undefined }, 'isNotEmpty'],
    ['typeQueueRabbit', { ...validDto, typeQueueRabbit: undefined }, 'isNotEmpty'],
    ['typeQueueRabbit', { ...validDto, typeQueueRabbit: 'invalid-queue' }, 'isEnum'],
  ])('deve falhar se a propriedade `%s` for inválida', async (property, invalidDto, constraint) => {
    const dto = plainToInstance(CreateRabbitDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
});