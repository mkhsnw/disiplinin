import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { ProjectCreateRequest } from 'src/models/projects.model';
import { Logger } from 'winston';
import { ProjectValidation } from './projects.validation';
import { Role } from '@prisma/client';
import { success } from 'zod';
import { Http } from 'winston/lib/winston/transports';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async createProject(req: ProjectCreateRequest, userId: string) {
    this.logger.info('Creating project', { userId, projectName: req.name });
    const projectCreateRequest: ProjectCreateRequest =
      this.validationService.validate(ProjectValidation.CREATE_PROJECTS, req);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new HttpException('Owner not found', 400);
    }

    const result = await this.prismaService.$transaction(async (prisma) => {
      const project = await prisma.project.create({
        data: {
          name: projectCreateRequest.name,
          description: projectCreateRequest.description,
          ownerId: userId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              Task: true,
              ProjectMember: true,
            },
          },
        },
      });

      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: userId,
          role: Role.ADMIN,
        },
      });
      return project;
    });

    this.logger.log('Project created successfully', result.id);
    return {
      success: true,
      data: result,
    };
  }

  async getProjects(userId: string, page: number = 1, limit: number = 10) {
    this.logger.info('Fetching projects', { userId, page, limit });
    const skip = (page - 1) * limit;
    const projects = await this.prismaService.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            ProjectMember: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ProjectMember: {
          where: {
            userId: userId,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            Task: true,
            ProjectMember: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: projects,
      meta: {
        pagination: {
          page,
          limit,
          total: projects.length,
          totalPages: Math.ceil(projects.length / limit),
        },
      },
    };
  }

  async getProjectsById(projectId: string) {
    if (!projectId) {
      throw new HttpException('Project ID is required', 400);
    }

    const project = await this.prismaService.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new HttpException('Project not found', 404);
    }

    return {
      success: true,
      data: project,
    };
  }

  async editProject(
    projectId: string,
    req: ProjectCreateRequest,
    userId: string,
  ) {
    const projectRequest: ProjectCreateRequest =
      this.validationService.validate(ProjectValidation.CREATE_PROJECTS, req);

    const project = await this.prismaService.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new HttpException('Project not found', 404);
    }

    const isOwner = project.ownerId === userId;
    if (!isOwner) {
      throw new HttpException(
        'You are not authorized to edit this project',
        403,
      );
    }

    const updatedProject = await this.prismaService.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: projectRequest.name,
        description: projectRequest.description,
      },
    });

    return {
      success: true,
      data: updatedProject,
    };
  }

  async deleteProjects(projectId: string, userId: string) {
    if (!projectId) {
      throw new HttpException('Project ID is required', 400);
    }

    const project = await this.prismaService.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new HttpException('Project not found', 404);
    }

    const isOwner = project.ownerId === userId;
    if (!isOwner) {
      throw new HttpException(
        'You are not authorized to delete this project',
        403,
      );
    }

    const deletedProject = await this.prismaService.project.delete({
      where: {
        id: projectId,
      },
    });

    return {
      success: true,
      data: deletedProject,
    };
  }

  async addProjectMember(projectId: string, userId: string, memberId: string) {
    this.logger.info('Adding project member', { projectId, userId, memberId });

    const project = await this.prismaService.project.findUnique({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            ProjectMember: {
              some: {
                userId: userId,
                role: Role.ADMIN,
              },
            },
          },
        ],
      },
    });

    this.logger.info('Project fetched for adding member', { project });

    if (!project) {
      throw new HttpException('Project not found', 404);
    }

    const memberUser = await this.prismaService.user.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!memberUser) {
      throw new HttpException('User not found', 404);
    }

    const existingMember = await this.prismaService.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: memberId,
      },
    });

    if (existingMember) {
      throw new HttpException('User is already a member of this project', 400);
    }

    const newMember = await this.prismaService.projectMember.create({
      data: {
        projectId: projectId,
        userId: memberId,
        role: Role.MEMBER,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: newMember,
    };
  }

  async removeProjectMember(
    projectId: string,
    userId: string,
    memberId: string,
  ) {
    this.logger.info('Removing project member', {
      projectId,
      userId,
      memberId,
    });

    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            ProjectMember: {
              some: {
                userId: userId,
                role: Role.ADMIN,
              },
            },
          },
        ],
      },
    });

    if (!project) {
      throw new HttpException('Project not found', 404);
    }

    if (project.ownerId === memberId) {
      throw new HttpException('Cannot remove project owner', 400);
    }

    const removedMember = await this.prismaService.projectMember.deleteMany({
      where: {
        projectId,
        userId: memberId,
      },
    });

    return {
      success: true,
      data: removedMember,
    };
  }
}
