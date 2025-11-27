// Auth interfaces for admin app

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface AuthResponse extends AuthTokens {
  user?: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface CurrentUser extends AuthUser, AuthTokens {}
