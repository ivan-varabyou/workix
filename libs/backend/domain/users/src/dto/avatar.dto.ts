import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Upload Avatar Response DTO
 */
export class UploadAvatarResponseDto {
  @ApiProperty({
    description: 'Avatar URL',
    example: '/uploads/avatars/user-123-1234567890.jpg',
  })
  avatarUrl: string;

  @ApiProperty({
    description: 'Success message',
  })
  message: string;

  constructor(avatarUrl: string, message: string) {
    this.avatarUrl = avatarUrl;
    this.message = message;
  }
}

/**
 * Get Avatar Response DTO
 */
export class GetAvatarResponseDto {
  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: '/uploads/avatars/user-123-1234567890.jpg',
  })
  avatarUrl?: string;
}

/**
 * Avatar Thumbnails DTO
 */
export class AvatarThumbnailsDto {
  @ApiProperty({
    description: 'Small thumbnail (50x50)',
  })
  small: string;

  @ApiProperty({
    description: 'Medium thumbnail (150x150)',
  })
  medium: string;

  @ApiProperty({
    description: 'Large thumbnail (300x300)',
  })
  large: string;

  constructor(small: string, medium: string, large: string) {
    this.small = small;
    this.medium = medium;
    this.large = large;
  }
}

/**
 * Batch Upload Result DTO
 */
export class BatchUploadResultDto {
  @ApiProperty({
    description: 'User ID',
  })
  userId: string;

  @ApiProperty({
    description: 'Upload success status',
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Avatar URL if successful',
  })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Error message if failed',
  })
  error?: string;

  constructor(userId: string, success: boolean, avatarUrl?: string, error?: string) {
    this.userId = userId;
    this.success = success;
    if (avatarUrl !== undefined) {
      this.avatarUrl = avatarUrl;
    }
    if (error !== undefined) {
      this.error = error;
    }
  }
}
