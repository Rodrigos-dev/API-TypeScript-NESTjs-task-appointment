import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserReq } from 'src/commom/decorators/user-request.decorator';
import { AuthRole } from 'src/commom/decorators/roles.decorator';
import { RolesGuard } from 'src/commom/guards/roles.guard';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import loggers from 'src/commom/utils/loggers';
import { CurrentUserDto } from 'src/auth/dto/current-user-dto';
import { UserFindAllByQueryDto, UserFindAllDto } from './dto/query-filters.dto';
import { RoleEnum } from 'src/commom/enums/user-enums';
import { ApiBearerAuth, ApiExtraModels, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdatePasswordEmailCodeDto } from './dto/update-password-email-code.dto';

@ApiTags('User')
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
  updatePasswordByCodeEmail(@Param('codeForgetPassword') codeForgetPassword: string, @Body() data: UpdatePasswordEmailCodeDto) {

    if (!codeForgetPassword) {
      loggers.loggerMessage('error', 'Precisa enviar o código que foi enviado no email, código não enviado')
      throw new HttpException('Precisa enviar o código que foi enviado no email, código não enviado', HttpStatus.BAD_REQUEST);
    }

    return this.userService.updatePassword(data, codeForgetPassword);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserReq() userReq: CurrentUserDto
  ) {
    return this.userService.update(+userId, updateUserDto, userReq);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Patch('/password/updatePassword')
  updatePassword(@Body() data: UpdatePasswordDto) {
    return this.userService.updatePassword(data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Get()
  findAll(@Req() req: any, @Query() query: UserFindAllDto) {
    return this.userService.findAll(req, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Get(':userId')
  //@AuthRole(RoleEnum.ADMIN, RoleEnum.USER)
  findOneById(@Param('userId') userId: string, @UserReq() userReq: CurrentUserDto) {
    return this.userService.findOneById(+userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Get('email/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Get('list/findAllByQuery')
  findAllByQuery(@Req() req: any, @Query() query: UserFindAllByQueryDto) {
    return this.userService.findAllByQuery(query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.userService.remove(+userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Delete('removeAvatarImage/:userId')
  removeAvatarImage(@Param('userId') userId: string, @UserReq() userReq: CurrentUserDto) {
    return this.userService.removeAvatarImage(+userId, userReq);
  }
}
