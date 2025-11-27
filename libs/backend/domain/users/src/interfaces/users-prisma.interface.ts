// Prisma service interfaces for users module

import { DynamicModule } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type UsersPrismaService = PrismaClient & {
  user: {
    findUnique: (args: {
      where: { id?: string; email?: string };
      select?: {
        id?: boolean;
        email?: boolean;
        firstName?: boolean;
        lastName?: boolean;
        bio?: boolean;
        avatarUrl?: boolean;
        phoneNumber?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        twoFactorEnabled?: boolean;
        lastLoginAt?: boolean;
      };
    }) => Promise<User | null>;
    findFirst: (args: {
      where: {
        email?: string;
        id?: string;
      };
    }) => Promise<User | null>;
    findMany: (args?: {
      where?: {
        OR?: Array<{
          email?: { contains?: string; mode?: 'insensitive' };
          firstName?: { contains?: string; mode?: 'insensitive' };
          lastName?: { contains?: string; mode?: 'insensitive' };
        }>;
        lastLoginAt?: {
          gt?: Date;
          lt?: Date;
        };
      };
      select?: {
        id?: boolean;
        email?: boolean;
        firstName?: boolean;
        lastName?: boolean;
        avatarUrl?: boolean;
        createdAt?: boolean;
        lastLoginAt?: boolean;
      };
      skip?: number;
      take?: number;
      orderBy?: {
        createdAt?: 'asc' | 'desc';
        lastLoginAt?: 'asc' | 'desc';
      };
    }) => Promise<User[]>;
    create: (args: { data: UserCreateData }) => Promise<User>;
    update: (args: {
      where: { id: string };
      data: UserUpdateData;
      select?: {
        id?: boolean;
        email?: boolean;
        firstName?: boolean;
        lastName?: boolean;
        bio?: boolean;
        phoneNumber?: boolean;
        updatedAt?: boolean;
      };
    }) => Promise<User>;
    delete: (args: { where: { id: string } }) => Promise<User>;
    count: (args?: {
      where?: {
        lastLoginAt?: {
          gt?: Date;
          lt?: Date;
        };
      };
    }) => Promise<number>;
  };
};

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  twoFactorEnabled?: boolean | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateData {
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: Date;
}

export interface UserUpdateData {
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string | null;
  phoneNumber?: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  twoFactorEnabled?: boolean | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListResponse {
  users: Array<{
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    createdAt: Date;
    lastLoginAt?: Date | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
}

export interface UserSearchResult {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  activeRate: string;
}

export interface PrismaModuleClass {
  forRoot?: (options?: Record<string, unknown>) => DynamicModule;
}
