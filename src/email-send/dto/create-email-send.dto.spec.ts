import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateEmailSendDto } from './create-email-send.dto';

describe('CreateEmailSendDto', () => {
  const validDto = {
    subject: 'Assunto do email',
    emailTo: 'destino@example.com',
    text: 'Corpo do email',
  };

  // --- Teste de Sucesso ---
  it('deve passar a validação com um DTO válido', async () => {
    const dto = plainToInstance(CreateEmailSendDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it.each([
    ['subject', { ...validDto, subject: '' }],
    ['emailTo', { ...validDto, emailTo: '' }],
    ['text', { ...validDto, text: '' }],
  ])('deve falhar se a propriedade `%s` estiver vazia', async (property, invalidDto) => {
    const dto = plainToInstance(CreateEmailSendDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it.each([
    ['subject', { ...validDto, subject: undefined }],
    ['emailTo', { ...validDto, emailTo: undefined }],
    ['text', { ...validDto, text: undefined }],
  ])('deve falhar se a propriedade `%s` estiver ausente', async (property, invalidDto) => {
    const dto = plainToInstance(CreateEmailSendDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});