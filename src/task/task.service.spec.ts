import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import { mockTaskRepository } from 'src/__mocks__/task.mock';
import { mockUser, mockUserRepository } from 'src/__mocks__/user.mock';
import { DeleteResult, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PeriodTasksEnum, StatusTaskEnum } from 'src/commom/enums/task.enums';
import * as dateFns from 'date-fns';
import { TaskFindAllDto, TasksPeriodFindDto } from './dto/task-query-filters.dto';
import { RoleEnum } from 'src/commom/enums/user-enums';
import { validate } from 'class-validator';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUserDto } from 'src/auth/dto/current-user-dto';

jest.mock('date-fns', () => ({
  addMinutes: jest.fn((date, amount) => new Date(date.getTime() + amount * 60000)),
  subMinutes: jest.fn((date, amount) => new Date(date.getTime() - amount * 60000)),
  startOfDay: jest.fn((date) => new Date(date)),
  endOfDay: jest.fn((date) => new Date(date)), // <-- ADICIONAR
  startOfWeek: jest.fn((date) => new Date(date)), // <-- ADICIONAR
  endOfWeek: jest.fn((date) => new Date(date)), // <-- ADICIONAR
  startOfMonth: jest.fn((date) => new Date(date)), // <-- ADICIONAR
  endOfMonth: jest.fn((date) => new Date(date)), // <-- ADICIONAR
  startOfYear: jest.fn((date) => new Date(date)), // <-- ADICIONAR
  endOfYear: jest.fn((date) => new Date(date)), // <-- ADICIONAR
  parseISO: jest.fn((str) => new Date(str)),
  isBefore: jest.fn(() => false),
}));

describe('TaskService', () => {
  let service: TaskService;
  let taskRepo: jest.Mocked<Repository<Task>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepo = module.get(getRepositoryToken(Task));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });
});

// //############################ create #############################################//

describe('TaskService - create', () => {
  let service: TaskService;
  let taskRepo: jest.Mocked<Repository<Task>>;
  let userRepo: jest.Mocked<Repository<User>>;

  const createTaskDto: CreateTaskDto = {
    userOwnerId: 1,
    dateEvent: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    title: 'Nova tarefa',
    description: 'Descrição da tarefa',
  };

  const userReq = {
    sub: 1,
    role: 'user',
    username: 'Usuário Mockado',
    email: 'mock@email.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useFactory: mockTaskRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepo = module.get(getRepositoryToken(Task));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('deve criar a tarefa com sucesso', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(service, 'verifyDateAndHourFree').mockResolvedValue(true);
    jest.spyOn(taskRepo, 'save').mockResolvedValue({
      id: 1,
      ...createTaskDto,
      status: StatusTaskEnum.PENDING,
      user: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await service.create(createTaskDto, userReq);

    expect(result).toHaveProperty('id');
    expect(taskRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      userOwnerId: 1,
      title: 'Nova tarefa',
    }));
  });

  it('deve lançar erro se a data for menor que hoje', async () => {
    const dto = { ...createTaskDto, dateEvent: '2000-01-01' };

    // forçar o mock para esse teste
    (dateFns.isBefore as jest.Mock).mockReturnValue(true);

    await expect(service.create(dto, userReq)).rejects.toThrow(HttpException);
    await expect(service.create(dto, userReq)).rejects.toThrow('Data não pode ser menor que a data de hoje!');
  });

  it('deve lançar erro se userOwnerId for diferente do user logado', async () => {
    const dto = { ...createTaskDto, userOwnerId: 999 };

    (dateFns.isBefore as jest.Mock).mockReturnValue(false);

    await expect(service.create(dto, userReq)).rejects.toThrow(HttpException);
    await expect(service.create(dto, userReq)).rejects.toThrow('Usuário logado deve ser o mesmo que está criando a tarefa!');
  });

  it('deve lançar erro se o usuário não for encontrado', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

    await expect(service.create(createTaskDto, userReq)).rejects.toThrow(HttpException);
    await expect(service.create(createTaskDto, userReq)).rejects.toThrow('Usuário não encontrado!');
  });

  it('deve lançar erro se já existir tarefa no mesmo horário', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(service, 'verifyDateAndHourFree').mockResolvedValue(undefined);

    await expect(service.create(createTaskDto, userReq)).rejects.toThrow(HttpException);
    await expect(service.create(createTaskDto, userReq)).rejects.toThrow('Já existe uma tarefa para essa data e hora!');
  });
});

