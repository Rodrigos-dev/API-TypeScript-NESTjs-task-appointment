import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import * as admin from 'firebase-admin';
import  dropbox from 'src/commom/dropbox';
import cloudinary from 'src/commom/cloudinary';

let serviceAccount = null

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());  

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(json({ limit: '250mb' }));
  app.use(urlencoded({ extended: true, limit: '250mb' }));

  if (process.env.ENVIRONMENT === 'development') {
    //file admin firebase dev 
    serviceAccount = require('../apibancotypeorminiciado-dev-firebase-adminsdk-k0hff-d194ee7cc6.json'); 

  } else {
    //file admin firebase prod
    serviceAccount = require('../apibancotypeorminiciado-prod-firebase-adminsdk-6w4vv-ad41cde8f7.json');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  await app.listen(process.env.PORT || 3000);

  await cloudinary.initConfigCloudnary()
}

bootstrap();

