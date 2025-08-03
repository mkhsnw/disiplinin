import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiErrorResponse, ApiSuccessResponse } from './global.model';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseSuccessInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ):
    | Observable<ApiSuccessResponse<T>>
    | Promise<Observable<ApiSuccessResponse<T>>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        },
      })),
    );
  }
}
