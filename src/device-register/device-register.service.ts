import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDeviceRegisterDto } from './dto/create-device-register.dto';
import { UpdateDeviceRegisterDto } from './dto/update-device-register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceRegister } from './entities/device-register.entity';
import { Repository } from 'typeorm';
import loggers from 'src/commom/utils/loggers';
import exceptions from 'src/commom/utils/exceptions';

@Injectable()
export class DeviceRegisterService {

  constructor(
    @InjectRepository(DeviceRegister) private deviceRegisterRepository: Repository<DeviceRegister>
  ) { }

  async createOrUpdateRegisterToken(data: CreateDeviceRegisterDto) {
    try {

      if (!data.userId) {
        loggers.loggerMessage('error', 'property userId must be sended, no found')
        throw new HttpException(`property userId must be sended, no found`, HttpStatus.BAD_REQUEST)
      }

      if (!data.token) {
        loggers.loggerMessage('error', 'property token must be sended, no found')
        throw new HttpException(`property token must be sended, no found`, HttpStatus.BAD_REQUEST)
      }

      const registerUserExists = await this.deviceRegisterRepository.findOne({
        where: {
          userId: Number(data.userId)
        }
      })

      if (registerUserExists) {

        let updateRegisterToken: CreateDeviceRegisterDto = { token: data.token }

        return await this.deviceRegisterRepository.save({ ...updateRegisterToken, id: Number(registerUserExists.id) })

      } else {

        const registerToken = new DeviceRegister()

        registerToken.userId = data.userId
        registerToken.token = data.token
        registerToken.systemType = data.systemType

        return await this.deviceRegisterRepository.save(registerToken)

      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async findAllTokenRegisters(queryParams: { page: number; take: number; orderBy: 'ASC' | 'DESC'; }) {
    try {

      let { page, take, orderBy } = queryParams;

      if (!page) page = 1;
      if (!take) take = 10;
      if (!orderBy) orderBy = 'DESC';

      const [tokenRegisters, total] = await this.deviceRegisterRepository.findAndCount({
        skip: take * (page - 1),
        take,
        order: { id: orderBy },
      })

      return [{ total: total, tokenRegisters: tokenRegisters }]

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async getOneByUserOwnerRegisterId(userIdOwnerRegisterToken: number) {
    try {

      const tokenExists = await this.deviceRegisterRepository.findOne({
        where: {
          userId: Number(userIdOwnerRegisterToken)
        }
      })       

      if (!tokenExists) {
        throw new HttpException(`register not found user: ${userIdOwnerRegisterToken}`, HttpStatus.BAD_REQUEST)
      }

      return tokenExists

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async remove(userId: number, registerId: number) {
    try {

      const tokenExists = await this.deviceRegisterRepository.findOne({
        where: {          
          id: Number(registerId),
          userId: Number(userId)
        }
      })        

      if (!tokenExists) {
        loggers.loggerMessage('error', 'register not found ')
        throw new HttpException(`register not found `, HttpStatus.BAD_REQUEST)
      }     

      return await this.deviceRegisterRepository.delete(registerId)

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }
}
