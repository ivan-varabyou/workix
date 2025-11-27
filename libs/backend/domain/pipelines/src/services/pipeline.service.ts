import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';
import { BasePayload } from '@workix/integrations/core';

import { CreatePipelineDto } from '../dtos/create-pipeline.dto';
import { UpdatePipelineDto } from '../dtos/update-pipeline.dto';
import { Pipeline, PipelinePrismaService } from '../interfaces/pipeline-execution.interface';

/**
 * PipelineService
 * Manages pipeline CRUD operations
 * Uses PrismaService injected from the service that uses this library
 */
@Injectable()
export class PipelineService {
  // private readonly _logger = new Logger(PipelineService.name); // Reserved for future use
  private readonly prisma: PipelinePrismaService;

  constructor(
    @Optional() @Inject('PrismaService') prisma?: PipelinePrismaService,
    private readonly i18n?: I18nService
  ) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Use PipelinesModule.forRoot(prismaService)');
    }
    this.prisma = prisma;
  }

  /**
   * Create a new pipeline
   */
  async create(userId: string, dto: CreatePipelineDto): Promise<Pipeline> {
    if (!dto.name) {
      throw new Error('Pipeline name is required');
    }
    const createData: {
      userId: string;
      name: string;
      version: number;
      isPublic: boolean;
      isActive: boolean;
      isTemplate: boolean;
      executionCount: number;
      tags: string[];
      description?: string;
      config?: BasePayload;
      category?: string;
    } = {
      userId,
      name: dto.name,
      version: 1,
      isPublic: dto.isPublic ?? false,
      isActive: true,
      isTemplate: dto.isTemplate ?? false,
      executionCount: 0,
      tags: dto.tags || [],
    };
    if (dto.description !== undefined && dto.description !== null && dto.description !== '') {
      createData.description = dto.description;
    }
    if (dto.config !== undefined && dto.config !== null) {
      createData.config = dto.config as unknown as BasePayload;
    }
    if (dto.category !== undefined && dto.category !== null && dto.category !== '') {
      createData.category = dto.category;
    }
    const pipeline = await this.prisma.pipeline.create({
      data: createData,
    });

    return pipeline;
  }

  /**
   * Get user's pipelines (with filtering)
   */
  async findUserPipelines(
    userId: string,
    options: {
      isActive?: boolean;
      category?: string;
      isTemplate?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<[Pipeline[], number]> {
    const where: Record<string, unknown> = {
      userId,
      deletedAt: null,
    };

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options.category) {
      where.category = options.category;
    }

    if (options.isTemplate !== undefined) {
      where.isTemplate = options.isTemplate;
    }

    const findManyArgs: {
      where: Record<string, unknown>;
      orderBy: { createdAt: string };
      take?: number;
      skip?: number;
    } = {
      where,
      orderBy: { createdAt: 'desc' },
    };
    if (options.limit !== undefined) {
      findManyArgs.take = options.limit;
    }
    if (options.offset !== undefined) {
      findManyArgs.skip = options.offset;
    }
    const [pipelines, total] = await Promise.all([
      this.prisma.pipeline.findMany(findManyArgs),
      this.prisma.pipeline.count({ where }),
    ]);

    return [pipelines, total];
  }

  /**
   * Get all public pipelines (marketplace)
   */
  async findPublic(
    options: {
      category?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<[Pipeline[], number]> {
    const where: Record<string, unknown> = {
      isPublic: true,
      isActive: true,
      deletedAt: null,
    };

    if (options.category) {
      where.category = options.category;
    }

    if (options.tags && options.tags.length > 0) {
      where.tags = { hasSome: options.tags };
    }

    const findManyArgs: {
      where: Record<string, unknown>;
      orderBy: { createdAt: string };
      take?: number;
      skip?: number;
    } = {
      where,
      orderBy: { createdAt: 'desc' },
    };
    if (options.limit !== undefined) {
      findManyArgs.take = options.limit;
    }
    if (options.offset !== undefined) {
      findManyArgs.skip = options.offset;
    }
    const [pipelines, total] = await Promise.all([
      this.prisma.pipeline.findMany(findManyArgs),
      this.prisma.pipeline.count({ where }),
    ]);

    return [pipelines, total];
  }

  /**
   * Get pipeline by ID
   */
  async findById(pipelineId: string): Promise<Pipeline> {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, deletedAt: null },
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline with ID "${pipelineId}" not found`);
    }

    return pipeline;
  }

  /**
   * Get pipeline by ID with access check
   */
  async findByIdWithAccess(pipelineId: string, userId: string): Promise<Pipeline> {
    const pipeline = await this.findById(pipelineId);

    if (pipeline.userId !== userId && !pipeline.isPublic) {
      throw new ForbiddenException(
        this.i18n?.translate('pipelines.no_access') || 'You do not have access to this pipeline'
      );
    }

    return pipeline;
  }

  /**
   * Update pipeline
   */
  async update(pipelineId: string, userId: string, dto: UpdatePipelineDto): Promise<Pipeline> {
    const pipeline: Pipeline = await this.findById(pipelineId);

    if (pipeline.userId !== userId) {
      throw new ForbiddenException(
        this.i18n?.translate('pipelines.can_only_update_own') ||
          'You can only update your own pipelines'
      );
    }

    const updateData: {
      name?: string;
      description?: string;
      config?: BasePayload;
      tags?: string[];
      category?: string;
      version?: number;
      isPublic?: boolean;
      isActive?: boolean;
      isTemplate?: boolean;
    } = {};
    if (dto.name !== undefined && dto.name !== null && dto.name !== '') {
      updateData.name = dto.name;
    }
    if (dto.description !== undefined && dto.description !== null) {
      updateData.description = dto.description;
    }
    if (dto.config !== undefined && dto.config !== null) {
      updateData.config = dto.config as unknown as BasePayload;
    }
    if (dto.tags !== undefined) {
      updateData.tags = dto.tags;
    }
    if (dto.category !== undefined && dto.category !== null && dto.category !== '') {
      updateData.category = dto.category;
    }
    if (dto.isPublic !== undefined) {
      updateData.isPublic = dto.isPublic;
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }
    if (dto.isTemplate !== undefined) {
      updateData.isTemplate = dto.isTemplate;
    }
    if (dto.config !== undefined && dto.config !== null) {
      updateData.config = dto.config as unknown as BasePayload;
      updateData.version = pipeline.version + 1;
    }

    return await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: updateData,
    });
  }

  /**
   * Soft delete pipeline
   */
  async delete(pipelineId: string, userId: string): Promise<void> {
    const pipeline = await this.findById(pipelineId);

    if (pipeline.userId !== userId) {
      throw new ForbiddenException(
        this.i18n?.translate('pipelines.can_only_delete_own') ||
          'You can only delete your own pipelines'
      );
    }

    await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Permanently delete pipeline
   */
  async hardDelete(pipelineId: string, userId: string): Promise<void> {
    const pipeline = await this.findById(pipelineId);

    if (pipeline.userId !== userId) {
      throw new ForbiddenException(
        this.i18n?.translate('pipelines.can_only_delete_own') ||
          'You can only delete your own pipelines'
      );
    }

    await this.prisma.pipeline.delete({
      where: { id: pipelineId },
    });
  }

  /**
   * Publish pipeline to marketplace
   */
  async publish(pipelineId: string, userId: string): Promise<Pipeline> {
    const pipeline = await this.findById(pipelineId);

    if (pipeline.userId !== userId) {
      throw new ForbiddenException(
        this.i18n?.translate('pipelines.can_only_publish_own') ||
          'You can only publish your own pipelines'
      );
    }

    return await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: { isPublic: true },
    });
  }

  /**
   * Unpublish pipeline from marketplace
   */
  async unpublish(pipelineId: string, userId: string): Promise<Pipeline> {
    const pipeline = await this.findById(pipelineId);

    if (pipeline.userId !== userId) {
      throw new ForbiddenException(
        this.i18n?.translate('pipelines.can_only_manage_own') ||
          'You can only manage your own pipelines'
      );
    }

    return await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: { isPublic: false },
    });
  }

  /**
   * Record pipeline execution
   */
  async recordExecution(pipelineId: string): Promise<void> {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (pipeline) {
      await this.prisma.pipeline.update({
        where: { id: pipelineId },
        data: {
          executionCount: pipeline.executionCount + 1,
          lastExecutedAt: new Date(),
        },
      });
    }
  }

  /**
   * Get pipeline templates
   */
  async findTemplates(
    options: {
      category?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<[Pipeline[], number]> {
    const where: Record<string, unknown> = {
      isTemplate: true,
      isActive: true,
    };

    if (options.category) {
      where.category = options.category;
    }

    const findManyArgs: {
      where: Record<string, unknown>;
      orderBy: Array<{ executionCount: string } | { createdAt: string }>;
      take?: number;
      skip?: number;
    } = {
      where,
      orderBy: [{ executionCount: 'desc' }, { createdAt: 'desc' }],
    };
    if (options.limit !== undefined) {
      findManyArgs.take = options.limit;
    }
    if (options.offset !== undefined) {
      findManyArgs.skip = options.offset;
    }
    const [pipelines, total] = await Promise.all([
      this.prisma.pipeline.findMany(findManyArgs),
      this.prisma.pipeline.count({ where }),
    ]);

    return [pipelines, total];
  }

  /**
   * Clone template as new pipeline
   */
  async cloneTemplate(templateId: string, userId: string, name: string): Promise<Pipeline> {
    const template: Pipeline = await this.findById(templateId);

    if (!template.isTemplate) {
      throw new ForbiddenException(
        this.i18n?.translate('pipelines.only_templates_can_be_cloned') ||
          'Only templates can be cloned'
      );
    }

    const createData: {
      userId: string;
      name: string;
      version: number;
      isPublic: boolean;
      isActive: boolean;
      isTemplate: boolean;
      executionCount: number;
      tags: string[];
      description?: string;
      config?: BasePayload;
      category?: string;
    } = {
      userId,
      name,
      isTemplate: false,
      isPublic: false,
      version: 1,
      isActive: true,
      executionCount: 0,
      tags: [...(template.tags || [])],
    };
    if (template.description !== undefined && template.description !== null) {
      createData.description = template.description;
    }
    if (template.config !== undefined) {
      createData.config = JSON.parse(JSON.stringify(template.config)) as BasePayload;
    }
    if (template.category !== undefined && template.category !== null) {
      createData.category = template.category;
    }
    const newPipeline = await this.prisma.pipeline.create({
      data: createData,
    });

    return newPipeline;
  }
}
