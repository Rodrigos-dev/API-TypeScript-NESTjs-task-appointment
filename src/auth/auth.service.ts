import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import exceptions from 'src/commom/utils/exceptions';
import loggers from 'src/commom/utils/loggers';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) { }

    async validarUsuario(email: string, senha: string): Promise<any> {
        try {
            const usuario = await this.userService.findOneByEmail(email).catch((err) => { });

            if (!usuario) {
                loggers.loggerMessage('error', 'Email inválido, usuário não encontrado!')
                throw new HttpException(`Email ou senha inválidos!`, HttpStatus.BAD_REQUEST);
            }

            if (usuario && bcrypt.compareSync(senha, usuario.password)) {

                const { password, ...result } = usuario;

                return result;

            } else {
                loggers.loggerMessage('error', `Senha inválida!`)
                throw new HttpException(`Email ou senha inválidos!`, HttpStatus.BAD_REQUEST);
            }

        } catch (err) {
            return exceptions.exceptionsReturn(err)
        }

    }

    async login(userPayload: any, refresh?: boolean) {

        let user: any = {}

        if(!refresh){
            refresh = false
        }

        if(refresh === true){
            user = await this.userService.findOneByEmail(userPayload.email).catch((err) => { });
        }else{
            user = userPayload
        }
        

        if (!user && refresh) {
            loggers.loggerMessage('error', 'Email inválido, usuário não encontrado!')
            throw new HttpException(`Usuario não encontrado refaça o login!`, HttpStatus.NOT_FOUND);
        }

        const payload = { sub: user.id, username: user.name, email: user.email, role: user.role };

        //Generate 2 tokens
        user.access_token = await this.generateOneHourToken(payload);// token to use 
        user.access_token_to_refresh = await this.generateThirtyHourToken(payload);// token to use for refreshToken       

        const { password, ...result } = user;

        return result;
    }

    // Generate token expire 1 hour
    async generateOneHourToken(payload: any) {
        return this.jwtService.sign(payload, {
            expiresIn: '1h', // 1 hora de expiração
        });
    }

    // GGenerate token expire 30 hour
    async generateThirtyHourToken(payload: any) {
        return this.jwtService.sign(payload, {
            expiresIn: '30h', // 3 horas de expiração
        });
    }

    // Método para verificar o token
    verifyToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token); // Verifica o token
            return decoded; // Retorna os dados decodificados do token
        } catch (e) {
            throw new Error('Invalid token');
        }
    }
}