//###################### verifyDateAndHourFree ############################################//

describe('TaskService - verifyDateAndHourFree', () => {
  let service: TaskService;
  let taskRepo: jest.Mocked<Repository<Task>>;

  const taskBody: Task = {
    id: 1,
    userOwnerId: 1,
    dateEvent: '2025-08-05',
    startTime: '09:00',
    endTime: '10:00',
    title: 'Tarefa teste',
    description: 'Descrição da tarefa',
    status: StatusTaskEnum.PENDING,
    user: { id: 1, name: 'John Doe' } as User,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepo = module.get(getRepositoryToken(Task));
  });

  it('deve retornar true se não existir conflito de horário', async () => {
    taskRepo.find.mockResolvedValue([]);
    const result = await service.verifyDateAndHourFree('2025-08-05', '11:00', '12:00', 1);
    expect(result).toBe(true);
  });

  it('deve lançar erro se já existir tarefa exatamente no mesmo horário', async () => {
    taskRepo.find.mockResolvedValue([taskBody]);
    await expect(service.verifyDateAndHourFree('2025-08-05', '09:00', '10:00', 1))
      .rejects.toThrow(HttpException);
  });

  it('deve lançar erro se startTime estiver dentro do intervalo de outra tarefa', async () => {
    taskRepo.find.mockResolvedValue([taskBody]);
    await expect(service.verifyDateAndHourFree('2025-08-05', '09:30', '10:30', 1))
      .rejects.toThrow(HttpException);
  });

  it('deve lançar erro se endTime estiver dentro do intervalo de outra tarefa', async () => {
    taskRepo.find.mockResolvedValue([taskBody]);
    await expect(service.verifyDateAndHourFree('2025-08-05', '08:30', '09:30', 1))
      .rejects.toThrow(HttpException);
  });

  it('deve lançar erro se o novo horário estiver completamente dentro de outro', async () => {
    taskRepo.find.mockResolvedValue([taskBody]);
    await expect(service.verifyDateAndHourFree('2025-08-05', '09:15', '09:45', 1))
      .rejects.toThrow(HttpException);
  });

  it('deve lançar erro se o novo horário englobar completamente outro', async () => {
    taskRepo.find.mockResolvedValue([taskBody]);
    await expect(service.verifyDateAndHourFree('2025-08-05', '08:00', '11:00', 1))
      .rejects.toThrow(HttpException);
  });

  it('deve lançar erro se endTime for menor ou igual ao startTime', async () => {
    taskRepo.find.mockResolvedValue([]);
    await expect(service.verifyDateAndHourFree('2025-08-05', '10:00', '09:00', 1))
      .rejects.toThrow('Horário de término deve ser maior que o horário de início');

    await expect(service.verifyDateAndHourFree('2025-08-05', '10:00', '10:00', 1))
      .rejects.toThrow('Horário de término deve ser maior que o horário de início');
  });

  it('deve retornar true se novo horário for antes de tarefas existentes', async () => {
    taskRepo.find.mockResolvedValue([taskBody]);
    const result = await service.verifyDateAndHourFree('2025-08-05', '07:00', '08:00', 1);
    expect(result).toBe(true);
  });

  it('deve retornar true se novo horário for depois de tarefas existentes', async () => {
    taskRepo.find.mockResolvedValue([taskBody]);
    const result = await service.verifyDateAndHourFree('2025-08-05', '10:30', '11:30', 1);
    expect(result).toBe(true);
  });

})

