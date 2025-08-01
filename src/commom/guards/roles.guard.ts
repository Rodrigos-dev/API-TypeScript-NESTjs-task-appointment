import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import loggers from '../utils/loggers';
import { RoleEnum } from '../enums/user-enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<RoleEnum[]>('roles', context.getHandler());
    if (!roles) {
      loggers.loggerMessage('error', 'Nenhuma permissão encontrada')
      return true;  
    }

    const request = context.switchToHttp().getRequest();
    
    const jwtAuthGuard = new JwtAuthGuard();
    const isAuthenticated = await jwtAuthGuard.canActivate(context);

    if (!isAuthenticated) {
      loggers.loggerMessage('error', 'Usuario não autenticado ou token inválido')
      return false;
    }

    const user = request.user;

    if (!user || !user.role) {
      loggers.loggerMessage('error', 'Usuario ou permissão não encontrado')
      return false;
    }

    return roles.some(role => user.role.includes(role));
  }
}