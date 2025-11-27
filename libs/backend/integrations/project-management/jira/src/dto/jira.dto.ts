import { IsArray, IsOptional, IsString } from 'class-validator';

import { JiraIssue, JiraUser } from '../interfaces/jira-config.interface';
import { JiraChangelog } from '../interfaces/jira-events.interface';

export class JiraIntegrationDto {
  @IsString()
  jiraEmail?: string;

  @IsString()
  jiraBaseUrl?: string;

  @IsString()
  apiToken?: string;
}

export class JiraIssueCreateDto {
  @IsString()
  projectKey?: string;

  @IsString()
  issueType?: string;

  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  labels?: string[];
}

export class JiraSearchDto {
  @IsString()
  jql?: string;
}

export class JiraWebhookDto {
  @IsString()
  webhookUrl?: string;
}

export class JiraTransitionDto {
  @IsString()
  issueKey?: string;

  @IsString()
  transitionId?: string;
}

export class JiraCommentDto {
  @IsString()
  issueKey?: string;

  @IsString()
  comment?: string;
}

export class JiraEventDto {
  @IsString()
  webhookEvent?: string;

  @IsOptional()
  issue?: JiraIssue;

  @IsOptional()
  changelog?: JiraChangelog;

  @IsOptional()
  user?: JiraUser;
}

export class JiraIntegrationResponseDto {
  id: string;
  userId: string;
  jiraEmail: string;
  jiraBaseUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    jiraEmail: string,
    jiraBaseUrl: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.jiraEmail = jiraEmail;
    this.jiraBaseUrl = jiraBaseUrl;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export class JiraIntegrationStatsDto {
  integration: {
    id: string;
    jiraEmail: string;
    isActive: boolean;
    createdAt: Date;
  };
  user: {
    displayName: string;
    email: string;
    avatarUrl: string;
    accountType: string;
  };
  stats: {
    connectedProjects: number;
  };

  constructor(
    integration: {
      id: string;
      jiraEmail: string;
      isActive: boolean;
      createdAt: Date;
    },
    user: {
      displayName: string;
      email: string;
      avatarUrl: string;
      accountType: string;
    },
    stats: {
      connectedProjects: number;
    }
  ) {
    this.integration = integration;
    this.user = user;
    this.stats = stats;
  }
}
