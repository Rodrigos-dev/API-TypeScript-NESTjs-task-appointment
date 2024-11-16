import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail } from 'class-validator';
import { Role } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {    
    name: string;

    @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })    
    email: string;  
    
    role: Role; 
}
