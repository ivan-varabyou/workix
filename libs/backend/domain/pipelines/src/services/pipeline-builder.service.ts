import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';
import { BasePayload } from '@workix/integrations/core';

import {
  CreatePipelineData,
  CreateStepData,
  PipelineListResponse,
  PipelinePrismaService,
  PipelineStep,
  PipelineWithDetails,
  PipelineWithSteps,
  StepPrismaService,
  UpdatePipelineData,
} from '../interfaces/pipeline-execution.interface';

/**
 * Pipeline Builder Service
 * Handles pipeline creation, editing, and management
 */
@Injectable()
export class PipelineBuilderService {
  private readonly logger = new Logger(PipelineBuilderService.name);
  private readonly prisma: PipelinePrismaService & StepPrismaService;

  constructor(
    @Inject('PrismaService') prisma: PipelinePrismaService & StepPrismaService,
    private readonly i18n: I18nService
  ) {
    this.prisma = prisma;
  }

  /**
   * Create new pipeline
   */
  async createPipeline(userId: string, data: CreatePipelineData): Promise<PipelineWithSteps> {
    if (!data.name || !data.steps) {
      throw new BadRequestException(this.i18n.translate('pipelines.name_and_steps_required'));
    }

    const createData: {
      userId: string;
      name: string;
      version: number;
      isPublic: boolean;
      isActive: boolean;
      isTemplate: boolean;
      executionCount: number;
      status: string;
      steps: {
        create: Array<{
          name: string;
          type: string;
          order: number;
          config: BasePayload;
        }>;
      };
      description?: string;
    } = {
      userId,
      name: data.name,
      version: 1,
      isPublic: false,
      isActive: true,
      isTemplate: false,
      executionCount: 0,
      status: 'draft',
      steps: {
        create: data.steps.map((step: CreateStepData, index: number) => ({
          name: step.name,
          type: step.type,
          order: index,
          config: step.config || {},
        })),
      },
    };
    if (data.description !== undefined && data.description !== null) {
      createData.description = data.description;
    }
    const pipeline: PipelineWithSteps = (await this.prisma.pipeline.create({
      data: createData,
      include: { steps: true },
    })) as PipelineWithSteps;

    this.logger.log(`Pipeline created: ${pipeline.id} for user: ${userId}`);
    return pipeline;
  }

