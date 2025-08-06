import { RoleEnum } from "src/commom/enums/user-enums";
import { User } from "../user/entities/user.entity";

export const mockUser: User = {
  id: 1,
  name: 'Usuário Mockado',
  email: 'mock@email.com',
  password: 'senha123',
  codeForgetPassword: null,
  role: RoleEnum.USER,
  avatar: null,
  tasks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const mockUsersList: User[] = [
  {
    id: 1,
    name: 'Usuário Comum',
    email: 'usuario@teste.com',
    password: 'hashedpassword1',
    codeForgetPassword: null,
    role: RoleEnum.USER,
    avatar: {
      urlAvatar: 'https://exemplo.com/avatar1.png',
      avatarName: 'avatar1.png',
      mimeType: 'image/png',
    },
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null, // ativo
  },
  {
    id: 2,
    name: 'Admin Ativo',
    email: 'admin@teste.com',
    password: 'hashedpassword2',
    codeForgetPassword: null,
    role: RoleEnum.ADMIN,
    avatar: {
      urlAvatar: 'https://exemplo.com/avatar2.png',
      avatarName: 'avatar2.png',
      mimeType: 'image/png',
    },
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null, // ativo
  },
  {
    id: 3,
    name: 'Usuário Desativado',
    email: 'inativo@teste.com',
    password: 'hashedpassword3',
    codeForgetPassword: null,
    role: RoleEnum.USER,
    avatar: null,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(), // simula usuário deletado
  },
];

export const mockUserRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});