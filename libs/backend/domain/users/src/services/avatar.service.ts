import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';
import * as path from 'path';

import { BatchUploadResult, UploadedFile } from '../interfaces/file.interface';
import { User, UsersPrismaService } from '../interfaces/users-prisma.interface';

/**
 * Avatar Upload Service
 * Handles user avatar uploads and processing
 */
@Injectable()
export class AvatarService {
  private readonly logger: Logger = new Logger(AvatarService.name);
  private prisma: UsersPrismaService;

  private readonly MAX_FILE_SIZE: number = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES: string[] = ['image/jpeg', 'image/png', 'image/webp'];
  // private readonly UPLOAD_DIR = './uploads/avatars';

  constructor(@Inject('PrismaService') prisma: UsersPrismaService, private i18n: I18nService) {
    this.prisma = prisma;
  }

  private get prismaClient(): UsersPrismaService {
    return this.prisma;
  }

  /**
   * Upload and process avatar
   */
  async uploadAvatar(
    userId: string,
    file: UploadedFile
  ): Promise<{
    avatarUrl: string;
    message: string;
  }> {
    // Validate file
    this.validateFile(file);

    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('errors.user_not_found'));
    }

    // Generate unique filename
    const filename: string = `${userId}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}${path.extname(file.originalname)}`;
    const avatarUrl: string = `/uploads/avatars/${filename}`;

    // In production, upload to S3 or similar
    // For now, just store the path
    await this.prismaClient.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    this.logger.log(`Avatar uploaded for user: ${userId}`);

    return {
      avatarUrl,
      message: 'Avatar uploaded successfully',
    };
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(userId: string): Promise<{ message: string }> {
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('errors.user_not_found'));
    }

    await this.prismaClient.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    this.logger.log(`Avatar deleted for user: ${userId}`);

    return {
      message: 'Avatar deleted successfully',
    };
  }

  /**
   * Get avatar URL
   */
  async getAvatarUrl(userId: string): Promise<{ avatarUrl?: string }> {
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('errors.user_not_found'));
    }

    const result: { avatarUrl?: string } = {};
    if (user.avatarUrl !== undefined && user.avatarUrl !== null) {
      result.avatarUrl = user.avatarUrl;
    }
    return result;
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: UploadedFile): void {
    if (!file) {
      throw new BadRequestException(this.i18n.translate('users.avatar.no_file_provided'));
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(this.i18n.translate('users.avatar.file_size_exceeded'));
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(this.i18n.translate('users.avatar.invalid_file_type'));
    }

    // Check file extension
    const ext: string = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      throw new BadRequestException(this.i18n.translate('users.avatar.invalid_file_extension'));
    }
  }

  /**
   * Process image (resize, optimize)
   * In production, use sharp library
   */
  // eslint-disable-next-line no-restricted-syntax -- Buffer is required for file processing in Node.js backend
  async processImage(file: UploadedFile): Promise<Buffer> {
    // This is a placeholder - in production use sharp for image processing
    // Example: resize to 200x200, optimize quality, etc.
    return file.buffer;
  }

  /**
   * Generate avatar thumbnails
   */
  async generateThumbnails(avatarUrl: string): Promise<{
    small: string;
    medium: string;
    large: string;
  }> {
    // Generate different sizes: 50x50, 150x150, 300x300
    return {
      small: avatarUrl + '?size=50',
      medium: avatarUrl + '?size=150',
      large: avatarUrl + '?size=300',
    };
  }

  /**
   * Batch upload avatars
   */
  async batchUploadAvatars(
    uploads: Array<{ userId: string; file: UploadedFile }>
  ): Promise<BatchUploadResult[]> {
    const results: Array<{ userId: string; success: boolean; avatarUrl?: string; error?: string }> =
      [];

    for (const upload of uploads) {
      try {
        const result: { avatarUrl: string; message: string } = await this.uploadAvatar(upload.userId, upload.file);
        results.push({
          userId: upload.userId,
          success: true,
          avatarUrl: result.avatarUrl,
        });
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        results.push({
          userId: upload.userId,
          success: false,
          error: errorMessage,
        });
      }
    }

    return results;
  }
}