//##################### find all ################################################

describe('TaskService - findAll', () => {
  let service: TaskService;
  let taskRepo: jest.Mocked<Repository<Task>>;

  // Mock do QueryBuilder com todos os métodos usados encadeados
  const mockQueryBuilder: any = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([mockTaskRepository, mockTaskRepository.length]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();


    service = module.get<TaskService>(TaskService);
    taskRepo = module.get(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar lista de tarefas paginada corretamente para user comum', async () => {
    const mockTasks = [
      {
        id: 1,
        userOwnerId: 1,
        dateEvent: '2025-08-05',
        startTime: '09:00',
        endTime: '10:00',
        title: 'Tarefa 1',
        description: 'Descrição 1',
        status: StatusTaskEnum.PENDING,
      },
      {
        id: 2,
        userOwnerId: 1,
        dateEvent: '2025-08-06',
        startTime: '11:00',
        endTime: '12:00',
        title: 'Tarefa 2',
        description: 'Descrição 2',
        status: StatusTaskEnum.FINISHED,
      },
    ];

    // Simula retorno do getManyAndCount  
    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, mockTasks.length]);

    // Query sem filtros adicionais, user comum solicitando suas próprias tasks
    const queryDto: TaskFindAllDto = {
      userOwnerId: 1,
      page: 1,
      take: 10,
      orderBy: 'DESC',
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: 'user1',
      email: 'user1@example.com',
    };

    const result = await service.findAll(queryDto, userReq) as {
      total: number;
      currentPage: number;
      totalPages: number;
      tasks: Task[];
    };;

    expect(taskRepo.createQueryBuilder).toHaveBeenCalledWith('task');
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.userOwnerId = :userOwnerId', { userOwnerId: 1 });
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('task.id', 'DESC');
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();

    expect(result.total).toBe(mockTasks.length);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.tasks).toEqual(mockTasks);
  });

  it('deve lançar erro se user comum não passar userOwnerId', async () => {
    const queryDto: TaskFindAllDto = {}; // sem userOwnerId
    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: 'user1',
      email: 'user1@example.com',
    };

    await expect(service.findAll(queryDto, userReq)).rejects.toThrow(HttpException);
  });

  it('deve lançar erro se userOwnerId for diferente do usuário logado e não for admin', async () => {
    const queryDto: TaskFindAllDto = {
      userOwnerId: 2,
    };
    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: 'user1',
      email: 'user1@example.com',
    };

    await expect(service.findAll(queryDto, userReq)).rejects.toThrow(HttpException);
  });

  it('deve permitir que admin busque tarefas sem filtro de userOwnerId', async () => {
    const mockTasks = [];

    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 0]);

    const queryDto: TaskFindAllDto = {
      page: 1,
      take: 10,
    };

    const userReq = {
      sub: 99,
      role: RoleEnum.ADMIN,
      username: 'admin',
      email: 'admin@example.com',
    };

    const result = await service.findAll(queryDto, userReq) as {
      total: number;
      currentPage: number;
      totalPages: number;
      tasks: Task[];
    };;

    expect(result.tasks).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('deve aplicar filtros de título e descrição corretamente', async () => {
    const mockTasks = [];

    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 0]);

    const queryDto: TaskFindAllDto = {
      userOwnerId: 1,
      title: 'tarefa',
      description: 'descrição',
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: 'user1',
      email: 'user1@example.com',
    };

    const result = await service.findAll(queryDto, userReq) as {
      total: number;
      currentPage: number;
      totalPages: number;
      tasks: Task[];
    };;

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.title LIKE :title', { title: `%${queryDto.title}%` });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.description LIKE :description', { description: `%${queryDto.description}%` });
    expect(result.tasks).toEqual([]);
  });

  it('deve normalizar status para lowercase e filtrar', async () => {
    const mockTasks = [];

    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 0]);

    const queryDto: TaskFindAllDto = {
      userOwnerId: 1,
      status: StatusTaskEnum.PENDING,
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: 'user1',
      email: 'user1@example.com',
    };

    const result = await service.findAll(queryDto, userReq) as {
      total: number;
      currentPage: number;
      totalPages: number;
      tasks: Task[];
    };;

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.status = :status', { status: 'pending' });
    expect(result.tasks).toEqual([]);
  });

  it('deve aplicar filtro de dateEvent corretamente', async () => {
    const mockTasks = [
      {
        id: 1,
        userOwnerId: 1,
        dateEvent: '2025-08-05',
        startTime: '09:00',
        endTime: '10:00',
        title: 'Tarefa 1',
        description: 'Descrição 1',
        status: StatusTaskEnum.PENDING,
      },
    ];

    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, mockTasks.length]);

    const queryDto: TaskFindAllDto = {
      userOwnerId: 1,
      dateEvent: '2025-08-05',  // <-- aqui adiciona o dateEvent para ativar o if
      page: 1,
      take: 10,
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: 'user1',
      email: 'user1@example.com',
    };

    const result = await service.findAll(queryDto, userReq) as {
      total: number;
      currentPage: number;
      totalPages: number;
      tasks: Task[];
    };

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.dateEvent = :dateEvent', { dateEvent: queryDto.dateEvent });
    expect(result.tasks).toEqual(mockTasks);
    expect(result.total).toBe(mockTasks.length);
  });
});

