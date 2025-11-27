import { Injectable, Logger } from '@nestjs/common';

import {
  BasePayload,
  isBasePayload,
  SyncPayload,
} from '../interfaces/integration-payload.interface';
import { IntegrationCapability } from '../interfaces/integration-provider.interface';
import { IntegrationRouter } from '../router/integration.router';
import { DataTransformerService, GenericDataFormat } from './data-transformer.service';

/**
 * Sync Configuration
 */
export interface SyncConfig {
  providerId: string;
  operation: string;
  schedule?: string; // Cron expression
  incremental?: boolean; // Use incremental sync
  lastSyncAt?: Date;
  batchSize?: number;
  filters?: SyncPayload['filters'];
}

/**
 * Sync Result
 */
export interface SyncResult {
  providerId: string;
  operation: string;
  status: 'success' | 'failed' | 'partial';
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsFailed: number;
  errors?: string[];
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  nextSyncAt?: Date;
}

/**
 * Data Sync Service
 * Handles data ingestion and incremental sync from APIs
 */
@Injectable()
export class DataSyncService {
  private readonly logger = new Logger(DataSyncService.name);
  private syncConfigs: Map<string, SyncConfig> = new Map();

  constructor(private router: IntegrationRouter, private transformer: DataTransformerService) {}

  /**
   * Register sync configuration
   */
  registerSync(config: SyncConfig): void {
    const key = `${config.providerId}:${config.operation}`;
    this.syncConfigs.set(key, config);
    this.logger.log(`Sync registered: ${key}`);
  }

  /**
   * Pull data from API (ingestion)
   */
  async pullData(
    providerId: string,
    operation: string,
    options?: {
      since?: Date; // For incremental sync
      limit?: number;
      filters?: SyncPayload['filters'];
    }
  ): Promise<GenericDataFormat[]> {
    const startTime = Date.now();
    const requestId = `sync-pull-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${requestId}] Starting data pull`, {
      providerId,
      operation,
      since: options?.since,
      limit: options?.limit,
    });

