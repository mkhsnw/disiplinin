import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest } from '../models/auth.model';
import { JwtAuthGuard } from './jwtAuth.guard';
import { Auth } from './auth.decorator';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  async register(@Body() req: RegisterRequest) {
    const user = await this.authService.register(req);
    return user;
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() req: LoginRequest) {
    const result = await this.authService.login(req);
    return result;
  }

  @Get('/current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Auth() req: any) {
    return req;
  }
}
