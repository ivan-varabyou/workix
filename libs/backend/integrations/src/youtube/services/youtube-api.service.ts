import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import type { youtube_v3 } from 'googleapis';
import { google } from 'googleapis';

export type YouTubeApiClient = youtube_v3.Youtube;

export interface UploadProgressEvent {
  bytesRead: number;
  totalBytes: number;
}

export type FileStream = Buffer | Blob | ArrayBuffer | Uint8Array | NodeJS.ReadableStream;

export interface OAuthTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string | null;
  token_type?: string | null;
  expiry_date?: number | null;
}

export type YouTubeChannelInfo = youtube_v3.Schema$Channel;
export type YouTubeVideoInfo = youtube_v3.Schema$Video;
export type YouTubeSearchResult = youtube_v3.Schema$SearchResult;
export type YouTubeCommentThread = youtube_v3.Schema$CommentThread;
export type YouTubePlaylistItem = youtube_v3.Schema$PlaylistItem;

export interface VideoUploadMetadata {
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: 'public' | 'unlisted' | 'private';
}

export interface VideoUpdateMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
}

@Injectable()
export class YouTubeApiService {
  private logger = new Logger(YouTubeApiService.name);
  private youtube!: YouTubeApiClient;
  private oauth2Client!: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.initializeOAuth2();
  }

  /**
   * Initialize OAuth2 client
   */
  private initializeOAuth2(): void {
    this.oauth2Client = new OAuth2Client(
      this.configService.get('YOUTUBE_CLIENT_ID'),
      this.configService.get('YOUTUBE_CLIENT_SECRET'),
      this.configService.get('YOUTUBE_REDIRECT_URI')
    );

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
    }) as YouTubeApiClient;

    this.logger.log('YouTube API initialized');
  }

  /**
   * Get OAuth2 authorization URL
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.readonly',
      ],
    });
  }

  /**
   * Set credentials from authorization code
   */
  async setCredentialsFromCode(code: string): Promise<OAuthTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Store refresh token securely (implement based on your storage solution)
    if (tokens.refresh_token) {
      this.logger.log('Refresh token obtained');
    }

    return tokens as OAuthTokens;
  }

  /**
   * Set credentials from stored tokens
   */
  setCredentialsFromTokens(tokens: OAuthTokens): void {
    const credentials: {
      access_token?: string;
      refresh_token?: string;
      scope?: string;
      token_type?: string;
      expiry_date?: number;
    } = {};
    if (tokens.access_token !== undefined && tokens.access_token !== null) {
      credentials.access_token = tokens.access_token;
    }
    if (tokens.refresh_token !== undefined && tokens.refresh_token !== null) {
      credentials.refresh_token = tokens.refresh_token;
    }
    if (tokens.scope !== undefined && tokens.scope !== null) {
      credentials.scope = tokens.scope;
    }
    if (tokens.token_type !== undefined && tokens.token_type !== null) {
      credentials.token_type = tokens.token_type;
    }
    if (tokens.expiry_date !== undefined && tokens.expiry_date !== null) {
      credentials.expiry_date = tokens.expiry_date;
    }
    this.oauth2Client.setCredentials(credentials);
  }

  /**
   * Get channel info
   */
  async getChannelInfo(forUsername?: string): Promise<YouTubeChannelInfo> {
    try {
      const params: youtube_v3.Params$Resource$Channels$List = {
        part: ['snippet', 'statistics', 'contentDetails'],
        mine: !forUsername,
      };
      if (forUsername !== undefined) {
        params.forUsername = forUsername;
      }
      const response = await this.youtube.channels.list(params);

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = response.data.items[0];
      if (!channel) {
        throw new Error('Channel not found');
      }
      return channel as YouTubeChannelInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get channel info: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Upload video
   */
  async uploadVideo(fileStream: FileStream, metadata: VideoUploadMetadata): Promise<string> {
    try {
      const response = await this.youtube.videos.insert(
        {
          part: ['snippet', 'status'],
          requestBody: {
            snippet: {
              title: metadata.title,
              description: metadata.description,
              tags: metadata.tags || [],
              categoryId: metadata.categoryId || '22', // People & Blogs
            },
            status: {
              privacyStatus: metadata.privacyStatus || 'private',
            },
          },
          media: {
            body: fileStream,
          },
        },
        {
          onUploadProgress: (evt: UploadProgressEvent) => {
            const progress = (evt.bytesRead / evt.totalBytes) * 100;
            this.logger.debug(`Upload progress: ${progress.toFixed(0)}%`);
          },
        }
      );

      const videoId = response.data.id;
      if (!videoId) {
        throw new Error('Video ID not found in response');
      }
      this.logger.log(`Video uploaded: ${videoId}`);
      return videoId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to upload video: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Update video metadata
   */
  async updateVideoMetadata(videoId: string, metadata: VideoUpdateMetadata): Promise<void> {
    try {
      await this.youtube.videos.update({
        part: ['snippet'],
        requestBody: {
          id: videoId,
          snippet: (() => {
            const snippet: {
              title?: string;
              description?: string;
              tags?: string[];
              categoryId?: string;
            } = {};
            if (metadata.title !== undefined) {
              snippet.title = metadata.title;
            }
            if (metadata.description !== undefined) {
              snippet.description = metadata.description;
            }
            if (metadata.tags !== undefined) {
              snippet.tags = metadata.tags;
            }
            if (metadata.categoryId !== undefined) {
              snippet.categoryId = metadata.categoryId;
            }
            return snippet;
          })(),
        },
      });

      this.logger.log(`Video metadata updated: ${videoId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to update video metadata: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Upload custom thumbnail
   */
  async uploadThumbnail(videoId: string, imageStream: FileStream): Promise<void> {
    try {
      await this.youtube.thumbnails.set({
        videoId,
        media: {
          body: imageStream,
        },
      });

      this.logger.log(`Thumbnail uploaded for video: ${videoId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to upload thumbnail: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get video statistics
   */
  async getVideoStats(videoId: string): Promise<YouTubeVideoInfo> {
    try {
      const response = await this.youtube.videos.list({
        part: ['statistics', 'snippet', 'contentDetails'],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.data.items[0];
      if (!video) {
        throw new Error('Video not found');
      }
      return video;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get video stats: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get playlist items
   */
  async getPlaylistItems(playlistId: string): Promise<YouTubePlaylistItem[]> {
    try {
      const response = await this.youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId,
        maxResults: 50,
      });

      return response.data.items ?? [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get playlist items: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Search videos
   */
  async searchVideos(query: string, maxResults = 10): Promise<YouTubeSearchResult[]> {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults,
        order: 'relevance',
      });

      return response.data.items ?? [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to search videos: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get comments for video
   */
  async getComments(videoId: string, maxResults = 20): Promise<YouTubeCommentThread[]> {
    try {
      const response = await this.youtube.commentThreads.list({
        part: ['snippet'],
        videoId,
        maxResults,
        textFormat: 'plainText',
      });

      return response.data.items ?? [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get comments: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get trending videos
   */
  async getTrendingVideos(regionCode = 'US', maxResults = 10): Promise<YouTubeVideoInfo[]> {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics'],
        chart: 'mostPopular',
        regionCode,
        maxResults,
      });

      return response.data.items ?? [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get trending videos: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
