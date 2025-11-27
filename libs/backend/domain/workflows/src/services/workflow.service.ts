import { Injectable } from '@nestjs/common';

import {
  Workflow,
  WorkflowContext,
  WorkflowContextValue,
  WorkflowExecution,
  WorkflowStep,
  WorkflowStepConfig,
} from '../interfaces/workflow.interface';
import { WorkflowPrismaService } from '../interfaces/workflow-prisma.interface';

@Injectable()
export class WorkflowService {
  // Logger reserved for future use
  // private _logger = new Logger(WorkflowService.name);
  private workflows: Workflow[] = [];
  private executions: WorkflowExecution[] = [];

  constructor(private prisma: WorkflowPrismaService) {}

  get enabledWorkflows(): Workflow[] {
    return this.workflows.filter((w) => w.enabled);
  }

  get failedExecutions(): WorkflowExecution[] {
    return this.executions.filter((e) => e.status === 'failed');
  }

  get successRate(): number {
    if (this.executions.length === 0) return 100;

    const successful = this.executions.filter((e) => e.status === 'completed').length;
    return Math.round((successful / this.executions.length) * 100);
  }

  /**
   * Create workflow
   */
  async createWorkflow(
    userId: string,
    name: string,
    description: string,
    steps: WorkflowStep[],
    triggers: string[] = []
  ): Promise<Workflow> {
    const workflow = await this.prisma.workflow.create({
      data: {
        userId,
        name,
        description,
        steps,
        triggers,
        enabled: true,
      },
    });

    this.workflows.push(workflow);
    return workflow;
  }

