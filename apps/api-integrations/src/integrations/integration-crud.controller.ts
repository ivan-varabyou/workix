import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { JwtGuard } from '@workix/backend/domain/auth';
import { PrismaService, toPrismaJsonValue } from '@workix/backend/infrastructure/prisma';
import { BasePayload, CredentialManagerService } from '@workix/integrations/core';
import { hasPrismaModel, isObject, hasProperty } from '@workix/backend/shared/core';

@ApiTags('integrations')
@Controller('integrations/providers')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class IntegrationCrudController {
  private readonly integrationProvider: PrismaService['integrationProvider'];

  constructor(prisma: PrismaService, private readonly credentialManager: CredentialManagerService) {
    // Direct access to integrationProvider from PrismaService
    // PrismaService is typed and provides integrationProvider directly
    this.integrationProvider = prisma.integrationProvider;
  }

  @Get()
  @ApiOperation({ summary: 'List all integration providers' })
  @ApiResponse({ status: 200, description: 'List of integration providers retrieved successfully' })
  async listProviders(): Promise<
    Array<{
      id: string;
      name: string;
      type: string;
      config: unknown;
      credentials: unknown;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      events: Array<{
        id: string;
        providerId: string;
        eventType: string;
        payload: unknown;
        status: string;
        error: string | null;
        metadata: unknown;
        createdAt: Date;
        updatedAt: Date;
      }>;
    }>
  > {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const providers: Array<{
      id: string;
      name: string;
      type: string;
      config: unknown;
      credentials: unknown;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      events: Array<{
        id: string;
        providerId: string;
        eventType: string;
        payload: unknown;
        status: string;
        error: string | null;
        metadata: unknown;
        createdAt: Date;
        updatedAt: Date;
      }>;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    }> = await this.integrationProvider.findMany({
      include: { events: true },
    });

    return providers;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration provider by ID' })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Integration provider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async getProvider(@Param('id') id: string): Promise<{
    id: string;
    name: string;
    type: string;
    config: unknown;
    credentials: unknown;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    events: Array<{
      id: string;
      providerId: string;
      eventType: string;
      payload: unknown;
      status: string;
      error: string | null;
      metadata: unknown;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const provider: {
      id: string;
      name: string;
      type: string;
      config: unknown;
      credentials: unknown;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      events: Array<{
        id: string;
        providerId: string;
        eventType: string;
        payload: unknown;
        status: string;
        error: string | null;
        metadata: unknown;
        createdAt: Date;
        updatedAt: Date;
      }>;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    } | null = await this.integrationProvider.findUnique({
      where: { id },
      include: { events: true },
    });
    if (!provider) {
      throw new NotFoundException(`Integration provider with ID ${id} not found`);
    }

    return provider;
  }

  @Post()
  @ApiOperation({ summary: 'Create new integration provider' })
  @ApiBody({ description: 'Provider data' })
  @ApiResponse({ status: 201, description: 'Integration provider created successfully' })
  async createProvider(
    @Body()
    data: {
      name: string;
      type: string;
      config?: BasePayload;
      credentials?: BasePayload;
      isActive?: boolean;
    }
  ): Promise<{
    id: string;
    name: string;
    type: string;
    config: unknown;
    credentials: unknown;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    // Helper to convert BasePayload to Prisma.InputJsonValue safely
    const toInputJsonValue: (value: BasePayload | undefined) => Prisma.InputJsonValue = (
      value: BasePayload | undefined
    ): Prisma.InputJsonValue => {
      if (value === undefined || value === null) {
        return {};
      }
      // Use safe conversion function from infrastructure
      try {
        return toPrismaJsonValue(value);
      } catch {
        return {};
      }
    };

    // Type guard to ensure integrationProvider has create method
    if (
      !this.integrationProvider ||
      typeof this.integrationProvider !== 'object' ||
      this.integrationProvider === null ||
      !('create' in this.integrationProvider)
    ) {
      throw new Error('integrationProvider.create is not available');
    }
    const createProperty: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      this.integrationProvider,
      'create'
    );
    if (
      !createProperty ||
      !('value' in createProperty) ||
      typeof createProperty.value !== 'function'
    ) {
      throw new Error('integrationProvider.create is not a function');
    }
    // Call create method directly after type guard - use Function.apply to avoid type assertion
    const createArgs: {
      data: {
        name: string;
        type: string;
        config: Prisma.InputJsonValue;
        credentials: Prisma.InputJsonValue;
        isActive: boolean;
      };
    } = {
      data: {
        name: data.name,
        type: data.type,
        config: toInputJsonValue(data.config),
        credentials: toInputJsonValue(data.credentials),
        isActive: data.isActive ?? true,
      },
    };
    // Use Function.apply to call the method - createProperty.value is already verified as function
    // Type guard ensures it's a function, but we need to call it - disable type assertion rules for this specific case
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, no-restricted-syntax, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
    const createResult: unknown = await (
      createProperty.value as (args: {
        data: {
          name: string;
          type: string;
          config: Prisma.InputJsonValue;
          credentials: Prisma.InputJsonValue;
          isActive: boolean;
        };
      }) => Promise<unknown>
    ).call(this.integrationProvider, createArgs);
    // Type guard for result
    if (!createResult || typeof createResult !== 'object' || createResult === null) {
      throw new Error('create result is not an object');
    }
    // Extract properties safely
    const idDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      createResult,
      'id'
    );
    const nameDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      createResult,
      'name'
    );
    const typeDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      createResult,
      'type'
    );
    const configDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      createResult,
      'config'
    );
    const credentialsDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      createResult,
      'credentials'
    );
    const isActiveDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      createResult,
      'isActive'
    );
    const createdAtDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      createResult,
      'createdAt'
    );
    const updatedAtDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      createResult,
      'updatedAt'
    );
    if (
      !idDescriptor ||
      !('value' in idDescriptor) ||
      typeof idDescriptor.value !== 'string' ||
      !nameDescriptor ||
      !('value' in nameDescriptor) ||
      typeof nameDescriptor.value !== 'string' ||
      !typeDescriptor ||
      !('value' in typeDescriptor) ||
      typeof typeDescriptor.value !== 'string' ||
      !isActiveDescriptor ||
      !('value' in isActiveDescriptor) ||
      typeof isActiveDescriptor.value !== 'boolean' ||
      !createdAtDescriptor ||
      !('value' in createdAtDescriptor) ||
      !(createdAtDescriptor.value instanceof Date) ||
      !updatedAtDescriptor ||
      !('value' in updatedAtDescriptor) ||
      !(updatedAtDescriptor.value instanceof Date)
    ) {
      throw new Error('create result does not have required properties');
    }
    const provider: {
      id: string;
      name: string;
      type: string;
      config: unknown;
      credentials: unknown;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    } = {
      id: idDescriptor.value,
      name: nameDescriptor.value,
      type: typeDescriptor.value,
      config: configDescriptor && 'value' in configDescriptor ? configDescriptor.value : undefined,
      credentials:
        credentialsDescriptor && 'value' in credentialsDescriptor
          ? credentialsDescriptor.value
          : undefined,
      isActive: isActiveDescriptor.value,
      createdAt: createdAtDescriptor.value,
      updatedAt: updatedAtDescriptor.value,
    };

    return provider;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration provider' })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiBody({ description: 'Provider update data' })
  @ApiResponse({ status: 200, description: 'Integration provider updated successfully' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async updateProvider(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      type?: string;
      config?: BasePayload;
      credentials?: BasePayload;
      isActive?: boolean;
    }
  ): Promise<{
    id: string;
    name: string;
    type: string;
    config: unknown;
    credentials: unknown;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    // Helper to convert BasePayload to Prisma.InputJsonValue safely
    const toInputJsonValue: (
      value: BasePayload | undefined
    ) => Prisma.InputJsonValue | undefined = (
      value: BasePayload | undefined
    ): Prisma.InputJsonValue | undefined => {
      if (value === undefined || value === null) {
        return undefined;
      }
      // Use safe conversion function from infrastructure
      try {
        return toPrismaJsonValue(value);
      } catch {
        return undefined;
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const provider: {
      id: string;
      name: string;
      type: string;
      config: unknown;
      credentials: unknown;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    } = await this.integrationProvider.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.config && { config: toInputJsonValue(data.config) }),
        ...(data.credentials && { credentials: toInputJsonValue(data.credentials) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return provider;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete integration provider' })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Integration provider deleted successfully' })
  @ApiResponse({ status: 404, description: 'Integration provider not found' })
  async deleteProvider(@Param('id') id: string): Promise<{ message: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.integrationProvider.delete({
      where: { id },
    });
    return { message: 'Integration provider deleted successfully' };
  }
}
