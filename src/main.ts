import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

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

  // if (process.env.ENVIRONMENT === 'development') {
  //   //file admin firebase dev 
  //   serviceAccount = require('../infinity-friends-firebase-admin.json');

  // } else {
  //   //file admin firebase prod
  //   serviceAccount = require('../infinity-friends-prod-f9236-firebase-adminsdk-h5t0f-402cca644d.json');
  // }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

