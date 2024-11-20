import { Injectable } from '@nestjs/common';
import { CreateUserTestBullQueueDto } from './dto/create-user-test-bull-queue.dto';
import { UpdateUserTestBullQueueDto } from './dto/update-user-test-bull-queue.dto';
import { InjectQueue, Process } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Job, Queue } from 'bull';

@Injectable()
export class UserTestBullQueueService {

  constructor(
    @InjectQueue('users') private usersFila: Queue,		//=> aki add a fila users aki, ela jah foi criada no module
    @InjectRepository(User)
    private userRepository: Repository<User>,    
  ) { }


  async addUserByQueue(createUserDto: CreateUserTestBullQueueDto) {
    try {      

      for (let i = 1; i < 10; i++) {
        const user = new User()

        user.name = createUserDto.name + `${i}`
        user.email = createUserDto.email + `${i}`
        user.password = createUserDto.password      

        this.usersFila.add('users-job', user, {delay: 1000})        
      }

      return 'ok'

    } catch (err) {
      throw err
    }
  }  

  async saveUserInDatabase(user: CreateUserDto){
    try{      
      return await this.userRepository.save(user)
    }catch(err){
      throw err
    }
  }

}
