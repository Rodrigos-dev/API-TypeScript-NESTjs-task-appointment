import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PushNotificationService } from './push-notification.service';
import { PushNotification } from './entities/push-notification.entity';
import { DeviceRegister } from 'src/device-register/entities/device-register.entity';
import { Repository } from 'typeorm';
import loggers from 'src/commom/utils/loggers';
import exceptions from 'src/commom/utils/exceptions';
import index from '../commom/firebase';
import { SendPushNotificationFirebaseDto } from './dto/send-push-notification-firebase.dto';

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let pushNotificationRepository: Repository<PushNotification>;
  let deviceRegisterRepository: Repository<DeviceRegister>;

  // Mock dos repositórios e serviços externos
  const mockPushNotificationRepository = {
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockDeviceRegisterRepository = {
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockFirebaseIndex = {
    postPushNotification: jest.fn(),
  };

  jest.spyOn(loggers, 'loggerMessage').mockImplementation(async () => {});
  jest.spyOn(exceptions, 'exceptionsReturn').mockImplementation((err) => {
    throw err;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushNotificationService,
        {
          provide: getRepositoryToken(PushNotification),
          useValue: mockPushNotificationRepository,
        },
        {
          provide: getRepositoryToken(DeviceRegister),
          useValue: mockDeviceRegisterRepository,
        },
      ],
    }).compile();

    service = module.get<PushNotificationService>(PushNotificationService);
    pushNotificationRepository = module.get<Repository<PushNotification>>(getRepositoryToken(PushNotification));
    deviceRegisterRepository = module.get<Repository<DeviceRegister>>(getRepositoryToken(DeviceRegister));

    // Força o mock do módulo 'index'
    Object.assign(index, mockFirebaseIndex);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('sendPushNotification', () => {

    it('deve enviar push notifications para tokens específicos e salvar no DB', async () => {
      const data: SendPushNotificationFirebaseDto = {
        tokens: ['token1', 'token2'],
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: 'https://test.com/image.jpg',
        },
      };

      const mockUsers = [
        { userId: 1, token: 'token1' },
        { userId: 2, token: 'token2' },
      ];

      jest.spyOn(deviceRegisterRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      } as any);

      await service.sendPushNotification(data);

      expect(deviceRegisterRepository.createQueryBuilder).toHaveBeenCalledWith('tokensRegistereds');
      expect(mockFirebaseIndex.postPushNotification).toHaveBeenCalledWith(data);
      expect(mockPushNotificationRepository.save).toHaveBeenCalledTimes(1);
    });

    it('deve salvar push notifications com valores nulos para icon e imageUrl quando não fornecidos', async () => {
      const data: SendPushNotificationFirebaseDto = {
        tokens: ['token1'],
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: undefined, // Simula a falta de imageUrl
        },
        icon: undefined, // Simula a falta de icon
      };

      const mockUsers = [{ userId: 1, token: 'token1' }];
      jest.spyOn(deviceRegisterRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      } as any);

      await service.sendPushNotification(data);

      expect(mockPushNotificationRepository.save).toHaveBeenCalledTimes(1);
      expect(mockPushNotificationRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: 1,
            title: 'Test Title',
            message: 'Test Body',
            imageUrl: null, // Espera-se 'null' aqui
            icon: null, // Espera-se 'null' aqui
            allUsers: false,
          }),
        ]),
      );
    });

    it('deve enviar push notifications para todos os usuários e salvar no DB', async () => {
      const data: SendPushNotificationFirebaseDto = {
        tokens: [],
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: 'https://test.com/image.jpg',
        },
      };

      const mockRegisteredTokensPage1 = [{ token: 'token1', userId: 1 }];
      const mockRegisteredTokensPage2 = [{ token: 'token2', userId: 2 }];
      const mockRegisteredTokensPage3 = []; // Simula o fim da paginação

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(mockRegisteredTokensPage1)
          .mockResolvedValueOnce(mockRegisteredTokensPage2)
          .mockResolvedValueOnce(mockRegisteredTokensPage3),
      };

      jest.spyOn(deviceRegisterRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.sendPushNotification(data);

      expect(deviceRegisterRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalledTimes(3);
      expect(mockFirebaseIndex.postPushNotification).toHaveBeenCalledTimes(2);
      expect(mockPushNotificationRepository.save).toHaveBeenCalledTimes(1);
      expect(mockPushNotificationRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ userId: 1, allUsers: true }),
          expect.objectContaining({ userId: 2, allUsers: true }),
        ])
      );
    });

    it('deve deletar a url da imagem se ela for uma string vazia', async () => {
      const data: SendPushNotificationFirebaseDto = {
        tokens: ['token1'],
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: '',
        },
      };

      const mockUsers = [{ userId: 1, token: 'token1' }];
      jest.spyOn(deviceRegisterRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      } as any);

      await service.sendPushNotification(data);

      // Verifica se a propriedade imageUrl foi deletada
      expect(data.notification.imageUrl).toBeUndefined();
    });

    it('deve deletar a propriedade de data se ela não for enviada', async () => {
      const data: SendPushNotificationFirebaseDto = {
        tokens: ['token1'],
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: 'https://test.com/image.jpg',
        },
      };
      
      const mockUsers = [{ userId: 1, token: 'token1' }];
      jest.spyOn(deviceRegisterRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      } as any);
      
      await service.sendPushNotification(data);

      // Verifica se a propriedade `data` foi deletada
      expect(data.data).toBeUndefined();
    });

    it('deve lançar erro se o título estiver ausente', async () => {
      const data: SendPushNotificationFirebaseDto = {
        tokens: [],
        notification: {
          title: '',
          body: 'Test Body',
          imageUrl: 'https://test.com/image.jpg',
        },
      };

      await expect(service.sendPushNotification(data)).rejects.toThrow(
        new HttpException('message must have a title', HttpStatus.BAD_REQUEST)
      );
    });

    it('deve lançar erro se o corpo estiver ausente', async () => {
      const data: SendPushNotificationFirebaseDto = {
        tokens: [],
        notification: {
          title: 'Test Title',
          body: '',
          imageUrl: 'https://test.com/image.jpg',
        },
      };

      await expect(service.sendPushNotification(data)).rejects.toThrow(
        new HttpException('message must have a body', HttpStatus.BAD_REQUEST)
      );
    });

    it('deve lançar erro se a URL da imagem for inválida', async () => {
      const data: SendPushNotificationFirebaseDto = {
        tokens: [],
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: 'invalid-url', // URL inválida
        },
      };

      await expect(service.sendPushNotification(data)).rejects.toThrow(
        new HttpException('message must have a url valid https://.....-.com or send \'\' cause not have a url', HttpStatus.BAD_REQUEST)
      );
    });
    
    it('deve lançar erro se o número de tokens for superior a 499', async () => {
      const data: SendPushNotificationFirebaseDto = {
        tokens: new Array(500).fill('token'),
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: 'https://test.com/image.jpg',
        },
      };
    
      try {
        await service.sendPushNotification(data);
        fail('A promessa deveria ter sido rejeitada.');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect((err as HttpException).message).toBe('only 500 tokens each time');
        expect(loggers.loggerMessage).toHaveBeenCalledWith('error', err);
      }
    });

    it('deve tratar exceções do repositório', async () => {
      const error = new Error('Database connection error');
      
      const data: SendPushNotificationFirebaseDto = {
        tokens: ['token1'],
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: 'https://test.com/image.jpg',
        },
      };
      
      jest.spyOn(deviceRegisterRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(error),
      } as any);

      await expect(service.sendPushNotification(data)).rejects.toThrow(error);
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
      expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
    });

    it('deve tratar erro na postagem da push notification para todos os usuários', async () => {
      const error = new Error('Firebase post error');
      const data: SendPushNotificationFirebaseDto = {
        tokens: [],
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: 'https://test.com/image.jpg',
        },
      };
      const mockRegisteredTokensPage1 = [{ token: 'token1', userId: 1 }];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(mockRegisteredTokensPage1)
          .mockResolvedValueOnce([]),
      };

      jest.spyOn(deviceRegisterRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(index, 'postPushNotification').mockRejectedValue(error);

      await expect(service.sendPushNotification(data)).rejects.toThrow(error);
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
      expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
    });

    it('deve tratar erro na postagem da push notification para todos os usuários', async () => {
      const error = new Error('Firebase post error');
      const data: SendPushNotificationFirebaseDto = {
        tokens: [],
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          imageUrl: 'https://test.com/image.jpg',
        },
      };
      const mockRegisteredTokensPage1 = [{ token: 'token1', userId: 1 }];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(mockRegisteredTokensPage1)
          .mockResolvedValueOnce([]),
      };

      jest.spyOn(deviceRegisterRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(index, 'postPushNotification').mockRejectedValue(error);

      await expect(service.sendPushNotification(data)).rejects.toThrow(error);
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
      expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
    });   

    
  });

  describe('delete', () => {

    it('deve deletar as push notifications com sucesso', async () => {
      const pushIds = [1, 2, 3];
      mockPushNotificationRepository.delete.mockResolvedValue({ affected: 3 });

      const result = await service.delete(pushIds);
      
      expect(mockPushNotificationRepository.delete).toHaveBeenCalledWith(pushIds);
      expect(result).toEqual({ affected: 3 });
    });

    it('deve lançar erro se nenhum ID for fornecido', async () => {
      const pushIds = [];

      await expect(service.delete(pushIds)).rejects.toThrow(
        new HttpException('Id ou ids doa notificação a ser deletada deve ser enviada/s', HttpStatus.BAD_REQUEST)
      );
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', 'Id ou ids doa notificação a ser deletada deve ser enviada/s');
    });

    it('deve tratar exceções do repositório', async () => {
      const error = new Error('Database error');
      const pushIds = [1];
      mockPushNotificationRepository.delete.mockRejectedValue(error);

      await expect(service.delete(pushIds)).rejects.toThrow(error);
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
      expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
    });
  });
});