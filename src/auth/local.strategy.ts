import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
        usernameField: 'email', //trocando o username para email			=> OBS SE TROCAR SENHA POR PASSWORD PARA ENVIAR PASSWORD NO BODY ADI NO 'SENHA' TEM QUE VIR 'PASSWORD'
        passwordField: 'password' //passando o nome do campo para passaword
      });
    }

  async validate(email: string, senha: string): Promise<any> {
    const company = await this.authService.validarUsuario(email, senha);
    if (!company) {
      throw new UnauthorizedException();
    }
    return company;
  }
}