  /**
   * Get pipeline by ID
   */
  async getPipeline(pipelineId: string, userId: string): Promise<PipelineWithDetails> {
    const pipeline: PipelineWithDetails | null = (await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        executions: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    })) as PipelineWithDetails | null;

    if (!pipeline || pipeline.userId !== userId) {
      throw new NotFoundException(this.i18n.translate('pipelines.not_found'));
    }

    return pipeline;
  }

  /**
   * Update pipeline
   */
  async updatePipeline(
    pipelineId: string,
    userId: string,
    data: UpdatePipelineData
  ): Promise<PipelineWithSteps> {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline || pipeline.userId !== userId) {
      throw new NotFoundException(this.i18n.translate('pipelines.not_found'));
    }

    const updateData: {
      name?: string;
      description?: string;
    } = {};
    if (data.name !== undefined && data.name !== null && data.name !== '') {
      updateData.name = data.name;
    } else if (pipeline.name !== undefined) {
      updateData.name = pipeline.name;
    }
    if (data.description !== undefined && data.description !== null) {
      updateData.description = data.description;
    } else if (pipeline.description !== undefined) {
      updateData.description = pipeline.description;
    }
    const updated: PipelineWithSteps = (await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: updateData,
      include: { steps: true },
    })) as PipelineWithSteps;

    this.logger.log(`Pipeline updated: ${pipelineId}`);
    return updated;
  }

  /**
   * Add step to pipeline
   */
  async addStep(
    pipelineId: string,
    userId: string,
    stepData: CreateStepData
  ): Promise<PipelineStep> {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline || pipeline.userId !== userId) {
      throw new NotFoundException(this.i18n.translate('pipelines.not_found'));
    }

    const stepsCount: number = await this.prisma.step.count({
      where: { pipelineId },
    });

    const step: PipelineStep = await this.prisma.step.create({
      data: {
        pipelineId,
        name: stepData.name,
        type: stepData.type,
        order: stepsCount,
        config: stepData.config || {},
      },
    });

    this.logger.log(`Step added to pipeline: ${pipelineId}`);
    return step;
  }

  /**
   * Remove step from pipeline
   */
  async removeStep(pipelineId: string, stepId: string, userId: string): Promise<void> {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline || pipeline.userId !== userId) {
      throw new NotFoundException(this.i18n.translate('pipelines.not_found'));
    }

    await this.prisma.step.delete({
      where: { id: stepId },
    });

    this.logger.log(`Step removed from pipeline: ${pipelineId}`);
  }

  /**
   * Reorder steps
   */
  async reorderSteps(
    pipelineId: string,
    userId: string,
    stepOrder: string[]
  ): Promise<PipelineStep[]> {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline || pipeline.userId !== userId) {
      throw new NotFoundException(this.i18n.translate('pipelines.not_found'));
    }

    const updates: Promise<PipelineStep>[] = stepOrder.map((stepId: string, index: number) =>
      this.prisma.step.update({
        where: { id: stepId },
        data: { order: index },
      })
    );

    await Promise.all(updates);
    this.logger.log(`Steps reordered in pipeline: ${pipelineId}`);

    return await this.prisma.step.findMany({
      where: { pipelineId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Publish pipeline
   */
  async publishPipeline(pipelineId: string, userId: string): Promise<PipelineWithSteps> {
    const pipelineResult = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    const pipeline: PipelineWithSteps | null =
      pipelineResult && 'steps' in pipelineResult ? (pipelineResult as PipelineWithSteps) : null;

    if (!pipeline || pipeline.userId !== userId) {
      throw new NotFoundException(this.i18n.translate('pipelines.not_found'));
    }

    if (pipeline.steps.length === 0) {
      throw new BadRequestException(this.i18n.translate('pipelines.must_have_at_least_one_step'));
    }

    const published: PipelineWithSteps = (await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: { status: 'published', publishedAt: new Date() },
      include: { steps: true },
    })) as PipelineWithSteps;

    this.logger.log(`Pipeline published: ${pipelineId}`);
    return published;
  }

  /**
   * Duplicate pipeline
   */
  async duplicatePipeline(pipelineId: string, userId: string): Promise<PipelineWithSteps> {
    const pipelineResult = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    const pipeline: PipelineWithSteps | null =
      pipelineResult && 'steps' in pipelineResult ? (pipelineResult as PipelineWithSteps) : null;

    if (!pipeline || pipeline.userId !== userId) {
      throw new NotFoundException(this.i18n.translate('pipelines.not_found'));
    }

    const duplicateCreateData: {
      userId: string;
      name: string;
      version: number;
      status: string;
      isPublic: boolean;
      isActive: boolean;
      isTemplate: boolean;
      executionCount: number;
      steps: {
        create: Array<{
          name: string;
          type: string;
          order: number;
          config: BasePayload;
        }>;
      };
      description?: string;
    } = {
      userId,
      name: `${pipeline.name} (Copy)`,
      version: 1,
      status: 'draft',
      isPublic: false,
      isActive: true,
      isTemplate: false,
      executionCount: 0,
      steps: {
        create: pipeline.steps.map((step) => ({
          name: step.name,
          type: step.type,
          order: step.order,
          config: step.config,
        })),
      },
    };
    if (pipeline.description !== undefined && pipeline.description !== null) {
      duplicateCreateData.description = pipeline.description;
    }
    const duplicateResult = await this.prisma.pipeline.create({
      data: duplicateCreateData,
      include: { steps: true },
    });
    const duplicate: PipelineWithSteps =
      duplicateResult && 'steps' in duplicateResult
        ? (duplicateResult as PipelineWithSteps)
        : (duplicateResult as PipelineWithSteps);

    this.logger.log(`Pipeline duplicated: ${pipelineId} -> ${duplicate.id}`);
    return duplicate;
  }

  /**
   * List user pipelines
   */
  async listPipelines(userId: string, skip = 0, take = 10): Promise<PipelineListResponse> {
    const [pipelines, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where: { userId },
        skip,
        take,
        include: { steps: { select: { id: true, name: true, type: true } } },
        orderBy: { createdAt: 'desc' },
      }) as Promise<PipelineWithSteps[]>,
      this.prisma.pipeline.count({ where: { userId } }),
    ]);

    return {
      pipelines,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  /**
   * Delete pipeline
   */
  async deletePipeline(pipelineId: string, userId: string): Promise<void> {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline || pipeline.userId !== userId) {
      throw new NotFoundException(this.i18n.translate('pipelines.not_found'));
    }

    await this.prisma.pipeline.delete({
      where: { id: pipelineId },
    });

    this.logger.log(`Pipeline deleted: ${pipelineId}`);
  }
}
