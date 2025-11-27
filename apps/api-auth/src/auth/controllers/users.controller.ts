import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtGuard } from '@workix/domain/auth';
import {
  UpdateUserProfileDto,
  UserListResponsePrisma,
  UserProfilePrisma,
  UserProfileService,
  UserSearchResultPrisma,
} from '@workix/domain/users';

import {
  DeleteUserProfileResponseDto,
  UpdateAvatarRequestBodyDto,
  UserListResponseDto,
  UserProfileResponseDto,
  UserSearchResultDto,
} from '@workix/domain/users';
import { UpdateAvatarRequestBody } from './users.controller.interfaces';

/**
 * Users Controller
 * Handles user profile management endpoints
 * Moved from monolith to Auth API - all user data operations should be in Auth API
 */
@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@ApiExtraModels(
  UserProfileResponseDto,
  UserListResponseDto,
  UserSearchResultDto,
  DeleteUserProfileResponseDto,
  UpdateAvatarRequestBodyDto,
)
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private userProfileService: UserProfileService) {}

  /**
   * Get current user profile
   * Convenient endpoint that uses JWT token to get current user
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile found', type: () => UserProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser('userId') userId: string): Promise<UserProfilePrisma> {
    return await this.userProfileService.getProfile(userId);
  }

  /**
   * Get user profile by ID
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User profile found', type: () => UserProfileResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - can only access own profile' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  @ApiResponse({ status: 400, description: 'Invalid user ID format' })
  async getUserProfile(
    @Param('userId') userId: string,
    @CurrentUser('userId') currentUserId: string
  ): Promise<UserProfilePrisma> {
    // Validate userId format - prevent path traversal
    if (!userId || typeof userId !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }

    // Check for path traversal patterns
    if (/\.\.|%2e%2e|%2E%2E|\.\.\/|\.\.\\|\.\.%2f|\.\.%2F|\.\.%5c|\.\.%5C/i.test(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // Check for non-UUID characters (if using UUID format)
    // Allow UUID format: 8-4-4-4-12 hex characters
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // Only allow users to access their own profile
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only access your own profile');
    }

    try {
      return await this.userProfileService.getProfile(userId);
    } catch (error: unknown) {
      // Don't expose internal errors or paths
      if (error instanceof Error && error.message.includes('not found')) {
        throw new BadRequestException('User profile not found');
      }
      throw new BadRequestException('Unable to retrieve user profile');
    }
  }

  /**
   * List all users (with pagination)
   * Only accessible by admins
   */
  @Get()
  @ApiOperation({ summary: 'List all users (paginated)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of users per page' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of users to skip' })
  @ApiResponse({ status: 200, description: 'Users list retrieved', type: () => UserListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listUsers(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<UserListResponsePrisma> {
    const take: number = limit ? Number(limit) : 10;
    const skip: number = offset ? Number(offset) : 0;
    return await this.userProfileService.listUsers(skip, take);
  }

  /**
   * Search users by name or email
   */
  @Get('search')
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of results' })
  @ApiResponse({ status: 200, description: 'Search results', type: () => [UserSearchResultDto] })
  @ApiResponse({ status: 400, description: 'Search query is required' })
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit?: number
  ): Promise<UserSearchResultPrisma[]> {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    const take: number = limit ? Number(limit) : 10;
    return await this.userProfileService.searchUsers(query, take);
  }

  /**
   * Update user profile
   */
  @Put(':userId')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({ description: 'User profile update data' }) // UpdateUserProfileDto from domain/users
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: () => UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateUserProfile(
    @Param('userId') userId: string,
    @CurrentUser('userId') currentUserId: string,
    @Body() updateDto: UpdateUserProfileDto
  ): Promise<UserProfilePrisma> {
    // Only allow users to update their own profile
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return await this.userProfileService.updateProfile(userId, updateDto);
  }

  /**
   * Update user avatar
   */
  @Post(':userId/avatar')
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({ type: () => UpdateAvatarRequestBodyDto })
  @ApiResponse({ status: 200, description: 'Avatar updated successfully', type: () => UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async updateAvatar(
    @Param('userId') userId: string,
    @CurrentUser('userId') currentUserId: string,
    @Body() body: UpdateAvatarRequestBody
  ): Promise<UserProfilePrisma> {
    // Only allow users to update their own avatar
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own avatar');
    }
    // Avatar update is part of profile update
    return await this.userProfileService.updateProfile(userId, {
      avatarUrl: body.avatarUrl,
    });
  }

  /**
   * Delete user profile
   */
  @Delete(':userId')
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully', type: () => DeleteUserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async deleteUserProfile(
    @Param('userId') userId: string,
    @CurrentUser('userId') currentUserId: string
  ): Promise<{ message: string }> {
    // Only allow users to delete their own profile
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    return await this.userProfileService.deleteProfile(userId);
  }
}
