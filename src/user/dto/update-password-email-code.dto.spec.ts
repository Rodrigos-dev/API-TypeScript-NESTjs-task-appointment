import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdatePasswordEmailCodeDto } from './update-password-email-code.dto';

describe('UpdatePasswordEmailCodeDto', () => {
  // DTO base válido para facilitar a criação de payloads de teste
  const validDto = {
    email: 'test@example.com',
    password: 'Password123!',
    oldPassword: 'OldPassword1!',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(UpdatePasswordEmailCodeDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação se a `oldPassword` for omitida', async () => {
    const dtoWithoutOldPassword = {
      email: 'test@example.com',
      password: 'Password123!',
    };
    const dto = plainToInstance(UpdatePasswordEmailCodeDto, dtoWithoutOldPassword);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha para `email` ---
  it.each([
    ['email', '', 'isNotEmpty'],
    ['email', undefined, 'isNotEmpty'],
    ['email', 'email-invalido', 'isEmail'],
  ])('deve falhar se a propriedade `%s` for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(UpdatePasswordEmailCodeDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });

  // --- Testes de Falha para `password` ---
  it.each([
    ['password', '', 'isNotEmpty'],
    ['password', 'abcde', 'minLength'], // Menos de 6 caracteres
    ['password', 'abcdef', 'matches'], // Sem maiúscula, número ou caractere especial
    ['password', 'abcdef12', 'matches'], // Sem caractere especial
    ['password', 'ABCDEF12', 'matches'], // Sem caractere especial
  ])('deve falhar se a nova senha (`%s`) for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(UpdatePasswordEmailCodeDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });

  // --- Testes de Falha para `oldPassword` (opcional) ---
  it.each([
    ['oldPassword', 'abcde', 'minLength'], // Menos de 6 caracteres
    ['oldPassword', 'abcdef', 'matches'], // Sem maiúscula, número ou caractere especial
    ['oldPassword', 'abcdef12', 'matches'], // Sem caractere especial
    ['oldPassword', 'ABCDEF12', 'matches'], // Sem caractere especial
  ])('deve falhar se a senha antiga (`%s`) for inválida (se fornecida)', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(UpdatePasswordEmailCodeDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
});