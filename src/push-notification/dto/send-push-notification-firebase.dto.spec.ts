import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SendPushNotificationFirebaseDto } from './send-push-notification-firebase.dto';

describe('SendPushNotificationFirebaseDto', () => {
  // Payload de notificação válido para uso nos testes
  const validNotificationPayload = {
    title: 'Título do Teste',
    body: 'Corpo da mensagem de teste.',
    imageUrl: 'https://example.com/image.jpg',
  };

  // DTO base válido para facilitar a criação de payloads de teste
  const validDto = {
    tokens: ['token1', 'token2'],
    notification: validNotificationPayload,
    data: { key1: 'value1' },
    icon: 'https://example.com/icon.png',
  };

  // --- Testes de Sucesso ---
  it('deve passar a validação com um DTO completo e válido', async () => {
    const dto = plainToInstance(SendPushNotificationFirebaseDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com campos opcionais ausentes', async () => {
    const partialDto = {
      tokens: ['token1'],
      notification: {
        title: 'Título',
        body: 'Corpo',
      },
    };
    const dto = plainToInstance(SendPushNotificationFirebaseDto, partialDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve passar a validação com um array de tokens vazio', async () => {
    const dto = plainToInstance(SendPushNotificationFirebaseDto, {
      ...validDto,
      tokens: [],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // --- Testes de Falha ---
  it.each([
    ['tokens', 'not-an-array', 'isArray'],
    ['tokens', [123, 'token2'], 'isString'],
  ])('deve falhar se a propriedade `%s` for inválida', async (property, value, constraint) => {
    const invalidDto = { ...validDto, [property]: value };
    const dto = plainToInstance(SendPushNotificationFirebaseDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(errors[0].constraints).toHaveProperty(constraint);
  });

  it('deve falhar se a propriedade `notification` estiver ausente', async () => {
    const invalidDto = { ...validDto, notification: undefined };
    const dto = plainToInstance(SendPushNotificationFirebaseDto, invalidDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('notification');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it.each([
    ['title', 123, 'isString'],
    ['body', '', 'isNotEmpty'],
  ])('deve falhar se a notificação aninhada tiver a propriedade `%s` inválida', async (property, value, constraint) => {
    const invalidNotification = { ...validNotificationPayload, [property]: value };
    const invalidDto = { ...validDto, notification: invalidNotification };
    const dto = plainToInstance(SendPushNotificationFirebaseDto, invalidDto);
    const errors = await validate(dto);
    
    // Erro principal: `notification`
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('notification');

    // Erro aninhado: propriedade inválida dentro de `notification`
    expect(errors[0].children).toHaveLength(1);
    expect(errors[0].children[0].property).toBe(property);
    expect(errors[0].children[0].constraints).toHaveProperty(constraint);
  });
});