// src/task/task.service.ts - Fix the main issues
import { HttpException, Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { Logger } from 'winston';
import {
  CreateTaskRequest,
  TaskListRequest,
  UpdateTaskRequest,
} from '../models/task.model';
import { ValidationService } from '../common/validation.service';
import { TaskValidation } from './task.validation';

@Injectable()
export class TaskService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async createTask(req: CreateTaskRequest, authorId: string) {
    this.logger.info('Creating task', { title: req.title, authorId });
    try {
      const taskRequest = this.validationService.validate(
        TaskValidation.CREATE_TASK,
        req,
      );

      // Check assignee exists if provided
      if (taskRequest.assigneeId) {
        const assignee = await this.prismaService.user.findUnique({
          where: { id: taskRequest.assigneeId },
        });
        if (!assignee) {
          throw new BadRequestException('Assignee not found');
        }
      }

      // Check team exists if provided
      if (taskRequest.teamId) {
        const team = await this.prismaService.team.findUnique({
          where: { id: taskRequest.teamId },
        });
        if (!team) {
          throw new BadRequestException('Team not found');
        }
      }

      const task = await this.prismaService.task.create({
        data: {
          title: taskRequest.title,
          description: taskRequest.description,
          priority: taskRequest.priority,
          authorId,
          assigneeId: taskRequest.assigneeId || null, // Ensure null instead of undefined
          teamId: taskRequest.teamId || null,
          deadline: taskRequest.deadline || null,
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

      this.logger.info('Task created successfully', { taskId: task.id });

      return {
        ...task,
        deadline: task.deadline?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        message: 'Task created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create task', { error: error.message, authorId });
      throw error;
    }
  }

  async updateTask(id: string, req: UpdateTaskRequest) {
    try {
      // Check if task exists first
      const existedTask = await this.prismaService.task.findUnique({
        where: { id },
        select: { id: true, authorId: true },
      });
      
      if (!existedTask) {
        this.logger.warn('Task not found', { id });
        throw new NotFoundException('Task not found');
      }

      const validatedRequest = this.validationService.validate(
        TaskValidation.UPDATE_TASK,
        req,
      );

      // Fix: Check assignee in user table, not task table
      if (validatedRequest.assigneeId) {
        const assignee = await this.prismaService.user.findUnique({
          where: { id: validatedRequest.assigneeId },
        });
        if (!assignee) {
          throw new BadRequestException('Assignee not found');
        }
      }

      if (validatedRequest.teamId) {
        const team = await this.prismaService.team.findUnique({
          where: { id: validatedRequest.teamId },
        });
        if (!team) {
          throw new BadRequestException('Team not found');
        }
      }

      this.logger.info('Updating task', { id });
      
      const updatedTask = await this.prismaService.task.update({
        where: { id },
        data: {
          ...(validatedRequest.title && { title: validatedRequest.title }),
          ...(validatedRequest.description && {
            description: validatedRequest.description,
          }),
          ...(validatedRequest.priority && {
            priority: validatedRequest.priority,
          }),
          ...(validatedRequest.status && { status: validatedRequest.status }),
          ...(validatedRequest.assigneeId !== undefined && {
            assigneeId: validatedRequest.assigneeId,
          }),
          ...(validatedRequest.teamId !== undefined && {
            teamId: validatedRequest.teamId,
          }),
          ...(validatedRequest.deadline !== undefined && {
            deadline: validatedRequest.deadline,
          }),
        },
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

      this.logger.info('Task updated successfully', { id });

      return {
        ...updatedTask,
        deadline: updatedTask.deadline?.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
        message: 'Task updated successfully',
      };
    } catch (error) {
      this.logger.error('Failed to update task', { error: error.message, id });
      throw error;
    }
  }

  async getTasks(req: TaskListRequest) {
    try {
      const page = parseInt(String(req.page || 1));
      const limit = parseInt(String(req.limit || 10));
      const skip = (page - 1) * limit;
      const whereConditions: any = {};

      if (req.status) {
        whereConditions.status = Array.isArray(req.status)
          ? { in: req.status }
          : req.status;
      }

      if (req.search) {
        // Fix: Remove mode for MySQL compatibility
        whereConditions.OR = [
          { title: { contains: req.search } },
          { description: { contains: req.search } },
        ];
      }

      if (req.labelIds && req.labelIds.length > 0) {
        whereConditions.labels = {
          some: {
            labelId: { in: req.labelIds },
          },
        };
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

      const mappedTasks = tasks.map((task) => ({
        ...task,
        deadline: task.deadline?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        labels: task.labels.map((label) => label.label),
        commentsCount: task._count.comments,
        attachmentsCount: task._count.Attachment,
      }));

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
    } catch (error) {
      this.logger.error('Failed to get tasks', { error: error.message });
      throw error;
    }
  }

  async getTaskDetail(id: string) {
    this.logger.info('Getting task detail', { id });
    
    try {
      const task = await this.prismaService.task.findUnique({
        where: { id },
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

      if (!task) {
        this.logger.warn('Task not found', { id });
        throw new NotFoundException('Task not found');
      }

      return {
        ...task,
        deadline: task.deadline?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        labels: task.labels.map((tl) => tl.label),
        commentsCount: task._count.comments,
        attachmentsCount: task._count.Attachment,
      };
    } catch (error) {
      this.logger.error('Failed to get task detail', { error: error.message, id });
      throw error;
    }
  }

  async deleteTask(id: string, userId: string) {
    try {
      const task = await this.prismaService.task.findUnique({
        where: { id },
        select: { id: true, authorId: true },
      });

      if (!task) {
        this.logger.warn('Task not found', { id });
        throw new NotFoundException('Task not found');
      }

      if (task.authorId !== userId) {
        this.logger.warn('User is not the author of the task', { id, userId });
        throw new HttpException('Forbidden', 403);
      }

      await this.prismaService.task.delete({
        where: { id },
      });
      
      this.logger.info('Task deleted successfully', { id });
      
      return {
        message: 'Task deleted successfully',
      };
    } catch (error) {
      this.logger.error('Failed to delete task', { error: error.message, id, userId });
      throw error;
    }
  }

  async assignTask(taskId: string, assigneeId: string) {
    this.logger.info('Assigning task', { taskId, assigneeId });
    
    try {
      const assignee = await this.prismaService.user.findUnique({
        where: { id: assigneeId },
      });
      
      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      const updatedTask = await this.prismaService.task.update({
        where: { id: taskId },
        data: { assigneeId },
        select: {
          id: true,
          title: true,
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });
      
      this.logger.info('Task assigned successfully', { taskId, assigneeId });
      
      return {
        ...updatedTask,
        message: 'Task assigned successfully',
      };
    } catch (error) {
      this.logger.error('Failed to assign task', { error: error.message, taskId, assigneeId });
      throw error;
    }
  }

  // Fix: Async/await issue
  async updateTaskStatus(id: string, status: string) {
    try {
      const validatedStatus = this.validationService.validate(
        TaskValidation.UPDATE_STATUS,
        { status },
      );

      const updatedTask = await this.prismaService.task.update({
        where: { id },
        data: { status: validatedStatus.status },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });

      this.logger.info('Task status updated successfully', { id, status });

      return {
        ...updatedTask,
        updatedAt: updatedTask.updatedAt.toISOString(),
        message: 'Task status updated successfully',
      };
    } catch (error) {
      this.logger.error('Failed to update task status', { error: error.message, id, status });
      throw error;
    }
  }

  async getTaskStats(userId?: string) {
    try {
      const whereConditions: any = {};

      if (userId) {
        whereConditions.OR = [{ authorId: userId }, { assigneeId: userId }];
      }

      const [total, todo, inProgress, review, completed, overdue] =
        await Promise.all([
          this.prismaService.task.count({ where: whereConditions }),
          this.prismaService.task.count({
            where: { ...whereConditions, status: 'TODO' },
          }),
          this.prismaService.task.count({
            where: { ...whereConditions, status: 'IN_PROGRESS' },
          }),
          this.prismaService.task.count({
            where: { ...whereConditions, status: 'REVIEW' },
          }),
          this.prismaService.task.count({
            where: { ...whereConditions, status: 'COMPLETED' },
          }),
          this.prismaService.task.count({
            where: {
              ...whereConditions,
              status: { not: 'COMPLETED' },
              deadline: { lt: new Date() },
            },
          }),
        ]);

      return {
        total,
        todo,
        inProgress,
        review,
        completed,
        overdue,
      };
    } catch (error) {
      this.logger.error('Failed to get task stats', { error: error.message, userId });
      throw error;
    }
  }

  // Fix: Actually implement overdue logic
  async getOverdueTasks(query: TaskListRequest) {
    try {
      const page = parseInt(String(query.page || 1));
      const limit = parseInt(String(query.limit || 10));
      const skip = (page - 1) * limit;

      const whereConditions: any = {
        deadline: { lt: new Date() },
        status: { not: 'COMPLETED' },
      };

      // Add other filters from query
      if (query.status) {
        whereConditions.status = Array.isArray(query.status)
          ? { in: query.status.filter(s => s !== 'COMPLETED') }
          : query.status !== 'COMPLETED' ? query.status : { not: 'COMPLETED' };
      }

      if (query.priority) {
        whereConditions.priority = Array.isArray(query.priority)
          ? { in: query.priority }
          : query.priority;
      }

      if (query.assigneeId) {
        whereConditions.assigneeId = query.assigneeId;
      }

      if (query.teamId) {
        whereConditions.teamId = query.teamId;
      }

      const tasks = await this.prismaService.task.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { deadline: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          deadline: true,
          createdAt: true,
          updatedAt: true,
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
        },
      });

      const total = await this.prismaService.task.count({
        where: whereConditions,
      });

      const mappedTasks = tasks.map(task => ({
        ...task,
        deadline: task.deadline?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }));

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
    } catch (error) {
      this.logger.error('Failed to get overdue tasks', { error: error.message });
      throw error;
    }
  }

  async searchTasks(searchTerm: string, query: TaskListRequest) {
    return this.getTasks({
      ...query,
      search: searchTerm,
    });
  }
}