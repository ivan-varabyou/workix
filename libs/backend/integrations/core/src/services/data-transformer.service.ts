import { Injectable } from '@nestjs/common';

import { BasePayload, isBasePayload } from '../interfaces/integration-payload.interface';
import { IntegrationResponse } from '../interfaces/integration-provider.interface';
import {
  ProductData,
  ProviderData,
  SocialMediaPostData,
  YouTubeChannelData,
  YouTubeVideoData,
} from '../interfaces/provider-data.interface';

/**
 * Generic Data Format
 * Normalized format for all API responses
 */
export interface GenericDataFormat {
  id: string;
  type: string; // 'video', 'product', 'channel', 'listing', etc.
  provider: string;
  title?: string;
  description?: string;
  url?: string;
  thumbnail?: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    sales?: number;
    revenue?: number;
    rating?: number;
    followers?: number;
    [key: string]: string | number | boolean | undefined;
  };
  metadata: {
    category?: string;
    tags?: string[];
    publishedAt?: Date;
    createdAt?: Date;
    [key: string]: string | number | boolean | Date | string[] | undefined;
  };
  raw?: ProviderData; // Original provider-specific data
}

/**
 * Data Transformer Service
 * Transforms provider-specific data to generic format
 */
@Injectable()
export class DataTransformerService {
  /**
   * Transform provider response to generic format
   */
  transform<T = BasePayload>(response: IntegrationResponse<T>): GenericDataFormat {
    const provider: string | undefined = response.provider;
    const operation: string | undefined = response.operation;
    const data: BasePayload = isBasePayload(response.data) ? response.data : {};

    switch (provider) {
      case 'youtube':
        return this.transformYouTube(data, operation);
      case 'ozon':
        return this.transformOzon(data, operation);
      case 'ebay':
        return this.transformEbay(data, operation);
      case 'amazon':
        return this.transformAmazon(data, operation);
      case 'tiktok':
        return this.transformTikTok(data, operation);
      case 'instagram':
        return this.transformInstagram(data, operation);
      case 'wildberries':
        return this.transformWildberries(data, operation);
      default:
        return this.transformGeneric(data, provider || '', operation || '');
    }
  }

  /**
   * Transform multiple responses
   */
  transformMany(responses: IntegrationResponse[]): GenericDataFormat[] {
    return responses.map((r) => this.transform(r));
  }

  /**
   * YouTube transformer
   */
  private transformYouTube(data: ProviderData, operation: string | undefined): GenericDataFormat {
    const videoData: YouTubeVideoData = data as YouTubeVideoData;
    const channelData: YouTubeChannelData = data as YouTubeChannelData;

    if (operation && (operation.includes('Video') || operation.includes('video'))) {
      const titleValue = videoData.snippet?.title || videoData.title;
      const descriptionValue = videoData.snippet?.description || videoData.description;
      const thumbnailValue = videoData.snippet?.thumbnails?.high?.url || videoData.thumbnail;
      const result: GenericDataFormat = {
        id: String(videoData.id || videoData.videoId || ''),
        type: 'video',
        provider: 'youtube',
        url: `https://www.youtube.com/watch?v=${videoData.id || videoData.videoId}`,
        metrics: {
          views: Number(videoData.statistics?.viewCount) || videoData.views || 0,
          likes: Number(videoData.statistics?.likeCount) || videoData.likes || 0,
          comments: Number(videoData.statistics?.commentCount) || videoData.comments || 0,
          shares: Number(videoData.statistics?.shareCount) || videoData.shares || 0,
        },
        metadata: (() => {
          const metadata: {
            category?: string;
            tags?: string[];
            publishedAt?: Date;
            [key: string]: string | number | boolean | Date | string[] | undefined;
          } = {};
          if (videoData.snippet?.categoryId !== undefined) {
            metadata.category = videoData.snippet.categoryId;
          }
          const tags = videoData.snippet?.tags || [];
          if (tags.length > 0) {
            metadata.tags = tags;
          }
          if (videoData.snippet?.publishedAt !== undefined) {
            metadata.publishedAt = new Date(videoData.snippet.publishedAt);
          }
          return metadata;
        })(),
        raw: data,
      };
      if (titleValue !== undefined) {
        result.title = titleValue;
      }
      if (descriptionValue !== undefined) {
        result.description = descriptionValue;
      }
      if (thumbnailValue !== undefined) {
        result.thumbnail = thumbnailValue;
      }
      return result;
    }

    if (operation && (operation.includes('Channel') || operation.includes('channel'))) {
      const titleValue = channelData.snippet?.title || channelData.name;
      const descriptionValue = channelData.snippet?.description;
      const thumbnailValue = channelData.snippet?.thumbnails?.high?.url;
      const result: GenericDataFormat = {
        id: String(channelData.id || channelData.channelId || ''),
        type: 'channel',
        provider: 'youtube',
        url: `https://www.youtube.com/channel/${channelData.id || channelData.channelId}`,
        metrics: {
          views: Number(channelData.statistics?.viewCount) || 0,
          followers:
            Number(channelData.statistics?.subscriberCount) || channelData.subscribers || 0,
        },
        metadata: (() => {
          const metadata: {
            publishedAt?: Date;
            [key: string]: string | number | boolean | Date | string[] | undefined;
          } = {};
          if (channelData.snippet?.publishedAt !== undefined) {
            metadata.publishedAt = new Date(channelData.snippet.publishedAt);
          }
          return metadata;
        })(),
        raw: data,
      };
      if (titleValue !== undefined) {
        result.title = titleValue;
      }
      if (descriptionValue !== undefined) {
        result.description = descriptionValue;
      }
      if (thumbnailValue !== undefined) {
        result.thumbnail = thumbnailValue;
      }
      return result;
    }

    return this.transformGeneric(data, 'youtube', operation);
  }

