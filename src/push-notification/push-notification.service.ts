import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import index from '../commom/firebase';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceRegister } from 'src/device-register/entities/device-register.entity';
import { Repository } from 'typeorm';
import { SendPushNotificationFirebaseDto } from './dto/send-push-notification-firebase.dto';
import { PushNotification } from './entities/push-notification.entity';
import loggers from 'src/commom/utils/loggers';
import exceptions from 'src/commom/utils/exceptions';

@Injectable()
export class PushNotificationService {

  constructor(
    @InjectRepository(PushNotification) private pushNotificationRepository: Repository<PushNotification>,
    @InjectRepository(DeviceRegister) private deviceRegisterRepository: Repository<DeviceRegister>
  ) { }

  async sendPushNotification(data: SendPushNotificationFirebaseDto) {
    try {

      let page = 1;
      let take = 499;

      // Verifica se a string contém '.com' e comeca 'https://'
      if (data.notification.imageUrl && (!data.notification.imageUrl.match(/\.com/) || !data.notification.imageUrl.match(/^https:\/\//))) {
        throw new HttpException(`Deve enviar uma url válida https://...`, HttpStatus.BAD_REQUEST)
      }

      if (data.notification.imageUrl === '') {
        delete data.notification.imageUrl
      }

      if (!data.data) {
        delete data.data
      }    
      
      if(data.tokens.length > 499){
        throw new HttpException(`Apenas 500 tokens por vez`, HttpStatus.BAD_REQUEST)
      }

      if (data.tokens.length === 0) {

        let continueSendPush = true        
        let userIdsReceivePushDatabase = []

        while (continueSendPush === true){

          let userIdsReceivePush = []

          const queryToken = this.deviceRegisterRepository.createQueryBuilder('deviceRegister')
          .select(['token', 'userId'])

            .skip(take * (page - 1))
            .take(take)
            .orderBy('deviceRegister.id', 'DESC');

          const registeredsTokens = await queryToken.getRawMany();

          if(registeredsTokens.length > 0){
            for await (const register of registeredsTokens) {
              data.tokens.push(register.token)
              userIdsReceivePush.push(register.userId)
              userIdsReceivePushDatabase.push(register.userId)
            }

            const notificationSend = await index.postPushNotification(data)
  
            page++

          }else{
            continueSendPush = false
          }
        } 
        
        const pushSaveIndatabase = []

        for await (const userId of userIdsReceivePushDatabase) { 

          const push = new PushNotification()
            push.message = data.notification.body,
            push.title = data.notification.title,
            push.imageUrl = data.notification.imageUrl ? data.notification.imageUrl : null,
            push.allUsers = true,
            push.icon = data.icon ? data.icon : null,
            push.userId = userId         

          pushSaveIndatabase.push(push)

        }             

        await this.pushNotificationRepository.save(pushSaveIndatabase)

        return true

      } else {        

        const queryUsers = this.deviceRegisterRepository.createQueryBuilder('tokensRegistereds')
          .where('tokensRegistereds.token IN (:...tokens) ', { tokens: data.tokens })

        const tokensRegistereds: any = await queryUsers.getMany()        

        const notificationSend = await index.postPushNotification(data)

        const pushSaveIndatabase = []

        for await (const tokenRegistered of tokensRegistereds) {

          const push = new PushNotification()

          push.message = data.notification.body,
          push.title = data.notification.title,
          push.imageUrl = data.notification.imageUrl ? data.notification.imageUrl : null,
          push.allUsers = false,
          push.icon = data.icon ? data.icon : null,
          push.userId = tokenRegistered.userId       
          
          pushSaveIndatabase.push(push)
        }

        return await this.pushNotificationRepository.save(pushSaveIndatabase)
      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

  async delete(pushIds: number[]){
    try{

      if(pushIds.length === 0) {
        //.loggerMessage('error', 'Id ou ids das notificação a ser deletada deve ser enviada/s')
        throw new HttpException(`Id ou ids das notificação a ser deletada deve ser enviada/s`, HttpStatus.BAD_REQUEST)
      }

      return await this.pushNotificationRepository.delete(pushIds)
      
    }catch(err){
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }
}