//#################### Find one #####################################################

describe('TaskService - findOne', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<Repository<Task>>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {}, // só precisa se usar no service
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get(getRepositoryToken(Task));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('deve retornar a tarefa se ela existir', async () => {
    const taskId = 1;
    const mockTask = {
      id: taskId,
      userOwnerId: 1,
      dateEvent: '2025-08-05',
      startTime: '08:00',
      endTime: '09:00',
      title: 'Tarefa teste',
      description: 'Descrição teste',
      status: StatusTaskEnum.PENDING,
      user: { id: 1, name: 'John Doe' } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as Task;

    taskRepository.findOne.mockResolvedValueOnce(mockTask);

    const result = await service.findOne(taskId);

    expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
    expect(result).toEqual(mockTask);
  });

  it('deve lançar exceção se a tarefa não existir', async () => {
    const taskId = 999;
    taskRepository.findOne.mockResolvedValueOnce(null);

    try {
      await service.findOne(taskId);
      // Se não lançar erro, falha o teste
      fail('Deveria ter lançado exceção');
    } catch (err) {
      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(err).toBeInstanceOf(HttpException);
      expect(err.message).toBe('Tarefa não encontrada');
      expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
    }
  });
});

//#################### findTasksByPeriod ###################################################

describe('TaskService - findTasksByPeriod', () => {
  let service: TaskService;

  const mockTasks: Task[] = [
    {
      id: 1,
      userOwnerId: 1,
      dateEvent: '2025-08-05',
      startTime: '08:00',
      endTime: '09:00',
      title: 'Tarefa 1',
      description: 'Descrição 1',
      status: StatusTaskEnum.PENDING,
      user: { id: 1, name: 'John Doe' } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];

  const mockQueryBuilder: any = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([mockTasks, mockTasks.length]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('deve retornar tarefas corretamente para o período "day" e usuário comum', async () => {
    const query: TasksPeriodFindDto = {
      userOwnerId: 1,
      period: PeriodTasksEnum.DAY,
      status: StatusTaskEnum.PENDING,
      page: 1,
      take: 10,
      orderBy: 'DESC',
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: '',
      email: ''
    };

    const result = await service.findTasksByPeriod(query, userReq) as {
      total: number;
      currentPage: number;
      totalPages: number;
      tasks: Task[];
    };

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'task.dateEvent BETWEEN :start AND :end',
      expect.any(Object),
    );
    expect(result.total).toBe(mockTasks.length);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.tasks).toEqual(mockTasks);
  });

  it('deve retornar tarefas corretamente para o período "week" e usuário comum', async () => {
    const query: TasksPeriodFindDto = {
      userOwnerId: 1,
      period: PeriodTasksEnum.WEEK,
      status: StatusTaskEnum.PENDING,
      page: 1,
      take: 10,
      orderBy: 'DESC',
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: '',
      email: ''
    };

    const result = await service.findTasksByPeriod(query, userReq) as {
      total: number;
      currentPage: number;
      totalPages: number;
      tasks: Task[];
    };

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'task.dateEvent BETWEEN :start AND :end',
      expect.any(Object),
    );
    expect(result.total).toBe(mockTasks.length);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.tasks).toEqual(mockTasks);
  });

  it('deve retornar tarefas corretamente para um período "month" e usuário comum', async () => {
    const query: TasksPeriodFindDto = {
      userOwnerId: 1,
      period: PeriodTasksEnum.MONTH,
      status: StatusTaskEnum.PENDING,
      page: 1,
      take: 10,
      orderBy: 'DESC',
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: '',
      email: ''
    };

    const result = await service.findTasksByPeriod(query, userReq) as {
      total: number;
      currentPage: number;
      totalPages: number;
      tasks: Task[];
    };

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'task.dateEvent BETWEEN :start AND :end',
      expect.any(Object),
    );
    expect(result.total).toBe(mockTasks.length);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.tasks).toEqual(mockTasks);
  });

  it('deve retornar tarefas corretamente para o período "year" e usuário comum', async () => {
    const query: TasksPeriodFindDto = {
      userOwnerId: 1,
      period: PeriodTasksEnum.YEAR,
      status: StatusTaskEnum.PENDING,
      page: 1,
      take: 10,
      orderBy: 'DESC',
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: '',
      email: ''
    };

    const result = await service.findTasksByPeriod(query, userReq) as {
      total: number;
      currentPage: number;
      totalPages: number;
      tasks: Task[];
    };

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'task.dateEvent BETWEEN :start AND :end',
      expect.any(Object),
    );
    expect(result.total).toBe(mockTasks.length);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.tasks).toEqual(mockTasks);
  });

  it('deve falhar a validação se period não for fornecido', async () => {
    const dto = new TasksPeriodFindDto(); // vazio
    dto.userOwnerId = 1;

    const errors = await validate(dto);
    const periodError = errors.find((e) => e.property === 'period');

    expect(periodError).toBeDefined();
    expect(periodError.constraints).toHaveProperty('isNotEmpty');
  });

  it('deve lançar exceção se o usuário comum informar userOwnerId diferente do sub', async () => {
    const query: TasksPeriodFindDto = {
      userOwnerId: 99, // diferente do sub
      period: PeriodTasksEnum.MONTH,
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: '',
      email: ''
    };

    await expect(service.findTasksByPeriod(query, userReq)).rejects.toThrow(
      'Usuário filtrado deve ser o mesmo que faz a request',
    );
  });

  it('deve lançar exceção se o período for inválido', async () => {
    const query: TasksPeriodFindDto = {
      userOwnerId: 1,
      period: 'invalidPeriod' as any,
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: '',
      email: ''
    };

    await expect(service.findTasksByPeriod(query, userReq)).rejects.toThrow(
      'Período inválido',
    );
  });

  // Test para entrar no if (!userOwnerId)
  it('deve lançar erro se userOwnerId não for enviado para usuário comum', async () => {
    const query: TasksPeriodFindDto = {
      // userOwnerId ausente
      period: PeriodTasksEnum.DAY,
      page: 1,
      take: 10,
      orderBy: 'DESC',
    };

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: '',
      email: '',
    };

    await expect(service.findTasksByPeriod(query, userReq)).rejects.toThrow(
      'Deve ser enviado o id do usuário a buscar as tarefas',
    );
  });

  it('deve lançar erro se o campo "period" não for enviado', async () => {
    const query: TasksPeriodFindDto = {
      userOwnerId: 1,
      period: PeriodTasksEnum.YEAR,
      page: 1,
      take: 10,
      orderBy: 'DESC',
    };

    delete query.period

    const userReq = {
      sub: 1,
      role: RoleEnum.USER,
      username: '',
      email: '',
    };

    await expect(service.findTasksByPeriod(query, userReq)).rejects.toThrow(
      'O campo "period" é obrigatório',
    );
  });
});

