import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { JwtGuard } from '@workix/domain/auth';
import { PrismaService } from '@workix/infrastructure/prisma';
import {
  BasePayload,
  Credential,
  CredentialManagerService,
  CredentialRotationResult,
} from '@workix/integrations/core';

import {
  AddCredentialDto,
  CreateProviderDto,
  ProviderWithCredentialsFromManager,
  SetConfigDto,
  UpdateCredentialDto,
  UpdateProviderDto,
} from './interfaces/integration-crud.interface';
import {
  CredentialRotationResponse,
  IntegrationProviderResponse,
  IntegrationProviderWithEventsResponse,
} from './interfaces/integration-crud-response.interface';
import {
  isValidEventStatus,
  PrismaIntegrationEventInProvider,
  PrismaIntegrationProvider,
  PrismaIntegrationProviderWithEvents,
} from './interfaces/prisma-integration.interface';
import { basePayloadToJsonValue, jsonValueToBasePayload } from './utils/type-mappers';

@ApiTags('integrations')
@Controller('integrations/providers')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class IntegrationCrudController {
  private readonly integrationProvider: PrismaService['integrationProvider'];

  constructor(prisma: PrismaService, private credentialManager: CredentialManagerService) {
    if (!prisma.integrationProvider) {
      throw new Error('PrismaService does not have integrationProvider');
    }
    this.integrationProvider = prisma.integrationProvider;
  }

  @Get()
  @ApiOperation({ summary: 'List all integration providers' })
  @ApiResponse({ status: 200, description: 'List of integration providers retrieved successfully' })
  async listProviders(): Promise<IntegrationProviderWithEventsResponse[]> {
    const providers: PrismaIntegrationProviderWithEvents[] = await this.integrationProvider.findMany({
      include: { events: true },
    });
    // Преобразуем Prisma типы в наши интерфейсы
    return providers.map((provider: PrismaIntegrationProviderWithEvents): IntegrationProviderWithEventsResponse => ({
      id: provider.id,
      name: provider.name,
      type: provider.type,
      config: jsonValueToBasePayload(provider.config),
      credentials: jsonValueToBasePayload(provider.credentials),
      isActive: provider.isActive,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
      events: provider.events.map((event: PrismaIntegrationEventInProvider) => {
        if (!isValidEventStatus(event.status)) {
          throw new Error(`Invalid event status: ${event.status}`);
        }
        return {
          id: event.id,
          providerId: event.providerId,
          eventType: event.eventType,
          status: event.status,
          error: event.error,
          metadata: jsonValueToBasePayload(event.metadata),
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        };
      }),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration provider by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Integration provider ID' })
  @ApiResponse({ status: 200, description: 'Integration provider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async getProvider(@Param('id') id: string): Promise<IntegrationProviderWithEventsResponse | null> {
    const provider: PrismaIntegrationProviderWithEvents | null = await this.integrationProvider.findUnique({
      where: { id },
      include: { events: true },
    });
    if (!provider) {
      return null;
    }
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      config: jsonValueToBasePayload(provider.config),
      credentials: jsonValueToBasePayload(provider.credentials),
      isActive: provider.isActive,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
      events: provider.events.map((event: PrismaIntegrationEventInProvider) => {
        if (!isValidEventStatus(event.status)) {
          throw new Error(`Invalid event status: ${event.status}`);
        }
        return {
          id: event.id,
          providerId: event.providerId,
          eventType: event.eventType,
          status: event.status,
          error: event.error,
          metadata: jsonValueToBasePayload(event.metadata),
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        };
      }),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new integration provider' })
  @ApiBody({ type: Object, description: 'Integration provider data' })
  @ApiResponse({ status: 201, description: 'Integration provider created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createProvider(@Body() data: CreateProviderDto): Promise<IntegrationProviderResponse> {
    const createData: {
      name: string;
      type: string;
      config: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
      credentials: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
      isActive: boolean;
    } = {
      name: data.name,
      type: data.type || 'unknown',
      config: basePayloadToJsonValue(data.config || {}) ?? Prisma.DbNull,
      credentials: basePayloadToJsonValue(data.credentials || {}) ?? Prisma.DbNull,
      isActive: data.isActive !== undefined ? data.isActive : true,
    };
    const provider: PrismaIntegrationProvider = await this.integrationProvider.create({
      data: createData,
    });
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      config: jsonValueToBasePayload(provider.config),
      credentials: jsonValueToBasePayload(provider.credentials),
      isActive: provider.isActive,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration provider' })
  @ApiParam({ name: 'id', type: 'string', description: 'Integration provider ID' })
  @ApiBody({ type: Object, description: 'Integration provider update data' })
  @ApiResponse({ status: 200, description: 'Integration provider updated successfully' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async updateProvider(
    @Param('id') id: string,
    @Body() data: UpdateProviderDto
  ): Promise<IntegrationProviderResponse> {
    const updateData: {
      name?: string;
      type?: string;
      config?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
      credentials?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
      isActive?: boolean;
    } = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.type !== undefined) {
      updateData.type = data.type;
    }
    if (data.config !== undefined) {
      updateData.config = basePayloadToJsonValue(data.config) ?? Prisma.DbNull;
    }
    if (data.credentials !== undefined) {
      updateData.credentials = basePayloadToJsonValue(data.credentials) ?? Prisma.DbNull;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    const provider: PrismaIntegrationProvider = await this.integrationProvider.update({
      where: { id },
      data: updateData,
    });
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      config: jsonValueToBasePayload(provider.config),
      credentials: jsonValueToBasePayload(provider.credentials),
      isActive: provider.isActive,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete integration provider' })
  @ApiParam({ name: 'id', type: 'string', description: 'Integration provider ID' })
  @ApiResponse({ status: 200, description: 'Integration provider deleted successfully' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async deleteProvider(@Param('id') id: string): Promise<IntegrationProviderResponse> {
    const provider: PrismaIntegrationProvider = await this.integrationProvider.delete({ where: { id } });
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      config: jsonValueToBasePayload(provider.config),
      credentials: jsonValueToBasePayload(provider.credentials),
      isActive: provider.isActive,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }

  @Post(':id/credentials')
  @ApiOperation({ summary: 'Add credential to integration provider' })
  @ApiParam({ name: 'id', type: 'string', description: 'Integration provider ID' })
  @ApiBody({ type: Object, description: 'Credential data' })
  @ApiResponse({ status: 201, description: 'Credential added successfully' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async addCredential(
    @Param('id') providerId: string,
    @Body() data: AddCredentialDto
  ): Promise<IntegrationProviderResponse> {
    const provider: ProviderWithCredentialsFromManager = await this.credentialManager.createCredential(
      providerId,
      data.type,
      data.data,
      data.userId,
      data.expiresAt ? new Date(data.expiresAt) : undefined
    );
    const config: BasePayload | null = jsonValueToBasePayload(provider.config);
    const credentials: BasePayload | null = jsonValueToBasePayload(provider.credentials);
    const createdAt: Date = provider.createdAt || new Date();
    const updatedAt: Date = provider.updatedAt || new Date();
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      config,
      credentials,
      isActive: provider.isActive,
      createdAt,
      updatedAt,
    };
  }

  @Get(':id/credentials')
  @ApiOperation({ summary: 'List credentials for integration provider' })
  @ApiParam({ name: 'id', type: 'string', description: 'Integration provider ID' })
  @ApiQuery({ name: 'userId', required: false, type: 'string', description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'List of credentials retrieved successfully' })
  async listCredentials(
    @Param('id') providerId: string,
    @Query('userId') userId?: string
  ): Promise<Credential[]> {
    return this.credentialManager.getCredentials(providerId, userId);
  }

  @Get('credentials/:credentialId')
  @ApiOperation({ summary: 'Get credential by ID' })
  @ApiParam({ name: 'credentialId', type: 'string', description: 'Credential ID' })
  @ApiResponse({ status: 200, description: 'Credential retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async getCredential(@Param('credentialId') credentialId: string): Promise<Credential | null> {
    return this.credentialManager.getCredential(credentialId);
  }

  @Put('credentials/:credentialId')
  @ApiOperation({ summary: 'Update credential' })
  @ApiParam({ name: 'credentialId', type: 'string', description: 'Credential ID' })
  @ApiBody({ type: Object, description: 'Credential update data' })
  @ApiResponse({ status: 200, description: 'Credential updated successfully' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async updateCredential(
    @Param('credentialId') credentialId: string,
    @Body() data: UpdateCredentialDto
  ): Promise<IntegrationProviderResponse> {
    const provider: ProviderWithCredentialsFromManager = await this.credentialManager.updateCredential(
      credentialId,
      data.data,
      data.expiresAt ? new Date(data.expiresAt) : undefined
    );
    const config: BasePayload | null = jsonValueToBasePayload(provider.config);
    const credentials: BasePayload | null = jsonValueToBasePayload(provider.credentials);
    const createdAt: Date = provider.createdAt || new Date();
    const updatedAt: Date = provider.updatedAt || new Date();
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      config,
      credentials,
      isActive: provider.isActive,
      createdAt,
      updatedAt,
    };
  }

  @Delete('credentials/:credentialId')
  @ApiOperation({ summary: 'Delete credential' })
  @ApiParam({ name: 'credentialId', type: 'string', description: 'Credential ID' })
  @ApiResponse({ status: 200, description: 'Credential deleted successfully' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async deleteCredential(@Param('credentialId') credentialId: string): Promise<IntegrationProviderResponse> {
    const provider: ProviderWithCredentialsFromManager = await this.credentialManager.deleteCredential(credentialId);
    const config: BasePayload | null = jsonValueToBasePayload(provider.config);
    const credentials: BasePayload | null = jsonValueToBasePayload(provider.credentials);
    const createdAt: Date = provider.createdAt || new Date();
    const updatedAt: Date = provider.updatedAt || new Date();
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      config,
      credentials,
      isActive: provider.isActive,
      createdAt,
      updatedAt,
    };
  }

  @Post(':id/credentials/rotate')
  @ApiOperation({ summary: 'Rotate all credentials for integration provider' })
  @ApiParam({ name: 'id', type: 'string', description: 'Integration provider ID' })
  @ApiResponse({ status: 200, description: 'Credentials rotation completed' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async rotateCredentials(@Param('id') providerId: string): Promise<CredentialRotationResponse> {
    const results: CredentialRotationResult[] = await this.credentialManager.rotateCredentials(providerId);
    const rotatedCount: number = results.filter((r: CredentialRotationResult): boolean => r.status === 'rotated').length;
    const failedCount: number = results.filter((r: CredentialRotationResult): boolean => r.status === 'failed').length;
    return {
      providerId,
      total: results.length,
      rotated: rotatedCount,
      failed: failedCount,
      results,
    };
  }

  @Post(':id/config')
  @ApiOperation({ summary: 'Set configuration key for integration provider' })
  @ApiParam({ name: 'id', type: 'string', description: 'Integration provider ID' })
  @ApiBody({ type: Object, description: 'Configuration data' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async setConfig(@Param('id') providerId: string, @Body() data: SetConfigDto): Promise<IntegrationProviderResponse> {
    const provider: PrismaIntegrationProvider | null = await this.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Integration provider with ID ${providerId} not found`);
    }

    const config: BasePayload = jsonValueToBasePayload(provider.config) || {};
    config[data.key] = data.value;

    const configValue: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined = basePayloadToJsonValue(config);
    const updateData: {
      config: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    } = {
      config: configValue ?? Prisma.DbNull,
    };
    const updatedProvider: PrismaIntegrationProvider = await this.integrationProvider.update({
      where: { id: providerId },
      data: updateData,
    });
    return {
      id: updatedProvider.id,
      name: updatedProvider.name,
      type: updatedProvider.type,
      config: jsonValueToBasePayload(updatedProvider.config),
      credentials: jsonValueToBasePayload(updatedProvider.credentials),
      isActive: updatedProvider.isActive,
      createdAt: updatedProvider.createdAt,
      updatedAt: updatedProvider.updatedAt,
    };
  }

  @Get(':id/config')
  @ApiOperation({ summary: 'Get all configuration for integration provider' })
  @ApiParam({ name: 'id', type: 'string', description: 'Integration provider ID' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async listConfigs(@Param('id') providerId: string): Promise<BasePayload> {
    const provider: PrismaIntegrationProvider | null = await this.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Integration provider with ID ${providerId} not found`);
    }

    return jsonValueToBasePayload(provider.config) || {};
  }
}
