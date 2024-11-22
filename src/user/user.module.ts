import { Module, Global } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { EmailSendModule } from 'src/email-send/email-send.module';
import { EmailSendService } from 'src/email-send/email-send.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  exports: [TypeOrmModule, UserService],
  controllers: [UserController],
  providers: [UserService, EmailSendService]
})
export class UserModule {}