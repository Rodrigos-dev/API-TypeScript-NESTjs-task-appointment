import { StatusTaskEnum } from "src/commom/enums/task.enums";
import { Task } from "../task/entities/task.entity";
import { mockUsersList } from "src/__mocks__/user.mock";

const mockTasksList: Task[] = [
  {
    id: 1,
    userOwnerId: 1,
    dateEvent: '2025-08-05',
    startTime: '09:00',
    endTime: '10:00',
    title: 'Reunião com time',
    description: 'Planejamento semanal',
    status: StatusTaskEnum.PENDING,
    user: mockUsersList[0],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 2,
    userOwnerId: 1,
    dateEvent: '2025-08-06',
    startTime: '11:00',
    endTime: '12:00',
    title: 'Code Review',
    description: 'Revisar PRs pendentes',
    status: StatusTaskEnum.FINISHED,
    user: mockUsersList[0],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 3,
    userOwnerId: 1,
    dateEvent: '2025-08-07',
    startTime: '14:00',
    endTime: '15:00',
    title: 'Estudar NestJS',
    description: 'Aprender sobre Guards',
    status: StatusTaskEnum.CANCELLED,
    user: mockUsersList[0],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 1,
    userOwnerId: 1,
    dateEvent: '2025-08-05',
    startTime: '09:00',
    endTime: '10:00',
    title: 'Reunião com time',
    description: 'Planejamento semanal',
    status: StatusTaskEnum.PENDING,
    user: mockUsersList[1],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
];


export const mockTaskRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

