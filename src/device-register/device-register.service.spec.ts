import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeviceRegisterService } from './device-register.service';
import { DeviceRegister, SystemType } from './entities/device-register.entity';
import loggers from 'src/commom/utils/loggers';
import exceptions from 'src/commom/utils/exceptions';
import { Repository } from 'typeorm';

const mockDeviceRegister = {
  id: 1,
  userId: 123,
  token: 'mock-token',
  systemType: SystemType.ANDROID
};

const mockCreateDeviceRegisterDto = {
  userId: 123,
  token: 'new-mock-token',
  systemType: SystemType.IOS
};

const mockUpdateDeviceRegisterDto = {
  token: 'updated-token'
};

describe('DeviceRegisterService', () => {
  let service: DeviceRegisterService;
  let repository: Repository<DeviceRegister>;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  };

  jest.spyOn(loggers, 'loggerMessage').mockImplementation(async () => {});
  jest.spyOn(exceptions, 'exceptionsReturn').mockImplementation((err) => {
    throw err;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceRegisterService,
        {
          provide: getRepositoryToken(DeviceRegister),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DeviceRegisterService>(DeviceRegisterService);
    repository = module.get<Repository<DeviceRegister>>(getRepositoryToken(DeviceRegister));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdateRegisterToken', () => {
    it('deve criar um novo registro se o usuário não existir', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue({ ...mockDeviceRegister, ...mockCreateDeviceRegisterDto });

      const result = await service.createOrUpdateRegisterToken(mockCreateDeviceRegisterDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { userId: mockCreateDeviceRegisterDto.userId } });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        userId: mockCreateDeviceRegisterDto.userId,
        token: mockCreateDeviceRegisterDto.token,
        systemType: mockCreateDeviceRegisterDto.systemType,
      }));
      expect(result).toEqual({ ...mockDeviceRegister, ...mockCreateDeviceRegisterDto });
    });

    it('deve atualizar um registro existente se o usuário já existir', async () => {
      mockRepository.findOne.mockResolvedValue(mockDeviceRegister);
      mockRepository.save.mockResolvedValue({ ...mockDeviceRegister, token: mockUpdateDeviceRegisterDto.token });

      const result = await service.createOrUpdateRegisterToken({ ...mockDeviceRegister, ...mockUpdateDeviceRegisterDto });

      expect(repository.findOne).toHaveBeenCalledWith({ where: { userId: mockDeviceRegister.userId } });
      expect(repository.save).toHaveBeenCalledWith({ ...mockUpdateDeviceRegisterDto, id: mockDeviceRegister.id });
      expect(result).toEqual({ ...mockDeviceRegister, token: mockUpdateDeviceRegisterDto.token });
    });

    it('deve lançar uma exceção se o userId não for enviado', async () => {
      await expect(service.createOrUpdateRegisterToken({ userId: null, token: 'token' } as any))
        .rejects.toThrow(new HttpException('User Id deve ser enviado', HttpStatus.BAD_REQUEST));
      //expect(loggers.loggerMessage).toHaveBeenCalledWith('error', 'User Id deve ser enviado');
    });

    it('deve lançar uma exceção se o token não for enviado', async () => {
      await expect(service.createOrUpdateRegisterToken({ userId: 123, token: null } as any))
        .rejects.toThrow(new HttpException('Token deve ser enviado', HttpStatus.BAD_REQUEST));
    });

    it('deve tratar exceções do repositório e chamar exceptionsReturn', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.createOrUpdateRegisterToken(mockCreateDeviceRegisterDto)).rejects.toThrow(error);
      expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
    });
  });

  describe('findAllTokenRegisters', () => {
    it('deve retornar todos os registros com paginação e ordenação', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockDeviceRegister], 1]);
      const queryParams = { page: 1, take: 10, orderBy: 'ASC' as 'ASC' | 'DESC' };

      const result = await service.findAllTokenRegisters(queryParams);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { id: 'ASC' },
      });
      expect(result).toEqual([{ total: 1, tokenRegisters: [mockDeviceRegister] }]);
    });

    it('deve usar valores padrão se os parâmetros não forem fornecidos', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
      const queryParams = { page: null, take: null, orderBy: null } as any;

      const result = await service.findAllTokenRegisters(queryParams);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { id: 'DESC' },
      });
      expect(result).toEqual([{ total: 0, tokenRegisters: [] }]);
    });

    it('deve tratar exceções do repositório e chamar exceptionsReturn', async () => {
      const error = new Error('Database error');
      mockRepository.findAndCount.mockRejectedValue(error);
      const queryParams = { page: 1, take: 10, orderBy: 'DESC' as 'ASC' | 'DESC' };

      await expect(service.findAllTokenRegisters(queryParams)).rejects.toThrow(error);
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
      expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
    });
  });

  describe('getOneByUserOwnerRegisterId', () => {
    it('deve retornar o registro se ele for encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(mockDeviceRegister);

      const result = await service.getOneByUserOwnerRegisterId(mockDeviceRegister.userId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { userId: mockDeviceRegister.userId } });
      expect(result).toEqual(mockDeviceRegister);
    });

    it('deve lançar uma exceção se o registro não for encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getOneByUserOwnerRegisterId(999)).rejects.toThrow(
        new HttpException(`Registro não encontrado user: 999`, HttpStatus.BAD_REQUEST)
      );
    });

    it('deve tratar exceções do repositório e chamar exceptionsReturn', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.getOneByUserOwnerRegisterId(mockDeviceRegister.userId)).rejects.toThrow(error);
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
      expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
    });
  });

  describe('remove', () => {
    it('deve remover o registro se ele for encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(mockDeviceRegister);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockDeviceRegister.userId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { userId: mockDeviceRegister.userId } });
      expect(repository.delete).toHaveBeenCalledWith(mockDeviceRegister.id);
      expect(result).toEqual({ affected: 1 });
    });

    it('deve lançar uma exceção se o registro não for encontrado para remoção', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new HttpException(`Registro não encontrado `, HttpStatus.BAD_REQUEST)
      );
    });

    it('deve tratar exceções do repositório e chamar exceptionsReturn', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.remove(mockDeviceRegister.userId)).rejects.toThrow(error);
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
      expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
    });
  });
});