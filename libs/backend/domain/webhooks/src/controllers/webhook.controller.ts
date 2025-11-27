import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtGuard } from '@workix/backend/domain/auth';

import { CurrentUser as CurrentUserType } from '../interfaces/user.interface';
import { CreateWebhookDto, UpdateWebhookDto } from '../interfaces/webhook-dto.interface';
import { WebhookService } from '../services/webhook.service';

@ApiTags('webhooks')
@Controller('webhooks')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new webhook' })
  async createWebhook(@CurrentUser() user: CurrentUserType, @Body() dto: CreateWebhookDto) {
    return this.webhookService.createWebhook(user.userId, dto.url, dto.events);
  }

  @Get()
  @ApiOperation({ summary: 'Get all webhooks for current user' })
  async getWebhooks(@CurrentUser() user: CurrentUserType) {
    return this.webhookService.getUserWebhooks(user.userId);
  }

  @Get(':webhookId')
  @ApiOperation({ summary: 'Get webhook events' })
  async getWebhookEvents(@Param('webhookId') webhookId: string) {
    return this.webhookService.getWebhookEvents(webhookId);
  }

  @Put(':webhookId')
  @ApiOperation({ summary: 'Update webhook' })
  async updateWebhook(@Param('webhookId') webhookId: string, @Body() updates: UpdateWebhookDto) {
    return this.webhookService.updateWebhook(webhookId, updates);
  }

  @Delete(':webhookId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete webhook' })
  async deleteWebhook(@Param('webhookId') webhookId: string) {
    return this.webhookService.deleteWebhook(webhookId);
  }

  @Post(':webhookId/test')
  @ApiOperation({ summary: 'Test webhook delivery' })
  async testWebhook(@Param('webhookId') webhookId: string) {
    const success = await this.webhookService.testWebhook(webhookId);
    return { success, message: success ? 'Webhook test successful' : 'Webhook test failed' };
  }

  @Post('events/:eventId/retry')
  @ApiOperation({ summary: 'Retry failed webhook event' })
  async retryEvent(@Param('eventId') eventId: string) {
    await this.webhookService.retryEvent(eventId);
    return { message: 'Event retry queued' };
  }
}
