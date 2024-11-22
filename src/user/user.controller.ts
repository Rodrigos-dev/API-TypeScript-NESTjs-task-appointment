import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role, User } from './entities/user.entity';
import { UserReq } from 'src/commom/decorators/user-request.decorator';
import { AuthRole } from 'src/commom/decorators/roles.decorator';
import { RolesGuard } from 'src/commom/guards/roles.guard';
import { UpdateForgetPasswordDto } from './dto/update-and-forget-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('updateOrforgetedPassword')
  updateOrforgetedPassword(@Body() data: UpdateForgetPasswordDto) {
    return this.userService.updateOrforgetedPassword(data);
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

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  update(
    @Param('userId') userId: string, 
    @Body() updateUserDto: UpdateUserDto, 
    @UserReq() userReq: User
  ) {
    return this.userService.update(+userId, updateUserDto, userReq);
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.userService.remove(+userId);
  }
}
