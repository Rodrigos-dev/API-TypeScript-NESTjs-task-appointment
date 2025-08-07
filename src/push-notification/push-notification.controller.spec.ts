import { Test, TestingModule } from '@nestjs/testing';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './push-notification.service';
import { SendPushNotificationFirebaseDto } from './dto/send-push-notification-firebase.dto';

// Mock do PushNotificationService para isolar o teste do controller
const mockPushNotificationService = {
  sendPushNotification: jest.fn(),
  delete: jest.fn(),
};

describe('PushNotificationController', () => {
  let controller: PushNotificationController;
  let service: PushNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushNotificationController],
      providers: [
        {
          provide: PushNotificationService,
          useValue: mockPushNotificationService,
        },
      ],
    }).compile();

    controller = module.get<PushNotificationController>(PushNotificationController);
    service = module.get<PushNotificationService>(PushNotificationService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // --- Teste do endpoint POST /push-notification ---
  describe('sendPushNotification', () => {
    it('deve chamar o método sendPushNotification do serviço com o DTO correto', async () => {
      const mockDto: SendPushNotificationFirebaseDto = {
        tokens: ['token1', 'token2'],
        notification: {
          title: 'Novo Título',
          body: 'Nova Mensagem',
        },
        data: {
          acao: 'abrirApp',
        },
      };
      
      const mockResult = { success: true };
      jest.spyOn(service, 'sendPushNotification').mockResolvedValue(mockResult as any);

      const result = await controller.sendPushNotification(mockDto);

      expect(service.sendPushNotification).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResult);
    });
  });

  // --- Teste do endpoint DELETE /push-notification ---
  describe('delete', () => {
    it('deve chamar o método delete do serviço com a lista de IDs correta', async () => {
      const mockPushIds = [1, 2, 3];
      const mockResult = { affected: 3 };
      
      jest.spyOn(service, 'delete').mockResolvedValue(mockResult as any);

      const result = await controller.delete(mockPushIds);

      expect(service.delete).toHaveBeenCalledWith(mockPushIds);
      expect(result).toEqual(mockResult);
    });
  });
});