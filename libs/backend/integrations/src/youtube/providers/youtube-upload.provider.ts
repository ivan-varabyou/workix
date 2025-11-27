import { Injectable } from '@nestjs/common';

import { BasePayload } from '../../../core/src/interfaces/integration-payload.interface';
import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../core/src/interfaces/integration-provider.interface';
import { YouTubeApiService } from '../../youtube/services/youtube-api.service';
import type {
  FileStream,
  VideoUpdateMetadata,
  VideoUploadMetadata,
} from '../services/youtube-api.service';

@Injectable()
export class YouTubeUploadProvider implements IntegrationProvider {
  id = 'youtube';
  name = 'YouTube';
  capabilities = [IntegrationCapability.UPLOAD];

  constructor(private api: YouTubeApiService) {}

  supports(operation: string, capability: IntegrationCapability): boolean {
    if (capability !== IntegrationCapability.UPLOAD) return false;
    return ['uploadVideo', 'uploadThumbnail', 'updateMetadata'].includes(operation);
  }

  async execute<T = BasePayload>(request: IntegrationRequest): Promise<IntegrationResponse<T>> {
    const p = request.payload || {};
    let data: BasePayload;
    switch (request.operation) {
      case 'uploadVideo': {
        const fileStream = p.fileStream;
        const metadata = p.metadata;
        // Type guard для FileStream
        const isValidFileStream = (stream: unknown): stream is FileStream => {
          if (
            stream instanceof Buffer ||
            stream instanceof Blob ||
            stream instanceof ArrayBuffer ||
            stream instanceof Uint8Array ||
            (typeof stream === 'object' &&
              stream !== null &&
              'pipe' in stream &&
              typeof (stream as { pipe?: unknown }).pipe === 'function')
          ) {
            return true;
          }
          return false;
        };
        if (!isValidFileStream(fileStream)) {
          throw new Error('Invalid fileStream: must be a valid FileStream');
        }
        // Type guard для VideoUploadMetadata
        const isValidMetadata = (meta: unknown): meta is VideoUploadMetadata => {
          if (
            typeof meta === 'object' &&
            meta !== null &&
            !Array.isArray(meta) &&
            'title' in meta &&
            typeof (meta as { title?: unknown }).title === 'string' &&
            'description' in meta &&
            typeof (meta as { description?: unknown }).description === 'string'
          ) {
            return true;
          }
          return false;
        };
        if (!isValidMetadata(metadata)) {
          throw new Error('Invalid metadata: must be a valid VideoUploadMetadata');
        }
        const videoId: string = await this.api.uploadVideo(fileStream, metadata);
        data = { videoId, status: 'success' };
        break;
      }
      case 'uploadThumbnail': {
        const videoId = p.videoId;
        if (typeof videoId !== 'string') {
          throw new Error('Invalid videoId: must be a string');
        }
        const imageStream = p.imageStream;
        const isValidFileStream = (stream: unknown): stream is FileStream => {
          if (
            stream instanceof Buffer ||
            stream instanceof Blob ||
            stream instanceof ArrayBuffer ||
            stream instanceof Uint8Array ||
            (typeof stream === 'object' &&
              stream !== null &&
              'pipe' in stream &&
              typeof (stream as { pipe?: unknown }).pipe === 'function')
          ) {
            return true;
          }
          return false;
        };
        if (!isValidFileStream(imageStream)) {
          throw new Error('Invalid imageStream: must be a valid FileStream');
        }
        await this.api.uploadThumbnail(videoId, imageStream);
        data = { updated: true, videoId };
        break;
      }
      case 'updateMetadata': {
        const videoId = p.videoId;
        if (typeof videoId !== 'string') {
          throw new Error('Invalid videoId: must be a string');
        }
        const metadata = p.metadata;
        // Используем type guard из youtube-api-types
        const isValidMetadata = (meta: unknown): meta is VideoUpdateMetadata => {
          if (
            typeof meta === 'object' &&
            meta !== null &&
            !Array.isArray(meta) &&
            ('title' in meta || 'description' in meta || 'tags' in meta || 'categoryId' in meta)
          ) {
            const m = meta as Record<string, unknown>;
            return (
              (m.title === undefined || typeof m.title === 'string') &&
              (m.description === undefined || typeof m.description === 'string') &&
              (m.tags === undefined || Array.isArray(m.tags)) &&
              (m.categoryId === undefined || typeof m.categoryId === 'string')
            );
          }
          return false;
        };
        if (!isValidMetadata(metadata)) {
          throw new Error('Invalid metadata: must be a valid VideoUpdateMetadata');
        }
        await this.api.updateVideoMetadata(videoId, metadata);
        data = { updated: true, videoId };
        break;
      }
      default:
        throw new Error(`Unknown operation: ${request.operation}`);
    }
    return {
      id: request.id || `yt-upload-${Date.now()}`,
      provider: this.id,
      operation: request.operation,
      data,
      timestamp: new Date(),
    } as IntegrationResponse<T>;
  }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      capabilities: this.capabilities,
      status: 'active' as const,
    };
  }
}