  /**
   * Get user workflows
   */
  async getUserWorkflows(userId: string): Promise<Workflow[]> {
    try {
      const workflows = await this.prisma.workflow.findMany({
        where: { userId },
      });
      this.workflows = workflows;
      return workflows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    workflowId: string,
    input: WorkflowContext = {}
  ): Promise<WorkflowExecution> {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'running',
        startedAt: new Date(),
        result: input,
      },
    });

    // Execute workflow asynchronously
    this.runWorkflow(execution, workflow, input).catch((error) => {
      console.error('Workflow execution error:', error);
    });

    return execution;
  }

  /**
   * Run workflow steps
   */
  private async runWorkflow(
    execution: WorkflowExecution,
    workflow: Workflow,
    initialInput: WorkflowContext
  ): Promise<void> {
    let context: WorkflowContext = { ...initialInput };

    try {
      for (const step of workflow.steps) {
        context = await this.executeStep(step, context);
      }

      // Mark as completed
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          result: context,
        },
      });

      this.executions = this.executions.map((ex) =>
        ex.id === execution.id
          ? {
              ...ex,
              status: 'completed',
              completedAt: new Date(),
              result: context,
            }
          : ex
      );
    } catch (error) {
      const errorMessage: string =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : 'Unknown error';
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: errorMessage,
        },
      });

      this.executions = this.executions.map((ex) =>
        ex.id === execution.id
          ? {
              ...ex,
              status: 'failed',
              completedAt: new Date(),
              error: errorMessage,
            }
          : ex
      );
    }
  }

  /**
   * Execute individual step
   */
  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowContext> {
    switch (step.type) {
      case 'action':
        return await this.executeAction(step, context);

      case 'condition':
        return await this.executeCondition(step, context);

      case 'loop':
        return await this.executeLoop(step, context);

      case 'parallel':
        return await this.executeParallel(step, context);

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute action step (HTTP call, database operation, etc.)
   */
  private async executeAction(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowContext> {
    const { config, inputs, outputs } = step;

    // Resolve inputs from context
    const resolvedInputs: WorkflowContext = this.resolveInputs(inputs, context);

    let result: WorkflowContext;

    switch (config.actionType) {
      case 'http':
        result = await this.executeHttpAction(config, resolvedInputs);
        break;

      case 'database':
        result = await this.executeDatabaseAction(config, resolvedInputs);
        break;

      case 'email':
        result = await this.executeEmailAction(config, resolvedInputs);
        break;

      case 'transform':
        result = this.executeTransformAction(config, resolvedInputs);
        break;

      default:
        throw new Error(`Unknown action type: ${config.actionType}`);
    }

    // Map outputs to context
    return this.mapOutputs(context, result, outputs);
  }

  /**
   * Execute condition step
   */
  private async executeCondition(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowContext> {
    const { config } = step;
    const condition: string | undefined = config.condition;

    if (!condition) {
      return context;
    }

    const result: boolean = this.evaluateCondition(condition, context);

    if (result && config.thenSteps) {
      for (const thenStep of config.thenSteps) {
        context = await this.executeStep(thenStep, context);
      }
    } else if (!result && config.elseSteps) {
      for (const elseStep of config.elseSteps) {
        context = await this.executeStep(elseStep, context);
      }
    }

    return context;
  }

  /**
   * Execute loop step
   */
  private async executeLoop(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowContext> {
    const { config } = step;
    const itemsValue =
      config.items !== undefined ? this.resolveValue(config.items, context) : undefined;
    const items: WorkflowContext[] = Array.isArray(itemsValue) ? itemsValue : [];
    const results: WorkflowContext[] = [];
    const steps: WorkflowStep[] | undefined = config.steps;

    if (!steps) {
      return context;
    }

    for (const item of items) {
      const itemRecord: WorkflowContext = {};
      for (const key in context) {
        if (Object.prototype.hasOwnProperty.call(context, key)) {
          itemRecord[key] = context[key];
        }
      }
      itemRecord['item'] = item as WorkflowContextValue;
      let itemContext: WorkflowContext = itemRecord;

      for (const loopStep of steps) {
        const stepResult = await this.executeStep(loopStep, itemContext);
        const stepResultRecord: WorkflowContext = {};
        for (const key in stepResult) {
          if (Object.prototype.hasOwnProperty.call(stepResult, key)) {
            stepResultRecord[key] = stepResult[key];
          }
        }
        stepResultRecord['item'] = item as WorkflowContextValue;
        itemContext = stepResultRecord;
      }

      results.push(itemContext);
    }

    const outputVar: string | undefined = config.outputVar;
    if (outputVar) {
      // results is WorkflowContext[], which needs to be cast to WorkflowContextValue
      const resultsValue: WorkflowContextValue = (results.length > 0 ? results : []) as unknown as WorkflowContextValue;
      context[outputVar] = resultsValue;
    }
    return context;
  }

  /**
   * Execute parallel step
   */
  private async executeParallel(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowContext> {
    const { config } = step;
    const steps: WorkflowStep[] | undefined = config.steps;

    if (!steps) {
      return context;
    }

    const promises: Promise<WorkflowContext>[] = steps.map((parallelStep: WorkflowStep) =>
      this.executeStep(parallelStep, { ...context })
    );

    const results: WorkflowContext[] = await Promise.all(promises);

    // Merge results
    results.forEach((result: WorkflowContext, index: number) => {
      const stepConfig: WorkflowStepConfig | undefined = steps[index]?.config;
      const outputVar: string | undefined = stepConfig?.outputVar;
      if (outputVar) {
        context[outputVar] = result as WorkflowContextValue;
      }
    });

    return context;
  }

  /**
   * Execute HTTP action
   */
  private async executeHttpAction(
    _config: WorkflowStepConfig,
    inputs: WorkflowContext
  ): Promise<WorkflowContext> {
    // Would make actual HTTP request
    return { status: 200, data: inputs as WorkflowContextValue };
  }

  /**
   * Execute database action
   */
  private async executeDatabaseAction(
    _config: WorkflowStepConfig,
    _inputs: WorkflowContext
  ): Promise<WorkflowContext> {
    // Would execute database query
    return { rows: [] };
  }

  /**
   * Execute email action
   */
  private async executeEmailAction(
    _config: WorkflowStepConfig,
    _inputs: WorkflowContext
  ): Promise<WorkflowContext> {
    // Would send email
    return { sent: true, messageId: 'msg_' + Math.random() };
  }

  /**
   * Execute transform action
   */
  private executeTransformAction(
    _config: WorkflowStepConfig,
    inputs: WorkflowContext
  ): WorkflowContext {
    // Would apply transformation logic
    return inputs;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: string, context: WorkflowContext): boolean {
    try {
      const func = new Function('context', `return ${condition}`);
      return func(context);
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Resolve inputs from context
   */
  private resolveInputs(inputs: Record<string, string>, context: WorkflowContext): WorkflowContext {
    const resolved: WorkflowContext = {};

    Object.entries(inputs).forEach(([key, value]) => {
      const resolvedValue = this.resolveValue(value, context);
      resolved[key] = resolvedValue as WorkflowContextValue;
    });

    return resolved;
  }

  /**
   * Resolve value from context
   */
  private resolveValue(
    value: string | WorkflowContext,
    context: WorkflowContext
  ): string | number | boolean | WorkflowContext | WorkflowContext[] {
    if (typeof value === 'string' && value.startsWith('$')) {
      const path = value.substring(1);
      const nestedValue = this.getNestedValue(context, path);
      return nestedValue !== undefined ? nestedValue : value;
    }
    return value;
  }

  /**
   * Get nested value from context
   */
  private getNestedValue(
    obj: WorkflowContext,
    path: string
  ): string | number | boolean | WorkflowContext | WorkflowContext[] | undefined {
    const parts = path.split('.');
    let current: WorkflowContextValue | Record<string, WorkflowContextValue> | undefined = obj as
      | WorkflowContextValue
      | Record<string, WorkflowContextValue>;
    for (const prop of parts) {
      if (
        current &&
        typeof current === 'object' &&
        !Array.isArray(current) &&
        current !== null &&
        !(current instanceof Date)
      ) {
        const currentRecord: Record<string, WorkflowContextValue> = current as Record<
          string,
          WorkflowContextValue
        >;
        if (prop in currentRecord) {
          current = currentRecord[prop];
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
    return current as string | number | boolean | WorkflowContext | WorkflowContext[] | undefined;
  }

  /**
   * Map outputs to context
   */
  private mapOutputs(
    context: WorkflowContext,
    result: WorkflowContext,
    outputs: Record<string, string>
  ): WorkflowContext {
    Object.entries(outputs).forEach(([contextKey, resultKey]) => {
      const nestedValue = this.getNestedValue(result, resultKey);
      if (nestedValue !== undefined) {
        context[contextKey] = nestedValue as WorkflowContextValue;
      }
    });

    return context;
  }

  /**
   * Get workflow executions
   */
  async getWorkflowExecutions(workflowId: string, limit = 50): Promise<WorkflowExecution[]> {
    const executions = await this.prisma.workflowExecution.findMany({
      where: { workflowId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    this.executions = executions;
    return executions;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    const updated = await this.prisma.workflow.update({
      where: { id: workflowId },
      data: updates,
    });

    this.workflows = this.workflows.map((wf) => (wf.id === workflowId ? updated : wf));

    return updated;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.prisma.workflow.delete({
      where: { id: workflowId },
    });

    this.workflows = this.workflows.filter((wf) => wf.id !== workflowId);
  }
}
