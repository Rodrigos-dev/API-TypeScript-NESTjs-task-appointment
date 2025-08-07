import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUserDto } from 'src/auth/dto/current-user-dto';
import { UserFindAllByQueryDto, UserFindAllDto } from './dto/query-filters.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePasswordEmailCodeDto } from './dto/update-password-email-code.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as loggers from 'src/commom/utils/loggers';

// Mock do UserService
const mockUserService = {
  create: jest.fn(),
  forgetedPassword: jest.fn(),
  updatePassword: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOneByEmail: jest.fn(),
  findAllByQuery: jest.fn(),
  remove: jest.fn(),
  removeAvatarImage: jest.fn(),
};

// O mock agora tem uma estrutura simples, que corresponde ao namespace
jest.mock('src/commom/utils/loggers', () => ({
  default: {
    loggerMessage: jest.fn(),
  },
}));

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  const mockUserReq: CurrentUserDto = {
    sub: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
  };

  describe('create', () => {
    it('deve chamar o método create do serviço com o DTO correto', async () => {
      const mockDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      const mockResult = { id: 1, ...mockDto };
      jest.spyOn(service, 'create').mockResolvedValue(mockResult as any);

      const result = await controller.create(mockDto);
      expect(service.create).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('forgetedPassword', () => {
    it('deve chamar o método forgetedPassword do serviço com o DTO correto', async () => {
      const mockDto: ForgetPasswordDto = { email: 'test@example.com' };
      jest.spyOn(service, 'forgetedPassword').mockResolvedValue(undefined);

      await controller.forgetedPassword(mockDto);
      expect(service.forgetedPassword).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('updatePasswordByCodeEmail', () => {
    it('deve chamar o método updatePassword do serviço se o código for enviado', async () => {
      const mockCode = '123456';
      const mockDto: UpdatePasswordEmailCodeDto = {
        email: 'test@example.com',
        password: 'NewPassword123!',
      };
      jest.spyOn(service, 'updatePassword').mockResolvedValue(undefined);

      await controller.updatePasswordByCodeEmail(mockCode, mockDto);
      expect(service.updatePassword).toHaveBeenCalledWith(mockDto, mockCode);
    });

    it('deve lançar um HttpException se o código não for enviado', async () => {
      const mockDto: UpdatePasswordEmailCodeDto = {
        email: 'test@example.com',
        password: 'NewPassword123!',
      };

      try {
        await controller.updatePasswordByCodeEmail(null, mockDto as any);
        fail('Uma HttpException deveria ter sido lançada.');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Precisa enviar o código que foi enviado no email, código não enviado');
        expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(loggers.default.loggerMessage).toHaveBeenCalledWith('error', 'Precisa enviar o código que foi enviado no email, código não enviado');
      }
    });
  });

  describe('update', () => {
    it('deve chamar o método update do serviço com os parâmetros corretos', async () => {
      const mockUserId = '1';
      const mockDto: UpdateUserDto = { name: 'Updated User' };
      const mockResult = { id: 1, name: 'Updated User' };
      jest.spyOn(service, 'update').mockResolvedValue(mockResult as any);

      const result = await controller.update(mockUserId, mockDto, mockUserReq);
      expect(service.update).toHaveBeenCalledWith(+mockUserId, mockDto, mockUserReq);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updatePassword', () => {
    it('deve chamar o método updatePassword do serviço com o DTO correto', async () => {
      const mockDto: UpdatePasswordDto = {
        email: 'test@example.com',
        oldPassword: 'OldPassword123!',
        password: 'NewPassword123!',
      };
      jest.spyOn(service, 'updatePassword').mockResolvedValue(undefined);

      await controller.updatePassword(mockDto);
      expect(service.updatePassword).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('findAll', () => {
    it('deve chamar o método findAll do serviço com a query e a requisição corretas', async () => {
      const mockReq = {};
      const mockQuery: UserFindAllDto = { page: 1, take: 10, orderBy: 'ASC' };
      const mockResult = { data: [], total: 0 };
      jest.spyOn(service, 'findAll').mockResolvedValue(mockResult as any);

      const result = await controller.findAll(mockReq, mockQuery);
      expect(service.findAll).toHaveBeenCalledWith(mockReq, mockQuery);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOneById', () => {
    it('deve chamar o método findOneById do serviço com o ID correto', async () => {
      const mockUserId = '1';
      const mockResult = { id: 1, email: 'test@example.com' };
      jest.spyOn(service, 'findOneById').mockResolvedValue(mockResult as any);

      const result = await controller.findOneById(mockUserId, mockUserReq);
      expect(service.findOneById).toHaveBeenCalledWith(+mockUserId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOneByEmail', () => {
    it('deve chamar o método findOneByEmail do serviço com o email correto', async () => {
      const mockEmail = 'test@example.com';
      const mockResult = { id: 1, email: 'test@example.com' };
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(mockResult as any);

      const result = await controller.findOneByEmail(mockEmail);
      expect(service.findOneByEmail).toHaveBeenCalledWith(mockEmail);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAllByQuery', () => {
    it('deve chamar o método findAllByQuery do serviço com a query correta', async () => {
      const mockReq = {};
      const mockQuery: UserFindAllByQueryDto = { page: 1, take: 10, email: 'test@example.com' };
      const mockResult = { data: [], total: 0 };
      jest.spyOn(service, 'findAllByQuery').mockResolvedValue(mockResult as any);

      const result = await controller.findAllByQuery(mockReq, mockQuery);
      expect(service.findAllByQuery).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('deve chamar o método remove do serviço com o ID correto', async () => {
      const mockUserId = '1';
      const mockResult = { affected: 1 };
      jest.spyOn(service, 'remove').mockResolvedValue(mockResult as any);

      const result = await controller.remove(mockUserId);
      expect(service.remove).toHaveBeenCalledWith(+mockUserId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeAvatarImage', () => {
    it('deve chamar o método removeAvatarImage do serviço com o ID e o usuário corretos', async () => {
      const mockUserId = '1';
      const mockResult = { affected: 1 };
      jest.spyOn(service, 'removeAvatarImage').mockResolvedValue(mockResult as any);

      const result = await controller.removeAvatarImage(mockUserId, mockUserReq);
      expect(service.removeAvatarImage).toHaveBeenCalledWith(+mockUserId, mockUserReq);
      expect(result).toEqual(mockResult);
    });
  });
});