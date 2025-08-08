import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AvatarDto } from './avatar.dto';

describe('AvatarDto', () => {
  // DTO base válido para facilitar a criação de payloads de teste
  const validDto = {
    avatarName: 'Meu Avatar',
    base64: 'data:image/png;base64,iVBORw0KGgo...',
    mimeType: 'image/png',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(AvatarDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com um DTO que contém a propriedade opcional `urlAvatar`', async () => {
    const dtoWithOptional = {
      ...validDto,
      urlAvatar: 'http://example.com/avatar.png',
    };
    const dto = plainToInstance(AvatarDto, dtoWithOptional);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it.each([
    ['avatarName', '', 'isNotEmpty'],
    ['avatarName', undefined, 'isNotEmpty'],
    ['base64', '', 'isNotEmpty'],
    ['base64', undefined, 'isNotEmpty'],
    ['mimeType', '', 'isNotEmpty'],
    ['mimeType', undefined, 'isNotEmpty'],
  ])('deve falhar se a propriedade `%s` for inválida (vazia ou ausente)', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(AvatarDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
});