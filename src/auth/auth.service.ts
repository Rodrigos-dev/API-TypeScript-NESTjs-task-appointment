import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import exceptions from 'src/commom/utils/exceptions';
import loggers from 'src/commom/utils/loggers';
import { CurrentUserDto } from './dto/current-user-dto';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) { }

    async validarUsuario(email: string, senha: string): Promise<any> {
        try {
            const usuario = await this.userService.findOneByEmail(email)

            if (!usuario) {                
                throw new HttpException(`Email ou senha inválidos!`, HttpStatus.BAD_REQUEST);
            }

            if (usuario && bcrypt.compareSync(senha, usuario.password)) {

                const { password, ...result } = usuario;

                return result;

            } else {                
                throw new HttpException(`Email ou senha inválidos!`, HttpStatus.BAD_REQUEST);
            }

        } catch (err) {
            return exceptions.exceptionsReturn(err)           
        }

    }

    async login(userPayload: User, refresh?: boolean) {

        let user = null

        if(!refresh){
            refresh = false
        }

        if(refresh === true){
            user = await this.userService.findOneByEmail(userPayload.email);
        }else{
            user = userPayload
        }
        

        if (!user && refresh) {
            throw new HttpException(`Usuario não encontrado refaça o login!`, HttpStatus.NOT_FOUND);
        }

        const payload: CurrentUserDto = { 
            sub: user.id, 
            username: user.name, 
            email: user.email, 
            role: user.role 
        };

        user.access_token = await this.generateOneHourToken(payload);// token to use 
        user.access_token_to_refresh = await this.generateThirtyHourToken(payload);// token to use for refreshToken       

        const { password, ...result } = user;

        return result;
    }

    async generateOneHourToken(payload: CurrentUserDto) {
        return this.jwtService.sign(payload, {
            expiresIn: '1h', // 1 hora de expiração
        });
    }

    async generateThirtyHourToken(payload: CurrentUserDto) {
        return this.jwtService.sign(payload, {
            expiresIn: '30h', // 3 horas de expiração
        });
    }

    verifyToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token); 
            return decoded; 
        } catch (e) {
            throw new Error('Token Invalido');
        }
    }
}
