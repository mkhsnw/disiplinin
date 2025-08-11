import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { TaskService } from './task.service';
import {
  CreateTaskRequest,
  TaskListRequest,
  UpdateTaskRequest,
} from '../models/task.model';
import { Auth } from '../auth/auth.decorator';
import { ResponseSuccessInterceptor } from '../models/interceptor.model';

@Controller('/api/tasks')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseSuccessInterceptor)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(201)
  async createTask(@Body() req: CreateTaskRequest, @Auth() user: any) {
    return this.taskService.createTask(req, user.id);
  }

  @Get('stats/overview') // Move before :id to avoid route conflict
  async getTaskStats(@Auth() user: any) {
    return this.taskService.getTaskStats(user.id);
  }

  @Get('overdue/list') // Move before :id to avoid route conflict
  async getOverdueTasks(@Query() query: TaskListRequest) {
    return this.taskService.getOverdueTasks(query);
  }

  @Get()
  async getTasks(@Query() query: TaskListRequest) {
    return this.taskService.getTasks(query);
  }

  @Get(':id')
  async getTaskDetail(@Param('id') id: string) {
    return this.taskService.getTaskDetail(id);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() req: UpdateTaskRequest) {
    return this.taskService.updateTask(id, req);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteTask(@Param('id') id: string, @Auth() user: any) {
    await this.taskService.deleteTask(id, user.id);
    // For 204 No Content, return nothing
    return;
  }

  @Post(':id/assign')
  @HttpCode(200) // Explicitly set to 200
  async assignTask(
    @Param('id') id: string,
    @Body() body: { assigneeId: string },
  ) {
    if (!body || !body.assigneeId) {
      throw new BadRequestException('assigneeId is required');
    }
    return this.taskService.assignTask(id, body.assigneeId);
  }

  @Put(':id/status')
  @HttpCode(200) // Explicitly set to 200
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    if (!body || !body.status) {
      throw new BadRequestException('status is required'); // Fix: was "assigneeId is required"
    }
    return this.taskService.updateTaskStatus(id, body.status);
  }
}