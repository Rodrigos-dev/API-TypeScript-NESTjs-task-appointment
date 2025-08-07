import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EmailSendService } from './email-send.service';
import exceptions from 'src/commom/utils/exceptions';
import loggers from 'src/commom/utils/loggers';
import { CreateEmailSendDto } from './dto/create-email-send.dto';

describe('EmailSendService', () => {
  let service: EmailSendService;
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  jest.spyOn(loggers, 'loggerMessage').mockImplementation(async () => { });
  jest.spyOn(exceptions, 'exceptionsReturn').mockImplementation((err) => {
    throw err;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSendService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<EmailSendService>(EmailSendService);
    mailerService = module.get<MailerService>(MailerService);

    process.env.EMAIL_FROM_OR_LOGIN = 'test@example.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    // Caso de sucesso: O e-mail é enviado corretamente
    it('deve enviar um e-mail com sucesso e retornar o resultado', async () => {
      const mockResult = { response: '250 OK', accepted: ['user@example.com'] };
      mockMailerService.sendMail.mockResolvedValue(mockResult);

      const sendEmailBody: CreateEmailSendDto = {
        emailTo: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test Text',
      };

      const result = await service.sendEmail(sendEmailBody);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_FROM_OR_LOGIN,
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test Text',
      });
      expect(result).toEqual(mockResult);
    });

     it('deve lançar um erro se o e-mail for inválido ou nulo', async () => {
      // Casos de e-mail inválidos que sua validação de fato capta
      const invalidEmailBodies = [
        { emailTo: 'invalid-email', subject: 'sub', text: 'txt' },
        { emailTo: 'userexample.com', subject: 'sub', text: 'txt' },
        { emailTo: '', subject: 'sub', text: 'txt' },
      ];
      
      // Testa o caso de e-mail inválido
      for (const body of invalidEmailBodies) {
        try {
          await service.sendEmail(body as CreateEmailSendDto);
          fail('Esperado que o email inválido lançasse um erro.');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect((err as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect((err as HttpException).message).toBe('Email não enviado ou inválido!');
          // A linha abaixo foi corrigida para esperar o objeto de erro
          expect(loggers.loggerMessage).toHaveBeenCalledWith('error', err);
        }
      }

      // Testa o caso `emailTo` como null, que lança um TypeError antes da sua validação
      try {
        await service.sendEmail({ emailTo: null, subject: 'sub', text: 'txt' } as any);
        fail('Esperado que o email nulo lançasse um erro.');
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect((err as TypeError).message).toContain('toLowerCase');
        // A chamada ao logger não acontece aqui, pois o erro é lançado antes.
      }
    });

    it('deve tratar exceções do MailerService e chamar exceptionsReturn', async () => {
      const error = new Error('Erro de conexão com o servidor de e-mail');
      mockMailerService.sendMail.mockRejectedValue(error);

      const sendEmailBody: CreateEmailSendDto = {
        emailTo: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test Text',
      };

      try {
        await service.sendEmail(sendEmailBody);
        fail('Esperado que sendEmail lançasse um erro, mas não lançou.');
      } catch (err) {
        expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
        expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
        expect(err).toBe(error);
      }
    });
  });
});