//############################### Update Task ########################################//

describe('TaskService - update', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<Repository<Task>>;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
    jest.useRealTimers(); // caso tenha usado fake timers
  });

  const mockTask = {
    id: 1,
    userOwnerId: 1,
    dateEvent: '2025-08-05',
    startTime: '08:00',
    endTime: '09:00',
    title: 'Tarefa teste',
    description: 'Descrição teste',
    status: StatusTaskEnum.PENDING,
  } as Task;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get(getRepositoryToken(Task));
  });

  it('deve atualizar a tarefa com sucesso', async () => {
    const updateDto: UpdateTaskDto = {
      title: 'Atualizado',
      dateEvent: '2025-08-06',
      startTime: '10:00',
      endTime: '11:00',
    };

    taskRepository.findOne.mockResolvedValue(mockTask);
    taskRepository.find.mockResolvedValue([]);
    taskRepository.save.mockImplementation(async (data) => {
      return {
        ...mockTask,
        ...data,
      } as unknown as Task;
    });

    const userReq = { sub: 1, role: RoleEnum.USER, username: '', email: '' };

    const result = await service.update(mockTask.id, updateDto, userReq);

    try {
      jest.spyOn(service, 'verifyDateAndHourFree').mockResolvedValue(true);

      const result = await service.update(mockTask.id, updateDto, userReq);

      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: mockTask.id } });
      expect(service.verifyDateAndHourFree).toHaveBeenCalledWith(updateDto.dateEvent, updateDto.startTime, updateDto.endTime, mockTask.userOwnerId);
      expect(taskRepository.save).toHaveBeenCalledWith({ ...updateDto, id: mockTask.id });
      expect((result as Task).title).toBe(updateDto.title);
    } catch (err) {
      console.log('ERRO NO TESTE UPDATE: - task.service.spec.ts:953', err);
      throw err; // relança para falhar o teste como esperado
    }
  });

  it('deve lançar erro se a tarefa não existir', async () => {
    taskRepository.findOne.mockResolvedValue(null);

    await expect(service.update(999, {}, { sub: 1, role: RoleEnum.USER, username: '', email: '' })).rejects.toThrow('Tarefa não encontrada');
  });

  it('deve lançar erro se a tarefa estiver cancelada', async () => {
    taskRepository.findOne.mockResolvedValue({ ...mockTask, status: StatusTaskEnum.CANCELLED });

    await expect(service.update(mockTask.id, {}, { sub: 1, role: RoleEnum.USER, username: '', email: '' })).rejects.toThrow('Tarefa cancelada já');
  });

  it('deve lançar erro se a tarefa estiver finalizada', async () => {
    taskRepository.findOne.mockResolvedValue({ ...mockTask, status: StatusTaskEnum.FINISHED });

    await expect(service.update(mockTask.id, {}, { sub: 1, role: RoleEnum.USER, username: '', email: '' })).rejects.toThrow('Tarefa finalizada já');
  });

  it('deve lançar erro se o usuário não for dono nem admin', async () => {
    taskRepository.findOne.mockResolvedValue(mockTask);

    const userReq = { sub: 99, role: RoleEnum.USER, username: '', email: '' };

    await expect(service.update(mockTask.id, {}, userReq)).rejects.toThrow('Somente o proprietario da tarefa ou um administrador pode remover.');
  });

  it('deve lançar erro se a data for anterior à data atual', async () => {
    taskRepository.findOne.mockResolvedValue(mockTask);
    const isBeforeSpy = jest.spyOn(dateFns, 'isBefore').mockReturnValue(true);

    const updateDto: UpdateTaskDto = {
      dateEvent: '2020-01-01',
      startTime: '10:00',
      endTime: '11:00',
    };

    await expect(service.update(mockTask.id, updateDto, { sub: 1, role: RoleEnum.USER, username: '', email: '' })).rejects.toThrow('Data não pode ser menor que a data de hoje!');

    isBeforeSpy.mockRestore();
  });

  it('deve lançar erro se verificar conflito de horário e existir conflito', async () => {
    taskRepository.findOne.mockResolvedValue(mockTask);
    const isBeforeSpy = jest.spyOn(service, 'verifyDateAndHourFree').mockImplementation(() => {
      throw new HttpException('Já existe uma tarefa para essa data e hora!', HttpStatus.CONFLICT);
    });

    const updateDto: UpdateTaskDto = {
      dateEvent: '2025-08-06',
      startTime: '10:00',
      endTime: '11:00',
    };

    await expect(service.update(mockTask.id, updateDto, { sub: 1, role: RoleEnum.USER, username: '', email: '' })).rejects.toThrow('Já existe uma tarefa para essa data e hora!');

    isBeforeSpy.mockRestore();
  });

  it('deve lançar erro se enviar apenas parte da data/hora (não as 3 propriedades)', async () => {
    taskRepository.findOne.mockResolvedValue(mockTask);

    const partialUpdate1 = { dateEvent: '2025-08-06' };
    const partialUpdate2 = { startTime: '10:00' };

    await expect(service.update(mockTask.id, partialUpdate1 as any, { sub: 1, role: RoleEnum.USER, username: '', email: '' })).rejects.toThrow('Atualizar data hora inicial ou hora final deve enviar as 3 propriedades');

    await expect(service.update(mockTask.id, partialUpdate2 as any, { sub: 1, role: RoleEnum.USER, username: '', email: '' })).rejects.toThrow('Atualizar data hora inicial ou hora final deve enviar as 3 propriedades');
  });
});

