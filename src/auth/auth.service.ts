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
    this.logger.info('Registering user', { email: req.email });

    const userRequest: RegisterRequest = this.validationService.validate(
      AuthValidation.REGISTER,
      req,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
        email: userRequest.email,
      },
    });

    if (user) {
      this.logger.warn('User already exists', { email: userRequest.email });
      throw new HttpException('Email or password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(userRequest.password, 10);

    const newUser = this.prismaService.user.create({
      data: {
        name: userRequest.name,
        email: userRequest.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    this.logger.info('User registered successfully', {
      email: userRequest.email,
    });

    return newUser;
  }

  async login(req: LoginRequest) {
    this.logger.info('Login User', { email: req.email });

    const loginRequest: LoginRequest = this.validationService.validate(
      AuthValidation.LOGIN,
      req,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
        email: loginRequest.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      throw new HttpException('Email or password is incorrect', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn('Invalid password attempt', {
        email: loginRequest.email,
      });
      throw new HttpException('Email or password is incorrect', 401);
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: payload,
    };
  }

  async refreshToken(token: string) {
    const payload = this.jwtService.verify(token);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      this.logger.warn('Invalid refresh token attempt', { token });
      throw new HttpException('Invalid token', 401);
    }

    const newPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    };

    const newAccessToken = this.jwtService.sign(newPayload);
    return {
      accessToken: newAccessToken,
      user: newPayload,
    };
  }
}
