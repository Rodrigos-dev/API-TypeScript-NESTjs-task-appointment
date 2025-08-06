import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import exceptions from 'src/commom/utils/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import loggers from 'src/commom/utils/loggers';
import dropbox from 'src/commom/dropbox';
import cloudinary from 'src/commom/cloudinary';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { EmailSendService } from 'src/email-send/email-send.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RabbitService } from 'src/rabbit/rabbit.service';
import { CreateRabbitDto, TypeQueuRabbit } from 'src/rabbit/dto/create-rabbit.dto';
import { RoleEnum, UserTypePathBucketEnum } from 'src/commom/enums/user-enums';
import { CurrentUserDto } from 'src/auth/dto/current-user-dto';
import { UserFindAllByQueryDto, UserFindAllDto } from './dto/query-filters.dto';
import { UpdatePasswordEmailCodeDto } from './dto/update-password-email-code.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private emailSendService: EmailSendService,
    private rabbitService: RabbitService
  ) { }

  async mountUrlUserFileBucket(userId: number, typePath: UserTypePathBucketEnum) {
    if (userId && typePath) {
      return `users/${userId}/${typePath}`
    } else {
      return false
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {

      if (createUserDto.password.toLowerCase() !== createUserDto.confirmPassword.toLowerCase()) {
        throw new HttpException('erro no body enviado', HttpStatus.BAD_REQUEST);
      }

      const user = new User()

      user.name = createUserDto.name
      user.email = createUserDto.email
      user.password = bcrypt.hashSync(createUserDto.password, 8)

      let userCreated = await this.userRepository.save(user)

      if (createUserDto.avatar && createUserDto.avatar.base64) {

        if (createUserDto.avatar.avatarName && createUserDto.avatar.avatarName.endsWith('.jpeg')) {

          const avatarName = `avatar_${Date.now()}.jpeg`

          const montedUrl = await this.mountUrlUserFileBucket(userCreated.id, UserTypePathBucketEnum.AVATAR)

          if (montedUrl) {

            //const url = await dropbox.uploadFileToDropbox({ urlPathToUpload: montedUrl, base64: createUserDto.base64 })

            const url = await cloudinary.uploadFileToCloudinary({ urlPathToUpload: montedUrl, base64: createUserDto.avatar.base64, nameFile: avatarName })

            userCreated.avatar = {
              mimeType: 'image/jpeg',
              avatarName: avatarName,
              urlAvatar: url, // substitua por `url` se você descomentar o upload
            };

            if (url) {
              userCreated = await this.userRepository.save({ ...userCreated, id: Number(userCreated.id) })
            }

          }

        } else {
          loggers.loggerMessage('error', 'A apenas arquivos com extensão jpeg');
        }

      }

      const { password, ...result } = userCreated

      return result

    } catch (err) {
      loggers.loggerMessage('error', err);
      return exceptions.exceptionsReturn(err)
    }
  }

  async findAll(req: any, query: UserFindAllDto) {
    try {

      let { page, take, orderBy } = query;

      if (!page) page = 1;
      if (!take) take = 10;
      if (!orderBy) orderBy = 'DESC';      

      const [result, total] = await this.userRepository.findAndCount({
        skip: (page - 1) * take, // Pula registros com base na página
        take: take, // Limita a quantidade de registros
        order: {
          createdAt: orderBy, // Ordena pela data de criação (exemplo, ajuste conforme sua tabela)
        },
      });

      return {
        total: total,
        currentPage: page,
        totalPages: Math.ceil(total / take),
        users: result || [],
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

      return user;

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }

  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email: email } });

      if (!user) {
        throw new HttpException(`usuário não encontrado!`, HttpStatus.NOT_FOUND);
      }

      return user

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async findAllByQuery(query: UserFindAllByQueryDto) {
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

      return {
        total: total,
        currentPage: page,
        totalPages: Math.ceil(total / take),
        users: users || [],
      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async update(userId: number, updateUserDto: UpdateUserDto, userReq: CurrentUserDto) {
    try {

      if(Number(userId) !== Number(userReq.sub) && userReq.role !== RoleEnum.ADMIN) { 
        throw new HttpException(`Somente o proprio usuário ou um administrador pode alterar dados`, HttpStatus.FORBIDDEN)
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

      if (updateUserDto.role && userReq.role !== RoleEnum.ADMIN) {
        throw new HttpException(`Você não tem permissão para alterar a Permissão, refaça o login e tente novamente`, HttpStatus.FORBIDDEN)
      }

      if (updateUserDto.avatar) {

        if (updateUserDto.avatar.base64 === '') {
          throw new HttpException(`Base 64 não pode ser ''`, HttpStatus.BAD_REQUEST)
        }

        if (updateUserDto.avatar.avatarName && updateUserDto.avatar.avatarName.endsWith('.jpeg')) {

          const deleteAvatar = await this.removeAvatarImage(userId, userReq)

          if (deleteAvatar) {

            const avatarName = `avatar_${Date.now()}.jpeg`

            const montedUrl = await this.mountUrlUserFileBucket(userId, UserTypePathBucketEnum.AVATAR)

            if (montedUrl) {

              //const url = await dropbox.uploadFileToDropbox({ urlPathToUpload: montedUrl, base64: updateUserDto.base64 })
              const url = await cloudinary.uploadFileToCloudinary({ urlPathToUpload: montedUrl, base64: updateUserDto.avatar.base64, nameFile: avatarName })

              if (!url) {
                loggers.loggerMessage('error', 'Url não feito upload');
                throw new HttpException(`Url não feito upload `, HttpStatus.BAD_REQUEST)
              }

              updateUserDto.avatar = {
                mimeType: 'image/jpeg',
                avatarName,
                urlAvatar: url,
                base64: ''
              };

              delete updateUserDto.avatar.base64
              
            }
          } else {
            delete updateUserDto.avatar;
          }


        } else {
          throw new HttpException(`A apenas arquivos com extensão jpeg `, HttpStatus.BAD_REQUEST)
        }
      }

      const userUpdate = await this.userRepository.save({ ...updateUserDto, id: Number(userId) })      

      return userUpdate

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async forgetedPassword(data: ForgetPasswordDto) {
    try {

      const userExists = await this.findOneByEmail(data.email)

      if (!userExists) {
        throw new HttpException(`User don't found`, HttpStatus.BAD_REQUEST);
      }

      const timestamp = Date.now().toString().slice(-2);
      const randomPart = Math.floor(Math.random() * 9000) + 1000;
      let code = `${timestamp}${randomPart}`.slice(0, 4);
      code = `${code}${userExists.id}`

      let emailSended: boolean = false

      const dataEmail = {
        subject: 'Código para atualizar Senha',
        emailTo: userExists.email,
        text: `Seu Codigo para atualizar a Senha é  => ${code}.\n 
          Use seu código para realizar a atualização da sua nova senha`
      }

      const dataRabbit: CreateRabbitDto = {
        message: JSON.stringify(dataEmail),
        typeQueuRabbit: TypeQueuRabbit.SEND_EMAIL_FORGET_PASSWORD
      }

      const queueAdded = await this.rabbitService.create(dataRabbit)

      if (queueAdded) {
        emailSended = true

        let userUpdate = {
          codeForgetPassword: code,
        }

        const updatePassword = await this.userRepository.save({
          ...userUpdate,
          id: Number(userExists.id),
        });

        const firstLetterEmail = `${userExists.email[0]}${userExists.email[1]}`;

        const domain = userExists.email.substring(userExists.email.indexOf('@'));

        const emailToSendMessageEmail = `${firstLetterEmail}*********${domain}`;

        if (!emailSended) {
          return { message: 'Humm...Aconteceu algum problema tente mais tarde ou entre em contato com o suporte,' }
        } else {
          return { message: `Em alguns instantes sera enviado um Email para ${emailToSendMessageEmail} com o código para realizar a atualização de sua nova senha, verifique sua caixa de span ou lixo! Caso não encontre tente novamente ou entre em contato com o suporte.` }
        }
      } else {
        throw new HttpException(`algum erro ao adicionar na fila de processamento`, HttpStatus.BAD_REQUEST);
      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async updatePassword(data: UpdatePasswordDto | UpdatePasswordEmailCodeDto, codeForgetPassword?: string) {
    try {

      let userExists = null
      let messageUserNotFound = null
      let passwordUpdate = null

      if (codeForgetPassword) {
        if (!codeForgetPassword) {
          throw new HttpException(`Body com dados inválidos`, HttpStatus.BAD_REQUEST);
        }

        userExists = await this.userRepository.findOne({
          where: {
            codeForgetPassword: (codeForgetPassword).toString(),
            email: data.email
          }
        })

        if (userExists) {
          passwordUpdate = { password: bcrypt.hashSync(data.password, 8), codeForgetPassword: null }
        } else {
          messageUserNotFound = `Usuário não encontrado! ou não tem codigo, ou então codigo enviado errado`
        }

      } else {

        if (!data.oldPassword) {
          throw new HttpException('oldPassword deve ser enviado', HttpStatus.BAD_REQUEST);
        }

        userExists = await this.userRepository.findOne({
          where: {
            email: data.email
          }
        })

        if (userExists) {
          const oldPasswordSendedIsEqualRegistered = await bcrypt.compare(data.oldPassword, userExists.password);

          if (oldPasswordSendedIsEqualRegistered) {
            passwordUpdate = { password: bcrypt.hashSync(data.password, 8), codeForgetPassword: null }
          } else {
            throw new HttpException('oldPassword enviado não é igual ao registrado', HttpStatus.BAD_REQUEST);
          }

        } else {
          messageUserNotFound = `Usuário não encontrado!`
        }
      }

      if (!userExists) {
        throw new HttpException(messageUserNotFound, HttpStatus.BAD_REQUEST);
      }

      if (userExists.email.toLowerCase() !== data.email.toLowerCase()) {
        throw new HttpException(`Email enviado no body não é igual o cadastrado`, HttpStatus.BAD_REQUEST);
      }

      if (passwordUpdate) {
        return await this.userRepository.save({ ...passwordUpdate, id: Number(userExists.id), })
      } else {
        throw new HttpException(`Erro ao gerar o passord criptografado`, HttpStatus.BAD_REQUEST);
      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async remove(userId: number) {
    try {

      const deleted = await this.userRepository.delete(Number(userId))

      if (deleted.affected > 0) {
        //const deleteFolder = dropbox.deleteFolderUserDropbox(userId)  
        const deleteFolder = cloudinary.deleteFolderUserFromCloudinary(userId)
        return true
      } else {
        return false
      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async removeAvatarImage(userId: number, userReq: CurrentUserDto) {
    try {

      if (userReq.sub !== userId && userReq.role !== RoleEnum.ADMIN) {
        throw new HttpException(`Você não tem permissão para essa ação`, HttpStatus.FORBIDDEN)
      }

      const userExists = await this.userRepository.findOne({ where: { id: userId } })

      if (!userExists || !userExists.avatar.urlAvatar) {
        throw new HttpException(`Usuário não encontrado ou não tem uma url avatar`, HttpStatus.BAD_REQUEST)
      }

      if (userExists.avatar.avatarName) {

        const urlPathFileDelete = await this.mountUrlUserFileBucket(userExists.id, UserTypePathBucketEnum.AVATAR)

        if (urlPathFileDelete) {
          //const remove = await dropbox.deleteFileDropbox(`${urlFileDelete}`)
          const remove = await cloudinary.deleteFileFromCloudinary(`${urlPathFileDelete}/${userExists.avatar.avatarName}`)

          if (remove) {
            return true
          } else {
            return false
          }
        }

      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }
}
