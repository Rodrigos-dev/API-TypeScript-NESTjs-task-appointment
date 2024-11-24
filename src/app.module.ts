import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './commom/guards/roles.guard';
import { QueueBullModule } from './commom/bull-queue/bull.module';
import { UserTestBullQueueModule } from './user-test-bull-queue/user-test-bull-queue.module';
import { EmailSendModule } from './email-send/email-send.module';
import { RabbitModule } from './rabbit/rabbit.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { DeviceRegisterModule } from './device-register/device-register.module';


@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
  TypeOrmModule.forRootAsync({
    useFactory: () => ({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      authPlugins: {
        mysql_native_password: () => require('mysql2-aurora-data-api-plugin')
      },
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
    }),
  }),  
  UserModule,
  AuthModule,
  QueueBullModule,
  UserTestBullQueueModule,
  EmailSendModule,
  RabbitModule,
  PushNotificationModule,
  DeviceRegisterModule
  ],
  controllers: [AppController],
  providers: [AppService,
    
    RolesGuard,     // Registra o guard   
    Reflector,   
  ],
})
export class AppModule { }