  /**
   * Ozon transformer
   */
  private transformOzon(data: ProductData, _operation: string | undefined): GenericDataFormat {
    const result: GenericDataFormat = {
      id: data.productId || data.id || '',
      type: 'product',
      provider: 'ozon',
      url: data.url || `https://www.ozon.ru/product/${data.productId || data.id}`,
      metrics: {
        views: data.views || 0,
        sales: data.sales || 0,
        revenue: data.revenue || 0,
        rating: data.rating || 0,
      },
      metadata: {},
      raw: data,
    };
    const titleValue = data.name || data.title;
    if (titleValue !== undefined) {
      result.title = titleValue;
    }
    if (data.description !== undefined) {
      result.description = data.description;
    }
    const thumbnailValue = data.image || data.thumbnail;
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (data.category !== undefined) {
      result.metadata.category = data.category;
    }
    const tags = data.tags || [];
    if (tags.length > 0) {
      result.metadata.tags = tags;
    }
    return result;
  }

  /**
   * eBay transformer
   */
  private transformEbay(data: ProductData, _operation: string | undefined): GenericDataFormat {
    const idValue =
      (typeof data.listingId === 'string' ? data.listingId : '') ||
      (typeof data.id === 'string' ? data.id : '') ||
      '';
    const result: GenericDataFormat = {
      id: idValue,
      type: 'listing',
      provider: 'ebay',
      url: data.url || `https://www.ebay.com/itm/${data.listingId || data.id}`,
      metrics: {
        views: data.views || 0,
        sales: data.sales || 0,
        revenue: data.revenue || 0,
        rating: data.rating || 0,
      },
      metadata: {},
      raw: data,
    };
    if (typeof data.title === 'string') {
      result.title = data.title;
    }
    if (typeof data.description === 'string') {
      result.description = data.description;
    }
    const thumbnailValue = data.image || data.thumbnail;
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (data.category !== undefined) {
      result.metadata.category = data.category;
    }
    return result;
  }

  /**
   * Amazon transformer
   */
  private transformAmazon(data: ProductData, _operation: string | undefined): GenericDataFormat {
    const idValue =
      (typeof data.productId === 'string' ? data.productId : '') ||
      (typeof data.asin === 'string' ? data.asin : '') ||
      (typeof data.id === 'string' ? data.id : '') ||
      '';
    const result: GenericDataFormat = {
      id: idValue,
      type: 'product',
      provider: 'amazon',
      url: data.url || `https://www.amazon.com/dp/${data.asin || data.productId || data.id}`,
      metrics: {
        views: data.views || 0,
        sales: data.sales || 0,
        revenue: data.revenue || 0,
        rating: data.rating || 0,
        reviews: data.reviews || 0,
      },
      metadata: {},
      raw: data,
    };
    const titleValue =
      (typeof data.title === 'string' ? data.title : undefined) ||
      (typeof data.name === 'string' ? data.name : undefined);
    if (titleValue !== undefined && typeof titleValue === 'string') {
      result.title = titleValue;
    }
    if (typeof data.description === 'string') {
      result.description = data.description;
    }
    const thumbnailValue = data.image || data.thumbnail;
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (data.category !== undefined) {
      result.metadata.category = data.category;
    }
    return result;
  }

