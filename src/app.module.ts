import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [CommonModule, AuthModule, TaskModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
