import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/user/entities/user.entity';


export const AuthRole = (...roles: Role[]) => SetMetadata('roles', roles);