//############################# delete task ####################################################

describe('TaskService - remove', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<Repository<Task>>;

  const mockTask: Task = {
    id: 1,
    title: 'Tarefa de Teste',
    userOwnerId: 1,
    // ...outros campos necessários
  } as Task;

  const mockUser: CurrentUserDto = {
    sub: 1,
    role: RoleEnum.USER,
    username: '',
    email: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),  // << adicionar aqui
          }
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve remover a tarefa com sucesso', async () => {
    taskRepository.findOne.mockResolvedValue(mockTask);
    taskRepository.delete.mockResolvedValue({ affected: 1, raw: {} } as DeleteResult);

    const result = await service.remove(mockTask.id, mockUser);

    expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: mockTask.id } });
    expect(taskRepository.delete).toHaveBeenCalledWith(mockTask.id);
    expect(result).toEqual({ message: 'Tarefa removida com sucesso' });
  });

  it('deve lançar erro se a tarefa não for encontrada', async () => {
    taskRepository.findOne.mockResolvedValue(null);

    await expect(service.remove(mockTask.id, mockUser)).rejects.toThrow('Tarefa não encontrada');
  });

  it('deve lançar erro se usuário não for dono nem admin', async () => {
    taskRepository.findOne.mockResolvedValue({ ...mockTask, userOwnerId: 99 });

    await expect(service.remove(mockTask.id, mockUser)).rejects.toThrow(
      'Somente o proprietario da tarefa ou um administrador pode remover.'
    );
  });

  it('deve lançar erro se a deleção falhar (affected = 0)', async () => {
    taskRepository.findOne.mockResolvedValue(mockTask);
    taskRepository.delete.mockResolvedValue({ affected: 0, raw: {} } as DeleteResult);

    await expect(service.remove(mockTask.id, mockUser)).rejects.toThrow(
      'Erro ao remover tarefa'
    );
  });
});