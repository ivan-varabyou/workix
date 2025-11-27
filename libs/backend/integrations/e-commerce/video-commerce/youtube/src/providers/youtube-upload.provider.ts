import { Injectable } from '@nestjs/common';

import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../../../core/src/interfaces/integration-provider.interface';
import { YouTubeApiService } from '../services/youtube-api.service';
import {
  VideoUpdateMetadata,
  VideoUploadMetadata,
} from '../types/youtube-api-types';

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

  async execute<T = string | { updated: boolean }>(
    request: IntegrationRequest
  ): Promise<IntegrationResponse<T>> {
    const p = request.payload || {};
    let data: string | { updated: boolean };
    switch (request.operation) {
      case 'uploadVideo':
        const fileStream = p.fileStream;
        const metadata = p.metadata;
        if (
          fileStream &&
          typeof fileStream === 'object' &&
          !Array.isArray(fileStream) &&
          fileStream !== null &&
          metadata &&
          typeof metadata === 'object' &&
          !Array.isArray(metadata) &&
          metadata !== null &&
          'title' in metadata &&
          'description' in metadata &&
          'pipe' in fileStream
        ) {
          const metadataObj: VideoUploadMetadata = {
            title: typeof metadata.title === 'string' ? metadata.title : '',
            description: typeof metadata.description === 'string' ? metadata.description : '',
          };
          if (Array.isArray(metadata.tags)) {
            const filteredTags = metadata.tags.filter((t): t is string => typeof t === 'string');
            if (filteredTags.length > 0) {
              metadataObj.tags = filteredTags;
            }
          }
          if (typeof metadata.categoryId === 'string') {
            metadataObj.categoryId = metadata.categoryId;
          }
          if (
            typeof metadata.privacyStatus === 'string' &&
            (metadata.privacyStatus === 'public' ||
              metadata.privacyStatus === 'unlisted' ||
              metadata.privacyStatus === 'private')
          ) {
            metadataObj.privacyStatus = metadata.privacyStatus as 'public' | 'unlisted' | 'private';
          }
          data = await this.api.uploadVideo(fileStream, metadataObj);
        } else {
          throw new Error('Invalid fileStream or metadata');
        }
        break;
      case 'uploadThumbnail':
        const videoId = typeof p.videoId === 'string' ? p.videoId : '';
        const imageStream = p.imageStream;
        if (
          imageStream &&
          typeof imageStream === 'object' &&
          !Array.isArray(imageStream) &&
          imageStream !== null &&
          'pipe' in imageStream
        ) {
          await this.api.uploadThumbnail(videoId, imageStream);
          data = { updated: true };
        } else {
          throw new Error('Invalid imageStream');
        }
        break;
      case 'updateMetadata':
        const videoIdForUpdate = typeof p.videoId === 'string' ? p.videoId : '';
        const metadataForUpdate = p.metadata;
        if (
          metadataForUpdate &&
          typeof metadataForUpdate === 'object' &&
          !Array.isArray(metadataForUpdate) &&
          metadataForUpdate !== null
        ) {
          const metadataObj: VideoUpdateMetadata = {};
          if ('title' in metadataForUpdate && typeof metadataForUpdate.title === 'string') {
            metadataObj.title = metadataForUpdate.title;
          }
          if (
            'description' in metadataForUpdate &&
            typeof metadataForUpdate.description === 'string'
          ) {
            metadataObj.description = metadataForUpdate.description;
          }
          if ('tags' in metadataForUpdate && Array.isArray(metadataForUpdate.tags)) {
            const filteredTags = metadataForUpdate.tags.filter(
              (t): t is string => typeof t === 'string'
            );
            if (filteredTags.length > 0) {
              metadataObj.tags = filteredTags;
            }
          }
          if (
            'categoryId' in metadataForUpdate &&
            typeof metadataForUpdate.categoryId === 'string'
          ) {
            metadataObj.categoryId = metadataForUpdate.categoryId;
          }
          await this.api.updateVideoMetadata(videoIdForUpdate, metadataObj);
          data = { updated: true };
        } else {
          throw new Error('Invalid metadata');
        }
        break;
      default:
        throw new Error(`Unknown operation: ${request.operation}`);
    }
    const response: IntegrationResponse<T> = {
      id: request.id || `yt-upload-${Date.now()}`,
      provider: this.id,
      operation: request.operation,
      data: data as T,
      timestamp: new Date(),
    };
    return response;
  }

  getInfo(): {
    id: string;
    name: string;
    capabilities: IntegrationCapability[];
    status: 'active' | 'inactive' | 'beta' | 'deprecated';
  } {
    const statusValue: 'active' | 'inactive' | 'beta' | 'deprecated' = 'active';
    return { id: this.id, name: this.name, capabilities: this.capabilities, status: statusValue };
  }
}
