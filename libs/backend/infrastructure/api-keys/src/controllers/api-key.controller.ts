import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtGuard } from '@workix/domain/auth';

import { GenerateApiKeyDto, UpdateApiKeyDto, User } from '../interfaces/api-key-dto.interface';
import { ApiKeyService } from '../services/api-key.service';

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Generate new API key' })
  async generateApiKey(@CurrentUser() user: User, @Body() dto: GenerateApiKeyDto) {
    return this.apiKeyService.generateApiKey(
      user.userId,
      dto.name,
      dto.permissions,
      dto.expiresInDays
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all API keys for current user' })
  async getUserApiKeys(@CurrentUser() user: User) {
    return this.apiKeyService.getUserApiKeys(user.userId);
  }

  @Get(':keyId/usage')
  @ApiOperation({ summary: 'Get API key usage history' })
  async getApiKeyUsage(@Param('keyId') keyId: string, @Query('limit') limit = 100) {
    return this.apiKeyService.getApiKeyUsage(keyId, limit);
  }

  @Get(':keyId/stats')
  @ApiOperation({ summary: 'Get API key usage statistics' })
  async getUsageStatistics(@Param('keyId') keyId: string) {
    return this.apiKeyService.getUsageStatistics(keyId);
  }

  @Put(':keyId')
  @ApiOperation({ summary: 'Update API key' })
  async updateApiKey(@Param('keyId') keyId: string, @Body() updates: UpdateApiKeyDto) {
    return this.apiKeyService.updateApiKey(keyId, updates);
  }

  @Post(':keyId/rotate')
  @ApiOperation({ summary: 'Rotate API key' })
  async rotateApiKey(@Param('keyId') keyId: string) {
    return this.apiKeyService.rotateApiKey(keyId);
  }

  @Delete(':keyId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete API key' })
  async deleteApiKey(@Param('keyId') keyId: string) {
    return this.apiKeyService.deleteApiKey(keyId);
  }

  @Post(':keyId/revoke')
  @ApiOperation({ summary: 'Revoke API key' })
  async revokeApiKey(@Param('keyId') keyId: string) {
    await this.apiKeyService.revokeApiKey(keyId);
    return { message: 'API key revoked' };
  }
}
