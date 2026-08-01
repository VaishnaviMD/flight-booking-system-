export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}
