import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { LoginRequest, RegisterRequest } from '../models/auth.model';
import { Logger } from 'winston';
import { AuthValidation } from './auth.validation';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly jwtService: JwtService,
  ) {}

  async register(req: RegisterRequest) {
    const registerRequest: RegisterRequest = this.validationService.validate(
      AuthValidation.REGISTER,
      req,
    );

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: registerRequest.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new HttpException('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(registerRequest.password, 10);

    const newUser = await this.prismaService.user.create({
      data: {
        email: registerRequest.email,
        name: registerRequest.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: newUser,
    };
  }

  async login(req: LoginRequest) {
    try {
      const loginRequest: LoginRequest = await this.validationService.validate(
        AuthValidation.LOGIN,
        req,
      );

      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email: loginRequest.email,
        },
      });

      if (!existingUser) {
        throw new HttpException('Invalid email or password', 400);
      }

      const isPasswordValid = await bcrypt.compare(
        loginRequest.password,
        existingUser.password,
      );
      if (!isPasswordValid) {
        throw new HttpException('Invalid email or password', 400);
      }

      const token = this.jwtService.sign({
        email: existingUser.email,
        id: existingUser.id,
      });

      const { password, ...withoutPassword } = existingUser;

      return {
        success: true,
        data: {
          ...withoutPassword,
          token,
        },
      };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw new HttpException('Login failed', 500);
    }
  }
}
