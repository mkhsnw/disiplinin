import { ZodError, ZodType } from 'zod';

export class ValidationService {
  validate<T>(zodType: ZodType<T>, data: unknown): T {
    try {
      return zodType.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw error;
      }
      throw new Error('Validation failed: ' + error.message);
    }
  }
}
