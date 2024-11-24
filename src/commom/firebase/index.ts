
import * as admin from 'firebase-admin';
import { CreatePushNotificationDto } from 'src/push-notification/dto/create-push-notification.dto';

const postPushNotification = (data: CreatePushNotificationDto) => {    

    return admin.messaging().sendEachForMulticast({
      tokens: data.tokens,
      notification: data.notification,     
      data: data.data,
    })
    .then((response) => {
      console.log(response, 1111)
      return response
    })
    .catch((error) => {
      console.log(error, 222);
      return error
    });
 
};

export default {  
  postPushNotification
};



