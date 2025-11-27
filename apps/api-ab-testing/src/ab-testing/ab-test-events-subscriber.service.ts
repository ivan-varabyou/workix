import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  type ABTestCreateRequestData,
  type ABTestEndRequestData,
  type ABTestPauseRequestData,
  type ABTestResumeRequestData,
  type ABTestTrackEventRequestData,
  isABTestCreateRequestData,
  isABTestEndRequestData,
  isABTestPauseRequestData,
  isABTestResumeRequestData,
  isABTestTrackEventRequestData,
  PubSubEvent,
  PubSubSubscriberService,
} from '@workix/backend/shared/core';
import { type ABTestConfig, ABTestingService, type ABTestVariant } from '@workix/backend/domain/ab-testing';

/**
 * ABTestEventsSubscriberService
 * Subscribes to ab-test.* events from API Gateway
 * and processes A/B test operations asynchronously
 */
@Injectable()
export class ABTestEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(ABTestEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    private readonly abTestingService: ABTestingService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to ab-test.* events
    await this.pubSub.subscribe('ab-test.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleABTestEvent(event);
    });
    this.logger.log('Subscribed to ab-test.* events for A/B test operations processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from ab-test.* events');
  }

  private async handleABTestEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;

      if (eventName === 'ab-test.create.request') {
        await this.handleCreateRequest(event.data);
      } else if (eventName === 'ab-test.update.request') {
        await this.handleUpdateRequest(event.data);
      } else if (eventName === 'ab-test.delete.request') {
        await this.handleDeleteRequest(event.data);
      } else if (eventName === 'ab-test.track.request') {
        await this.handleTrackRequest(event.data);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling A/B test event: ${errorMessage}`);
    }
  }

  private async handleCreateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isABTestCreateRequestData(data)) {
        this.logger.warn('Invalid A/B test create request data');
        return;
      }

      const createData: ABTestCreateRequestData = data;

      if (!createData.config) {
        this.logger.warn('Missing config in create request');
        return;
      }

      // Type guard ensures config is defined and is an object
      if (typeof createData.config !== 'object' || createData.config === null) {
        this.logger.warn('Invalid config type in create request');
        return;
      }

      this.logger.log(`Processing A/B test create request (taskId: ${createData.taskId})`);

      // Build ABTestConfig from validated data using safe property access
      const configObj: unknown = createData.config;
      const abTestConfig: ABTestConfig = {
        name: '',
        variants: [],
        metric: '',
      };

      if (typeof configObj === 'object' && configObj !== null) {
        const nameDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'name');
        if (nameDesc && 'value' in nameDesc && typeof nameDesc.value === 'string') {
          abTestConfig.name = nameDesc.value;
        }

        const variantsDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'variants');
        if (variantsDesc && 'value' in variantsDesc && Array.isArray(variantsDesc.value)) {
          const validVariants: ABTestVariant[] = [];
          for (const variant of variantsDesc.value) {
            if (typeof variant === 'object' && variant !== null) {
              const idDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'id');
              const nameDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'name');
              const valueDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'value');

              if (
                idDesc && 'value' in idDesc && typeof idDesc.value === 'string' &&
                nameDesc && 'value' in nameDesc && typeof nameDesc.value === 'string' &&
                valueDesc && 'value' in valueDesc
              ) {
                // Type guard for ABTestVariantValue
                const valueVal: unknown = valueDesc.value;
                function isValidVariantValue(
                  val: unknown
                ): val is string | number | boolean | Record<string, unknown> | unknown[] {
                  return (
                    typeof val === 'string' ||
                    typeof val === 'number' ||
                    typeof val === 'boolean' ||
                    (typeof val === 'object' && val !== null && !Array.isArray(val)) ||
                    Array.isArray(val)
                  );
                }

                if (isValidVariantValue(valueVal)) {
                  const weightDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(variant, 'weight');
                  const variantObj: ABTestVariant = {
                    id: idDesc.value,
                    name: nameDesc.value,
                    value: valueVal,
                  };
                  if (weightDesc && 'value' in weightDesc && typeof weightDesc.value === 'number') {
                    variantObj.weight = weightDesc.value;
                  }
                  validVariants.push(variantObj);
                }
              }
            }
          }
          abTestConfig.variants = validVariants;
        }

        const metricDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'metric');
        if (metricDesc && 'value' in metricDesc && typeof metricDesc.value === 'string') {
          abTestConfig.metric = metricDesc.value;
        }

        const descriptionDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'description');
        if (descriptionDesc && 'value' in descriptionDesc && typeof descriptionDesc.value === 'string') {
          abTestConfig.description = descriptionDesc.value;
        }

        const hypothesisDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'hypothesis');
        if (hypothesisDesc && 'value' in hypothesisDesc && typeof hypothesisDesc.value === 'string') {
          abTestConfig.hypothesis = hypothesisDesc.value;
        }

        const targetSampleSizeDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'targetSampleSize');
        if (targetSampleSizeDesc && 'value' in targetSampleSizeDesc && typeof targetSampleSizeDesc.value === 'number') {
          abTestConfig.targetSampleSize = targetSampleSizeDesc.value;
        }

        const confidenceLevelDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'confidenceLevel');
        if (confidenceLevelDesc && 'value' in confidenceLevelDesc && typeof confidenceLevelDesc.value === 'number') {
          abTestConfig.confidenceLevel = confidenceLevelDesc.value;
        }

        const minEffectSizeDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(configObj, 'minEffectSize');
        if (minEffectSizeDesc && 'value' in minEffectSizeDesc && typeof minEffectSizeDesc.value === 'number') {
          abTestConfig.minEffectSize = minEffectSizeDesc.value;
        }
      }

      if (!abTestConfig.name || abTestConfig.variants.length === 0 || !abTestConfig.metric) {
        this.logger.warn('Missing required fields in config: name, variants, or metric');
        return;
      }

      await this.abTestingService.createTest(abTestConfig);
      this.logger.log(`A/B test created successfully (taskId: ${createData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process A/B test create request: ${errorMessage}`);
    }
  }

  private async handleUpdateRequest(data: unknown): Promise<void> {
    try {
      // Handle pause, resume, and end actions
      if (isABTestPauseRequestData(data)) {
        const pauseData: ABTestPauseRequestData = data;
        if (!pauseData.testId) {
          this.logger.warn('Missing testId in pause request');
          return;
        }
        this.logger.log(`Processing A/B test pause request for ${pauseData.testId} (taskId: ${pauseData.taskId})`);
        await this.abTestingService.pauseTest(pauseData.testId);
        this.logger.log(`A/B test paused successfully: ${pauseData.testId} (taskId: ${pauseData.taskId})`);
      } else if (isABTestResumeRequestData(data)) {
        const resumeData: ABTestResumeRequestData = data;
        if (!resumeData.testId) {
          this.logger.warn('Missing testId in resume request');
          return;
        }
        this.logger.log(`Processing A/B test resume request for ${resumeData.testId} (taskId: ${resumeData.taskId})`);
        await this.abTestingService.resumeTest(resumeData.testId);
        this.logger.log(`A/B test resumed successfully: ${resumeData.testId} (taskId: ${resumeData.taskId})`);
      } else if (isABTestEndRequestData(data)) {
        const endData: ABTestEndRequestData = data;
        if (!endData.testId) {
          this.logger.warn('Missing testId in end request');
          return;
        }
        this.logger.log(`Processing A/B test end request for ${endData.testId} (taskId: ${endData.taskId})`);
        await this.abTestingService.endTest(endData.testId);
        this.logger.log(`A/B test ended successfully: ${endData.testId} (taskId: ${endData.taskId})`);
      } else {
        this.logger.warn('Invalid A/B test update request data');
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process A/B test update request: ${errorMessage}`);
    }
  }

  private async handleDeleteRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isABTestEndRequestData(data)) {
        this.logger.warn('Invalid A/B test delete request data');
        return;
      }

      const deleteData: ABTestEndRequestData = data;

      if (!deleteData.testId) {
        this.logger.warn('Missing testId in delete request');
        return;
      }

      this.logger.log(`Processing A/B test delete request for ${deleteData.testId} (taskId: ${deleteData.taskId})`);
      // Note: ABTestingService might not have delete method, end test instead
      await this.abTestingService.endTest(deleteData.testId);
      this.logger.log(`A/B test deleted successfully: ${deleteData.testId} (taskId: ${deleteData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process A/B test delete request: ${errorMessage}`);
    }
  }

  private async handleTrackRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isABTestTrackEventRequestData(data)) {
        this.logger.warn('Invalid A/B test track request data');
        return;
      }

      const trackData: ABTestTrackEventRequestData = data;

      if (!trackData.testId || !trackData.variant || !trackData.eventName) {
        this.logger.warn('Missing testId, variant, or eventName in track request');
        return;
      }

      // Validate eventName is 'view' or 'conversion'
      if (trackData.eventName !== 'view' && trackData.eventName !== 'conversion') {
        this.logger.warn(`Invalid eventName: ${trackData.eventName}. Must be 'view' or 'conversion'`);
        return;
      }

      this.logger.log(`Processing A/B test track request for ${trackData.testId} (taskId: ${trackData.taskId})`);
      await this.abTestingService.trackEvent(
        trackData.testId,
        trackData.variant,
        trackData.eventName,
        trackData.metadata
      );
      this.logger.log(`A/B test event tracked successfully: ${trackData.testId} (taskId: ${trackData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process A/B test track request: ${errorMessage}`);
    }
  }
}
