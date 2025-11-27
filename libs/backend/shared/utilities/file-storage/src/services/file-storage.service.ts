import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

import { FileStoragePrismaService } from '../interfaces/file-storage.interface';

// Multer File interface
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
        destination?: string;
        filename?: string;
        path?: string;
      }
    }
  }
}

export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
  uploadedBy?: string;
  tags?: string[];
}

export interface UploadOptions {
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
}

export interface StorageConfig {
  basePath: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

@Injectable()
export class FileStorageService {
  private logger = new Logger(FileStorageService.name);
  private files: Map<string, FileMetadata> = new Map();
  private config: StorageConfig;

  constructor(_prisma: FileStoragePrismaService) {
    this.config = {
      basePath: process.env.FILE_STORAGE_PATH || './storage',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
      ],
    };
  }

  /**
   * Upload file
   */
  async uploadFile(file: Express.Multer.File, options?: UploadOptions): Promise<FileMetadata> {
    // Validate file size
    if (file.size > (options?.maxSize || this.config.maxFileSize)) {
      throw new Error(`File size exceeds maximum allowed size`);
    }

    // Validate MIME type
    if (options?.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }

    if (
      this.config.allowedMimeTypes.length > 0 &&
      !this.config.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }

    const fileId = uuid();
    const folder = options?.folder || 'default';
    const storagePath = path.join(this.config.basePath, folder);
    const filename = `${fileId}-${file.originalname}`;
    const filePath = path.join(storagePath, filename);

    // Ensure directory exists
    await fs.mkdir(storagePath, { recursive: true });

    // Save file
    await fs.writeFile(filePath, file.buffer);

    const metadata: FileMetadata = {
      id: fileId,
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      uploadedAt: new Date(),
    };

    this.files.set(fileId, metadata);
    this.logger.log(`File ${fileId} uploaded: ${file.originalname}`);

    return metadata;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    return this.files.get(fileId) || null;
  }

  /**
   * Download file
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    const metadata = this.files.get(fileId);
    if (!metadata) {
      throw new Error(`File ${fileId} not found`);
    }

    return await fs.readFile(metadata.path);
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    this.files.delete(fileId);
  }
}
