import { Injectable } from '@nestjs/common';

import { BasePayload, isBasePayload } from '../../../src/interfaces/integration-payload.interface';
import { ProviderData } from '../../../src/interfaces/provider-data.interface';
import { IntegrationResponse } from '../interfaces/integration-provider.interface';

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
    const provider = response.provider || '';
    const operation = response.operation;
    const data: BasePayload = isBasePayload(response.data) ? response.data : {};

    const operationValue = operation || '';
    switch (provider) {
      case 'youtube':
        return this.transformYouTube(data, operationValue);
      case 'ozon':
        return this.transformOzon(data, operationValue);
      case 'ebay':
        return this.transformEbay(data, operationValue);
      case 'amazon':
        return this.transformAmazon(data, operationValue);
      case 'tiktok':
        return this.transformTikTok(data, operationValue);
      case 'instagram':
        return this.transformInstagram(data, operationValue);
      case 'wildberries':
        return this.transformWildberries(data, operationValue);
      default:
        return this.transformGeneric(data, provider, operationValue);
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
  private transformYouTube(data: ProviderData, operation: string): GenericDataFormat {
    if (operation.includes('Video') || operation.includes('video')) {
      const idValue =
        (typeof data.id === 'string' ? data.id : '') ||
        (typeof data.videoId === 'string' ? data.videoId : '') ||
        '';
      const snippet = data.snippet && typeof data.snippet === 'object' ? data.snippet : undefined;
      const statistics =
        data.statistics && typeof data.statistics === 'object' ? data.statistics : undefined;
      const titleValue =
        (snippet && 'title' in snippet && typeof snippet.title === 'string'
          ? snippet.title
          : undefined) ||
        (typeof data.title === 'string' ? data.title : undefined) ||
        '';
      const descriptionValue =
        (snippet && 'description' in snippet && typeof snippet.description === 'string'
          ? snippet.description
          : undefined) ||
        (typeof data.description === 'string' ? data.description : undefined) ||
        '';
      const thumbnails =
        snippet &&
        'thumbnails' in snippet &&
        snippet.thumbnails &&
        typeof snippet.thumbnails === 'object'
          ? snippet.thumbnails
          : undefined;
      const high =
        thumbnails && 'high' in thumbnails && thumbnails.high && typeof thumbnails.high === 'object'
          ? thumbnails.high
          : undefined;
      const thumbnailValue =
        (high && 'url' in high && typeof high.url === 'string' ? high.url : undefined) ||
        (typeof data.thumbnail === 'string' ? data.thumbnail : undefined) ||
        '';
      const categoryValue =
        data.snippet &&
        typeof data.snippet === 'object' &&
        'categoryId' in data.snippet &&
        typeof data.snippet.categoryId === 'string'
          ? data.snippet.categoryId
          : undefined;
      const tagsValue =
        data.snippet &&
        typeof data.snippet === 'object' &&
        'tags' in data.snippet &&
        Array.isArray(data.snippet.tags)
          ? data.snippet.tags.filter((tag): tag is string => typeof tag === 'string')
          : [];
      const publishedAtValue =
        data.snippet &&
        typeof data.snippet === 'object' &&
        'publishedAt' in data.snippet &&
        data.snippet.publishedAt
          ? new Date(String(data.snippet.publishedAt))
          : undefined;
      const result: GenericDataFormat = {
        id: idValue,
        type: 'video',
        provider: 'youtube',
        url: `https://www.youtube.com/watch?v=${idValue}`,
        metrics: {
          views:
            (statistics && 'viewCount' in statistics && typeof statistics.viewCount === 'number'
              ? statistics.viewCount
              : undefined) || (typeof data.views === 'number' ? data.views : 0),
          likes:
            (statistics && 'likeCount' in statistics && typeof statistics.likeCount === 'number'
              ? statistics.likeCount
              : undefined) || (typeof data.likes === 'number' ? data.likes : 0),
          comments:
            (statistics &&
            'commentCount' in statistics &&
            typeof statistics.commentCount === 'number'
              ? statistics.commentCount
              : undefined) || (typeof data.comments === 'number' ? data.comments : 0),
          shares:
            (statistics && 'shareCount' in statistics && typeof statistics.shareCount === 'number'
              ? statistics.shareCount
              : undefined) || (typeof data.shares === 'number' ? data.shares : 0),
        },
        metadata: {},
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
      if (categoryValue !== undefined) {
        result.metadata.category = categoryValue;
      }
      if (tagsValue.length > 0) {
        result.metadata.tags = tagsValue;
      }
      if (publishedAtValue !== undefined) {
        result.metadata.publishedAt = publishedAtValue;
      }
      return result;
    }

    if (operation.includes('Channel') || operation.includes('channel')) {
      const idValue =
        (typeof data.id === 'string' ? data.id : '') ||
        (typeof data.channelId === 'string' ? data.channelId : '') ||
        '';
      const snippet = data.snippet && typeof data.snippet === 'object' ? data.snippet : undefined;
      const statistics =
        data.statistics && typeof data.statistics === 'object' ? data.statistics : undefined;
      const titleValue =
        (snippet && 'title' in snippet && typeof snippet.title === 'string'
          ? snippet.title
          : undefined) ||
        (typeof data.name === 'string' ? data.name : undefined) ||
        '';
      const descriptionValue =
        snippet && 'description' in snippet && typeof snippet.description === 'string'
          ? snippet.description
          : undefined;
      const thumbnails =
        snippet &&
        'thumbnails' in snippet &&
        snippet.thumbnails &&
        typeof snippet.thumbnails === 'object'
          ? snippet.thumbnails
          : undefined;
      const high =
        thumbnails && 'high' in thumbnails && thumbnails.high && typeof thumbnails.high === 'object'
          ? thumbnails.high
          : undefined;
      const thumbnailValue =
        high && 'url' in high && typeof high.url === 'string' ? high.url : undefined;
      const viewCount =
        (statistics && 'viewCount' in statistics && typeof statistics.viewCount === 'number'
          ? statistics.viewCount
          : undefined) || (typeof data.viewCount === 'number' ? data.viewCount : 0);
      const subscriberCount =
        (statistics &&
        'subscriberCount' in statistics &&
        typeof statistics.subscriberCount === 'number'
          ? statistics.subscriberCount
          : undefined) || (typeof data.subscribers === 'number' ? data.subscribers : 0);
      const publishedAtValue =
        snippet && 'publishedAt' in snippet && snippet.publishedAt
          ? new Date(String(snippet.publishedAt))
          : undefined;
      const result: GenericDataFormat = {
        id: idValue,
        type: 'channel',
        provider: 'youtube',
        url: `https://www.youtube.com/channel/${idValue}`,
        metrics: {
          views: viewCount,
          followers: subscriberCount,
        },
        metadata: {},
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
      if (publishedAtValue !== undefined) {
        result.metadata.publishedAt = publishedAtValue;
      }
      return result;
    }

    return this.transformGeneric(data, 'youtube', operation || '');
  }

  /**
   * Ozon transformer
   */
  private transformOzon(data: ProviderData, _operation: string): GenericDataFormat {
    const idValue =
      (typeof data.productId === 'string' ? data.productId : '') ||
      (typeof data.id === 'string' ? data.id : '') ||
      '';
    const titleValue: string =
      (typeof data.name === 'string' ? data.name : '') ||
      (typeof data.title === 'string' ? data.title : '') ||
      '';
    const descriptionValue = typeof data.description === 'string' ? data.description : undefined;
    const urlValue =
      (typeof data.url === 'string' ? data.url : undefined) ||
      `https://www.ozon.ru/product/${idValue}`;
    const thumbnailValue =
      (typeof data.image === 'string' ? data.image : undefined) ||
      (typeof data.thumbnail === 'string' ? data.thumbnail : undefined);
    const viewsValue = typeof data.views === 'number' ? data.views : 0;
    const salesValue = typeof data.sales === 'number' ? data.sales : 0;
    const revenueValue = typeof data.revenue === 'number' ? data.revenue : 0;
    const ratingValue = typeof data.rating === 'number' ? data.rating : 0;
    const categoryValue = typeof data.category === 'string' ? data.category : undefined;
    const tagsValue = Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === 'string')
      : [];
    const result: GenericDataFormat = {
      id: idValue,
      type: 'product',
      provider: 'ozon',
      metrics: {
        views: viewsValue,
        sales: salesValue,
        revenue: revenueValue,
        rating: ratingValue,
      },
      metadata: {},
      raw: data,
    };
    if (titleValue !== undefined && titleValue !== '') {
      result.title = titleValue;
    }
    if (descriptionValue !== undefined) {
      result.description = descriptionValue;
    }
    if (urlValue !== undefined) {
      result.url = urlValue;
    }
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (categoryValue !== undefined) {
      result.metadata.category = categoryValue;
    }
    if (tagsValue.length > 0) {
      result.metadata.tags = tagsValue;
    }
    return result;
  }

  /**
   * eBay transformer
   */
  private transformEbay(data: ProviderData, _operation: string): GenericDataFormat {
    const idValue =
      (typeof data.listingId === 'string' ? data.listingId : '') ||
      (typeof data.id === 'string' ? data.id : '') ||
      '';
    const titleValue = typeof data.title === 'string' ? data.title : '';
    const descriptionValue = typeof data.description === 'string' ? data.description : undefined;
    const urlValue =
      (typeof data.url === 'string' ? data.url : undefined) ||
      `https://www.ebay.com/itm/${idValue}`;
    const thumbnailValue =
      (typeof data.image === 'string' ? data.image : undefined) ||
      (typeof data.thumbnail === 'string' ? data.thumbnail : undefined);
    const viewsValue = typeof data.views === 'number' ? data.views : 0;
    const salesValue = typeof data.sales === 'number' ? data.sales : 0;
    const revenueValue = typeof data.revenue === 'number' ? data.revenue : 0;
    const ratingValue = typeof data.rating === 'number' ? data.rating : 0;
    const categoryValue = typeof data.category === 'string' ? data.category : undefined;
    const result: GenericDataFormat = {
      id: idValue,
      type: 'listing',
      provider: 'ebay',
      metrics: {
        views: viewsValue,
        sales: salesValue,
        revenue: revenueValue,
        rating: ratingValue,
      },
      metadata: {},
      raw: data,
    };
    if (titleValue !== undefined && titleValue !== '') {
      result.title = titleValue;
    }
    if (descriptionValue !== undefined) {
      result.description = descriptionValue;
    }
    if (urlValue !== undefined) {
      result.url = urlValue;
    }
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (categoryValue !== undefined) {
      result.metadata.category = categoryValue;
    }
    return result;
  }

  /**
   * Amazon transformer
   */
  private transformAmazon(data: ProviderData, _operation: string): GenericDataFormat {
    const idValue =
      (typeof data.productId === 'string' ? data.productId : '') ||
      (typeof data.asin === 'string' ? data.asin : '') ||
      (typeof data.id === 'string' ? data.id : '') ||
      '';
    const titleValue: string =
      (typeof data.title === 'string' ? data.title : '') ||
      (typeof data.name === 'string' ? data.name : '') ||
      '';
    const descriptionValue = typeof data.description === 'string' ? data.description : undefined;
    const urlValue =
      (typeof data.url === 'string' ? data.url : undefined) ||
      `https://www.amazon.com/dp/${idValue}`;
    const thumbnailValue =
      (typeof data.image === 'string' ? data.image : undefined) ||
      (typeof data.thumbnail === 'string' ? data.thumbnail : undefined);
    const viewsValue = typeof data.views === 'number' ? data.views : 0;
    const salesValue = typeof data.sales === 'number' ? data.sales : 0;
    const revenueValue = typeof data.revenue === 'number' ? data.revenue : 0;
    const ratingValue = typeof data.rating === 'number' ? data.rating : 0;
    const reviewsValue = typeof data.reviews === 'number' ? data.reviews : 0;
    const categoryValue = typeof data.category === 'string' ? data.category : undefined;
    const result: GenericDataFormat = {
      id: idValue,
      type: 'product',
      provider: 'amazon',
      metrics: {
        views: viewsValue,
        sales: salesValue,
        revenue: revenueValue,
        rating: ratingValue,
        reviews: reviewsValue,
      },
      metadata: {},
      raw: data,
    };
    if (titleValue !== undefined && titleValue !== '') {
      result.title = titleValue;
    }
    if (descriptionValue !== undefined) {
      result.description = descriptionValue;
    }
    if (urlValue !== undefined) {
      result.url = urlValue;
    }
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (categoryValue !== undefined) {
      result.metadata.category = categoryValue;
    }
    return result;
  }

  /**
   * TikTok transformer
   */
  private transformTikTok(data: ProviderData, _operation: string): GenericDataFormat {
    const idValue =
      (typeof data.videoId === 'string' ? data.videoId : '') ||
      (typeof data.id === 'string' ? data.id : '') ||
      '';
    const titleValue =
      (typeof data.title === 'string' ? data.title : undefined) ||
      (typeof data.description === 'string' ? data.description : undefined) ||
      '';
    const descriptionValue = typeof data.description === 'string' ? data.description : undefined;
    const usernameValue = typeof data.username === 'string' ? data.username : '';
    const urlValue =
      (typeof data.url === 'string' ? data.url : undefined) ||
      `https://www.tiktok.com/@${usernameValue}/video/${idValue}`;
    const thumbnailValue =
      (typeof data.thumbnail === 'string' ? data.thumbnail : undefined) ||
      (typeof data.cover === 'string' ? data.cover : undefined);
    const viewsValue = typeof data.views === 'number' ? data.views : 0;
    const likesValue = typeof data.likes === 'number' ? data.likes : 0;
    const commentsValue = typeof data.comments === 'number' ? data.comments : 0;
    const sharesValue = typeof data.shares === 'number' ? data.shares : 0;
    const followersValue = typeof data.followers === 'number' ? data.followers : 0;
    const tagsValue = Array.isArray(data.hashtags)
      ? data.hashtags.filter((tag): tag is string => typeof tag === 'string')
      : [];
    const result: GenericDataFormat = {
      id: idValue,
      type: 'video',
      provider: 'tiktok',
      metrics: {
        views: viewsValue,
        likes: likesValue,
        comments: commentsValue,
        shares: sharesValue,
        followers: followersValue,
      },
      metadata: {},
      raw: data,
    };
    if (titleValue !== undefined && titleValue !== '') {
      result.title = titleValue;
    }
    if (descriptionValue !== undefined) {
      result.description = descriptionValue;
    }
    if (urlValue !== undefined) {
      result.url = urlValue;
    }
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (tagsValue.length > 0) {
      result.metadata.tags = tagsValue;
    }
    return result;
  }

  /**
   * Instagram transformer
   */
  private transformInstagram(data: ProviderData, _operation: string): GenericDataFormat {
    const idValue =
      (typeof data.postId === 'string' ? data.postId : '') ||
      (typeof data.id === 'string' ? data.id : '') ||
      '';
    const captionValue = typeof data.caption === 'string' ? data.caption : undefined;
    const urlValue =
      (typeof data.url === 'string' ? data.url : undefined) ||
      `https://www.instagram.com/p/${idValue}`;
    const thumbnailValue =
      (typeof data.thumbnail === 'string' ? data.thumbnail : undefined) ||
      (typeof data.image === 'string' ? data.image : undefined);
    const likesValue = typeof data.likes === 'number' ? data.likes : 0;
    const commentsValue = typeof data.comments === 'number' ? data.comments : 0;
    const sharesValue = typeof data.shares === 'number' ? data.shares : 0;
    const impressionsValue = typeof data.impressions === 'number' ? data.impressions : 0;
    const followersValue = typeof data.followers === 'number' ? data.followers : 0;
    const tagsValue = Array.isArray(data.hashtags)
      ? data.hashtags.filter((tag): tag is string => typeof tag === 'string')
      : [];
    const result: GenericDataFormat = {
      id: idValue,
      type: 'post',
      provider: 'instagram',
      metrics: {
        likes: likesValue,
        comments: commentsValue,
        shares: sharesValue,
        impressions: impressionsValue,
        followers: followersValue,
      },
      metadata: {},
      raw: data,
    };
    if (captionValue !== undefined) {
      result.title = captionValue;
      result.description = captionValue;
    }
    if (urlValue !== undefined) {
      result.url = urlValue;
    }
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (tagsValue.length > 0) {
      result.metadata.tags = tagsValue;
    }
    return result;
  }

  /**
   * Wildberries transformer
   */
  private transformWildberries(data: ProviderData, _operation: string): GenericDataFormat {
    const idValue =
      (typeof data.productId === 'string' ? data.productId : '') ||
      (typeof data.id === 'string' ? data.id : '') ||
      '';
    const titleValue =
      (typeof data.name === 'string' ? data.name : undefined) ||
      (typeof data.title === 'string' ? data.title : undefined) ||
      '';
    const descriptionValue = typeof data.description === 'string' ? data.description : undefined;
    const urlValue =
      (typeof data.url === 'string' ? data.url : undefined) ||
      `https://www.wildberries.ru/catalog/${idValue}/detail.aspx`;
    const thumbnailValue =
      (typeof data.image === 'string' ? data.image : undefined) ||
      (typeof data.thumbnail === 'string' ? data.thumbnail : undefined);
    const viewsValue = typeof data.views === 'number' ? data.views : 0;
    const salesValue = typeof data.sales === 'number' ? data.sales : 0;
    const revenueValue = typeof data.revenue === 'number' ? data.revenue : 0;
    const ratingValue = typeof data.rating === 'number' ? data.rating : 0;
    const reviewsValue = typeof data.reviews === 'number' ? data.reviews : 0;
    const categoryValue = typeof data.category === 'string' ? data.category : undefined;
    const result: GenericDataFormat = {
      id: idValue,
      type: 'product',
      provider: 'wildberries',
      metrics: {
        views: viewsValue,
        sales: salesValue,
        revenue: revenueValue,
        rating: ratingValue,
        reviews: reviewsValue,
      },
      metadata: {},
      raw: data,
    };
    if (titleValue !== undefined && titleValue !== '') {
      result.title = titleValue;
    }
    if (descriptionValue !== undefined) {
      result.description = descriptionValue;
    }
    if (urlValue !== undefined) {
      result.url = urlValue;
    }
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    if (categoryValue !== undefined) {
      result.metadata.category = categoryValue;
    }
    return result;
  }

  /**
   * Generic transformer (fallback)
   */
  private transformGeneric(
    data: ProviderData,
    provider: string,
    operation: string
  ): GenericDataFormat {
    const providerIdKey = `${provider}Id`;
    const providerIdValue = providerIdKey in data ? data[providerIdKey] : undefined;
    const idValue =
      (typeof data.id === 'string' ? data.id : '') ||
      (typeof providerIdValue === 'string' ? providerIdValue : '') ||
      '';
    const titleValue =
      (typeof data.title === 'string' ? data.title : undefined) ||
      (typeof data.name === 'string' ? data.name : undefined) ||
      '';
    const descriptionValue = typeof data.description === 'string' ? data.description : undefined;
    const urlValue = typeof data.url === 'string' ? data.url : undefined;
    const thumbnailValue =
      (typeof data.thumbnail === 'string' ? data.thumbnail : undefined) ||
      (typeof data.image === 'string' ? data.image : undefined);
    const result: GenericDataFormat = {
      id: idValue,
      type: 'generic',
      provider,
      metrics: {},
      metadata: {
        operation: operation || '',
      },
      raw: data,
    };
    if (titleValue !== undefined && titleValue !== '') {
      result.title = titleValue;
    }
    if (descriptionValue !== undefined) {
      result.description = descriptionValue;
    }
    if (urlValue !== undefined) {
      result.url = urlValue;
    }
    if (thumbnailValue !== undefined) {
      result.thumbnail = thumbnailValue;
    }
    return result;
  }
}
