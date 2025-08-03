import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [TestService, AuthService, JwtService],
})
export class TestModule {}
