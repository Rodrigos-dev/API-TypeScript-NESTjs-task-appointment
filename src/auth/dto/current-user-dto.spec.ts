import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer'; // Importe o plainToInstance
import { CurrentUserDto } from './current-user-dto';

describe('CurrentUserDto', () => {
  // Use um objeto simples para criar as instâncias do DTO
  const baseDto = {
    sub: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
  };

  // --- Teste de Sucesso ---
  it('deve passar a validação com um DTO válido', async () => {
    const dtoInstance = plainToInstance(CurrentUserDto, baseDto);
    const errors = await validate(dtoInstance);
    expect(errors.length).toBe(0);
  });

  // --- Testes de Falha para `sub` ---
  it('deve falhar se `sub` estiver ausente', async () => {
    // Crie uma cópia do DTO e remova a propriedade
    const dtoWithoutSub = { ...baseDto, sub: undefined };
    const dtoInstance = plainToInstance(CurrentUserDto, dtoWithoutSub);

    const errors = await validate(dtoInstance);
    
    // Agora o teste vai funcionar como esperado
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  // --- Testes de Falha para `username` ---
  it('deve falhar se `username` estiver ausente', async () => {
    const dtoWithoutUsername = { ...baseDto, username: undefined };
    const dtoInstance = plainToInstance(CurrentUserDto, dtoWithoutUsername);

    const errors = await validate(dtoInstance);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  // --- Testes de Falha para `email` ---
  it('deve falhar se `email` estiver ausente', async () => {
    const dtoWithoutEmail = { ...baseDto, email: undefined };
    const dtoInstance = plainToInstance(CurrentUserDto, dtoWithoutEmail);

    const errors = await validate(dtoInstance);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
  
  // --- Testes de Falha para `role` ---
  it('deve falhar se `role` estiver ausente', async () => {
    const dtoWithoutRole = { ...baseDto, role: undefined };
    const dtoInstance = plainToInstance(CurrentUserDto, dtoWithoutRole);

    const errors = await validate(dtoInstance);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});