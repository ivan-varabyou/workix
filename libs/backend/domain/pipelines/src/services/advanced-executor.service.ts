import { Injectable, Logger } from '@nestjs/common';
import {
  AICapability,
  AIRouter,
  PromptManagerService,
  TextGenerationRequest,
  TextGenerationResponse,
} from '@workix/ai/ai-core';
import { WorkerFrameworkService, WorkerInput } from '@workix/domain/workers';
import { BasePayload } from '@workix/integrations/core';

import {
  DataSourceConfig,
  LLMResponseData,
  PipelineInput,
  PipelineOutput,
  TransformConfig,
} from '../interfaces/pipeline-execution.interface';
import {
  PipelineExecutionContext,
  PipelineGraphConfig,
  PipelineNode,
} from '../types/pipeline-graph';

/**
 * Advanced Pipeline Executor Service
 * Executes complex workflows with LLM prompts & workers
 */
@Injectable()
export class AdvancedExecutorService {
  private readonly logger: Logger = new Logger(AdvancedExecutorService.name);
  private executions: Map<string, PipelineExecutionContext> = new Map();

  constructor(
    private readonly aiRouter: AIRouter,
    private readonly promptManager: PromptManagerService,
    private readonly workerFramework: WorkerFrameworkService
  ) {}

  /**
   * Execute pipeline graph
   */
  async executeGraph(
    pipelineId: string,
    graphConfig: PipelineGraphConfig,
    input: PipelineInput = {}
  ): Promise<PipelineOutput> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const userIdValue: string = typeof input.userId === 'string' ? input.userId : 'system';
    const context: PipelineExecutionContext = {
      pipelineId,
      executionId,
      userId: userIdValue,
      startedAt: new Date(),
      variables: input as Record<string, any>,
      nodeResults: new Map(),
    };

    this.executions.set(executionId, context);

    this.logger.log(`Starting pipeline execution: ${pipelineId} (${executionId})`);

    try {
      // Find start node
      const startNode = graphConfig.nodes.find((n) => n.type === 'start');
      if (!startNode) {
        throw new Error('No start node found in graph');
      }

      // Execute graph starting from start node
      const result = await this.executeNode(startNode, graphConfig, context);

      // Find end node and get final result
      const endNode = graphConfig.nodes.find((n) => n.type === 'end');
      if (endNode && context.nodeResults.has(endNode.id)) {
        return context.nodeResults.get(endNode.id);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Pipeline execution failed: ${pipelineId} - ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    } finally {
      this.executions.delete(executionId);
    }
  }

  /**
   * Execute single node
   */
  private async executeNode(
    node: PipelineNode,
    graphConfig: PipelineGraphConfig,
    context: PipelineExecutionContext
  ): Promise<PipelineOutput> {
    this.logger.log(`Executing node: ${node.id} (${node.type})`);

    let result: PipelineOutput;

    switch (node.type) {
      case 'start':
        result = context.variables;
        break;

      case 'dataSource':
        result = await this.executeDataSourceNode(node, context);
        break;

      case 'transform':
        result = await this.executeTransformNode(node, context);
        break;

      case 'worker':
        result = await this.executeWorkerNode(node, context);
        break;

      case 'llm':
        result = await this.executeLLMNode(node, context);
        break;

      case 'decision':
        result = await this.executeDecisionNode(node, graphConfig, context);
        break;

      case 'parallel':
        const parallelResults = await this.executeParallelNode(node, graphConfig, context);
        result =
          parallelResults.length === 1
            ? parallelResults[0] ?? null
            : (parallelResults as PipelineOutput);
        break;

      case 'end':
        result = context.nodeResults.get(node.id) || context.variables;
        break;

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }

    // Store result
    context.nodeResults.set(node.id, result);

    // Execute next nodes
    const edges = graphConfig.edges.filter((e) => e.from === node.id);
    for (const edge of edges) {
      const nextNode = graphConfig.nodes.find((n) => n.id === edge.to);
      if (nextNode) {
        // Check edge condition if present
        if (edge.condition) {
          const conditionMet = this.evaluateCondition(edge.condition, result, context);
          if (!conditionMet) {
            continue;
          }
        }

        await this.executeNode(nextNode, graphConfig, context);
      }
    }

    return result;
  }

  /**
   * Execute DataSource node
   */
  private async executeDataSourceNode(
    node: PipelineNode,
    context: PipelineExecutionContext
  ): Promise<any> {
    const configRaw = node.dataSourceConfig || {};
    const config: DataSourceConfig = {
      ...configRaw,
      type: node.dataSourceType || 'api',
    } as DataSourceConfig;

    switch (node.dataSourceType) {
      case 'api':
        return await this.fetchFromAPI(config, context);
      case 'database':
        return await this.fetchFromDatabase(config, context);
      case 'file':
        return await this.fetchFromFile(config, context);
      default:
        throw new Error(`Unknown data source type: ${node.dataSourceType}`);
    }
  }

