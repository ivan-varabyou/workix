import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  GitHubIntegrationDto,
  GitHubIssueDto,
  GitHubSyncDto,
  GitHubWebhookDto,
} from '../dto/github.dto';
import { GitHubWebhookPayload } from '../interfaces/github-config.interface';
import { GitHubApiService } from '../services/github-api.service';
import { GitHubEventsService } from '../services/github-events.service';
import { GitHubIntegrationService } from '../services/github-integration.service';

@ApiTags('github-integration')
@Controller('github')
export class GitHubController {
  constructor(
    private readonly githubIntegrationService: GitHubIntegrationService,
    private readonly githubEventsService: GitHubEventsService,
    private readonly githubApiService: GitHubApiService
  ) {}

  /**
   * Create GitHub integration
   */
  @Post('integrate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create GitHub integration for authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'GitHub integration created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid integration data' })
  async createIntegration(@Body() dto: GitHubIntegrationDto): Promise<any> {
    if (dto.githubUserId === undefined || !dto.githubLogin || !dto.accessToken) {
      throw new Error('GitHub user ID, login, and access token are required');
    }
    return await this.githubIntegrationService.createIntegration(
      'current-user-id',
      dto.githubUserId,
      dto.githubLogin,
      dto.accessToken,
      dto.scope
    );
  }

  /**
   * Get user's GitHub integration
   */
  @Get('integration')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get current GitHub integration' })
  @ApiResponse({ status: 200, description: 'GitHub integration details' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getIntegration(): Promise<any> {
    return await this.githubIntegrationService.getIntegration('current-user-id');
  }

  /**
   * Get user repositories
   */
  @Get('repositories')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get repositories from GitHub account' })
  @ApiResponse({ status: 200, description: 'List of repositories' })
  async getRepositories(@Query('page') page = 1): Promise<any[]> {
    return await this.githubIntegrationService.getUserRepositories('current-user-id', page);
  }

  /**
   * Get repository details
   */
  @Get('repository/:owner/:repo')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get repository details' })
  @ApiResponse({ status: 200, description: 'Repository details' })
  async getRepository(@Param('owner') owner: string, @Param('repo') repo: string): Promise<any> {
    return await this.githubApiService.getRepository(owner, repo);
  }

  /**
   * Get repository issues
   */
  @Get('repository/:owner/:repo/issues')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get repository issues' })
  @ApiResponse({ status: 200, description: 'List of issues' })
  async getIssues(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<any[]> {
    return await this.githubApiService.getIssues(owner, repo, state);
  }

  /**
   * Create an issue
   */
  @Post('repository/:owner/:repo/issues')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new issue' })
  @ApiResponse({ status: 201, description: 'Issue created' })
  async createIssue(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() dto: GitHubIssueDto
  ): Promise<any> {
    const integration = await this.githubIntegrationService.getIntegration('current-user-id');
    if (!integration) {
      throw new Error('GitHub integration not found');
    }

    if (!dto.title) {
      throw new Error('Title is required');
    }
    return await this.githubApiService.createIssue(
      integration.accessToken,
      owner,
      repo,
      dto.title,
      dto.body,
      dto.labels
    );
  }

  /**
   * Get pull requests
   */
  @Get('repository/:owner/:repo/pulls')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get repository pull requests' })
  @ApiResponse({ status: 200, description: 'List of pull requests' })
  async getPullRequests(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<any[]> {
    return await this.githubApiService.getPullRequests(owner, repo, state);
  }

  /**
   * Get commits
   */
  @Get('repository/:owner/:repo/commits')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get repository commits' })
  @ApiResponse({ status: 200, description: 'List of commits' })
  async getCommits(@Param('owner') owner: string, @Param('repo') repo: string): Promise<any[]> {
    return await this.githubApiService.getCommits(owner, repo);
  }

  /**
   * Create webhook for pipeline triggers
   */
  @Post('webhook')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create webhook for pipeline integration' })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  async createWebhook(@Body() dto: GitHubWebhookDto): Promise<any> {
    if (!dto.owner || !dto.repo || !dto.webhookUrl) {
      throw new Error('Owner, repo, and webhook URL are required');
    }
    return await this.githubIntegrationService.createWebhookForPipeline(
      'current-user-id',
      dto.owner,
      dto.repo,
      dto.webhookUrl
    );
  }

  /**
   * List webhooks
   */
  @Get('webhooks/:owner/:repo')
  @HttpCode(200)
  @ApiOperation({ summary: 'List repository webhooks' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  async listWebhooks(@Param('owner') owner: string, @Param('repo') repo: string): Promise<any[]> {
    return await this.githubIntegrationService.listWebhooks('current-user-id', owner, repo);
  }

  /**
   * Handle GitHub webhook
   */
  @Post('webhook/event')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle incoming GitHub webhook event' })
  @ApiResponse({ status: 200, description: 'Event processed' })
  async handleWebhookEvent(@Body() payload: GitHubWebhookPayload): Promise<{ ok: boolean }> {
    await this.githubEventsService.handleWebhookEvent(payload);
    return { ok: true };
  }

  /**
   * Sync repository data
   */
  @Post('sync')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sync repository data from GitHub' })
  @ApiResponse({ status: 200, description: 'Repository synced' })
  async syncRepository(@Body() dto: GitHubSyncDto): Promise<any> {
    if (!dto.owner || !dto.repo) {
      throw new Error('Owner and repo are required');
    }
    return await this.githubIntegrationService.syncRepository(
      'current-user-id',
      dto.owner,
      dto.repo
    );
  }

  /**
   * Get integration statistics
   */
  @Get('stats')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get GitHub integration statistics' })
  @ApiResponse({ status: 200, description: 'Integration statistics' })
  async getStats(): Promise<any> {
    return await this.githubIntegrationService.getIntegrationStats('current-user-id');
  }

  /**
   * Get repository insights
   */
  @Get('insights/:owner/:repo')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get repository insights' })
  @ApiResponse({ status: 200, description: 'Repository insights' })
  async getInsights(@Param('owner') owner: string, @Param('repo') repo: string): Promise<any> {
    return await this.githubApiService.getRepositoryInsights(owner, repo);
  }

  /**
   * Deactivate integration
   */
  @Delete('integration/:integrationId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate GitHub integration' })
  @ApiResponse({ status: 200, description: 'Integration deactivated' })
  async deactivateIntegration(@Param('integrationId') integrationId: string): Promise<any> {
    await this.githubIntegrationService.deactivateIntegration(integrationId);
    return { message: 'Integration deactivated successfully' };
  }
}
