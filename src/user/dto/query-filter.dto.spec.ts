import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UserFindAllByQueryDto, UserFindAllDto } from './query-filters.dto';


describe('UserFindAllDto', () => {
  // DTO base válido para facilitar a criação de payloads de teste
  const validDto = {
    page: 1,
    take: 10,
    orderBy: 'DESC',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(UserFindAllDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com um DTO completamente vazio (todos os campos são opcionais)', async () => {
    const emptyDto = {};
    const dto = plainToInstance(UserFindAllDto, emptyDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it('deve falhar se a propriedade `orderBy` for um valor inválido', async () => {
    const invalidDto = { ...validDto, orderBy: 'INVALID' };
    const dto = plainToInstance(UserFindAllDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('orderBy');
    expect(errors[0].constraints).toHaveProperty('isIn');
  });
});

describe('UserFindAllByQueryDto', () => {
  // DTO base válido para facilitar a criação de payloads de teste
  const validDto = {
    userId: 1,
    email: 'teste@example.com',
    name: 'Teste',
    page: 1,
    take: 10,
    orderBy: 'ASC',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(UserFindAllByQueryDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com um DTO completamente vazio', async () => {
    const emptyDto = {};
    const dto = plainToInstance(UserFindAllByQueryDto, emptyDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com apenas alguns campos preenchidos', async () => {
    const partialDto = {
      email: 'outro@email.com',
      orderBy: 'DESC',
    };
    const dto = plainToInstance(UserFindAllByQueryDto, partialDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it.each([
    ['orderBy', 'INVALID', 'isIn'],
  ])('deve falhar se a propriedade `%s` for um valor inválido', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(UserFindAllByQueryDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
});