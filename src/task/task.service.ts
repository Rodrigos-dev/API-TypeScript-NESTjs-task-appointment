import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  addMinutes,
  isBefore,
  parseISO,
  startOfDay,
  subMinutes,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear
} from 'date-fns';
import { In, Not, Repository } from 'typeorm';
import exceptions from 'src/commom/utils/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Task } from './entities/task.entity';
import { CurrentUserDto } from 'src/auth/dto/current-user-dto';
import loggers from 'src/commom/utils/loggers';
import { TaskFindAllDto, TasksPeriodFindDto } from './dto/task-query-filters.dto';
import { RoleEnum } from 'src/commom/enums/user-enums';
import { StatusTaskEnum } from 'src/commom/enums/task.enums';

@Injectable()
export class TaskService {

  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) { }

  async create(createTaskDto: CreateTaskDto, userReq: CurrentUserDto) {
    try {
      const eventDate = startOfDay(parseISO(createTaskDto.dateEvent));
      const today = startOfDay(new Date());

      if (isBefore(eventDate, today)) {
        throw new HttpException(`Data não pode ser menor que a data de hoje!`, HttpStatus.BAD_REQUEST);
      }

      if (Number(createTaskDto.userOwnerId) !== userReq.sub) {
        throw new HttpException(`Usuário logado deve ser o mesmo que está criando a tarefa!`, HttpStatus.BAD_REQUEST);
      }

      const userExists = await this.userRepository.findOne({ where: { id: userReq.sub } });

      if (!userExists) {
        throw new HttpException(`Usuário não encontrado!`, HttpStatus.NOT_FOUND);
      }

      const taskDataHourExists = await this.verifyDateAndHourFree(
        createTaskDto.dateEvent,
        createTaskDto.startTime,
        createTaskDto.endTime,
        createTaskDto.userOwnerId
      );

      if (!taskDataHourExists) {
        throw new HttpException(`Já existe uma tarefa para essa data e hora!`, HttpStatus.CONFLICT);
      }

      const task = new Task();

      task.userOwnerId = createTaskDto.userOwnerId
      task.dateEvent = createTaskDto.dateEvent
      task.startTime = createTaskDto.startTime
      task.endTime = createTaskDto.endTime
      task.title = createTaskDto.title
      task.description = createTaskDto.description
      task.user = userExists

      const createdEvent = await this.taskRepository.save(task);

      delete createdEvent.user

      return createdEvent;

    } catch (err) {
      loggers.loggerMessage('error', err);
      return exceptions.exceptionsReturn(err)
    }
  }

  async verifyDateAndHourFree(
    dateEvent: string,
    startTime: string,
    endTime: string,
    userOwnerId: number = null
  ) {
    try {

      const startDate = new Date(`${dateEvent} ${startTime}`);
      const endDate = new Date(`${dateEvent} ${endTime}`);

      // Validação do horário
      if (endDate <= startDate) {
        throw new HttpException(
          'Horário de término deve ser maior que o horário de início',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Ajuste para dar margem mínima (igual ao seu original)
      const startHour = addMinutes(startDate, 1);
      const endHour = subMinutes(endDate, 1);

      const where: any = {
        dateEvent,
        status: Not(In([StatusTaskEnum.CANCELLED])),
      };

      if (userOwnerId) {
        where.userOwnerId = userOwnerId;
      }

      const scheduleEvents = await this.taskRepository.find({ where });

      for await (const scheduleEvent of scheduleEvents) {
        const start = new Date(`${scheduleEvent.dateEvent} ${scheduleEvent.startTime}`);
        const end = new Date(`${scheduleEvent.dateEvent} ${scheduleEvent.endTime}`);

        const startInside = startHour >= start && startHour <= end;
        const endInside = endHour >= start && endHour <= end;
        const englobaCompletamente = startHour <= start && endHour >= end;

        if (startInside || endInside || englobaCompletamente) {
          throw new HttpException(
            `Já existe uma tarefa para essa data e hora!`,
            HttpStatus.NOT_FOUND,
          );
        }
      }

      return true;
    } catch (err) {
      loggers.loggerMessage('error', err);
      return exceptions.exceptionsReturn(err);
    }
  }

  async findAll(query: TaskFindAllDto, userReq: CurrentUserDto) {
    try {

      let {
        userOwnerId,
        dateEvent,
        title,
        description,
        status,
        page,
        take,
        orderBy
      } = query;

      if (!page) page = 1;
      if (!take) take = 10;
      if (!orderBy) orderBy = 'DESC';

      if (userReq.role !== RoleEnum.ADMIN) {

        if (!userOwnerId) {
          throw new HttpException(`Deve ser enviado o id do usuário a buscar as tarefas`, HttpStatus.FORBIDDEN)
        }

        if (userOwnerId && (Number(userOwnerId) !== Number(userReq.sub))) {
          throw new HttpException(`Usuário filtrado deve ser o mesmo que faz a request`, HttpStatus.FORBIDDEN)
        }

      }

      const queryTasks = this.taskRepository.createQueryBuilder('task');

      if (userOwnerId) {
        queryTasks.andWhere('task.userOwnerId = :userOwnerId', { userOwnerId });
      }

      if (dateEvent) {
        queryTasks.andWhere('task.dateEvent = :dateEvent', { dateEvent });
      }

      if (title) {
        queryTasks.andWhere('task.title LIKE :title', { title: `%${title}%` });
      }

      if (description) {
        queryTasks.andWhere('task.description LIKE :description', { description: `%${description}%` });
      }

      if (status) {
        const normalizedStatus = status.toLowerCase();
        queryTasks.andWhere('task.status = :status', { status: normalizedStatus });
      }

      queryTasks
        .orderBy('task.id', orderBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
        .skip((page - 1) * take)
        .take(take);


      const [tasks, total] = await queryTasks.getManyAndCount()

      return {
        total: total,
        currentPage: page,
        totalPages: Math.ceil(total / take),
        tasks: tasks || [],
      }

    } catch (err) {
      loggers.loggerMessage('error', err);
      return exceptions.exceptionsReturn(err)
    }
  }

  async findOne(taskId: number) {
    try {

      const taskExists = await this.taskRepository.findOne({ where: { id: taskId } })

      if (!taskExists) {
        throw new HttpException(`Tarefa não encontrada`, HttpStatus.NOT_FOUND)
      }

      return taskExists

    } catch (err) {
      loggers.loggerMessage('error', err);
      return exceptions.exceptionsReturn(err)
    }
  }

  async findTasksByPeriod(query: TasksPeriodFindDto, userReq: CurrentUserDto) {
    try {

      let {
        userOwnerId,
        period,
        status,
        page,
        take,
        orderBy
      } = query;

      if (!page) page = 1;
      if (!take) take = 10;
      if (!orderBy) orderBy = 'DESC';

      if (userReq.role !== RoleEnum.ADMIN) {

        if (!userOwnerId) {
          throw new HttpException(`Deve ser enviado o id do usuário a buscar as tarefas`, HttpStatus.FORBIDDEN)
        }

        if (userOwnerId && (Number(userOwnerId) !== Number(userReq.sub))) {
          throw new HttpException(`Usuário filtrado deve ser o mesmo que faz a request`, HttpStatus.FORBIDDEN)
        }

      }

      if (!period) {
        throw new HttpException('O campo "period" é obrigatório', HttpStatus.BAD_REQUEST);
      }

      const now = new Date();
      let start: Date;
      let end: Date;

      switch (period) {
        case 'day':
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case 'week':
          start = startOfWeek(now);
          end = endOfWeek(now);
          break;
        case 'month':
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case 'year':
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        default:
          throw new HttpException('Período inválido', HttpStatus.BAD_REQUEST);
      }

      const queryTasks = this.taskRepository.createQueryBuilder('task');

      queryTasks.andWhere('task.dateEvent BETWEEN :start AND :end', { start, end });

      if (userOwnerId) {
        queryTasks.andWhere('task.userOwnerId = :userOwnerId', { userOwnerId });
      }

      if (status) {
        const normalizedStatus = status.toLowerCase();
        queryTasks.andWhere('task.status = :status', { status: normalizedStatus });
      }

      queryTasks
        .orderBy('task.id', orderBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
        .skip((page - 1) * take)
        .take(take);


      const [tasks, total] = await queryTasks.getManyAndCount()

      return {
        total: total,
        currentPage: page,
        totalPages: Math.ceil(total / take),
        tasks: tasks || [],
      }

    } catch (err) {
      loggers.loggerMessage('error', err);
      return exceptions.exceptionsReturn(err)
    }
  }

  async update(taskId: number, updateTaskDto: UpdateTaskDto, userReq: CurrentUserDto) {
    try {

      const taskExists = await this.taskRepository.findOne({ where: { id: taskId } })

      if (!taskExists) {
        throw new HttpException(`Tarefa não encontrada`, HttpStatus.NOT_FOUND)
      }

      if (taskExists && taskExists.status === StatusTaskEnum.CANCELLED) {
        throw new HttpException(`Tarefa cancelada já`, HttpStatus.NOT_FOUND)
      }

      if (taskExists && taskExists.status === StatusTaskEnum.FINISHED) {
        throw new HttpException(`Tarefa finalizada já`, HttpStatus.NOT_FOUND)
      }

      if (Number(userReq.sub) !== Number(taskExists.userOwnerId) && userReq.role !== RoleEnum.ADMIN) {
        throw new HttpException(`Somente o proprietario da tarefa ou um administrador pode remover.`, HttpStatus.FORBIDDEN)
      }


      if (updateTaskDto.dateEvent || updateTaskDto.startTime || updateTaskDto.endTime) {

        if (updateTaskDto.dateEvent && updateTaskDto.startTime && updateTaskDto.endTime) {

          const eventDate = startOfDay(parseISO(updateTaskDto.dateEvent));
          const today = startOfDay(new Date());

          if (isBefore(eventDate, today)) {
            console.log(eventDate, today, 'before 2 - task.service.ts:358')
            throw new HttpException(`Data não pode ser menor que a data de hoje!`, HttpStatus.BAD_REQUEST);
          }

          const taskDataHourExists = await this.verifyDateAndHourFree(
            updateTaskDto.dateEvent,
            updateTaskDto.startTime,
            updateTaskDto.endTime,
            taskExists.userOwnerId
          );

        } else {
          throw new HttpException(`Atualizar data hora inicial ou hora final deve enviar as 3 propriedades`, HttpStatus.BAD_REQUEST)
        }
      }

      const taskUpdate = await this.taskRepository.save({ ...updateTaskDto, id: Number(taskExists.id) })

      return taskUpdate

    } catch (err) {
      loggers.loggerMessage('error', err);
      return exceptions.exceptionsReturn(err)
    }
  }

  async remove(taskId: number, userReq: CurrentUserDto) {
    try {

      const taskExists = await this.taskRepository.findOne({ where: { id: taskId } })

      if (!taskExists) {
        throw new HttpException(`Tarefa não encontrada`, HttpStatus.NOT_FOUND)
      }

      if (Number(userReq.sub) !== Number(taskExists.userOwnerId) && userReq.role !== RoleEnum.ADMIN) {
        throw new HttpException(`Somente o proprietario da tarefa ou um administrador pode remover.`, HttpStatus.FORBIDDEN)
      }

      const deleted = await this.taskRepository.delete(Number(taskId))

      if (deleted.affected === 0) {
        throw new HttpException('Erro ao remover tarefa', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return { message: 'Tarefa removida com sucesso' };

    } catch (err) {
      loggers.loggerMessage('error', err);
      return exceptions.exceptionsReturn(err)
    }
  }
}
