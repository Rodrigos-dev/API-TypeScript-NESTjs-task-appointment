import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RefreshJwtAuthGuard } from './refresh-jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return await this.authService.login(req.user);
    }

    @UseGuards(RefreshJwtAuthGuard)
    @ApiBearerAuth('jwt-auth')
    @Post('refreshToken')
    async refreshToken(@Request() req) {
        return this.authService.login(req.user, true);
    }    
}

