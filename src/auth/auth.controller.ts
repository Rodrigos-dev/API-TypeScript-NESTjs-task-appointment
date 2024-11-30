import { Controller, Get, HttpException, HttpStatus, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RefreshJwtAuthGuard } from './refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(RefreshJwtAuthGuard)
    @Post('refreshToken')
    async refreshToken(@Request() req) {
        return this.authService.login(req.user, true);
    }    
}

