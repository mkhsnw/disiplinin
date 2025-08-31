import { HttpException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../common/prisma.service';
import { LoginRequest } from '../models/auth.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default',
    });
  }

  async validate(payload: LoginRequest) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    if (!user) {
      throw new HttpException('User not found', 401);
    }
    return user;
  }
}
