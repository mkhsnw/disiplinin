import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TestService {
  constructor(private readonly prismaService: PrismaService) {}

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
      // Clean up in correct order
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
}