
import * as admin from 'firebase-admin';
import { SendPushNotificationFirebaseDto } from 'src/push-notification/dto/send-push-notification-firebase.dto';
import loggers from '../utils/loggers';
import exceptions from '../utils/exceptions';

const postPushNotification = async (data: SendPushNotificationFirebaseDto) => {    

    return await admin.messaging().sendEachForMulticast({
      tokens: data.tokens,
      notification: data.notification,     
      data: data.data,
    })
    .then((response) => {
      loggers.loggerMessage('detail', JSON.stringify(response))
      return response
    })
    .catch((err) => {     
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)      
    });
 
};

export default {  
  postPushNotification
};



