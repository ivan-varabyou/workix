import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  JiraCommentDto,
  JiraIntegrationDto,
  JiraIssueCreateDto,
  JiraSearchDto,
  JiraTransitionDto,
  JiraWebhookDto,
} from '../dto/jira.dto';
import {
  JiraProject,
  JiraTransition,
  JiraWebhookPayload,
} from '../interfaces/jira-config.interface';
import { JiraApiService } from '../services/jira-api.service';
import { JiraEventsService } from '../services/jira-events.service';
import { JiraIntegrationService } from '../services/jira-integration.service';
import {
  JiraCommentResponse,
  JiraIntegrationResponse,
  JiraIntegrationStatsResponse,
  JiraIssueResponse,
  JiraSearchResponse,
  JiraWebhookResponse,
} from '../types/jira-api-types';

@ApiTags('jira-integration')
@Controller('jira')
export class JiraController {
  constructor(
    private readonly jiraIntegrationService: JiraIntegrationService,
    private readonly jiraEventsService: JiraEventsService,
    private readonly jiraApiService: JiraApiService
  ) {}

  /**
   * Create Jira integration
   */
  @Post('integrate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Jira integration for authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'Jira integration created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid integration data' })
  async createIntegration(@Body() dto: JiraIntegrationDto): Promise<JiraIntegrationResponse> {
    if (!dto.jiraEmail || !dto.jiraBaseUrl || !dto.apiToken) {
      throw new Error('Jira email, base URL, and API token are required');
    }
    return await this.jiraIntegrationService.createIntegration(
      'current-user-id',
      dto.jiraEmail,
      dto.jiraBaseUrl,
      dto.apiToken
    );
  }

  /**
   * Get user's Jira integration
   */
  @Get('integration')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get current Jira integration' })
  @ApiResponse({ status: 200, description: 'Jira integration details' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getIntegration(): Promise<JiraIntegrationResponse | null> {
    return await this.jiraIntegrationService.getIntegration('current-user-id');
  }

  /**
   * Get user projects
   */
  @Get('projects')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Jira projects' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async getProjects(): Promise<JiraProject[]> {
    return await this.jiraIntegrationService.getUserProjects('current-user-id');
  }

  /**
   * Search issues
   */
  @Post('search')
  @HttpCode(200)
  @ApiOperation({ summary: 'Search Jira issues' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchIssues(@Body() dto: JiraSearchDto): Promise<JiraSearchResponse> {
    if (!dto.jql) {
      throw new Error('JQL query is required');
    }
    return await this.jiraIntegrationService.searchIssues('current-user-id', dto.jql);
  }

  /**
   * Create issue
   */
  @Post('issue')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new Jira issue' })
  @ApiResponse({ status: 201, description: 'Issue created' })
  async createIssue(@Body() dto: JiraIssueCreateDto): Promise<JiraIssueResponse> {
    if (!dto.projectKey || !dto.issueType || !dto.summary) {
      throw new Error('Project key, issue type, and summary are required');
    }
    return await this.jiraIntegrationService.createIssue(
      'current-user-id',
      dto.projectKey,
      dto.issueType,
      dto.summary,
      dto.description,
      dto.labels
    );
  }

  /**
   * Get issue details
   */
  @Get('issue/:issueKey')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get issue details' })
  @ApiResponse({ status: 200, description: 'Issue details' })
  async getIssue(@Param('issueKey') issueKey: string): Promise<JiraIssueResponse> {
    return await this.jiraApiService.getIssue(issueKey);
  }

  /**
   * Get available transitions
   */
  @Get('issue/:issueKey/transitions')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get available transitions for an issue' })
  @ApiResponse({ status: 200, description: 'Available transitions' })
  async getTransitions(@Param('issueKey') issueKey: string): Promise<JiraTransition[]> {
    return await this.jiraApiService.getTransitions(issueKey);
  }

  /**
   * Transition issue
   */
  @Post('issue/transition')
  @HttpCode(200)
  @ApiOperation({ summary: 'Transition an issue' })
  @ApiResponse({ status: 200, description: 'Issue transitioned' })
  async transitionIssue(@Body() dto: JiraTransitionDto): Promise<void> {
    if (!dto.issueKey || !dto.transitionId) {
      throw new Error('Issue key and transition ID are required');
    }
    return await this.jiraIntegrationService.updateIssueStatus(
      'current-user-id',
      dto.issueKey,
      dto.transitionId
    );
  }

  /**
   * Add comment
   */
  @Post('issue/comment')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add comment to an issue' })
  @ApiResponse({ status: 201, description: 'Comment added' })
  async addComment(@Body() dto: JiraCommentDto): Promise<JiraCommentResponse> {
    if (!dto.issueKey || !dto.comment) {
      throw new Error('Issue key and comment are required');
    }
    return await this.jiraIntegrationService.addComment(
      'current-user-id',
      dto.issueKey,
      dto.comment
    );
  }

  /**
   * Create webhook
   */
  @Post('webhook')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create webhook for pipeline integration' })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  async createWebhook(@Body() dto: JiraWebhookDto): Promise<JiraWebhookResponse> {
    if (!dto.webhookUrl) {
      throw new Error('Webhook URL is required');
    }
    return await this.jiraIntegrationService.createWebhookForPipeline(
      'current-user-id',
      dto.webhookUrl
    );
  }

  /**
   * Handle Jira webhook
   */
  @Post('webhook/event')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle incoming Jira webhook event' })
  @ApiResponse({ status: 200, description: 'Event processed' })
  async handleWebhookEvent(@Body() payload: JiraWebhookPayload): Promise<{ ok: boolean }> {
    await this.jiraEventsService.handleWebhookEvent(payload);
    return { ok: true };
  }

  /**
   * Get integration statistics
   */
  @Get('stats')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Jira integration statistics' })
  @ApiResponse({ status: 200, description: 'Integration statistics' })
  async getStats(): Promise<JiraIntegrationStatsResponse | null> {
    return await this.jiraIntegrationService.getIntegrationStats('current-user-id');
  }

  /**
   * Deactivate integration
   */
  @Delete('integration/:integrationId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate Jira integration' })
  @ApiResponse({ status: 200, description: 'Integration deactivated' })
  async deactivateIntegration(
    @Param('integrationId') integrationId: string
  ): Promise<{ message: string }> {
    await this.jiraIntegrationService.deactivateIntegration(integrationId);
    return { message: 'Integration deactivated successfully' };
  }
}
