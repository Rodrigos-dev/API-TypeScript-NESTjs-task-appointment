import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CurrentUserDto } from 'src/auth/dto/current-user-dto';
import { UserReq } from 'src/commom/decorators/user-request.decorator';
import { TaskFindAllDto, TasksPeriodFindDto } from './dto/task-query-filters.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @UserReq() userReq: CurrentUserDto) {
    return await this.taskService.create(createTaskDto, userReq);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Get()
  async findAll(@Query() query: TaskFindAllDto, @UserReq() userReq: CurrentUserDto) {
    return await this.taskService.findAll(query, userReq);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Get(':taskId')
  async findOne(@Param('taskId') id: string) {
    return await this.taskService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Get('find/period')
  async findTasksByPeriod(@Query() query: TasksPeriodFindDto, @UserReq() userReq: CurrentUserDto) {
    return await this.taskService.findTasksByPeriod(query, userReq);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Patch(':taskId')
  async update(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @UserReq() userReq: CurrentUserDto
  ) {
    return await this.taskService.update(+taskId, updateTaskDto, userReq);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Delete(':taskId')
  async remove(@Param('taskId') taskId: string, @UserReq() userReq: CurrentUserDto) {
    return await this.taskService.remove(+taskId, userReq);
  }
}
