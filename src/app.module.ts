import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [CommonModule, AuthModule, ProjectsModule,MembersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
