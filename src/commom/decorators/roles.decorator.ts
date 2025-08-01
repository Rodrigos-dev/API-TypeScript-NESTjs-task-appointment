import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enums/user-enums';



export const AuthRole = (...roles: RoleEnum[]) => SetMetadata('roles', roles);