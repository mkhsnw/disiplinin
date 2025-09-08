import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectCreateRequest } from 'src/models/projects.model';
import { ProjectService } from './projects.service';
import { Auth } from 'src/auth/auth.decorator';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { User } from '@prisma/client';
import { QueryRequest } from 'src/models/global.model';

@Controller('/api/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Post()
  @HttpCode(201)
  async createProjects(@Body() req: ProjectCreateRequest, @Auth() user: User) {
    const project = await this.projectService.createProject(req, user.id);
    return project;
  }

  @Get()
  @HttpCode(200)
  async getProjects(@Query() query: QueryRequest, @Auth() user: User) {
    const projects = this.projectService.getProjects(
      user.id,
      query.page ?? 1,
      query.limit ?? 10,
    );
    return projects;
  }
}
