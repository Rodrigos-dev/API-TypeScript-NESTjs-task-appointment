import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PeriodTasksEnum, StatusTaskEnum } from '../../commom/enums/task.enums';
import { TaskFindAllDto, TasksPeriodFindDto } from './task-query-filters.dto';

//dto filter find all
describe('TaskFindAllDto', () => {
  const validDto = {
    userOwnerId: 1,
    status: StatusTaskEnum.PENDING,
    dateEvent: '2025-08-02',
    title: 'Título de busca',
    description: 'Descrição de busca',
    page: 1,
    take: 10,
    orderBy: 'ASC',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(TaskFindAllDto, validDto) as any;
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com um DTO completamente vazio (todos os campos são opcionais)', async () => {
    const emptyDto = {};
    const dto = plainToInstance(TaskFindAllDto, emptyDto) as any;
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com apenas alguns campos preenchidos', async () => {
    const partialDto = {
      userOwnerId: 1,
      status: StatusTaskEnum.FINISHED,
    };
    const dto = plainToInstance(TaskFindAllDto, partialDto) as any;
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it.each([
    ['status', 'invalid-status', 'isEnum'],
    ['dateEvent', 'invalid-date-string', 'isDateString'],
    ['orderBy', 'INVALID', 'isIn'],
  ])('deve falhar se a propriedade `%s` for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(TaskFindAllDto, invalidDto) as any;
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
});


//dto filter all by period
describe('TasksPeriodFindDto', () => {
  const validDto = {
    userOwnerId: 1,
    status: StatusTaskEnum.PENDING,
    period: PeriodTasksEnum.DAY,
    page: 1,
    take: 10,
    orderBy: 'ASC',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(TasksPeriodFindDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com apenas a propriedade `period` (obrigatória)', async () => {
    const dto = plainToInstance(TasksPeriodFindDto, { period: PeriodTasksEnum.WEEK });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it('deve falhar se a propriedade `period` estiver ausente', async () => {
    const invalidDto = { ...validDto, period: undefined };
    const dto = plainToInstance(TasksPeriodFindDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('period');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it.each([
    ['status', 'invalid-status', 'isEnum'],
    ['period', 'invalid-period', 'isEnum'],
    ['orderBy', 'INVALID', 'isIn'],
  ])('deve falhar se a propriedade `%s` for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(TasksPeriodFindDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
});