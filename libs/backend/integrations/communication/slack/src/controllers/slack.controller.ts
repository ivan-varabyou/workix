import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  SlackFormattedNotificationDto,
  SlackIntegrationDto,
  SlackMessageDto,
  SlackNotificationDto,
  SlackPipelineNotificationDto,
  SlackWorkflowNotificationDto,
} from '../dto/slack.dto';
import { SlackEventPayload } from '../interfaces/slack-config.interface';
import { SlackMessage } from '../interfaces/slack-config.interface';
import { SlackApiService } from '../services/slack-api.service';
import { SlackEventsService } from '../services/slack-events.service';
import { SlackIntegrationService } from '../services/slack-integration.service';

@ApiTags('slack-integration')
@Controller('slack')
export class SlackController {
  constructor(
    private readonly slackIntegrationService: SlackIntegrationService,
    private readonly slackEventsService: SlackEventsService,
    private readonly slackApiService: SlackApiService
  ) {}

  /**
   * Create Slack integration
   */
  @Post('integrate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Slack integration for authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'Slack integration created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid integration data' })
  async createIntegration(@Body() dto: SlackIntegrationDto): Promise<any> {
    if (!dto.teamId || !dto.slackUserId || !dto.accessToken) {
      throw new Error('Team ID, Slack user ID, and access token are required');
    }
    return await this.slackIntegrationService.createIntegration(
      'current-user-id', // In real app, get from @CurrentUser()
      dto.teamId,
      dto.slackUserId,
      dto.accessToken,
      dto.channelId
    );
  }

  /**
   * Get user's Slack integration
   */
  @Get('integration')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get current Slack integration' })
  @ApiResponse({ status: 200, description: 'Slack integration details' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getIntegration(): Promise<any> {
    return await this.slackIntegrationService.getIntegration('current-user-id');
  }

  /**
   * Get integration by team
   */
  @Get('integration/team/:teamId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all integrations for a team' })
  @ApiResponse({ status: 200, description: 'List of integrations' })
  async getTeamIntegrations(@Param('teamId') teamId: string): Promise<any[]> {
    return await this.slackIntegrationService.getIntegrationByTeam(teamId);
  }

  /**
   * Send message to Slack
   */
  @Post('send-message')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send message to Slack channel' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid message data' })
  async sendMessage(@Body() dto: SlackMessageDto): Promise<any> {
    if (!dto.channel || !dto.text) {
      throw new Error('Channel and text are required');
    }
    const message: SlackMessage = {
      channel: dto.channel,
      text: dto.text,
    };
    if (dto.blocks !== undefined) {
      message.blocks = dto.blocks;
    }
    if (dto.threadTs !== undefined) {
      message.threadTs = dto.threadTs;
    }
    if (dto.replyBroadcast !== undefined) {
      message.replyBroadcast = dto.replyBroadcast;
    }
    return await this.slackApiService.sendMessage(message);
  }

  /**
   * Send notification
   */
  @Post('send-notification')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send notification to Slack' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  async sendNotification(@Body() dto: SlackNotificationDto): Promise<any> {
    if (!dto.message) {
      throw new Error('Message is required');
    }
    return await this.slackIntegrationService.sendNotification(
      'current-user-id',
      dto.message,
      dto.channel
    );
  }

  /**
   * Send formatted notification with blocks
   */
  @Post('send-formatted-notification')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send formatted notification with blocks' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  async sendFormattedNotification(@Body() dto: SlackFormattedNotificationDto): Promise<any> {
    if (!dto.blocks) {
      throw new Error('Blocks are required');
    }
    return await this.slackIntegrationService.sendFormattedNotification(
      'current-user-id',
      dto.blocks,
      dto.channel
    );
  }

  /**
   * Handle Slack events
   */
  @Post('events')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Slack events' })
  @ApiResponse({ status: 200, description: 'Event handled' })
  async handleEvents(
    @Body() payload: SlackEventPayload
  ): Promise<{ challenge?: string; ok?: boolean }> {
    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      const challenge = payload.challenge;
      if (!challenge) {
        throw new Error('Challenge is required for URL verification');
      }
      return await this.slackEventsService.handleUrlVerification(challenge);
    }

    // Handle events
    if (payload.type === 'event_callback') {
      await this.slackEventsService.handleEvent(payload);
    }

    return { ok: true };
  }

  /**
   * Send workflow event notification
   */
  @Post('notify-workflow')
  @HttpCode(200)
  @ApiOperation({ summary: 'Notify Slack about workflow event' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  async notifyWorkflowEvent(@Body() dto: SlackWorkflowNotificationDto): Promise<void> {
    const data = dto.data;
    if (!data) {
      throw new Error('Data is required for workflow event notification');
    }
    if (!dto.workflowId || !dto.eventType) {
      throw new Error('Workflow ID and event type are required');
    }
    return await this.slackIntegrationService.notifyWorkflowEvent(
      'current-user-id',
      dto.workflowId,
      dto.eventType,
      data
    );
  }

  /**
   * Send pipeline execution notification
   */
  @Post('notify-pipeline')
  @HttpCode(200)
  @ApiOperation({ summary: 'Notify Slack about pipeline execution' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  async notifyPipelineExecution(@Body() dto: SlackPipelineNotificationDto): Promise<void> {
    if (!dto.pipelineId || !dto.status) {
      throw new Error('Pipeline ID and status are required');
    }
    return await this.slackIntegrationService.notifyPipelineExecution(
      'current-user-id',
      dto.pipelineId,
      dto.status,
      dto.duration,
      dto.error
    );
  }

  /**
   * Get integration statistics
   */
  @Get('stats')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Slack integration statistics' })
  @ApiResponse({ status: 200, description: 'Integration statistics' })
  async getStats(): Promise<any> {
    return await this.slackIntegrationService.getIntegrationStats('current-user-id');
  }

  /**
   * Deactivate integration
   */
  @Delete('integration/:integrationId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate Slack integration' })
  @ApiResponse({ status: 200, description: 'Integration deactivated' })
  async deactivateIntegration(@Param('integrationId') integrationId: string): Promise<any> {
    await this.slackIntegrationService.deactivateIntegration(integrationId);
    return { message: 'Integration deactivated successfully' };
  }

  /**
   * Get channels
   */
  @Get('channels')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get available Slack channels' })
  @ApiResponse({ status: 200, description: 'List of channels' })
  async getChannels(): Promise<any[]> {
    return await this.slackApiService.listChannels();
  }
}
