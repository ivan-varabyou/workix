import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';
import { BasePayload } from '@workix/integrations/core';

import {
  PipelineStep,
  StepExecutionResult,
  StepPrismaService,
  StepResultEntity,
} from '../interfaces/pipeline-execution.interface';

/**
 * Step Executor Service
 * Executes individual pipeline steps
 */
@Injectable()
export class StepExecutorService {
  private readonly logger = new Logger(StepExecutorService.name);
  private readonly prisma: StepPrismaService;

  constructor(
    @Inject('PrismaService') prisma: StepPrismaService,
    private readonly i18n: I18nService
  ) {
    this.prisma = prisma;
  }

  /**
   * Execute single step
   */
  async executeStep(
    stepId: string,
    executionId: string,
    input: BasePayload
  ): Promise<StepExecutionResult> {
    const step: PipelineStep | null = await this.prisma.step.findUnique({
      where: { id: stepId },
    });

    if (!step) {
      throw new BadRequestException(this.i18n.translate('pipelines.step_not_found'));
    }

    try {
      let output: BasePayload = input;

      switch (step.type) {
        case 'http':
          output = await this.executeHttpStep(step.config, input);
          break;
        case 'transform':
          output = await this.executeTransformStep(step.config, input);
          break;
        case 'conditional':
          output = await this.executeConditionalStep(step.config, input);
          break;
        case 'delay':
          output = await this.executeDelayStep(step.config, input);
          break;
        default:
          throw new BadRequestException(`Unknown step type: ${step.type}`);
      }

      await this.prisma.stepResult.create({
        data: {
          executionId,
          stepId,
          status: 'success',
          output: JSON.stringify(output),
        },
      });

      this.logger.log(`Step executed successfully: ${stepId}`);
      return { success: true, output };
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      await this.prisma.stepResult.create({
        data: {
          executionId,
          stepId,
          status: 'failed',
          error: errorMessage,
        },
      });

      this.logger.error(`Step execution failed: ${stepId} - ${errorMessage}`);
      return { success: false, output: null, error: errorMessage };
    }
  }

  /**
   * Execute HTTP step
   */
  private async executeHttpStep(config: BasePayload, input: BasePayload): Promise<BasePayload> {
    const method: string = (config.method as string) || 'GET';
    const url: string = config.url as string;
    const headers: Record<string, string> = (config.headers as Record<string, string>) || {};
    const body: BasePayload | undefined = config.body as BasePayload | undefined;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body || input);
    }
    const response: Response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: BasePayload = await response.json();
    return result;
  }

  /**
   * Execute transform step
   */
  private async executeTransformStep(
    config: BasePayload,
    input: BasePayload
  ): Promise<BasePayload> {
    const expression: string | undefined = config.expression as string | undefined;

    if (!expression) {
      return input;
    }

    try {
      const func = new Function('input', `return ${expression}`);
      const result: BasePayload = func(input);
      return result;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      throw new Error(`Transform error: ${errorMessage}`);
    }
  }

  /**
   * Execute conditional step
   */
  private async executeConditionalStep(
    config: BasePayload,
    input: BasePayload
  ): Promise<BasePayload> {
    const condition: string | undefined = config.condition as string | undefined;
    const trueValue: BasePayload | undefined = config.trueValue as BasePayload | undefined;
    const falseValue: BasePayload | undefined = config.falseValue as BasePayload | undefined;

    if (!condition) {
      return input;
    }

    try {
      const func = new Function('input', `return ${condition}`);
      const result: boolean = func(input);

      return result ? trueValue || input : falseValue || input;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      throw new Error(`Condition error: ${errorMessage}`);
    }
  }

  /**
   * Execute delay step
   */
  private async executeDelayStep(config: BasePayload, input: BasePayload): Promise<BasePayload> {
    const milliseconds: number = (config.milliseconds as number) || 1000;

    return new Promise<BasePayload>((resolve: (value: BasePayload) => void) => {
      setTimeout(() => resolve(input), milliseconds);
    });
  }

  /**
   * Get step results
   */
  async getStepResults(stepId: string, executionId: string): Promise<StepResultEntity | null> {
    return await this.prisma.stepResult.findFirst({
      where: { stepId, executionId },
    });
  }
}
