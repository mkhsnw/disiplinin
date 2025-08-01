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
        meta: {
          timestamp: new Date().toISOString(),
          path: host.switchToHttp().getRequest().url,
          method: host.switchToHttp().getRequest().method,
        },
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        success: false,
        error: {
          code: 'ZOD_VALIDATION_ERROR',
          message: 'Validation failed',
        },
        meta: {
          timestamp: new Date().toISOString(),
          path: host.switchToHttp().getRequest().url,
          method: host.switchToHttp().getRequest().method,
        },
      });
    }
  }
}