  /**
   * Execute Transform node
   */
  private async executeTransformNode(
    node: PipelineNode,
    context: PipelineExecutionContext
  ): Promise<any> {
    const input = this.getNodeInput(node, context);
    const config = node.transformConfig || {};

    switch (node.transformType) {
      case 'map':
        return this.transformMap(input, config.mapping || {});
      case 'filter':
        return this.transformFilter(input, config.filter || '');
      case 'aggregate':
        return this.transformAggregate(
          input,
          config.aggregation || { function: 'sum', field: 'value' }
        );
      default:
        return input;
    }
  }

  /**
   * Execute Worker node
   */
  private async executeWorkerNode(
    node: PipelineNode,
    context: PipelineExecutionContext
  ): Promise<any> {
    const input = this.getNodeInput(node, context);
    const config = node.workerConfig || {};

    // Find worker
    const worker = this.workerFramework.findBestWorker(config.capabilities || [], node.workerType);

    if (!worker) {
      throw new Error(`No worker found for node: ${node.id}`);
    }

    const workerInput: WorkerInput = Object.fromEntries(
      Object.entries(input).map(([key, value]) => {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          value === null ||
          value === undefined
        ) {
          return [key, value];
        }
        if (value instanceof Date) {
          return [key, value];
        }
        if (Array.isArray(value)) {
          if (value.every((v) => typeof v === 'string')) {
            return [key, value];
          }
          if (value.every((v) => typeof v === 'number')) {
            return [key, value];
          }
        }
        if (typeof value === 'object' && value !== null) {
          return [key, value as Record<string, string | number | boolean>];
        }
        return [key, String(value)];
      })
    ) as WorkerInput;