  /**
   * TikTok transformer
   */
  private transformTikTok(
    data: SocialMediaPostData,
    _operation: string | undefined
  ): GenericDataFormat {
    const result: GenericDataFormat = {
      id: data.videoId || data.id || '',
      type: 'video',
      provider: 'tiktok',
      url: data.url || `https://www.tiktok.com/@${data.username}/video/${data.videoId || data.id}`,
      metrics: {
        views: data.views || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
        followers: data.followers || 0,
      },
      metadata: {},
      raw: data,
    };
    const titleValue = data.title || data.description;
    if (titleValue !== undefined) {
      result.title = titleValue;
    }
    if (data.description !== undefined) {
      result.description = data.description;
    }
    const thumbnailValue = data.thumbnail || data.cover;
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    const tags = data.hashtags || [];
    if (tags.length > 0) {
      result.metadata.tags = tags;
    }
    return result;
  }

  /**
   * Instagram transformer
   */
  private transformInstagram(
    data: SocialMediaPostData,
    _operation: string | undefined
  ): GenericDataFormat {
    const result: GenericDataFormat = {
      id: data.postId || data.id || '',
      type: 'post',
      provider: 'instagram',
      url: data.url || `https://www.instagram.com/p/${data.postId || data.id}`,
      metrics: {
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
        impressions: data.impressions || 0,
        followers: data.followers || 0,
      },
      metadata: {},
      raw: data,
    };
    if (data.caption !== undefined) {
      result.title = data.caption;
      result.description = data.caption;
    }
    const thumbnailValue = data.thumbnail || data.image;
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    const tags = data.hashtags || [];
    if (tags.length > 0) {
      result.metadata.tags = tags;
    }
    return result;
  }

  /**
   * Wildberries transformer
   */
  private transformWildberries(
    data: ProductData,
    _operation: string | undefined
  ): GenericDataFormat {
    const result: GenericDataFormat = {
      id: data.productId || data.id || '',
      type: 'product',
      provider: 'wildberries',
      url:
        data.url || `https://www.wildberries.ru/catalog/${data.productId || data.id}/detail.aspx`,
      metrics: {
        views: data.views || 0,
        sales: data.sales || 0,
        revenue: data.revenue || 0,
        rating: data.rating || 0,
        reviews: data.reviews || 0,
      },
      metadata: {},
      raw: data,
    };
    const titleValue = data.name || data.title;
    if (titleValue !== undefined) {
      result.title = titleValue;
    }
    if (data.description !== undefined) {
      result.description = data.description;
    }
    const thumbnailValue = data.image || data.thumbnail;
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (data.category !== undefined) {
      result.metadata.category = data.category;
    }
    return result;
  }

  /**
   * Generic transformer (fallback)
   */
  private transformGeneric(
    data: ProviderData,
    provider: string,
    operation: string | undefined
  ): GenericDataFormat {
    const baseData: BasePayload = isBasePayload(data) ? data : {};
    const providerIdKey = `${provider}Id`;
    const providerIdRaw = baseData[providerIdKey];
    const providerId: string | number | boolean | undefined =
      providerIdRaw &&
      (typeof providerIdRaw === 'string' ||
        typeof providerIdRaw === 'number' ||
        typeof providerIdRaw === 'boolean')
        ? providerIdRaw
        : undefined;

    // Filter baseData to only include metrics-compatible values
    const metrics: Record<string, string | number | boolean | undefined> = {};
    for (const [key, value] of Object.entries(baseData)) {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === undefined
      ) {
        metrics[key] = value;
      }
    }

    return {
      id: String(baseData.id || providerId || ''),
      type: 'generic',
      provider,
      title: String(baseData.title || baseData.name || ''),
      description: String(baseData.description || ''),
      url: String(baseData.url || ''),
      thumbnail: String(baseData.thumbnail || baseData.image || ''),
      metrics,
      metadata: {
        operation: operation && typeof operation === 'string' ? operation : '',
      },
      raw: data,
    };
  }
}