    try {
      // Build request payload
      const payload: SyncPayload = {
        ...options?.filters,
      };

      if (options?.since) {
        payload.since = options.since.toISOString();
      }

      if (options?.limit) {
        payload.limit = options.limit;
      }

      // Execute via IntegrationRouter
      const response = await this.router.execute(
        {
          id: requestId,
          capability: IntegrationCapability.ANALYTICS,
          operation,
          payload,
        },
        [providerId]
      );

      // Transform to generic format
      const transformed = this.transformer.transform(response);

      // If response.data is an array, transform all items
      if (Array.isArray(response.data)) {
        const items = response.data.filter(
          (item): item is BasePayload =>
            item !== null && item !== undefined && typeof item === 'object'
        );
        const transformedArray: GenericDataFormat[] = items.map((item: BasePayload) =>
          this.transformer.transform({
            ...response,
            data: item,
          })
        );

        const durationMs = Date.now() - startTime;
        this.logger.log(`[${requestId}] Data pull completed`, {
          itemsCount: transformedArray.length,
          durationMs,
        });

        return transformedArray;
      }

      const durationMs = Date.now() - startTime;
      this.logger.log(`[${requestId}] Data pull completed`, {
        itemsCount: 1,
        durationMs,
      });

      return [transformed];
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error(`[${requestId}] Data pull failed`, {
        error: error instanceof Error ? error.message : String(error),
        durationMs,
      });
      throw error;
    }
  }

  /**
   * Push data to API
   */
  async pushData(
    providerId: string,
    operation: string,
    data: GenericDataFormat | GenericDataFormat[]
  ): Promise<BasePayload[]> {
    const startTime = Date.now();
    const requestId = `sync-push-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const items = Array.isArray(data) ? data : [data];

    this.logger.log(`[${requestId}] Starting data push`, {
      providerId,
      operation,
      itemsCount: items.length,
    });

    try {
      const results: BasePayload[] = [];

      for (const item of items) {
        // Convert generic format back to provider-specific format
        const payload: BasePayload = this.convertToProviderFormat(item);

        const response = await this.router.execute(
          {
            id: `${requestId}-${item.id}`,
            capability: IntegrationCapability.UPLOAD,
            operation,
            payload,
          },
          [providerId]
        );

        results.push(response.data);
      }

      const durationMs = Date.now() - startTime;
      this.logger.log(`[${requestId}] Data push completed`, {
        itemsCount: items.length,
        durationMs,
      });

      return results;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error(`[${requestId}] Data push failed`, {
        error: error instanceof Error ? error.message : String(error),
        durationMs,
      });
      throw error;
    }
  }

  /**
   * Incremental sync (pull only new/updated items)
   */
  async incrementalSync(config: SyncConfig): Promise<SyncResult> {
    const startTime = new Date();
    const key = `${config.providerId}:${config.operation}`;
    const storedConfig = this.syncConfigs.get(key) || config;

    this.logger.log(`Starting incremental sync: ${key}`, {
      lastSyncAt: storedConfig.lastSyncAt,
    });

    try {
      // Pull data since last sync
      const pullOptions: {
        since?: Date;
        limit?: number;
        filters?: Record<string, string | number | boolean>;
      } = {
        limit: config.batchSize || 100,
      };
      if (storedConfig.lastSyncAt !== undefined) {
        pullOptions.since = storedConfig.lastSyncAt;
      }
      if (config.filters !== undefined) {
        pullOptions.filters = config.filters;
      }
      const data = await this.pullData(config.providerId, config.operation, pullOptions);

      // Process data (save to database, transform, etc.)
      const result = await this.processSyncData(data, config);

      // Update last sync time
      storedConfig.lastSyncAt = new Date();
      this.syncConfigs.set(key, storedConfig);

      const durationMs = Date.now() - startTime.getTime();

      const syncResult: SyncResult = {
        providerId: config.providerId,
        operation: config.operation,
        status: result.errors && result.errors.length > 0 ? 'partial' : 'success',
        itemsProcessed: data.length,
        itemsCreated: result.created,
        itemsUpdated: result.updated,
        itemsFailed: result.failed,
        startedAt: startTime,
        completedAt: new Date(),
        durationMs,
      };
      if (result.errors !== undefined && result.errors.length > 0) {
        syncResult.errors = result.errors;
      }
      const nextSync = this.calculateNextSync(storedConfig.schedule);
      if (nextSync !== undefined) {
        syncResult.nextSyncAt = nextSync;
      }
      return syncResult;
    } catch (error) {
      const durationMs = Date.now() - startTime.getTime();
      this.logger.error(`Incremental sync failed: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        providerId: config.providerId,
        operation: config.operation,
        status: 'failed',
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        itemsFailed: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        startedAt: startTime,
        completedAt: new Date(),
        durationMs,
      };
    }
  }

  /**
   * Full sync (pull all data)
   */
  async fullSync(config: SyncConfig): Promise<SyncResult> {
    const startTime = new Date();
    const key = `${config.providerId}:${config.operation}`;

    this.logger.log(`Starting full sync: ${key}`);

    try {
      // Pull all data
      const data = await this.pullData(config.providerId, config.operation, {
        limit: config.batchSize || 1000,
        filters: config.filters,
      });

      // Process data
      const result = await this.processSyncData(data, config);

      const durationMs = Date.now() - startTime.getTime();

      const syncResult: SyncResult = {
        providerId: config.providerId,
        operation: config.operation,
        status: result.errors && result.errors.length > 0 ? 'partial' : 'success',
        itemsProcessed: data.length,
        itemsCreated: result.created,
        itemsUpdated: result.updated,
        itemsFailed: result.failed,
        startedAt: startTime,
        completedAt: new Date(),
        durationMs,
      };
      if (result.errors !== undefined && result.errors.length > 0) {
        syncResult.errors = result.errors;
      }
      return syncResult;
    } catch (error) {
      const durationMs = Date.now() - startTime.getTime();
      this.logger.error(`Full sync failed: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        providerId: config.providerId,
        operation: config.operation,
        status: 'failed',
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        itemsFailed: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        startedAt: startTime,
        completedAt: new Date(),
        durationMs,
      };
    }
  }

  /**
   * Process synced data (save to database, etc.)
   * This is a placeholder - should be implemented based on your data storage needs
   */
  private async processSyncData(
    data: GenericDataFormat[],
    config: SyncConfig
  ): Promise<{ created: number; updated: number; failed: number; errors?: string[] }> {
    // TODO: Implement actual data processing
    // - Save to database
    // - Update existing records
    // - Handle duplicates
    // - Track sync status

    this.logger.log(`Processing ${data.length} items for ${config.providerId}:${config.operation}`);

    // Placeholder implementation
    return {
      created: data.length,
      updated: 0,
      failed: 0,
    };
  }

  /**
   * Convert generic format to provider-specific format
   */
  private convertToProviderFormat(data: GenericDataFormat): BasePayload {
    // Use raw data if available, otherwise reconstruct from generic format
    if (data.raw && isBasePayload(data.raw)) {
      return data.raw;
    }

    // Reconstruct provider-specific format
    const metrics = isBasePayload(data.metrics) ? data.metrics : {};
    const metadata = isBasePayload(data.metadata) ? data.metadata : {};
    return {
      ...metrics,
      ...metadata,
      title: data.title,
      description: data.description,
      url: data.url,
      thumbnail: data.thumbnail,
    };
  }

  /**
   * Calculate next sync time from cron expression
   */
  private calculateNextSync(schedule?: string): Date | undefined {
    if (!schedule) {
      return undefined;
    }

    // TODO: Implement cron parsing
    // For now, return next hour
    const next = new Date();
    next.setHours(next.getHours() + 1);
    return next;
  }

  /**
   * Get sync status
   */
  getSyncStatus(providerId: string, operation: string): SyncConfig | undefined {
    const key = `${providerId}:${operation}`;
    return this.syncConfigs.get(key);
  }

  /**
   * List all sync configurations
   */
  listSyncs(): SyncConfig[] {
    return Array.from(this.syncConfigs.values());
  }
}
