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

export class QueryRequest {
  page: number;
  limit: number;
}

