import { LoginRequest, RegisterRequest } from '../models/auth.model';
import z, { ZodType } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType<RegisterRequest> = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password too long'),
  });

  static readonly LOGIN: ZodType<LoginRequest> = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  });
}
