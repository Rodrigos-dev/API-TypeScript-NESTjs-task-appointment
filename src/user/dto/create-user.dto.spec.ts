import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { AvatarDto } from './avatar.dto';

// Mock do AvatarDto para o teste
// Usamos um DTO válido para aninhar e testar a validação
const validAvatarDto = {
  avatarName: 'Meu Avatar',
  base64: 'data:image/png;base64,iVBORw0KGgo...',
  mimeType: 'image/png',
};

describe('CreateUserDto', () => {
  // DTO base válido para facilitar a criação de payloads de teste
  const validDto = {
    name: 'João da Silva',
    email: 'joao.silva@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    avatar: validAvatarDto,
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(CreateUserDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com um DTO válido e sem o campo `avatar` (opcional)', async () => {
    const dtoWithoutAvatar = {
      name: 'João da Silva',
      email: 'joao.silva@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    const dto = plainToInstance(CreateUserDto, dtoWithoutAvatar);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha para `name` ---
  it.each([
    ['name', '', 'isNotEmpty'],
    ['name', undefined, 'isNotEmpty'],
  ])('deve falhar se a propriedade `%s` for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(CreateUserDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });

  // --- Testes de Falha para `email` ---
  it.each([
    ['email', '', 'isNotEmpty'],
    ['email', undefined, 'isNotEmpty'],
    ['email', 'email-invalido', 'isEmail'],
  ])('deve falhar se a propriedade `%s` for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(CreateUserDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });

  // --- Testes de Falha para `password` e `confirmPassword` ---
  it.each([
    ['password', '', 'isNotEmpty'],
    ['password', undefined, 'isNotEmpty'],
    ['password', 'abcde', 'minLength'], // Menos de 6 caracteres
    ['password', 'abcdef', 'matches'], // Sem maiúscula, número ou caractere especial
    ['confirmPassword', '', 'isNotEmpty'],
    ['confirmPassword', undefined, 'isNotEmpty'],
    ['confirmPassword', 'abcde', 'minLength'],
    ['confirmPassword', 'abcdef', 'matches'],
  ])('deve falhar se a senha ou confirmação (`%s`) for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(CreateUserDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
  
  it('deve falhar se o DTO aninhado (`avatar`) for inválido (se fornecido)', async () => {
    // avatarName ausente, o que causa uma falha de validação no AvatarDto
    const invalidAvatar = { ...validAvatarDto, avatarName: '' };
    const invalidDto = { ...validDto, avatar: invalidAvatar };
    const dto = plainToInstance(CreateUserDto, invalidDto);
    const errors = await validate(dto);

    // O erro principal é para a propriedade 'avatar'
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('avatar');

    // O erro aninhado está no `children` do erro principal
    expect(errors[0].children).toHaveLength(1);
    expect(errors[0].children[0].property).toBe('avatarName');
    expect(errors[0].children[0].constraints).toHaveProperty('isNotEmpty');
  });
});