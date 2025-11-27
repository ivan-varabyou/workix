import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  GitLabIntegrationDto,
  GitLabIssueDto,
  GitLabSyncDto,
  GitLabWebhookDto,
} from '../dto/gitlab.dto';
import { GitLabWebhookPayload } from '../interfaces/gitlab-config.interface';
import { GitLabApiService } from '../services/gitlab-api.service';
import { GitLabEventsService } from '../services/gitlab-events.service';
import { GitLabIntegrationService } from '../services/gitlab-integration.service';

@ApiTags('gitlab-integration')
@Controller('gitlab')
export class GitLabController {
  constructor(
    private readonly gitlabIntegrationService: GitLabIntegrationService,
    private readonly gitlabEventsService: GitLabEventsService,
    private readonly gitlabApiService: GitLabApiService
  ) {}

  /**
   * Create GitLab integration
   */
  @Post('integrate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create GitLab integration for authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'GitLab integration created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid integration data' })
  async createIntegration(@Body() dto: GitLabIntegrationDto): Promise<any> {
    if (dto.gitlabUserId === undefined || !dto.gitlabUsername || !dto.accessToken) {
      throw new Error('GitLab user ID, username, and access token are required');
    }
    return await this.gitlabIntegrationService.createIntegration(
      'current-user-id',
      dto.gitlabUserId,
      dto.gitlabUsername,
      dto.accessToken,
      dto.baseUrl
    );
  }

  /**
   * Get user's GitLab integration
   */
  @Get('integration')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get current GitLab integration' })
  @ApiResponse({ status: 200, description: 'GitLab integration details' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getIntegration(): Promise<any> {
    return await this.gitlabIntegrationService.getIntegration('current-user-id');
  }

  /**
   * Get user projects
   */
  @Get('projects')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get projects from GitLab account' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async getProjects(@Query('page') page = 1): Promise<any[]> {
    return await this.gitlabIntegrationService.getUserProjects('current-user-id', page);
  }

  /**
   * Get project details
   */
  @Get('project/:projectId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get project details' })
  @ApiResponse({ status: 200, description: 'Project details' })
  async getProject(@Param('projectId') projectId: string): Promise<any> {
    return await this.gitlabApiService.getProject(parseInt(projectId));
  }

  /**
   * Get project issues
   */
  @Get('project/:projectId/issues')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get project issues' })
  @ApiResponse({ status: 200, description: 'List of issues' })
  async getIssues(
    @Param('projectId') projectId: string,
    @Query('state') state: 'opened' | 'closed' | 'all' = 'opened'
  ): Promise<any[]> {
    return await this.gitlabApiService.getIssues(parseInt(projectId), state);
  }

  /**
   * Create an issue
   */
  @Post('project/:projectId/issues')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new issue' })
  @ApiResponse({ status: 201, description: 'Issue created' })
  async createIssue(
    @Param('projectId') projectId: string,
    @Body() dto: GitLabIssueDto
  ): Promise<any> {
    if (!dto.title) {
      throw new Error('Title is required');
    }
    return await this.gitlabApiService.createIssue(
      parseInt(projectId),
      dto.title,
      dto.description,
      dto.labels
    );
  }

  /**
   * Get merge requests
   */
  @Get('project/:projectId/merge-requests')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get project merge requests' })
  @ApiResponse({ status: 200, description: 'List of merge requests' })
  async getMergeRequests(
    @Param('projectId') projectId: string,
    @Query('state') state: 'opened' | 'closed' | 'merged' | 'all' = 'opened'
  ): Promise<any[]> {
    return await this.gitlabApiService.getMergeRequests(parseInt(projectId), state);
  }

  /**
   * Get commits
   */
  @Get('project/:projectId/commits')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get project commits' })
  @ApiResponse({ status: 200, description: 'List of commits' })
  async getCommits(@Param('projectId') projectId: string): Promise<any[]> {
    return await this.gitlabApiService.getCommits(parseInt(projectId));
  }

  /**
   * Create webhook for pipeline triggers
   */
  @Post('webhook')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create webhook for pipeline integration' })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  async createWebhook(@Body() dto: GitLabWebhookDto): Promise<any> {
    if (dto.projectId === undefined || !dto.webhookUrl) {
      throw new Error('Project ID and webhook URL are required');
    }
    return await this.gitlabIntegrationService.createWebhookForPipeline(
      'current-user-id',
      dto.projectId,
      dto.webhookUrl
    );
  }

  /**
   * List webhooks
   */
  @Get('webhooks/:projectId')
  @HttpCode(200)
  @ApiOperation({ summary: 'List project webhooks' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  async listWebhooks(@Param('projectId') projectId: string): Promise<any[]> {
    return await this.gitlabIntegrationService.listWebhooks('current-user-id', parseInt(projectId));
  }

  /**
   * Handle GitLab webhook
   */
  @Post('webhook/event')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle incoming GitLab webhook event' })
  @ApiResponse({ status: 200, description: 'Event processed' })
  async handleWebhookEvent(@Body() payload: GitLabWebhookPayload): Promise<{ ok: boolean }> {
    await this.gitlabEventsService.handleWebhookEvent(payload);
    return { ok: true };
  }

  /**
   * Sync project data
   */
  @Post('sync')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sync project data from GitLab' })
  @ApiResponse({ status: 200, description: 'Project synced' })
  async syncProject(@Body() dto: GitLabSyncDto): Promise<any> {
    if (dto.projectId === undefined) {
      throw new Error('Project ID is required');
    }
    return await this.gitlabIntegrationService.syncProject('current-user-id', dto.projectId);
  }

  /**
   * Get integration statistics
   */
  @Get('stats')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get GitLab integration statistics' })
  @ApiResponse({ status: 200, description: 'Integration statistics' })
  async getStats(): Promise<any> {
    return await this.gitlabIntegrationService.getIntegrationStats('current-user-id');
  }

  /**
   * Get project insights
   */
  @Get('insights/:projectId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get project insights' })
  @ApiResponse({ status: 200, description: 'Project insights' })
  async getInsights(@Param('projectId') projectId: string): Promise<any> {
    return await this.gitlabApiService.getProjectStats(parseInt(projectId));
  }

  /**
   * Deactivate integration
   */
  @Delete('integration/:integrationId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate GitLab integration' })
  @ApiResponse({ status: 200, description: 'Integration deactivated' })
  async deactivateIntegration(@Param('integrationId') integrationId: string): Promise<any> {
    await this.gitlabIntegrationService.deactivateIntegration(integrationId);
    return { message: 'Integration deactivated successfully' };
  }
}
