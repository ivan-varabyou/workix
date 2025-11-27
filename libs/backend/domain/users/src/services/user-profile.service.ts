import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';

import {
  User,
  UserListResponse,
  UserProfile,
  UserSearchResult,
  UsersPrismaService,
  UserStats,
  UserUpdateData,
} from '../interfaces/users-prisma.interface';

/**
 * User Profile Service
 * Complete CRUD operations for user profiles
 */
@Injectable()
export class UserProfileService {
  private readonly logger: Logger = new Logger(UserProfileService.name);
  private prisma: UsersPrismaService;

  constructor(@Inject('PrismaService') prisma: UsersPrismaService, private i18n: I18nService) {
    this.prisma = prisma;
  }

  private get prismaClient(): UsersPrismaService {
    return this.prisma;
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('errors.user_not_found'));
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: UserUpdateData): Promise<UserProfile> {
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('errors.user_not_found'));
    }

    // Validate email uniqueness if changing
    if (updateData.email && updateData.email !== user.email) {
      const existing: User | null = await this.prismaClient.user.findUnique({
        where: { email: updateData.email },
      });
      if (existing) {
        throw new ConflictException(this.i18n.translate('errors.email_already_exists'));
      }
    }

    const updateUserData: UserUpdateData = {};
    if (updateData.email !== undefined) {
      updateUserData.email = updateData.email;
    }
    if (updateData.firstName !== undefined) {
      updateUserData.firstName = updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      updateUserData.lastName = updateData.lastName;
    }
    if (updateData.bio !== undefined) {
      updateUserData.bio = updateData.bio;
    }
    if (updateData.phoneNumber !== undefined) {
      updateUserData.phoneNumber = updateData.phoneNumber;
    }
    const updated: User = await this.prismaClient.user.update({
      where: { id: userId },
      data: updateUserData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Profile updated for user: ${userId}`);
    return updated;
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<{ message: string }> {
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('errors.user_not_found'));
    }

    await this.prismaClient.user.delete({
      where: { id: userId },
    });

    this.logger.log(`Profile deleted for user: ${userId}`);
    return { message: 'Profile deleted successfully' };
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserProfile> {
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('errors.user_not_found'));
    }

    return user;
  }

  /**
   * List all users (paginated)
   */
  async listUsers(skip: number = 0, take: number = 10): Promise<UserListResponse> {
    const [users, total]: [Array<{
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      createdAt: Date;
      lastLoginAt?: Date | null;
    }>, number] = await Promise.all([
      this.prismaClient.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prismaClient.user.count(),
    ]);

    const page: number = Math.floor(skip / take) + 1;
    const pageSize: number = take;
    return {
      users,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string, limit: number = 10): Promise<UserSearchResult[]> {
    return await this.prismaClient.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
      take: limit,
    });
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.prismaClient.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const [total, active, inactive]: [number, number, number] = await Promise.all([
      this.prismaClient.user.count(),
      this.prismaClient.user.count({
        where: {
          lastLoginAt: {
            gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prismaClient.user.count({
        where: {
          lastLoginAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      activeRate: ((active / total) * 100).toFixed(2),
    };
  }
}
