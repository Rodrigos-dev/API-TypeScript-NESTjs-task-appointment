import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { mockUserRepository } from 'src/__mocks__/user.mock';
import { DeleteResult, Repository } from 'typeorm';
import { UserService } from './user.service';
import { EmailSendService } from 'src/email-send/email-send.service';
import { RabbitService } from 'src/rabbit/rabbit.service';
import { RoleEnum, UserTypePathBucketEnum } from 'src/commom/enums/user-enums';
import * as bcrypt from 'bcrypt';
import cloudinary from 'src/commom/cloudinary';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserFindAllDto } from './dto/query-filters.dto';
import exceptions from 'src/commom/utils/exceptions';
import loggers from 'src/commom/utils/loggers';

//############ SERVICE TESTE #########################

describe('UserService', () => {
  let userService: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: EmailSendService,
          useValue: {
            send: jest.fn(), // mock do método `send`
          },
        },
        {
          provide: RabbitService,
          useValue: {
            publish: jest.fn(), // mock do método `publish`
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
  });

  it('deve estar definido', () => {
    expect(userService).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//############ FUNCAO mountUrlUserFileBucket #########################

describe('UserService - mountUrlUserFileBucket', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: EmailSendService,
          useValue: {},
        },
        {
          provide: RabbitService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('deve retornar o caminho correto quando userId e typePath são válidos', async () => {
    const result = await userService.mountUrlUserFileBucket(1, UserTypePathBucketEnum.AVATAR);
    expect(result).toBe('users/1/avatar');
  });

  it('deve retornar false quando userId está ausente', async () => {
    const result = await userService.mountUrlUserFileBucket(null, UserTypePathBucketEnum.AVATAR);
    expect(result).toBe(false);
  });

  it('deve retornar false quando typePath está ausente', async () => {
    const result = await userService.mountUrlUserFileBucket(1, null);
    expect(result).toBe(false);
  });

  it('deve retornar false quando ambos os parâmetros estão ausentes', async () => {
    const result = await userService.mountUrlUserFileBucket(null, null);
    expect(result).toBe(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//############ FUNCAO CREATE #########################

describe('UserService - create', () => { 
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    save: jest.fn(),
  };

  const mockEmailSendService = {};
  const mockRabbitService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: mockEmailSendService },
        { provide: RabbitService, useValue: mockRabbitService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));

    jest.clearAllMocks();

    // mocka bcrypt.hashSync aqui
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('senha_hashed_fake');
    jest.spyOn(cloudinary, 'uploadFileToCloudinary').mockResolvedValue('http://cloudinary.url/avatar.jpg');
    jest.spyOn(service, 'mountUrlUserFileBucket').mockResolvedValue('users/1/AVATAR');     
  });

  it('deve criar um usuário com sucesso sem avatar', async () => {
    const createUserDto = {
      name: 'João',
      email: 'joao@email.com',
      password: 'Senha123!',
      confirmPassword: 'Senha123!',
    };

    const savedUser: User = {
      id: 1,
      name: 'João',
      email: 'joao@email.com',
      password: 'hash_senha',
      role: undefined,
      codeForgetPassword: undefined,
      avatar: undefined,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash_senha');
    userRepo.save.mockResolvedValue(savedUser);

    const result = await service.create(createUserDto as any);

    expect(bcrypt.hashSync).toHaveBeenCalledWith('Senha123!', 8);
    expect(userRepo.save).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      id: 1,
      name: 'João',
      email: 'joao@email.com',
    });
  });

  it('deve criar um usuário com avatar jpeg válido', async () => {
    const createUserDto = {
      name: 'Maria',
      email: 'maria@email.com',
      password: 'Senha123!',
      confirmPassword: 'Senha123!',
      avatar: {
        avatarName: 'imagem.jpeg',
        base64: 'base64mocked',
        mimeType: 'image/jpeg',
      },
    };

    const userWithPassword: User = {
      id: 2,
      name: 'Maria',
      email: 'maria@email.com',
      password: 'hash_senha',
      role: undefined,
      codeForgetPassword: undefined,
      avatar: undefined,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const userWithAvatar: User = {
      ...userWithPassword,
      avatar: {
        avatarName: expect.stringMatching(/^avatar_\d+\.jpeg$/) as any,
        mimeType: 'image/jpeg',
        urlAvatar: 'http://cloudinary.url/avatar.jpg',
      },
    };

    (bcrypt.hashSync as jest.Mock).mockReturnValue('hash_senha');
    (cloudinary.uploadFileToCloudinary as jest.Mock).mockResolvedValue('http://cloudinary.url/avatar.jpg');

    userRepo.save
      .mockResolvedValueOnce(userWithPassword) // 1ª chamada: cria o usuário
      .mockResolvedValueOnce(userWithAvatar); // 2ª chamada: atualiza com avatar

    const result = await service.create(createUserDto as any);

    expect(service.mountUrlUserFileBucket).toHaveBeenCalledWith(2, UserTypePathBucketEnum.AVATAR);
    expect(cloudinary.uploadFileToCloudinary).toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      id: 2,
      name: 'Maria',
      email: 'maria@email.com',
      avatar: {
        mimeType: 'image/jpeg',
        urlAvatar: 'http://cloudinary.url/avatar.jpg',
      },
    });
  });

  it('deve retornar erro se senha e confirmação forem diferentes', async () => {
    const createUserDto = {
      name: 'Ana',
      email: 'ana@email.com',
      password: '123456!',
      confirmPassword: '654321!',
    };

    await expect(service.create(createUserDto as any)).rejects.toThrow(HttpException);

    // Opcional: verificar mensagem do erro
    await expect(service.create(createUserDto as any)).rejects.toThrow('erro no body enviado');

    expect(userRepo.save).not.toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//############ FIND ALL ###############################

describe('UserService - findAll', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    findAndCount: jest.fn(),
  };

  const mockEmailSendService = {};
  const mockRabbitService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: mockEmailSendService },
        { provide: RabbitService, useValue: mockRabbitService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('deve retornar usuários paginados com valores padrão', async () => {
    const mockUsers = [
      { id: 1, name: 'João', email: 'joao@email.com' },
      { id: 2, name: 'Maria', email: 'maria@email.com' },
    ];

    const mockCount = 2;

    userRepo.findAndCount.mockResolvedValue([mockUsers as User[], mockCount]);

    const req = { user: { id: 99 } };
    const query: Partial<UserFindAllDto> = {}; // Não informa page, take nem orderBy

    const result = await service.findAll(req, query as UserFindAllDto);

    expect(userRepo.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      order: {
        createdAt: 'DESC',
      },
    });

    expect(result).toEqual({
      total: 2,
      currentPage: 1,
      totalPages: 1,
      users: mockUsers,
    });
  });

  it('deve usar os valores informados em query corretamente', async () => {
    const mockUsers = [{ id: 1, name: 'Pedro', email: 'pedro@email.com' }];
    const mockCount = 15;

    userRepo.findAndCount.mockResolvedValue([mockUsers as User[], mockCount]);

    const req = { user: { id: 10 } };
    const query: UserFindAllDto = {
      page: 2,
      take: 5,
      orderBy: 'ASC',
    };

    const result = await service.findAll(req, query);

    expect(userRepo.findAndCount).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      order: {
        createdAt: 'ASC',
      },
    });

    expect(result).toEqual({
      total: 15,
      currentPage: 2,
      totalPages: 3,
      users: mockUsers,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//########### FIND ONE BY ID ############################

describe('UserService - findOneById', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockEmailSendService = {};
  const mockRabbitService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: mockEmailSendService },
        { provide: RabbitService, useValue: mockRabbitService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('deve retornar um usuário válido se encontrado', async () => {
    const mockUser: User = {
      id: 1,
      name: 'João',
      email: 'joao@email.com',
      password: 'senha123',
      avatar: undefined,
      codeForgetPassword: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      role: undefined,
      tasks: [],
    };

    userRepo.findOne.mockResolvedValue(mockUser);

    const result = await service.findOneById(1);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(mockUser);
  });

  it('deve lançar exceção se usuário não for encontrado', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.findOneById(999)).rejects.toThrow(HttpException);
    await expect(service.findOneById(999)).rejects.toThrow('Usuário não encontrado!');
  });

  it('deve lançar exceção se o usuário não for encontrado', async () => {
    const userId = 2;

    userRepo.findOne.mockResolvedValue(null); // Simula que não encontrou o usuário

    try {
      await service.findOneById(userId);
      fail('Deveria ter lançado exceção');
    } catch (err) {
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(err).toBeInstanceOf(HttpException);
      expect(err.message).toBe('Usuário não encontrado!');
      expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//########## FIND BY EMAIL ###############################

describe('UserService - findOneByEmail', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockEmailSendService = {};
  const mockRabbitService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: mockEmailSendService },
        { provide: RabbitService, useValue: mockRabbitService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('deve retornar um usuário válido se encontrado', async () => {
    const mockUser: User = {
      id: 1,
      name: 'João',
      email: 'joao@email.com',
      password: 'senha123',
      avatar: undefined,
      codeForgetPassword: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      role: undefined,
      tasks: [],
    };

    userRepo.findOne.mockResolvedValue(mockUser);

    const result = await service.findOneByEmail('joao@email.com');

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: 'joao@email.com' } });
    expect(result).toEqual(mockUser);
  });

  it('deve lançar exceção se usuário não for encontrado', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.findOneByEmail('emailinvalido@email.com')).rejects.toThrow(HttpException);
    await expect(service.findOneByEmail('emailinvalido@email.com')).rejects.toThrow('usuário não encontrado!');
  });

  it('deve lançar exceção se o usuário não for encontrado (try/catch)', async () => {
    const email = 'naoexiste@email.com';

    userRepo.findOne.mockResolvedValue(null);

    try {
      await service.findOneByEmail(email);
      fail('Deveria ter lançado exceção');
    } catch (err) {
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(err).toBeInstanceOf(HttpException);
      expect(err.message).toBe('usuário não encontrado!');
      expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

// //########### findAllByQuery ############################

describe('UserService - findAllByQuery', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockEmailSendService = {};
  const mockRabbitService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: mockEmailSendService },
        { provide: RabbitService, useValue: mockRabbitService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('deve retornar resultados com paginação e ordenação padrão', async () => {
    // Mocks da query builder
    const mockQueryBuilder: any = {
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [{ id: 1, name: 'User1', email: 'user1@test.com' }], 1
      ]),
    };

    userRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const query = {}; // sem filtros, usa padrão

    const result = await service.findAllByQuery(query as any);

    expect(userRepo.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(mockQueryBuilder.orWhere).not.toHaveBeenCalled();
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.id', 'DESC');
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();

    expect(result).toEqual({
      total: 1,
      currentPage: 1,
      totalPages: 1,
      users: [{ id: 1, name: 'User1', email: 'user1@test.com' }],
    });
  });

  it('deve aplicar filtros userId, email e name', async () => {
    const mockQueryBuilder: any = {
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    userRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const query = {
      page: 2,
      take: 5,
      orderBy: 'ASC',
      userId: 10,
      email: 'test@example.com',
      name: 'Test User',
    };

    const result = await service.findAllByQuery(query as any);

    expect(userRepo.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith('user.id = :userId', { userId: 10 });
    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith('user.email = :email', { email: 'test@example.com' });
    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith('user.name = :name', { name: 'Test User' });

    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.id', 'ASC');
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith((2 - 1) * 5);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);

    expect(result).toEqual({
      total: 0,
      currentPage: 2,
      totalPages: 0,
      users: [],
    });
  });

  it('deve lançar exceção e chamar logger e exceptionsReturn em caso de erro', async () => {
    const mockError = new Error('Erro inesperado');

    jest.spyOn(loggers, 'loggerMessage').mockImplementation(async () => { });
    jest.spyOn(exceptions, 'exceptionsReturn').mockImplementation(async (err) => {
      // Simula throw da exceção que será capturada pelo rejects.toThrow
      throw new HttpException({ message: 'Erro', statusCode: 500 }, 500);
    });

    // Mock que lança erro para simular falha
    userRepo.createQueryBuilder.mockImplementation(() => { throw mockError; });

    await expect(service.findAllByQuery({} as any))
      .rejects
      .toThrow(HttpException);

    expect(loggers.loggerMessage).toHaveBeenCalledWith('error', mockError);
    expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(mockError);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//############ UPDATE USER ##############################

describe('UserService - update', () => {

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockLoggers = {
    loggerMessage: jest.fn(),
  };

  const mockExceptions = {
    exceptionsReturn: jest.fn(),
  };

  const mockCloudinary = {
    uploadFileToCloudinary: jest.fn(),
  };

  const mockRemoveAvatarImage = jest.fn();
  const mockMountUrlUserFileBucket = jest.fn();


  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const userReqAdmin = { sub: 1, role: RoleEnum.ADMIN };
  const userReqUser = { sub: 1, role: RoleEnum.USER };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: {} },
        { provide: RabbitService, useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;    

    // Mocks internos do service
    jest.spyOn(service, 'removeAvatarImage').mockImplementation(mockRemoveAvatarImage);
    jest.spyOn(service, 'mountUrlUserFileBucket').mockImplementation(mockMountUrlUserFileBucket);
    jest.spyOn(cloudinary, 'uploadFileToCloudinary').mockImplementation(mockCloudinary.uploadFileToCloudinary);

    jest.clearAllMocks();
  }); 

  it('deve lançar Forbidden se não for o próprio usuário nem admin', async () => {
    const updateUserDto = {};
    const userReq = { sub: 2, role: RoleEnum.USER };

    await expect(service.update(1, updateUserDto as any, userReq as any))
      .rejects.toThrow('Somente o proprio usuário ou um administrador pode alterar dados');
  });

  it('deve lançar erro se email já existe para outro usuário', async () => {
    const updateUserDto = { email: 'email@test.com' };
    const userReq = userReqAdmin;

    userRepo.findOne.mockResolvedValue({ id: 99, email: 'email@test.com' } as User);

    await expect(service.update(1, updateUserDto as any, userReq as any))
      .rejects.toThrow('Email já existe');
  });

  it('deve lançar erro se email informado é igual ao atual', async () => {
    const updateUserDto = { email: 'email@test.com' };
    const userReq = userReqAdmin;

    userRepo.findOne.mockResolvedValue({ id: 1, email: 'email@test.com' } as User);

    await expect(service.update(1, updateUserDto as any, userReq as any))
      .rejects.toThrow('Seu email cadastrado já é esse');
  });

  it('deve lançar erro se tentar alterar role e não for admin', async () => {
    const updateUserDto = { role: RoleEnum.ADMIN };
    const userReq = userReqUser;

    await expect(service.update(1, updateUserDto as any, userReq as any))
      .rejects.toThrow('Você não tem permissão para alterar a Permissão, refaça o login e tente novamente');
  });

  it('deve lançar erro se avatar base64 vazio', async () => {
    const updateUserDto = {
      avatar: {
        base64: '',
        avatarName: 'avatar.jpeg',
      },
    };
    const userReq = userReqAdmin;

    await expect(service.update(1, updateUserDto as any, userReq as any))
      .rejects.toThrow('Base 64 não pode ser \'\'');
  });

  it('deve lançar erro se avatar não for jpeg', async () => {
    const updateUserDto = {
      avatar: {
        base64: 'base64',
        avatarName: 'avatar.png',
      },
    };
    const userReq = userReqAdmin;

    await expect(service.update(1, updateUserDto as any, userReq as any))
      .rejects.toThrow('A apenas arquivos com extensão jpeg ');
  });

  it('deve atualizar avatar corretamente', async () => {
    const updateUserDto = {
      avatar: {
        base64: 'base64string',
        avatarName: 'avatar.jpeg',
      },
    };
    const userReq = userReqAdmin;

    mockRemoveAvatarImage.mockResolvedValue(true);
    mockMountUrlUserFileBucket.mockResolvedValue('users/1/AVATAR');
    mockCloudinary.uploadFileToCloudinary.mockResolvedValue('url_avatar');

    userRepo.save.mockResolvedValue({
      id: 1,
      avatar: {
        avatarName: expect.stringMatching(/^avatar_\d+\.jpeg$/),
        urlAvatar: 'url_avatar',
        mimeType: 'image/jpeg',
      },
    } as any);

    const result = await service.update(1, updateUserDto as any, userReq as any);

    expect(mockRemoveAvatarImage).toHaveBeenCalledWith(1, userReq);
    expect(mockMountUrlUserFileBucket).toHaveBeenCalledWith(1, UserTypePathBucketEnum.AVATAR);
    expect(mockCloudinary.uploadFileToCloudinary).toHaveBeenCalledWith({
      urlPathToUpload: 'users/1/AVATAR',
      base64: 'base64string',
      nameFile: expect.any(String),
    });
    expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      avatar: expect.objectContaining({
        mimeType: 'image/jpeg',
        urlAvatar: 'url_avatar',
      }),
      id: 1,
    }));
    expect(result).toHaveProperty('avatar');
  });

  it('deve excluir avatar se removeAvatarImage retornar falso', async () => {
    const updateUserDto = {
      avatar: {
        base64: 'base64string',
        avatarName: 'avatar.jpeg',
      },
    };
    const userReq = userReqAdmin;

    mockRemoveAvatarImage.mockResolvedValue(false);

    const result = await service.update(1, updateUserDto as any, userReq as any);

    expect(mockRemoveAvatarImage).toHaveBeenCalled();
    expect(updateUserDto).not.toHaveProperty('avatar.base64');
    expect(result).toBeDefined();
  });

  it('deve salvar usuário sem avatar', async () => {
    const updateUserDto = {
      name: 'Nome Atualizado',
      email: 'emailnovo@test.com',
    };
    const userReq = userReqAdmin;

    userRepo.save.mockResolvedValue({ id: 1, ...updateUserDto } as any);

    const result = await service.update(1, updateUserDto as any, userReq as any);

    expect(userRepo.save).toHaveBeenCalledWith({ ...updateUserDto, id: 1 });
    expect(result).toEqual({ id: 1, ...updateUserDto });
  });

  it('deve chamar exceptionsReturn em caso de erro', async () => {
    const updateUserDto = {};
    const userReq = userReqAdmin;
    const mockError = new Error('Erro inesperado');

    userRepo.save.mockRejectedValue(mockError);

    jest.spyOn(loggers, 'loggerMessage').mockImplementation(async () => { });
    jest.spyOn(exceptions, 'exceptionsReturn').mockImplementation(async (err) => {
      throw new HttpException({ message: 'Erro', statusCode: 500 }, 500);
    });

    await expect(service.update(1, updateUserDto as any, userReq as any))
      .rejects
      .toThrow(HttpException);

    expect(loggers.loggerMessage).toHaveBeenCalledWith('error', mockError);
    expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(mockError);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//############ forgetedPassword #########################

describe('UserService - forgetedPassword', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;
  let rabbitService: { create: jest.Mock };
  let mockExceptions: typeof exceptions;
  let mockLoggers: typeof loggers;

  const mockUserRepository = {
    save: jest.fn(),
  };

  const mockEmailSendService = {};
  const mockRabbitService = {};

  beforeEach(async () => {
    rabbitService = { create: jest.fn() };
    mockExceptions = exceptions;
    mockLoggers = loggers;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: mockEmailSendService },
        { provide: RabbitService, useValue: rabbitService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('deve enviar código por email e atualizar usuário com sucesso', async () => {
    const mockUser = {
      id: 123,
      email: 'teste@email.com',
    } as User;

    // Mock da função findOneByEmail para retornar um usuário válido
    jest.spyOn(service, 'findOneByEmail').mockResolvedValue(mockUser);

    // Mock da função create do RabbitService (simula fila criada com sucesso)
    rabbitService.create.mockResolvedValue(true);

    // Mock do repositório save (simula update no banco)
    userRepo.save.mockResolvedValue({
      ...mockUser,
      codeForgetPassword: '1234',
    });

    const result = await service.forgetedPassword({ email: mockUser.email });

    // Verifica se o método findOneByEmail foi chamado corretamente
    expect(service.findOneByEmail).toHaveBeenCalledWith(mockUser.email);

    // Verifica se o método create da fila foi chamado
    expect(rabbitService.create).toHaveBeenCalled();

    // Verifica se o usuário foi salvo com o código de recuperação
    expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      id: mockUser.id,
      codeForgetPassword: expect.any(String),
    }));

    // Verifica se a mensagem de resposta contém o e-mail mascarado corretamente
    expect(result).toHaveProperty('message');
    expect((result as { message: string }).message).toContain('te*********@email.com');
  });

  it('deve lançar HttpException se usuário não encontrado', async () => {
    jest.spyOn(service, 'findOneByEmail').mockResolvedValue(null);

    await expect(service.forgetedPassword({ email: 'invalido@email.com' }))
      .rejects
      .toThrow(HttpException);

    await expect(service.forgetedPassword({ email: 'invalido@email.com' }))
      .rejects
      .toThrow("User don't found");
  });

  it('deve lançar HttpException se falhar ao adicionar na fila Rabbit', async () => {
    const mockUser = {
      id: 123,
      email: 'teste@email.com',
    } as User;

    jest.spyOn(service, 'findOneByEmail').mockResolvedValue(mockUser);
    rabbitService.create.mockResolvedValue(false); // falha ao adicionar na fila

    await expect(service.forgetedPassword({ email: 'teste@email.com' }))
      .rejects
      .toThrow('algum erro ao adicionar na fila de processamento');
  });

  it('deve tratar erro inesperado com logger e exceptionsReturn', async () => {
    const mockError = new Error('Erro inesperado');

    jest.spyOn(service, 'findOneByEmail').mockRejectedValue(mockError);

    const loggerSpy = jest.spyOn(loggers, 'loggerMessage').mockImplementation(async () => { });
    const exceptionSpy = jest.spyOn(exceptions, 'exceptionsReturn').mockRejectedValue(mockError);

    await expect(service.forgetedPassword({ email: 'teste@email.com' })).rejects.toThrow('Erro inesperado');

    expect(loggerSpy).toHaveBeenCalledWith('error', mockError);
    expect(exceptionSpy).toHaveBeenCalledWith(mockError);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//############# updatePassword #############################

describe('UserService - updatePassword', () => {
  let service: UserService;
  let userRepo: jest.Mocked<ReturnType<typeof mockUserRepository>>;

  const mockUser: User = {
    id: 1,
    email: 'teste@email.com',
    password: bcrypt.hashSync('senhaAntiga', 8),
    codeForgetPassword: '1234',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: {} },
        { provide: RabbitService, useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockUserRepository() }, // <<--- CHAMA AQUI
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User)) as jest.Mocked<ReturnType<typeof mockUserRepository>>;
    jest.clearAllMocks();
  });

  it('deve atualizar senha com código de recuperação', async () => {
    const dto = { email: mockUser.email, password: 'novaSenha' };

    userRepo.findOne.mockResolvedValue(mockUser);
    userRepo.save.mockResolvedValue({ ...mockUser, password: '***', codeForgetPassword: null });

    const result = await service.updatePassword(dto, '1234');

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { codeForgetPassword: '1234', email: mockUser.email },
    });
    expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      id: mockUser.id,
      codeForgetPassword: null,
    }));
    expect(result).toHaveProperty('password');
  });

  it('deve atualizar senha com oldPassword válido', async () => {
    const dto = {
      email: mockUser.email,
      password: 'novaSenha',
      oldPassword: 'senhaAntiga',
    };

    userRepo.findOne.mockResolvedValue(mockUser);
    userRepo.save.mockResolvedValue({ ...mockUser, password: '***' });

    const result = await service.updatePassword(dto);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
    expect(result).toHaveProperty('password');
  });

  it('deve lançar erro se código estiver errado', async () => {
    userRepo.findOne.mockResolvedValue(null);
    const dto = { email: mockUser.email, password: 'novaSenha' };

    await expect(service.updatePassword(dto, 'codigoErrado')).rejects.toThrow(
      'Usuário não encontrado! ou não tem codigo, ou então codigo enviado errado',
    );
  });

  it('deve lançar erro se oldPassword for inválido', async () => {
    const dto = {
      email: mockUser.email,
      password: 'novaSenha',
      oldPassword: 'senhaErrada',
    };

    userRepo.findOne.mockResolvedValue(mockUser);

    await expect(service.updatePassword(dto)).rejects.toThrow(
      'oldPassword enviado não é igual ao registrado',
    );
  });

  it('deve lançar erro se oldPassword não for enviado', async () => {
    const dto = { email: mockUser.email, password: 'novaSenha' };

    await expect(service.updatePassword(dto)).rejects.toThrow(
      'oldPassword deve ser enviado',
    );
  });

  it('deve lançar erro se usuário não for encontrado no fluxo oldPassword', async () => {
    const dto = { email: 'inexistente@email.com', password: 'novaSenha', oldPassword: '123456' };

    userRepo.findOne.mockResolvedValue(null);

    await expect(service.updatePassword(dto)).rejects.toThrow('Usuário não encontrado!');
  });

  it('deve lançar erro se email do body for diferente do cadastrado', async () => {
    const dto = {
      email: 'diferente@email.com',
      password: 'novaSenha',
      oldPassword: 'senhaAntiga',
    };

    userRepo.findOne.mockResolvedValue(mockUser);

    await expect(service.updatePassword(dto)).rejects.toThrow(
      'Email enviado no body não é igual o cadastrado',
    );
  });

  it('deve tratar erro interno com logger e exceptionsReturn', async () => {
    const mockError = new Error('Erro inesperado');

    userRepo.findOne.mockRejectedValue(mockError);

    const loggerSpy = jest.spyOn(loggers, 'loggerMessage').mockImplementation(async () => { });
    const exceptionSpy = jest
      .spyOn(exceptions, 'exceptionsReturn')
      .mockRejectedValue(mockError);

    await expect(
      service.updatePassword({ email: mockUser.email, password: '123456', oldPassword: '123' }),
    ).rejects.toThrow(mockError);

    expect(loggerSpy).toHaveBeenCalledWith('error', mockError);
    expect(exceptionSpy).toHaveBeenCalledWith(mockError);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//############ remove ########################################

describe('UserService - remove', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    delete: jest.fn(),
  };

  const mockEmailSendService = {};
  const mockRabbitService = {};

  beforeEach(async () => {    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: mockEmailSendService }, 
        { provide: RabbitService, useValue: mockRabbitService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('deve remover usuário com sucesso e deletar pasta do Cloudinary', async () => {
    userRepo.delete.mockResolvedValue({ affected: 1, raw: {} } as DeleteResult);
    const cloudinarySpy = jest.spyOn(cloudinary, 'deleteFolderUserFromCloudinary').mockResolvedValue(undefined);

    const result = await service.remove(1);

    expect(userRepo.delete).toHaveBeenCalledWith(1);
    expect(cloudinarySpy).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it('deve retornar false se nenhum usuário for removido', async () => {
    userRepo.delete.mockResolvedValue({ affected: 0, raw: {} } as DeleteResult);;
    const cloudinarySpy = jest.spyOn(cloudinary, 'deleteFolderUserFromCloudinary');

    const result = await service.remove(99);

    expect(userRepo.delete).toHaveBeenCalledWith(99);
    expect(cloudinarySpy).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('deve tratar erro com logger e exceptionsReturn', async () => {
    const mockError = new Error('Erro inesperado');

    userRepo.delete.mockRejectedValue(mockError);
    const loggerSpy = jest.spyOn(loggers, 'loggerMessage').mockImplementation();
    const exceptionsSpy = jest.spyOn(exceptions, 'exceptionsReturn').mockImplementation(async (err) => {
      throw new Error('Exceção tratada');
    });

    await expect(service.remove(1)).rejects.toThrow('Exceção tratada');

    expect(userRepo.delete).toHaveBeenCalledWith(1);
    expect(loggerSpy).toHaveBeenCalledWith('error', mockError);
    expect(exceptionsSpy).toHaveBeenCalledWith(mockError);
  });

   afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});

//########### removeAvatarImage #############################

describe('UserService - removeAvatarImage', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockEmailSendService = {};
  const mockRabbitService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EmailSendService, useValue: mockEmailSendService },
        { provide: RabbitService, useValue: mockRabbitService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('deve lançar Forbidden se não for o próprio usuário nem admin', async () => {
    const userId = 1;
    const userReq = { sub: 2, role: RoleEnum.USER , username: '', email: ''}; // não é dono nem admin

    await expect(service.removeAvatarImage(userId, userReq)).rejects.toThrow(HttpException);     
  });

  it('deve lançar erro se usuário não encontrado ou sem urlAvatar', async () => {
    userRepo.findOne.mockResolvedValue(null);

    const userId = 1;
    const userReq = { sub: 1, role: RoleEnum.USER , username: '', email: '' };

    await expect(service.removeAvatarImage(userId, userReq)).rejects.toThrow(HttpException);
  });

  it('deve retornar true se avatar for removido com sucesso', async () => {
    const userId = 1;
    const userReq = { sub: 1, role: RoleEnum.USER , username: '', email: ''};
    const avatarName = 'avatar.jpg';

    const mockUser = {
      id: userId,
      avatar: {
        urlAvatar: 'https://cloudinary.com/avatar.jpg',
        avatarName,
      },
    };

    userRepo.findOne.mockResolvedValue(mockUser as any);

    // Mocks
    const urlPath = 'users/1/avatar';
    const fullPath = `${urlPath}/${avatarName}`;

    const mountUrlSpy = jest
      .spyOn(service, 'mountUrlUserFileBucket')
      .mockResolvedValue(urlPath);

    const deleteCloudinarySpy = jest
      .spyOn(cloudinary, 'deleteFileFromCloudinary')
      .mockResolvedValue(true);

    const result = await service.removeAvatarImage(userId, userReq);

    expect(mountUrlSpy).toHaveBeenCalledWith(userId, UserTypePathBucketEnum.AVATAR);
    expect(deleteCloudinarySpy).toHaveBeenCalledWith(fullPath);
    expect(result).toBe(true);
  });

  it('deve retornar false se avatar não for removido', async () => {
    const userId = 1;
    const userReq = { sub: 1, role: RoleEnum.USER , username: '', email: ''};
    const avatarName = 'avatar.jpg';

    const mockUser = {
      id: userId,
      avatar: {
        urlAvatar: 'https://cloudinary.com/avatar.jpg',
        avatarName,
      },
    };

    userRepo.findOne.mockResolvedValue(mockUser as any);

    jest
      .spyOn(service, 'mountUrlUserFileBucket')
      .mockResolvedValue('users/1/avatar');

    jest
      .spyOn(cloudinary, 'deleteFileFromCloudinary')
      .mockResolvedValue(undefined); // falha na exclusão

    const result = await service.removeAvatarImage(userId, userReq);
    expect(result).toBe(false);
  });
});