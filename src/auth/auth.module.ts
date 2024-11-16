import { forwardRef, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { LocalStrategy } from './local.strategy';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt-auth.strategy';
import { RefreshJwtStrategy } from './refresh-jwt.strategy';


@Module({
  imports: [forwardRef(()=>UserModule),PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,      
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, UserService, JwtStrategy, RefreshJwtStrategy],
  exports:  [AuthService]
})
export class AuthModule {}
