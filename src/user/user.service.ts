import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import exceptions from 'src/commom/utils/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import loggers from 'src/commom/utils/loggers';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {

      if (createUserDto.password.toLowerCase() !== createUserDto.confirmPassword.toLowerCase()) {
        loggers.loggerMessage('error', `Password e confirmPassword não podem ser diferentes!`)
        throw new HttpException('erro no body enviado', HttpStatus.BAD_REQUEST);
      }

      const user = new User()

      user.name = createUserDto.name
      user.email = createUserDto.email
      user.password = bcrypt.hashSync(createUserDto.password, 8)

      const userCreated = await this.userRepository.save(user)

      const { password, ...result } = userCreated

      return result

    } catch (err) {      
      return exceptions.exceptionsReturn(err)
    }
  }

  async findAll(req: any, query: {
    page: number;
    take: number;
    orderBy: 'ASC' | 'DESC';
  }) {
    try {

      let { page, take, orderBy } = query;

      if (!page) page = 1;
      if (!take) take = 10;
      if (!orderBy) orderBy = 'DESC';

      const userDidRequest = req.user

      const [result, total] = await this.userRepository.findAndCount({
        skip: (page - 1) * take, // Pula registros com base na página
        take: take, // Limita a quantidade de registros
        order: {
          createdAt: orderBy, // Ordena pela data de criação (exemplo, ajuste conforme sua tabela)
        },
      });

      const resultWithOutPassword = result.map(user => {
        const { password, ...rest } = user;
        return rest;
      });

      return {
        total: total,
        currentPage: page,
        totalPages: Math.ceil(total / take),
        users: resultWithOutPassword || [],
      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async findOneById(userId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } })

      if (!user) {
        throw new HttpException(`Usuário não encontrado!`, HttpStatus.NOT_FOUND);
      }

      const { password, ...rest } = user;
      
      return rest;

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }

  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email: email } });

      if (!user) {
        loggers.loggerMessage('error', `email invalido, usuário não encontrado!`)
        throw new HttpException(`usuário não encontrado!`, HttpStatus.NOT_FOUND);
      }

      return user
      
    } catch (err) {      
      return exceptions.exceptionsReturn(err)
    }
  }

  async findAllByQuery(query: {
    userId: number
    email: string,
    name: string,
    page: number;
    take: number;
    orderBy: 'ASC' | 'DESC';
  }) {
    try {

      let { page, take, orderBy, userId, email, name } = query;

      if (!page) page = 1;
      if (!take) take = 10;
      if (!orderBy) orderBy = 'DESC';

      const queryFind = this.userRepository.createQueryBuilder('user')

      if (userId) {
        queryFind.orWhere('user.id = :userId', { userId })
      }

      if (email) {
        queryFind.orWhere('user.email = :email', { email })
      }

      if (name) {
        queryFind.orWhere('user.name = :name', { name })
      }

      queryFind.orderBy('user.id', orderBy)
        .skip((page - 1) * take)
        .take(take)

      const [users, total]: any = await queryFind.getManyAndCount()

      const resultWithOutPassword = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });

      return {
        total: total,
        currentPage: page,
        totalPages: Math.ceil(total / take),
        users: resultWithOutPassword || [],
      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async update(userId: number, updateUserDto: UpdateUserDto, userReq: User) {
    try {

      if (updateUserDto.password) {
        throw new HttpException(`Esse metodo não atualiza o password`, HttpStatus.NOT_FOUND);
      }

      if (updateUserDto.email) {
        const userExistsWithThisEmail = await this.userRepository.findOne({ where: { email: updateUserDto.email } })

        if (userExistsWithThisEmail && Number(userExistsWithThisEmail.id) !== Number(userId)) {
          throw new HttpException(`Email já existe`, HttpStatus.BAD_REQUEST);
        }

        if (userExistsWithThisEmail && userExistsWithThisEmail.email.toLowerCase() === updateUserDto.email.toLowerCase()) {
          throw new HttpException(`Seu email cadastrado já é esse`, HttpStatus.BAD_REQUEST);
        }
      }

      if(updateUserDto.role && userReq.role !== Role.ADMIN){
        throw new HttpException(`Você não tem permissão para alterar a Permissão, refaça o login e tente novamente`, HttpStatus.FORBIDDEN)
      }

      return await this.userRepository.save({ ...updateUserDto, id: Number(userId) })

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async remove(userId: number) {
    try {

      const deleted = await this.userRepository.delete(Number(userId))

      if (deleted.affected > 0) {
        return true
      } else {
        return false
      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }
}
