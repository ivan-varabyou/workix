import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  type ABTestCreateRequestData,
  isABTestCreateRequestData,
  PubSubEvent,
  PubSubSubscriberService,
} from '@workix/backend/shared/core';
import { ABTestConfig, VirtualABTestService } from '@workix/backend/domain/ab-testing';

/**
 * ABTestEventsSubscriberService
 * Subscribes to abTest.* events from API Gateway
 * and processes abTest operations asynchronously
 */
@Injectable()
export class ABTestEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(ABTestEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    private readonly abTestService: VirtualABTestService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to abTest.* events
    await this.pubSub.subscribe('abTest.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleABTestEvent(event);
    });
    this.logger.log('Subscribed to abTest.* events for abTest operations processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from abTest.* events');
  }

  private async handleABTestEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;

      if (eventName === 'abTest.create.request') {
        await this.handleCreateRequest(event.data);
      } else if (eventName === 'abTest.update.request') {
        await this.handleUpdateRequest(event.data);
      } else if (eventName === 'abTest.delete.request') {
        await this.handleDeleteRequest(event.data);
      } else if (eventName === 'abTest.execute.request') {
        // Execute is handled by ExecutionsEventsSubscriberService
        this.logger.debug(`ABTest execution request received: ${JSON.stringify(event.data)}`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling abTest event: ${errorMessage}`);
    }
  }

  private async handleCreateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isABTestCreateRequestData(data)) {
        this.logger.warn('Invalid abTest create request data');
        return;
      }

      const createData: ABTestCreateRequestData = data;

      // Safely extract config
      const configObj: unknown = createData.config;
      if (!configObj || typeof configObj !== 'object' || configObj === null) {
        this.logger.warn('Missing or invalid config in create request');
        return;
      }

      // Safely extract taskId
      const taskId: string | undefined = createData.taskId;

      this.logger.log(`Processing abTest create request (taskId: ${taskId})`);

      // Build ABTestConfig safely using Object.getOwnPropertyDescriptor
      const abTestConfig: {
        name: string;
        description?: string;
        variants: Array<{
          name: string;
          value: unknown;
          weight?: number;
        }>;
        hypothesis?: string;
        targetSampleSize?: number;
        confidenceLevel?: number;
        minEffectSize?: number;
        metric: string;
      } = {
        name: '',
        variants: [],
        metric: '',
      };

      const nameDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'name');
      if (nameDescriptor && 'value' in nameDescriptor && typeof nameDescriptor.value === 'string') {
        abTestConfig.name = nameDescriptor.value;
      }

      const descriptionDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'description');
      if (descriptionDescriptor && 'value' in descriptionDescriptor && typeof descriptionDescriptor.value === 'string') {
        abTestConfig.description = descriptionDescriptor.value;
      }

      const variantsDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'variants');
      if (variantsDescriptor && 'value' in variantsDescriptor && Array.isArray(variantsDescriptor.value)) {
        abTestConfig.variants = variantsDescriptor.value.map((variant: unknown): { name: string; value: unknown; weight?: number } => {
          if (typeof variant === 'object' && variant !== null) {
            const variantNameDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'name');
            if (variantNameDescriptor && 'value' in variantNameDescriptor && typeof variantNameDescriptor.value === 'string') {
              const variantValueDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'value');
              const variantWeightDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'weight');
              return {
                name: variantNameDescriptor.value,
                value: variantValueDescriptor && 'value' in variantValueDescriptor ? variantValueDescriptor.value : null,
                weight: variantWeightDescriptor && 'value' in variantWeightDescriptor && typeof variantWeightDescriptor.value === 'number' ? variantWeightDescriptor.value : undefined,
              };
            }
          }
          return { name: '', value: null };
        }).filter((v: { name: string; value: unknown; weight?: number }): boolean => v.name !== '');
      }

      const hypothesisDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'hypothesis');
      if (hypothesisDescriptor && 'value' in hypothesisDescriptor && typeof hypothesisDescriptor.value === 'string') {
        abTestConfig.hypothesis = hypothesisDescriptor.value;
      }

      const targetSampleSizeDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'targetSampleSize');
      if (targetSampleSizeDescriptor && 'value' in targetSampleSizeDescriptor && typeof targetSampleSizeDescriptor.value === 'number') {
        abTestConfig.targetSampleSize = targetSampleSizeDescriptor.value;
      }

      const confidenceLevelDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'confidenceLevel');
      if (confidenceLevelDescriptor && 'value' in confidenceLevelDescriptor && typeof confidenceLevelDescriptor.value === 'number') {
        abTestConfig.confidenceLevel = confidenceLevelDescriptor.value;
      }

      const minEffectSizeDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'minEffectSize');
      if (minEffectSizeDescriptor && 'value' in minEffectSizeDescriptor && typeof minEffectSizeDescriptor.value === 'number') {
        abTestConfig.minEffectSize = minEffectSizeDescriptor.value;
      }

      const metricDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'metric');
      if (metricDescriptor && 'value' in metricDescriptor && typeof metricDescriptor.value === 'string') {
        abTestConfig.metric = metricDescriptor.value;
      }

      if (!abTestConfig.name || abTestConfig.variants.length === 0 || !abTestConfig.metric) {
        this.logger.warn('Missing required fields in config: name, variants, or metric');
        return;
      }

      // Process abTest creation asynchronously
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion, no-restricted-syntax
      await this.abTestService.createABTest(abTestConfig as ABTestConfig);

      this.logger.log(`ABTest created successfully (taskId: ${taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process abTest create request: ${errorMessage}`);
    }
  }

  private async handleUpdateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data
      if (!data || typeof data !== 'object' || data === null) {
        this.logger.warn('Invalid abTest update request data');
        return;
      }

      // Safely extract update data
      let abTestId: string | undefined;
      let config: Partial<ABTestConfig> | undefined;

      if ('abTestId' in data && typeof data.abTestId === 'string') {
        abTestId = data.abTestId;
      }
      if ('config' in data && typeof data.config === 'object' && data.config !== null) {
        const configObj: unknown = data.config;
        if (typeof configObj === 'object' && configObj !== null) {
          config = {};
          // Use Object.getOwnPropertyDescriptor for safe property access
          const nameDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'name');
          if (nameDescriptor && 'value' in nameDescriptor && typeof nameDescriptor.value === 'string') {
            config.name = nameDescriptor.value;
          }

          const descriptionDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'description');
          if (descriptionDescriptor && 'value' in descriptionDescriptor && typeof descriptionDescriptor.value === 'string') {
            config.description = descriptionDescriptor.value;
          }

          const variantsDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'variants');
          if (variantsDescriptor && 'value' in variantsDescriptor && Array.isArray(variantsDescriptor.value)) {
            config.variants = variantsDescriptor.value.map((variant: unknown): { name: string; value: unknown; weight?: number } => {
              if (typeof variant === 'object' && variant !== null) {
                const variantNameDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'name');
                if (variantNameDescriptor && 'value' in variantNameDescriptor && typeof variantNameDescriptor.value === 'string') {
                  const variantValueDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'value');
                  const variantWeightDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'weight');
                  return {
                    name: variantNameDescriptor.value,
                    value: variantValueDescriptor && 'value' in variantValueDescriptor ? variantValueDescriptor.value : null,
                    weight: variantWeightDescriptor && 'value' in variantWeightDescriptor && typeof variantWeightDescriptor.value === 'number' ? variantWeightDescriptor.value : undefined,
                  };
                }
              }
              return { name: '', value: null };
            }).filter((v: { name: string; value: unknown; weight?: number }): boolean => v.name !== '');
          }

          const hypothesisDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'hypothesis');
          if (hypothesisDescriptor && 'value' in hypothesisDescriptor && typeof hypothesisDescriptor.value === 'string') {
            config.hypothesis = hypothesisDescriptor.value;
          }

          const targetSampleSizeDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'targetSampleSize');
          if (targetSampleSizeDescriptor && 'value' in targetSampleSizeDescriptor && typeof targetSampleSizeDescriptor.value === 'number') {
            config.targetSampleSize = targetSampleSizeDescriptor.value;
          }

          const confidenceLevelDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'confidenceLevel');
          if (confidenceLevelDescriptor && 'value' in confidenceLevelDescriptor && typeof confidenceLevelDescriptor.value === 'number') {
            config.confidenceLevel = confidenceLevelDescriptor.value;
          }

          const minEffectSizeDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'minEffectSize');
          if (minEffectSizeDescriptor && 'value' in minEffectSizeDescriptor && typeof minEffectSizeDescriptor.value === 'number') {
            config.minEffectSize = minEffectSizeDescriptor.value;
          }

          const metricDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'metric');
          if (metricDescriptor && 'value' in metricDescriptor && typeof metricDescriptor.value === 'string') {
            config.metric = metricDescriptor.value;
          }
        }
      }

      if (!abTestId || !config) {
        this.logger.warn('Missing abTestId or config in update request');
        return;
      }

      const taskId: string | undefined = 'taskId' in data && typeof data.taskId === 'string' ? data.taskId : undefined;

      this.logger.log(`Processing abTest update request for ${abTestId} (taskId: ${taskId})`);

      // Process abTest update asynchronously
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.abTestService.updateABTest(abTestId, config);

      this.logger.log(`ABTest updated successfully: ${abTestId} (taskId: ${taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process abTest update request: ${errorMessage}`);
    }
  }

  private async handleDeleteRequest(data: unknown): Promise<void> {
    try {
      // Validate event data
      if (!data || typeof data !== 'object' || data === null) {
        this.logger.warn('Invalid abTest delete request data');
        return;
      }

      // Safely extract delete data
      let abTestId: string | undefined;
      if ('abTestId' in data && typeof data.abTestId === 'string') {
        abTestId = data.abTestId;
      }

      if (!abTestId) {
        this.logger.warn('Missing abTestId in delete request');
        return;
      }

      const taskId: string | undefined = 'taskId' in data && typeof data.taskId === 'string' ? data.taskId : undefined;

      this.logger.log(`Processing abTest delete request for ${abTestId} (taskId: ${taskId})`);

      // Process abTest deletion asynchronously
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.abTestService.deleteABTest(abTestId);

      this.logger.log(`ABTest deleted successfully: ${abTestId} (taskId: ${taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process abTest delete request: ${errorMessage}`);
    }
  }
}
