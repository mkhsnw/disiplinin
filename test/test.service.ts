// test/test.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Priority, Status, Task } from '@prisma/client';

@Injectable()
export class TestService {
  constructor(private readonly prismaService: PrismaService) {}

  // Existing functions - keep as is for auth spec compatibility
  async createTestUser() {
    const hashedPassword = await bcrypt.hash('test123', 10);

    return this.prismaService.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async deleteTestUser() {
    try {
      // Clean up in correct order based on foreign key constraints
      await this.prismaService.taskHistory.deleteMany();
      await this.prismaService.attachment.deleteMany();
      await this.prismaService.comment.deleteMany();
      await this.prismaService.taskLabel.deleteMany();
      await this.prismaService.task.deleteMany();
      await this.prismaService.teamMember.deleteMany();
      await this.prismaService.team.deleteMany();
      await this.prismaService.label.deleteMany();
      await this.prismaService.user.deleteMany();
    } catch (error) {
      console.log('Cleanup error (might be expected):', error.message);
    }
  }

  // Create additional test users
  async createTestAssignee() {
    const hashedPassword = await bcrypt.hash('test123', 10);

    return this.prismaService.user.create({
      data: {
        name: 'Test Assignee',
        email: 'assignee@example.com',
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async createAnotherTestUser() {
    const hashedPassword = await bcrypt.hash('test123', 10);

    return this.prismaService.user.create({
      data: {
        name: 'Another User',
        email: 'another@example.com',
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Create single test task
  async createTestTask(authorId: string) {
    return this.prismaService.task.create({
      data: {
        title: 'Test Task',
        description: 'This is a test task',
        priority: Priority.HIGH,
        status: Status.TODO,
        authorId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        authorId: true,
        assigneeId: true,
        teamId: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Create multiple test tasks
  async createTestTasks(authorId: string, count: number) {
    const tasks = [];
    const priorities = [
      Priority.LOW,
      Priority.MEDIUM,
      Priority.HIGH,
      Priority.CRITICAL,
    ];

    for (let i = 0; i < count; i++) {
      const task = await this.prismaService.task.create({
        data: {
          title: `Test Task ${i + 1}`,
          description: `This is test task number ${i + 1}`,
          priority: priorities[i % 4],
          status: Status.TODO,
          authorId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      // tasks.push(task);
    }

    return tasks;
  }

  // Create tasks with different statuses for statistics testing
  async createTestTasksWithStatuses(authorId: string) {
    const taskConfigs = [
      { status: Status.TODO, priority: Priority.LOW, title: 'TODO Task' },
      {
        status: Status.IN_PROGRESS,
        priority: Priority.MEDIUM,
        title: 'In Progress Task',
      },
      { status: Status.REVIEW, priority: Priority.HIGH, title: 'Review Task' },
      {
        status: Status.COMPLETED,
        priority: Priority.CRITICAL,
        title: 'Completed Task',
      },
    ];

    const tasks: any = [];
    for (const config of taskConfigs) {
      const task = await this.prismaService.task.create({
        data: {
          title: config.title,
          description: `Task with ${config.status} status`,
          status: config.status,
          priority: config.priority,
          authorId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      tasks.push(task);
    }

    return tasks;
  }

  // Create overdue tasks for overdue testing
  async createOverdueTasks(authorId: string) {
    // Create dates that are in the past
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(23, 59, 59, 999);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(23, 59, 59, 999);

    const taskConfigs = [
      {
        title: 'Overdue Task 1',
        description: 'This task is overdue by 1 day',
        priority: Priority.HIGH,
        status: Status.TODO,
        deadline: yesterday,
      },
      {
        title: 'Overdue Task 2',
        description: 'This task is overdue by 2 days',
        priority: Priority.CRITICAL,
        status: Status.IN_PROGRESS,
        deadline: twoDaysAgo,
      },
      {
        title: 'Overdue Task 3',
        description: 'This task is overdue by 1 week',
        priority: Priority.MEDIUM,
        status: Status.REVIEW,
        deadline: weekAgo,
      },
    ];

    const tasks: any = [];
    for (const config of taskConfigs) {
      const task = await this.prismaService.task.create({
        data: {
          ...config,
          authorId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          deadline: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      tasks.push(task);
    }

    return tasks;
  }

  // Create test team for team-related testing
  async createTestTeam(userId: string) {
    const team = await this.prismaService.team.create({
      data: {
        name: 'Test Team',
        description: 'A test team for testing purposes',
      },
    });

    // Create team member relationship
    await this.prismaService.teamMember.create({
      data: {
        userId,
        teamId: team.id,
        role: 'ADMIN', // Adjust based on your TeamRole enum
      },
    });

    return team;
  }

  // Helper function to create task with team and assignee
  async createTestTaskWithAssignee(
    authorId: string,
    assigneeId: string,
    teamId?: string,
  ) {
    return this.prismaService.task.create({
      data: {
        title: 'Task with Assignee',
        description: 'This task has an assignee assigned',
        priority: Priority.MEDIUM,
        status: Status.TODO,
        authorId,
        assigneeId,
        teamId: teamId || null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        authorId: true,
        assigneeId: true,
        teamId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Helper function to create task with deadline
  async createTestTaskWithDeadline(authorId: string, deadline: Date) {
    return this.prismaService.task.create({
      data: {
        title: 'Task with Deadline',
        description: 'This task has a deadline',
        priority: Priority.HIGH,
        status: Status.TODO,
        authorId,
        deadline,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        authorId: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Helper function to create labels for testing
  async createTestLabels() {
    const labelConfigs = [
      { name: 'Bug', color: '#ef4444' },
      { name: 'Feature', color: '#3b82f6' },
      { name: 'Enhancement', color: '#10b981' },
      { name: 'Documentation', color: '#f59e0b' },
    ];

    const labels: any = [];
    for (const config of labelConfigs) {
      try {
        const label = await this.prismaService.label.create({
          data: config,
        });
        labels.push(label);
      } catch (error) {
        // Label might already exist due to unique constraint
        const existingLabel = await this.prismaService.label.findUnique({
          where: { name: config.name },
        });
        if (existingLabel) {
          labels.push(existingLabel);
        }
      }
    }

    return labels;
  }

  // Helper function to create task with labels
  async createTestTaskWithLabels(
    authorId: string,
    labelNames: string[] = ['Bug', 'Feature'],
  ) {
    // First create or get labels
    const labels = await this.createTestLabels();
    const selectedLabels = labels.filter((label) =>
      labelNames.includes(label.name),
    );

    // Create task
    const task = await this.prismaService.task.create({
      data: {
        title: 'Task with Labels',
        description: 'This task has labels attached',
        priority: Priority.MEDIUM,
        status: Status.TODO,
        authorId,
      },
    });

    // Create task-label relationships
    for (const label of selectedLabels) {
      await this.prismaService.taskLabel.create({
        data: {
          taskId: task.id,
          labelId: label.id,
        },
      });
    }

    return {
      ...task,
      labels: selectedLabels,
    };
  }

  // Helper function to create comments for a task
  async createTestComments(
    taskId: string,
    authorId: string,
    count: number = 3,
  ) {
    const comments: any = [];
    for (let i = 0; i < count; i++) {
      const comment = await this.prismaService.comment.create({
        data: {
          text: `Test comment ${i + 1} for task ${taskId}`,
          authorId,
          taskId,
        },
      });
      comments.push(comment);
    }
    return comments;
  }

  // Helper function to create attachments for a task
  async createTestAttachments(
    taskId: string,
    userId: string,
    count: number = 2,
  ) {
    const attachments: any = [];
    for (let i = 0; i < count; i++) {
      const attachment = await this.prismaService.attachment.create({
        data: {
          url: `https://example.com/file${i + 1}.pdf`,
          type: 'task_attachment',
          taskId,
          userId,
        },
      });
      attachments.push(attachment);
    }
    return attachments;
  }

  // Complete task setup with all relationships
  async createCompleteTaskSetup(authorId: string) {
    // Create assignee
    const assignee = await this.createTestAssignee();

    // Create team
    const team = await this.createTestTeam(authorId);

    // Add assignee to team
    await this.prismaService.teamMember.create({
      data: {
        userId: assignee.id,
        teamId: team.id,
        role: 'MEMBER', // Adjust based on your TeamRole enum
      },
    });

    // Create labels
    const labels = await this.createTestLabels();

    // Create task with full setup
    const task = await this.prismaService.task.create({
      data: {
        title: 'Complete Test Task',
        description: 'This task has everything - assignee, team, deadline',
        priority: Priority.HIGH,
        status: Status.IN_PROGRESS,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        authorId,
        assigneeId: assignee.id,
        teamId: team.id,
      },
    });

    // Add some labels to the task
    await this.prismaService.taskLabel.createMany({
      data: labels.slice(0, 2).map((label) => ({
        taskId: task.id,
        labelId: label.id,
      })),
    });

    // Create comments
    await this.createTestComments(task.id, authorId, 3);

    // Create attachments
    await this.createTestAttachments(task.id, authorId, 2);

    return {
      task,
      team,
      assignee,
      labels: labels.slice(0, 2),
    };
  }

  // Utility function to get database counts (useful for debugging)
  async getDatabaseCounts() {
    const [
      users,
      tasks,
      teams,
      teamMembers,
      labels,
      taskLabels,
      comments,
      attachments,
    ] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.task.count(),
      this.prismaService.team.count(),
      this.prismaService.teamMember.count(),
      this.prismaService.label.count(),
      this.prismaService.taskLabel.count(),
      this.prismaService.comment.count(),
      this.prismaService.attachment.count(),
    ]);

    return {
      users,
      tasks,
      teams,
      teamMembers,
      labels,
      taskLabels,
      comments,
      attachments,
    };
  }

  // Helper to verify task exists
  async getTaskById(taskId: string) {
    return this.prismaService.task.findUnique({
      where: { id: taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        team: true,
        labels: {
          include: {
            label: true,
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
  }
}
