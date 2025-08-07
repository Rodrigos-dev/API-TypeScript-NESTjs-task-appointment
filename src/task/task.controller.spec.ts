import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUserDto } from 'src/auth/dto/current-user-dto';
import { TaskFindAllDto, TasksPeriodFindDto } from './dto/task-query-filters.dto';
import { StatusTaskEnum, PeriodTasksEnum } from 'src/commom/enums/task.enums';

// Mock do TaskService para isolar o teste do controller
const mockTaskService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findTasksByPeriod: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
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

  // --- Teste do endpoint POST /task ---
  describe('create', () => {
    it('deve chamar o método create do serviço com o DTO e o usuário corretos', async () => {
      const mockDto: CreateTaskDto = {
        userOwnerId: 1,
        dateEvent: '2025-08-02',
        startTime: '14:30',
        endTime: '16:00',
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa de teste',
      };
      const mockResult = { id: 1, ...mockDto };
      jest.spyOn(service, 'create').mockResolvedValue(mockResult as any);

      const result = await controller.create(mockDto, mockUserReq);

      expect(service.create).toHaveBeenCalledWith(mockDto, mockUserReq);
      expect(result).toEqual(mockResult);
    });
  });

  // --- Teste do endpoint GET /task ---
  describe('findAll', () => {
    it('deve chamar o método findAll do serviço com a query e o usuário corretos', async () => {
      const mockQuery: TaskFindAllDto = {
        userOwnerId: 1,
        status: StatusTaskEnum.PENDING,
        page: 1,
        take: 10,
      };
      const mockResult = { data: [], total: 0 };
      jest.spyOn(service, 'findAll').mockResolvedValue(mockResult as any);

      const result = await controller.findAll(mockQuery, mockUserReq);

      expect(service.findAll).toHaveBeenCalledWith(mockQuery, mockUserReq);
      expect(result).toEqual(mockResult);
    });
  });

  // --- Teste do endpoint GET /task/:taskId ---
  describe('findOne', () => {
    it('deve chamar o método findOne do serviço com o ID correto', async () => {
      const mockId = '1';
      const mockResult = { id: 1, title: 'Tarefa encontrada' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult as any);

      const result = await controller.findOne(mockId);

      expect(service.findOne).toHaveBeenCalledWith(+mockId);
      expect(result).toEqual(mockResult);
    });
  });

  // --- Teste do endpoint GET /task/find/period ---
  describe('findTasksByPeriod', () => {
    it('deve chamar o método findTasksByPeriod do serviço com a query e o usuário corretos', async () => {
      const mockQuery: TasksPeriodFindDto = {
        period: PeriodTasksEnum.WEEK,
        userOwnerId: 1,
      };
      const mockResult = { data: [], total: 0 };
      jest.spyOn(service, 'findTasksByPeriod').mockResolvedValue(mockResult as any);

      const result = await controller.findTasksByPeriod(mockQuery, mockUserReq);

      expect(service.findTasksByPeriod).toHaveBeenCalledWith(mockQuery, mockUserReq);
      expect(result).toEqual(mockResult);
    });
  });

  // --- Teste do endpoint PATCH /task/:taskId ---
  describe('update', () => {
    it('deve chamar o método update do serviço com o ID, DTO e usuário corretos', async () => {
      const mockId = '1';
      const mockDto: UpdateTaskDto = { title: 'Tarefa Atualizada' };
      const mockResult = { affected: 1 };
      jest.spyOn(service, 'update').mockResolvedValue(mockResult as any);

      const result = await controller.update(mockId, mockDto, mockUserReq);

      expect(service.update).toHaveBeenCalledWith(+mockId, mockDto, mockUserReq);
      expect(result).toEqual(mockResult);
    });
  });

  // --- Teste do endpoint DELETE /task/:taskId ---
  describe('remove', () => {
    it('deve chamar o método remove do serviço com o ID e o usuário corretos', async () => {
      const mockId = '1';
      const mockResult = { affected: 1 };
      jest.spyOn(service, 'remove').mockResolvedValue(mockResult as any);

      const result = await controller.remove(mockId, mockUserReq);

      expect(service.remove).toHaveBeenCalledWith(+mockId, mockUserReq);
      expect(result).toEqual(mockResult);
    });
  });
});