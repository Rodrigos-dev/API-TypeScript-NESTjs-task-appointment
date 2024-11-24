import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import index from '../commom/firebase';

@Injectable()
export class PushNotificationService {
  async sendPushNotification(data: CreatePushNotificationDto) {
    try {

      let page = 1;
      let take = 500;

      if (!data.notification.title || data.notification.title === '') {
        throw new HttpException(`message must have a title`, HttpStatus.BAD_REQUEST)
      }

      if (!data.notification.body || data.notification.body === '') {
        throw new HttpException(`message must have a body`, HttpStatus.BAD_REQUEST)
      }

      // Verifica se a string contém '.com' e comeca 'https://'
      if (!data.notification.imageUrl.match(/\.com/) || !data.notification.imageUrl.match(/^https:\/\//)) {
        throw new HttpException(`message must have a url valid https://.....-.com or send '' cause not have a url`, HttpStatus.BAD_REQUEST)
      }

      if (data.notification.imageUrl === '') {
        delete data.notification.imageUrl
      }

      if (!data.data) {
        delete data.data
      }

      // if (data.tokens.length === 0) {

      //   const qtdTokenssRegistereds = await this.firebaseDeviceRegisterEntityRepository.count()

      //   if (qtdTokenssRegistereds === 0) {
      //     throw new HttpException(`no token registereds still`, HttpStatus.NOT_FOUND)
      //   }

      //   let qtdQuerysToRealized = Math.ceil(qtdTokenssRegistereds / 500);

      //   for (let x = 0; x < qtdQuerysToRealized; x++) {
      //     const queryToken = this.firebaseDeviceRegisterEntityRepository.createQueryBuilder('registerFirebase')
      //       .select('registerFirebase.token', 'token')

      //       .skip(take * (page - 1))
      //       .take(take)
      //       .orderBy('comment.id', 'DESC');

      //     const registeredsTokens = await queryToken.getRawMany();

      //     for await (const register of registeredsTokens) {
      //       data.tokens.push(register.token)
      //     }

      //     index.postPushNotification(data)

      //     page++
      //   }

      //   let pushInDataBase: CreatePushNotificationDataBaseDto = {
      //     message: data.notification.body ? data.notification.body : null,
      //     title: data.notification.title ? data.notification.title : null,
      //     imageUrl: data.notification.imageUrl ? data.notification.imageUrl : null,
      //     allUsers: true,
      //     icon: data.icon ? data.icon : null,
      //     userId: null
      //   }

      //   await this.pushNotificationDataBaseService.createPushInDataBase(pushInDataBase)

      // } else {

      //   const notificationSend = index.postPushNotification(data)

      //   const queryUsers = await this.firebaseDeviceRegisterEntityRepository.createQueryBuilder('tokensRegistereds')
      //     .where('tokensRegistereds.token IN (:...tokens) ', { tokens: data.tokens })

      //   const tokensRegistereds: any = await queryUsers.getMany()

      //   if(tokensRegistereds.length > 0){
      //     console.log('aaaa')
      //   }

      //   for await (const tokenRegistered of tokensRegistereds) {

      //     let pushInDataBase: CreatePushNotificationDataBaseDto = {
      //       message: data.notification.body ? data.notification.body : null,
      //       title: data.notification.title ? data.notification.title : null,
      //       imageUrl: data.notification.imageUrl ? data.notification.imageUrl : null,
      //       allUsers: false,
      //       icon: data.icon ? data.icon : null,
      //       userId: tokenRegistered.userId
      //     }

      //     await this.pushNotificationDataBaseService.createPushInDataBase(pushInDataBase)

      //   }
      // }

    } catch (err) {
      if (err.driverError) {
        throw new HttpException(err.driverError, HttpStatus.INTERNAL_SERVER_ERROR)
      } else {
        if (err.status >= 300 && err.status < 500) {
          throw err
        } else if (err.message) {
          throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
        } else {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
        }
      }
    }
  }
}
