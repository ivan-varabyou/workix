// Provider-specific data interfaces

import { BasePayload } from './integration-payload.interface';

/**
 * YouTube API response structures
 */
export interface YouTubeVideoData extends BasePayload {
  id?: string;
  videoId?: string;
  snippet?: {
    title?: string;
    description?: string;
    categoryId?: string;
    tags?: string[];
    publishedAt?: string;
    thumbnails?: {
      high?: {
        url?: string;
      };
    };
  };
  statistics?: {
    viewCount?: string | number;
    likeCount?: string | number;
    commentCount?: string | number;
    shareCount?: string | number;
  };
  title?: string;
  description?: string;
  thumbnail?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface YouTubeChannelData extends BasePayload {
  id?: string;
  channelId?: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: {
        url?: string;
      };
    };
  };
  statistics?: {
    viewCount?: string | number;
    subscriberCount?: string | number;
  };
  name?: string;
  subscribers?: number;
}

/**
 * E-commerce provider data structures
 */
export interface ProductData extends BasePayload {
  productId?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  thumbnail?: string;
  views?: number;
  sales?: number;
  revenue?: number;
  rating?: number;
  reviews?: number;
  category?: string;
  tags?: string[];
}

/**
 * Social media provider data structures
 */
export interface SocialMediaPostData extends BasePayload {
  postId?: string;
  videoId?: string;
  id?: string;
  title?: string;
  description?: string;
  caption?: string;
  url?: string;
  thumbnail?: string;
  cover?: string;
  image?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  impressions?: number;
  followers?: number;
  hashtags?: string[];
  username?: string;
}

/**
 * Generic provider data - fallback type
 */
export type ProviderData =
  | YouTubeVideoData
  | YouTubeChannelData
  | ProductData
  | SocialMediaPostData
  | BasePayload;
