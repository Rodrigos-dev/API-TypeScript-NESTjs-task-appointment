import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';
import { RoleEnum } from 'src/commom/enums/user-enums';
import { AvatarDto } from './avatar.dto';

// Mock do AvatarDto para o teste
// Usamos um DTO válido para aninhar e testar a validação
const validAvatarDto = {
  avatarName: 'Meu Avatar',
  base64: 'data:image/png;base64,iVBORw0KGgo...',
  mimeType: 'image/png',
};

describe('UpdateUserDto', () => {
  // DTO base válido com todos os campos preenchidos corretamente
  const validDto = {
    name: 'João da Silva',
    email: 'joao.silva@example.com',
    role: RoleEnum.USER,
    avatar: validAvatarDto,
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO completamente vazio (todos os campos são opcionais)', async () => {
    const emptyDto = {};
    const dto = plainToInstance(UpdateUserDto, emptyDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com um DTO válido e completo', async () => {
    const dto = plainToInstance(UpdateUserDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com apenas alguns campos preenchidos', async () => {
    const partialDto = {
      name: 'Maria',
      role: RoleEnum.ADMIN,
    };
    const dto = plainToInstance(UpdateUserDto, partialDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it.each([
    ['email', 'email-invalido', 'isEmail'],
    ['role', 'invalid-role', 'isEnum'],
  ])('deve falhar se a propriedade `%s` for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(UpdateUserDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });
  
  it('deve falhar se o DTO aninhado (`avatar`) for inválido', async () => {
    // avatarName ausente, o que causa uma falha de validação no AvatarDto
    const invalidAvatar = { ...validAvatarDto, avatarName: '' };
    const invalidDto = { ...validDto, avatar: invalidAvatar };
    const dto = plainToInstance(UpdateUserDto, invalidDto);
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