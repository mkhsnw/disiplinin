import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { Logger } from 'winston';
import {
  CreateTaskRequest,
  TaskListItem,
  TaskListRequest,
  UpdateTaskRequest,
} from 'src/models/task.model';

@Injectable()
export class TaskService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
  ) {}

  async createTask(req: CreateTaskRequest, authorId: string) {
    this.logger.info('Creating task', { title: req.title, authorId });
    try {
      if (req.assigneeId) {
        const assignee = await this.prismaService.user.findUnique({
          where: { id: req.assigneeId },
        });
        if (!assignee) {
          throw new HttpException('Assignee not found', 404);
        }
      }

      if (req.teamId) {
        const team = await this.prismaService.team.findUnique({
          where: { id: req.teamId },
        });
        if (!team) {
          throw new HttpException('Team not found', 404);
        }
      }

      const task = await this.prismaService.task.create({
        data: {
          title: req.title,
          description: req.description,
          priority: req.priority,
          authorId,
          assigneeId: req.assigneeId,
          teamId: req.teamId,
          deadline: req.deadline,
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          deadline: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          assigneeId: true,
          teamId: true,
          aiPrioritySuggestion: true,
          aiPriorityConfidence: true,
        },
      });

      return {
        ...task,
        deadline: task.deadline?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        message: 'Task created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating task', { error });
      throw error;
    }
  }

  async updateTask(id: string, req: UpdateTaskRequest) {
    const existedTask = await this.prismaService.task.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
      },
    });
    if (!existedTask) {
      this.logger.warn('Task not found', { id });
      throw new HttpException('Task not found', 404);
    }
    this.logger.info('Updating task', { id });
    const updatedTask = await this.prismaService.task.update({
      where: { id },
      data: req,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        deadline: true,
        updatedAt: true,
        assigneeId: true,
        teamId: true,
      },
    });

    return {
      ...updatedTask,
      deadline: updatedTask.deadline?.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
      message: 'Task updated successfully',
    };
  }

  async getTasks(req: TaskListRequest) {
    const page = req.page || 1;
    const limit = req.limit || 10;
    const skip = (page - 1) * limit;
    const whereConditions: any = {};

    if (req.status) {
      whereConditions.status = Array.isArray(req.status)
        ? { in: req.status }
        : req.status;
    }

    if (req.teamId) {
      whereConditions.teamId = req.teamId;
    }

    if (req.assigneeId) {
      whereConditions.assigneeId = req.assigneeId;
    }

    if (req.priority) {
      whereConditions.priority = Array.isArray(req.priority)
        ? { in: req.priority }
        : req.priority;
    }
    const tasks = await this.prismaService.task.findMany({
      where: whereConditions,
      skip: skip,
      take: limit,
      orderBy: {
        [req.sortBy || 'createdAt']: req.sortOrder || 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
        aiPrioritySuggestion: true,
        aiPriorityConfidence: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        labels: {
          select: {
            label: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            Attachment: true,
          },
        },
      },
    });

    const total = await this.prismaService.task.count({
      where: whereConditions,
    });

    const mappedTasks = tasks.map((task) => {
      return {
        ...task,
        deadline: task.deadline?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        labels: task.labels.map((label) => label.label),
        commentsCount: task._count.comments,
        attachmentsCount: task._count.Attachment,
      };
    });

    return {
      data: mappedTasks,
      meta: {
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }
}
