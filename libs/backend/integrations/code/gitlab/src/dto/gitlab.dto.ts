import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class GitLabIntegrationDto {
  @IsNumber()
  gitlabUserId?: number;

  @IsString()
  gitlabUsername?: string;

  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;
}

export class GitLabProjectDto {
  @IsNumber()
  projectId?: number;
}

export class GitLabIssueDto {
  @IsNumber()
  projectId?: number;

  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  labels?: string[];
}

export class GitLabWebhookDto {
  @IsNumber()
  projectId?: number;

  @IsString()
  webhookUrl?: string;
}

import {
  GitLabObjectAttributes,
  GitLabProjectPayload,
} from '../interfaces/gitlab-webhook.interface';

export class GitLabEventDto {
  @IsString()
  objectKind?: string;

  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  project?: GitLabProjectPayload;

  @IsOptional()
  objectAttributes?: GitLabObjectAttributes;
}

export class GitLabSyncDto {
  @IsNumber()
  projectId?: number;
}

export class GitLabIntegrationResponseDto {
  id: string;
  userId: string;
  gitlabUserId: number;
  gitlabUsername: string;
  baseUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    gitlabUserId: number,
    gitlabUsername: string,
    baseUrl: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.gitlabUserId = gitlabUserId;
    this.gitlabUsername = gitlabUsername;
    this.baseUrl = baseUrl;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export class GitLabIntegrationStatsDto {
  integration: {
    id: string;
    gitlabUsername: string;
    isActive: boolean;
    createdAt: Date;
  };
  user: {
    username: string;
    name: string;
    avatarUrl: string;
    state: string;
  };
  stats: {
    syncedProjects: number;
  };

  constructor(
    integration: {
      id: string;
      gitlabUsername: string;
      isActive: boolean;
      createdAt: Date;
    },
    user: {
      username: string;
      name: string;
      avatarUrl: string;
      state: string;
    },
    stats: {
      syncedProjects: number;
    }
  ) {
    this.integration = integration;
    this.user = user;
    this.stats = stats;
  }
}
