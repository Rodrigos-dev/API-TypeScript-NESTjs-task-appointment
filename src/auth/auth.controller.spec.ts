import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Mock do AuthService para isolar o teste do controller
const mockAuthService = {
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('deve chamar o método login do serviço com o usuário da requisição', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockResult = {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
      };
      
      // Simula o retorno do serviço
      jest.spyOn(service, 'login').mockResolvedValue(mockResult);

      const request = { user: mockUser };
      const result = await controller.login(request);

      // Verifica se o método login do serviço foi chamado com o usuário correto
      expect(service.login).toHaveBeenCalledWith(mockUser);
      // Verifica se o controller retornou o resultado do serviço
      expect(result).toEqual(mockResult);
    });
  });

  describe('refreshToken', () => {
    it('deve chamar o método login do serviço com o usuário da requisição e com refresh = true', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockResult = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };
      
      // Simula o retorno do serviço
      jest.spyOn(service, 'login').mockResolvedValue(mockResult);

      const request = { user: mockUser };
      const result = await controller.refreshToken(request);

      // Verifica se o método login do serviço foi chamado com o usuário e o flag 'true'
      expect(service.login).toHaveBeenCalledWith(mockUser, true);
      // Verifica se o controller retornou o resultado do serviço
      expect(result).toEqual(mockResult);
    });
  });
});