import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTaskDto } from './create-task.dto';

describe('CreateTaskDto', () => {
  // DTO base válido para facilitar a criação de payloads de teste
  const validDto = {
    userOwnerId: 1,
    dateEvent: '2025-08-02',
    startTime: '14:30',
    endTime: '16:00',
    title: 'Título da Tarefa',
    description: 'Descrição da tarefa.',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(CreateTaskDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it.each([
    // Casos para validações de presença (`isNotEmpty`)
    ['userOwnerId', undefined, 'isNotEmpty'],
    ['dateEvent', undefined, 'isNotEmpty'],
    ['title', '', 'isNotEmpty'],
    ['title', undefined, 'isNotEmpty'],
    ['description', '', 'isNotEmpty'],
    ['description', undefined, 'isNotEmpty'],

    // Casos para validações de formato (`isDateString` e `matches`)
    ['dateEvent', 'invalid-date', 'isDateString'],
    ['startTime', '14:3', 'matches'], // Agora o teste espera a restrição 'matches'
    ['startTime', undefined, 'isNotEmpty'],
    ['endTime', '16:', 'matches'], // Agora o teste espera a restrição 'matches'
    ['endTime', undefined, 'isNotEmpty'],
  ])('deve falhar se a propriedade `%s` for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(CreateTaskDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
});