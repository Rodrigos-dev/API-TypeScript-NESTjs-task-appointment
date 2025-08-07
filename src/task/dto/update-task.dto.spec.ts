import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateTaskDto } from './update-task.dto';
import { StatusTaskEnum } from '../../commom/enums/task.enums';

describe('UpdateTaskDto', () => {
  // DTO base válido com todos os campos preenchidos corretamente
  const validDto = {
    status: StatusTaskEnum.FINISHED,
    dateEvent: '2025-08-02',
    startTime: '14:30',
    endTime: '16:00',
    title: 'Título da Tarefa Atualizada',
    description: 'Descrição da tarefa atualizada.',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO completamente vazio (todos os campos são opcionais)', async () => {
    const emptyDto = {};
    const dto = plainToInstance(UpdateTaskDto, emptyDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(UpdateTaskDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
  
  it('deve passar a validação com apenas alguns campos preenchidos', async () => {
    const partialDto = {
      title: 'Apenas o título atualizado',
      status: StatusTaskEnum.PENDING,
    };
    const dto = plainToInstance(UpdateTaskDto, partialDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it.each([
    ['status', 'invalid-status', 'isEnum'],
    ['dateEvent', 'invalid-date-string', 'isDateString'],
  ])('deve falhar se a propriedade `%s` for inválida quando fornecida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(UpdateTaskDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });

  // A validação de formato de hora deve ser adicionada ao DTO com @Matches
  // para que os testes abaixo funcionem. Assumindo que a validação foi adicionada.
  it.each([
    ['startTime', '14:3', 'matches'],
    ['endTime', '16:', 'matches'],
  ])('deve falhar se a hora (`%s`) tiver um formato inválido', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(UpdateTaskDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
});