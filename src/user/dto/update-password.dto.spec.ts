import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdatePasswordDto } from './update-password.dto';

describe('UpdatePasswordDto', () => {
  // DTO base válido para facilitar a criação de payloads de teste
  const validDto = {
    email: 'test@example.com',
    password: 'NewPassword123!',
    oldPassword: 'OldPassword456@',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(UpdatePasswordDto, validDto);
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
    const dto = plainToInstance(UpdatePasswordDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });

  // --- Testes de Falha para `password` ---
  it.each([
    ['password', '', 'isNotEmpty'],
    ['password', undefined, 'isNotEmpty'],
    ['password', 'abcde', 'minLength'], // Menos de 6 caracteres
    ['password', 'abcdef', 'matches'], // Sem maiúscula, número ou caractere especial
  ])('deve falhar se a nova senha (`%s`) for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(UpdatePasswordDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });

  // --- Testes de Falha para `oldPassword` ---
  it.each([
    ['oldPassword', '', 'isNotEmpty'],
    ['oldPassword', undefined, 'isNotEmpty'],
    ['oldPassword', 'abcde', 'minLength'], // Menos de 6 caracteres
    ['oldPassword', 'abcdef', 'matches'], // Sem maiúscula, número ou caractere especial
  ])('deve falhar se a senha antiga (`%s`) for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(UpdatePasswordDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
});