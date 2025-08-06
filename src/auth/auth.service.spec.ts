import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CurrentUserDto } from './dto/current-user-dto';
import { RoleEnum } from 'src/commom/enums/user-enums';
import exceptions from 'src/commom/utils/exceptions';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let userService: jest.Mocked<UserService>;
    let jwtService: jest.Mocked<JwtService>;

    const mockUser = {
        id: 1,
        name: 'User',
        email: 'user@test.com',
        password: 'hashed_password',
        role: RoleEnum.USER,
        access_token: '',
        access_token_to_refresh: '',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: {
                        findOneByEmail: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                        verify: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get(UserService);
        jwtService = module.get(JwtService);
    });

    it('deve ser definido', () => {
        expect(service).toBeDefined();
    });

    describe('validarUsuario', () => {
        it('deve retornar dados do usuário se email e senha forem válidos', async () => {
            userService.findOneByEmail.mockResolvedValue(mockUser as any);
            (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

            const result = await service.validarUsuario(mockUser.email, 'senha123');

            expect(result).toEqual(expect.objectContaining({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
            }));
        });

        it('deve lançar exceção se usuário não for encontrado', async () => {
            userService.findOneByEmail.mockResolvedValue(null);

            await expect(service.validarUsuario('email@invalido.com', 'senha123'))
                .rejects
                .toThrow(HttpException);
        });

        it('deve lançar exceção se senha for inválida', async () => {
            userService.findOneByEmail.mockResolvedValue(mockUser as any);
            (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

            await expect(service.validarUsuario(mockUser.email, 'senhaErrada'))
                .rejects
                .toThrow(HttpException);
        });

        it('deve retornar erro formatado se exceção for lançada internamente', async () => {
            const error = new Error('Erro interno');
            userService.findOneByEmail.mockRejectedValue(error);

            jest.spyOn(exceptions, 'exceptionsReturn').mockImplementation(async (err) => {
                throw new Error('Email ou senha inválidos!');
            });

            await expect(service.validarUsuario('email@test.com', 'senha123'))
                .rejects
                .toThrow('Email ou senha inválidos!');

            expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
        });
    });

    describe('login', () => {
        it('deve logar com payload vindo do login (sem refresh)', async () => {
            const mockPayload = { ...mockUser };

            jwtService.sign.mockReturnValueOnce('token_1h');
            jwtService.sign.mockReturnValueOnce('token_30h');

            const result = await service.login(mockPayload as any);

            expect(result.access_token).toBe('token_1h');
            expect(result.access_token_to_refresh).toBe('token_30h');
        });

        it('deve logar com refreshToken (recarregar do banco)', async () => {
            const mockPayload = { ...mockUser };
            userService.findOneByEmail.mockResolvedValue(mockPayload as any);

            jwtService.sign.mockReturnValueOnce('token_1h');
            jwtService.sign.mockReturnValueOnce('token_30h');

            const result = await service.login(mockPayload as any, true);

            expect(userService.findOneByEmail).toHaveBeenCalledWith(mockPayload.email);
            expect(result.access_token).toBe('token_1h');
            expect(result.access_token_to_refresh).toBe('token_30h');
        });

        it('deve lançar exceção se usuário não for encontrado no refresh', async () => {
            userService.findOneByEmail.mockResolvedValue(null);

            await expect(service.login(mockUser as any, true))
                .rejects
                .toThrow(HttpException);
        });
    });

    describe('generateOneHourToken', () => {
        it('deve gerar token com expiração de 1 hora', async () => {
            jwtService.sign.mockReturnValue('token_1h');

            const payload: CurrentUserDto = {
                sub: 1,
                username: 'User',
                email: 'user@test.com',
                role: RoleEnum.USER,
            };

            const token = await service.generateOneHourToken(payload);
            expect(token).toBe('token_1h');
        });
    });

    describe('generateThirtyHourToken', () => {
        it('deve gerar token com expiração de 30 horas', async () => {
            jwtService.sign.mockReturnValue('token_30h');

            const payload: CurrentUserDto = {
                sub: 1,
                username: 'User',
                email: 'user@test.com',
                role: RoleEnum.USER,
            };

            const token = await service.generateThirtyHourToken(payload);
            expect(token).toBe('token_30h');
        });
    });

    describe('verifyToken', () => {
        it('deve retornar payload decodificado se o token for válido', () => {
            const decoded = { sub: 1, email: 'user@test.com' };
            jwtService.verify.mockReturnValue(decoded);

            const result = service.verifyToken('valid_token');
            expect(result).toEqual(decoded);
        });

        it('deve lançar erro se o token for inválido', () => {
            jwtService.verify.mockImplementation(() => { throw new Error(); });

            expect(() => service.verifyToken('invalid')).toThrow('Invalid token');
        });
    });
});


