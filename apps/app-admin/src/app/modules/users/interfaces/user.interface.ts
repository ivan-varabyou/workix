// User interfaces for admin app

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
  roles?: string[];
  isActive: boolean;
  phone?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
  skip: number;
  take: number;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  password: string;
  role?: string;
  roles?: string[];
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: string;
  roles?: string[];
  isActive?: boolean;
}
