import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [CommonModule, AuthModule, ProjectsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
