import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(HttpException, ZodError)
export class ErrorFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        success: false,
        error: {
          code: status,
          message: exception.getResponse(),
        },
      });
    } else if (exception instanceof ZodError) {
      const errors = exception.issues;
      response.status(400).json({
        success: false,
        error: {
          code: '400',
          message: errors.map((issue) => issue.message).join(', '),
        },
      });
    }
  }
}