    return await this.workerFramework.executeWorker(worker.id, workerInput, {
      ...config.params,
      context,
    });
  }

  /**
   * Execute LLM node
   */
  private async executeLLMNode(
    node: PipelineNode,
    context: PipelineExecutionContext
  ): Promise<any> {
    // Get prompt template or raw prompt
    let prompt: string;

    if (node.promptTemplate) {
      // Render template with variables
      prompt = this.promptManager.renderTemplate(node.promptTemplate, {
        variables: {
          ...context.variables,
          ...node.variables,
        },
        strict: false,
      });
    } else if (node.prompt) {
      prompt = node.prompt;
    } else {
      throw new Error(`No prompt or promptTemplate specified for LLM node: ${node.id}`);
    }

    // Execute via AI Router
    const constraints: {
      preferredProviders?: string[];
    } = {};
    if (node.model !== undefined) {
      constraints.preferredProviders = [node.model];
    }
    const provider = await this.aiRouter.selectProvider(AICapability.TEXT_GENERATION, constraints);

    const request: TextGenerationRequest = {
      type: AICapability.TEXT_GENERATION,
      prompt,
    };
    if (node.temperature !== undefined) {
      request.temperature = node.temperature;
    }
    if (node.maxTokens !== undefined) {
      request.maxTokens = node.maxTokens;
    }

    const response = await provider.execute(request);

    // Helper function to safely get property value
    function getProperty(obj: object, key: string): unknown {
      if (!(key in obj)) {
        return undefined;
      }
      // Use Object.getOwnPropertyDescriptor for safe access
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      return descriptor?.value;
    }

    // Type guard for TextGenerationResponse
    function isTextGenerationResponse(res: unknown): res is TextGenerationResponse {
      if (typeof res !== 'object' || res === null) {
        return false;
      }
      const content = getProperty(res, 'content');
      if (typeof content !== 'string') {
        return false;
      }
      const id = getProperty(res, 'id');
      if (typeof id !== 'string') {
        return false;
      }
      const provider = getProperty(res, 'provider');
      if (typeof provider !== 'string') {
        return false;
      }
      const model = getProperty(res, 'model');
      if (typeof model !== 'string') {
        return false;
      }
      return true;
    }

    // Type guard for LLMResponseData
    function isLLMResponseData(res: unknown): res is LLMResponseData {
      return (
        typeof res === 'object' &&
        res !== null &&
        ('output' in res || 'data' in res || 'text' in res || 'message' in res)
      );
    }

    if (isTextGenerationResponse(response)) {
      return response.content;
    }

    if (isLLMResponseData(response)) {
      if (response.output) {
        return response.output;
      }
      if (response.data && typeof response.data === 'string') {
        return response.data;
      }
      if (response.text) {
        return response.text;
      }
      if (response.message) {
        return response.message;
      }
    }

    return '';
  }

  /**
   * Execute Decision node
   */
  private async executeDecisionNode(
    node: PipelineNode,
    graphConfig: PipelineGraphConfig,
    context: PipelineExecutionContext
  ): Promise<PipelineOutput> {
    const input = this.getNodeInput(node, context);
    const config = node.decisionConfig || {};

    switch (node.decisionType) {
      case 'if':
        return this.executeIfDecision(node, graphConfig, context, input, config);
      case 'switch':
        return this.executeSwitchDecision(node, graphConfig, context, input, config);
      case 'loop':
        const loopResults = await this.executeLoopDecision(
          node,
          graphConfig,
          context,
          input,
          config
        );
        return loopResults.length === 1 ? loopResults[0] ?? null : (loopResults as PipelineOutput);
      default:
        return input;
    }
  }

  /**
   * Execute Parallel node
   */
  private async executeParallelNode(
    _node: PipelineNode,
    graphConfig: PipelineGraphConfig,
    context: PipelineExecutionContext
  ): Promise<PipelineOutput[]> {
    // const _input = this.getNodeInput(_node, context); // Reserved for future use
    const edges = graphConfig.edges.filter((e) => e.from === _node.id);
    const nextNodes = edges
      .map((e) => graphConfig.nodes.find((n) => n.id === e.to))
      .filter((node): node is PipelineNode => node !== undefined);

    // Execute all next nodes in parallel
    const results = await Promise.all(
      nextNodes.map((n) => this.executeNode(n, graphConfig, context))
    );

    return results;
  }

  /**
   * Helper methods
   */
  private getNodeInput(node: PipelineNode, context: PipelineExecutionContext): PipelineInput {
    // Get input from previous node or context variables
    if (node.inputs) {
      return { ...context.variables, ...node.inputs };
    }
    return context.variables;
  }

  private async fetchFromAPI(
    config: DataSourceConfig,
    _context: PipelineExecutionContext
  ): Promise<PipelineOutput> {
    if (!config.url) {
      throw new Error('URL is required for API data source');
    }
    const fetchOptions: RequestInit = {
      method: config.method || 'GET',
      headers: config.headers || {},
    };
    if (config.body !== undefined) {
      fetchOptions.body = JSON.stringify(config.body);
    }
    const response = await fetch(config.url, fetchOptions);

    return await response.json();
  }

  private async fetchFromDatabase(
    _config: DataSourceConfig,
    _context: PipelineExecutionContext
  ): Promise<PipelineOutput> {
    // TODO: Implement database fetch
    throw new Error('Database fetch not implemented');
  }

  private async fetchFromFile(
    _config: DataSourceConfig,
    _context: PipelineExecutionContext
  ): Promise<PipelineOutput> {
    // TODO: Implement file fetch
    throw new Error('File fetch not implemented');
  }

  private transformMap(input: PipelineOutput, mapping: Record<string, string>): PipelineOutput {
    if (Array.isArray(input)) {
      return input.map((item: BasePayload) => {
        const mapped: BasePayload = {};
        for (const [key, value] of Object.entries(mapping)) {
          mapped[key] = item[value];
        }
        return mapped;
      });
    }
    return input;
  }

  private transformFilter(input: PipelineOutput, _filterExpression: string): PipelineOutput {
    if (Array.isArray(input)) {
      // TODO: Implement expression evaluation
      return input;
    }
    return input;
  }

  private transformAggregate(
    input: PipelineOutput,
    aggregation: TransformConfig['aggregation']
  ): PipelineOutput {
    if (!aggregation) {
      return input;
    }
    if (Array.isArray(input)) {
      const field = aggregation.field;
      if (!field) {
        return input.length;
      }
      const values = input.map((item) => {
        if (typeof item === 'object' && item !== null && field in item) {
          const value = (item as Record<string, unknown>)[field];
          return typeof value === 'number' ? value : 0;
        }
        return 0;
      });
      switch (aggregation.operation) {
        case 'sum':
          return values.reduce((a, b) => a + b, 0);
        case 'avg':
          return values.reduce((a, b) => a + b, 0) / values.length;
        case 'min':
          return Math.min(...values);
        case 'max':
          return Math.max(...values);
        case 'count':
          return values.length;
        default:
          return input;
      }
    }
    return input;
  }

  private executeIfDecision(
    _node: PipelineNode,
    graphConfig: PipelineGraphConfig,
    context: PipelineExecutionContext,
    input: PipelineInput,
    config: BasePayload
  ): Promise<PipelineOutput> {
    const conditionValue = config.condition;
    const conditionStr: string = typeof conditionValue === 'string' ? conditionValue : '';
    const conditionMet = this.evaluateCondition(conditionStr, input, context);
    const targetNodeId = conditionMet ? config.trueTarget : config.falseTarget;
    const targetNode = graphConfig.nodes.find((n) => n.id === targetNodeId);

    if (targetNode) {
      return this.executeNode(targetNode, graphConfig, context);
    }

    return Promise.resolve(input);
  }

  private executeSwitchDecision(
    _node: PipelineNode,
    graphConfig: PipelineGraphConfig,
    context: PipelineExecutionContext,
    input: PipelineInput,
    config: BasePayload & {
      cases?: Array<{ value: string | number; target: string }>;
      field?: string;
      defaultTarget?: string;
    }
  ): Promise<PipelineOutput> {
    const cases = config.cases || [];
    const fieldName = config.field;
    const value = fieldName ? input[fieldName] : input;

    for (const caseItem of cases) {
      if (caseItem.value === value) {
        const targetNode = graphConfig.nodes.find((n) => n.id === caseItem.target);
        if (targetNode) {
          return this.executeNode(targetNode, graphConfig, context);
        }
      }
    }

    // Default case
    if (config.defaultTarget) {
      const targetNode = graphConfig.nodes.find((n) => n.id === config.defaultTarget);
      if (targetNode) {
        return this.executeNode(targetNode, graphConfig, context);
      }
    }

    return Promise.resolve(input);
  }

  private async executeLoopDecision(
    _node: PipelineNode,
    graphConfig: PipelineGraphConfig,
    context: PipelineExecutionContext,
    input: PipelineInput,
    config: BasePayload & {
      loopConfig?: { iterator?: string; maxIterations?: number };
      loopTarget?: string;
    }
  ): Promise<PipelineOutput[]> {
    // Type guard for loopConfig
    function isLoopConfig(value: unknown): value is { iterator?: string; maxIterations?: number } {
      return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        ('iterator' in value || 'maxIterations' in value)
      );
    }

    const loopConfig: { iterator?: string; maxIterations?: number } = isLoopConfig(
      config.loopConfig
    )
      ? config.loopConfig
      : {};
    const iterator: string = loopConfig.iterator || 'items';
    const maxIterations: number = loopConfig.maxIterations || 100;

    // Type guard for BasePayload array
    function isBasePayloadArray(value: unknown): value is BasePayload[] {
      return (
        Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null)
      );
    }

    const iteratorValue = input[iterator];
    const items: BasePayload[] = isBasePayloadArray(iteratorValue) ? iteratorValue : [input];
    const results: PipelineOutput[] = [];

    for (let i = 0; i < Math.min(items.length, maxIterations); i++) {
      const item = items[i];
      const loopContext = {
        ...context,
        variables: { ...context.variables, [iterator]: item, index: i },
      };

      const targetNode = graphConfig.nodes.find((n) => n.id === config.loopTarget);
      if (targetNode) {
        const result = await this.executeNode(targetNode, graphConfig, loopContext);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Evaluate condition expression
   */
  private evaluateCondition(
    condition: string,
    _input: PipelineOutput,
    context: PipelineExecutionContext
  ): boolean {
    try {
      // Simple condition evaluation
      // In production, use a proper expression evaluator
      if (!condition) {
        return true;
      }

      // Replace variables in condition
      let evaluatedCondition = condition;
      for (const [key, value] of Object.entries(context.variables)) {
        evaluatedCondition = evaluatedCondition.replace(
          new RegExp(`\\$\\{${key}\\}`, 'g'),
          String(value)
        );
      }

      // Simple boolean evaluation
      // For more complex conditions, use a proper expression parser
      if (evaluatedCondition.includes('===')) {
        const [left, right] = evaluatedCondition.split('===').map((s) => s.trim());
        return left === right;
      }
      if (evaluatedCondition.includes('!==')) {
        const [left, right] = evaluatedCondition.split('!==').map((s) => s.trim());
        return left !== right;
      }
      if (evaluatedCondition.includes('>')) {
        const [left, right] = evaluatedCondition.split('>').map((s) => s.trim());
        return Number(left) > Number(right);
      }
      if (evaluatedCondition.includes('<')) {
        const [left, right] = evaluatedCondition.split('<').map((s) => s.trim());
        return Number(left) < Number(right);
      }

      // Default: evaluate as boolean
      return Boolean(evaluatedCondition);
    } catch (error) {
      this.logger.warn(`Failed to evaluate condition: ${condition}`, error);
      return false;
    }
  }
}
