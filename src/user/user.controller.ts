import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role, User } from './entities/user.entity';
import { UserReq } from 'src/commom/decorators/user-request.decorator';
import { AuthRole } from 'src/commom/decorators/roles.decorator';
import { RolesGuard } from 'src/commom/guards/roles.guard';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import loggers from 'src/commom/utils/loggers';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('forgetedPassword')
  forgetedPassword(@Body() data: ForgetPasswordDto) {
    return this.userService.forgetedPassword(data);
  }

  @Post('/updatePasswordByCodeEmail/:codeForgetPassword')
  updatePasswordByCodeEmail(@Param('codeForgetPassword') codeForgetPassword: string, @Body() data: UpdatePasswordDto) {

    if (!codeForgetPassword) {
      loggers.loggerMessage('error', 'Precisa enviar o código que foi enviado no email, código não enviado')
      throw new HttpException('Precisa enviar o código que foi enviado no email, código não enviado', HttpStatus.BAD_REQUEST);
    }

    return this.userService.updatePassword(data, codeForgetPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserReq() userReq: User
  ) {
    return this.userService.update(+userId, updateUserDto, userReq);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/password/updatePassword')
  updatePassword(@Body() data: UpdatePasswordDto) {
    return this.userService.updatePassword(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any, @Query() query: {
    page: number;
    take: number;
    orderBy: 'ASC' | 'DESC'
  }) {
    return this.userService.findAll(req, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':userId')
  @AuthRole(Role.ADMIN, Role.USER)
  findOneById(@Param('userId') userId: string, @UserReq() userReq: User) {
    return this.userService.findOneById(+userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list/findAllByQuery')
  findAllByQuery(@Req() req: any, @Query() query: {
    userId: number
    email: string,
    name: string,
    page: number;
    take: number;
    orderBy: 'ASC' | 'DESC'
  }) {
    return this.userService.findAllByQuery(query);
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.userService.remove(+userId);
  }
}
