import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  meta: ApiMeta;
}

export class ApiErrorResponse {
  success: boolean;
  error: ApiErrorMessage;
  meta: ApiMeta;
}

export class ApiErrorMessage {
  code: string;
  message: string;
}

export class ApiMeta {
  timestamp: string;
  path: any;
  method: any;
}
