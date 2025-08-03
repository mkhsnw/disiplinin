export class LoginRequest {
  email: string;
  password: string;
}

export class UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: Date;
}

export class LoginResponse {
  accessToken: string;
  user: UserResponse;
}

export class RegisterRequest {
  email: string;
  password: string;
  name: string;
}
