import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class GitHubIntegrationDto {
  @IsNumber()
  githubUserId?: number;

  @IsString()
  githubLogin?: string;

  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  scope?: string;
}

export class GitHubRepositoryDto {
  @IsString()
  owner?: string;

  @IsString()
  repo?: string;
}

export class GitHubIssueDto {
  @IsString()
  owner?: string;

  @IsString()
  repo?: string;

  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsArray()
  labels?: string[];
}

export class GitHubWebhookDto {
  @IsString()
  owner?: string;

  @IsString()
  repo?: string;

  @IsString()
  webhookUrl?: string;
}

import {
  GitHubCommitPayload,
  GitHubIssuePayload,
  GitHubPullRequestPayload,
} from '../interfaces/github-config.interface';

export class GitHubEventDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  repository?: {
    id: number;
    name: string;
    full_name: string;
  };

  @IsOptional()
  issue?: GitHubIssuePayload;

  @IsOptional()
  pull_request?: GitHubPullRequestPayload;

  @IsOptional()
  commits?: GitHubCommitPayload[];
}

export class GitHubSyncDto {
  @IsString()
  owner?: string;

  @IsString()
  repo?: string;
}

export class GitHubIntegrationResponseDto {
  id: string;
  userId: string;
  githubUserId: number;
  githubLogin: string;
  scope?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    githubUserId: number,
    githubLogin: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    scope?: string
  ) {
    this.id = id;
    this.userId = userId;
    this.githubUserId = githubUserId;
    this.githubLogin = githubLogin;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    if (scope !== undefined) {
      this.scope = scope;
    }
  }
}

export class GitHubIntegrationStatsDto {
  integration: {
    id: string;
    githubLogin: string;
    isActive: boolean;
    createdAt: Date;
  };
  user: {
    login: string;
    name: string;
    avatarUrl: string;
    publicRepos: number;
    followers: number;
    following: number;
  };
  stats: {
    syncedRepositories: number;
  };

  constructor(
    integration: {
      id: string;
      githubLogin: string;
      isActive: boolean;
      createdAt: Date;
    },
    user: {
      login: string;
      name: string;
      avatarUrl: string;
      publicRepos: number;
      followers: number;
      following: number;
    },
    stats: {
      syncedRepositories: number;
    }
  ) {
    this.integration = integration;
    this.user = user;
    this.stats = stats;
  }
}
