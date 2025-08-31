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
}

export class ApiErrorResponse {
  success: boolean;
  error: ApiErrorMessage;
}

export class ApiErrorMessage {
  code: string;
  message: string;
}

