import { Test, TestingModule } from '@nestjs/testing';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import { RabbitService } from './rabbit.service';
import { EmailSendService } from 'src/email-send/email-send.service';
import loggers from 'src/commom/utils/loggers';
import { CreateRabbitDto, TypeQueueRabbit } from './dto/create-rabbit.dto';

// Mocks das dependências externas
const mockAmqpConnection = {
  publish: jest.fn(),
};

const mockEmailSendService = {
  sendEmail: jest.fn(),
};

describe('RabbitService', () => {
  let service: RabbitService;
  let amqpConnection: AmqpConnection;
  let emailSendService: EmailSendService;

  // Mock do logger para evitar saída no console durante os testes
  jest.spyOn(loggers, 'loggerMessage').mockImplementation(async () => { });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitService,
        {
          provide: AmqpConnection,
          useValue: mockAmqpConnection,
        },
        {
          provide: EmailSendService,
          useValue: mockEmailSendService,
        },
      ],
    }).compile();

    service = module.get<RabbitService>(RabbitService);
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
    emailSendService = module.get<EmailSendService>(EmailSendService);
  });

  // Limpa os mocks após cada teste para evitar "vazamento" de estado
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve publicar uma mensagem na fila com os dados corretos', async () => {
      // Mock da resposta do amqpConnection.publish
      mockAmqpConnection.publish.mockResolvedValue(true);

      const createRabbitDto: CreateRabbitDto = {
        message: '{"to": "test@example.com", "subject": "Test", "text": "Hello"}',
        typeQueueRabbit: TypeQueueRabbit.SEND_EMAIL_FORGET_PASSWORD,
      };

      await service.create(createRabbitDto);

      // Verifica se o publish foi chamado com os parâmetros esperados
      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'amq.direct',
        'send-email-forget-password',
        {
          message: createRabbitDto.message,
          typeQueuRabbit: createRabbitDto.typeQueueRabbit,
        },
      );
    });
  });

  describe('consume', () => {
    // Teste para o cenário de sucesso do consumo da fila
    it('deve enviar o email com sucesso e retornar Nack(false)', async () => {
      // Mock da mensagem recebida
      const message = { message: '{"to": "test@example.com", "subject": "Test", "text": "Hello"}' };

      // Configura o mock do serviço de e-mail para resolver com sucesso
      mockEmailSendService.sendEmail.mockResolvedValue(true);

      // Chama o método consume
      const result = await service.consume(message);

      // Verifica se o serviço de e-mail foi chamado com os dados corretos
      expect(emailSendService.sendEmail).toHaveBeenCalledWith(JSON.parse(message.message));
      // Verifica se a mensagem de log de sucesso foi chamada
      expect(loggers.loggerMessage).toHaveBeenCalledWith('info', 'Email enviado com sussesso');
      // Verifica se o Nack(false) foi retornado para confirmar o processamento
      expect(result).toEqual(new Nack(false));
    });

    // Teste para o cenário de erro do consumo da fila
    it('deve capturar o erro, logar e retornar Nack(false)', async () => {
      // Mock da mensagem recebida
      const message = { message: '{"to": "test@example.com", "subject": "Test", "text": "Hello"}' };
      // Cria um erro simulado
      const error = new Error('Falha no envio do email');

      // Configura o mock do serviço de e-mail para lançar um erro
      mockEmailSendService.sendEmail.mockRejectedValue(error);

      // Chama o método consume
      const result = await service.consume(message);

      // Verifica se o serviço de e-mail foi chamado (mesmo com o erro)
      expect(emailSendService.sendEmail).toHaveBeenCalledWith(JSON.parse(message.message));
      // Verifica se a mensagem de log de erro foi chamada
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
      // Verifica se o Nack(false) foi retornado para evitar que a mensagem seja requeued
      expect(result).toEqual(new Nack(false));
    });
  });
});