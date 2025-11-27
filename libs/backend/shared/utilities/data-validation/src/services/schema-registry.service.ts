import { Injectable, Logger } from '@nestjs/common';
import * as Ajv from 'ajv';
import * as addFormats from 'ajv-formats';

import {
  JsonSchema,
  SchemaMetadata,
  ValidationData,
  ValidationValue,
} from '../interfaces/data-validation.interface';

/**
 * Schema Definition
 */
export interface SchemaDefinition {
  id: string;
  name: string;
  version: string;
  schema: JsonSchema; // JSON Schema
  description?: string;
  metadata?: SchemaMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Validation Error
 */
export interface ValidationError {
  path: string;
  message: string;
  data?: ValidationValue;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Schema Registry Service
 * Flexible schema registry для динамических сущностей с JSON Schema validation
 */
@Injectable()
export class SchemaRegistryService {
  private readonly logger = new Logger(SchemaRegistryService.name);
  private schemas: Map<string, SchemaDefinition> = new Map();
  private validators: Map<string, Ajv.ValidateFunction> = new Map();
  private ajv: Ajv.Ajv;

  constructor() {
    // Initialize AJV with formats support
    this.ajv = new Ajv.default({ allErrors: true, strict: false });
    addFormats.default(this.ajv);

    // Add custom keywords if needed
    this.ajv.addKeyword({
      keyword: 'x-workix-metadata',
      type: 'object',
    });
  }

  /**
   * Register schema
   */
  registerSchema(schema: SchemaDefinition): void {
    try {
      // Validate schema itself
      this.ajv.validateSchema(schema.schema);

      if (!this.ajv.errors || this.ajv.errors.length === 0) {
        // Compile validator
        const validate = this.ajv.compile(schema.schema);
        this.validators.set(schema.id, validate);
        this.schemas.set(schema.id, schema);

        this.logger.log(`Schema registered: ${schema.id} (${schema.name} v${schema.version})`);
      } else {
        throw new Error(`Invalid JSON Schema: ${JSON.stringify(this.ajv.errors)}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to register schema ${schema.id}:`, error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get schema by ID
   */
  getSchema(schemaId: string): SchemaDefinition | undefined {
    return this.schemas.get(schemaId);
  }

  /**
   * List all schemas
   */
  listSchemas(): SchemaDefinition[] {
    return Array.from(this.schemas.values());
  }

  /**
   * Validate data against schema
   */
  validate(schemaId: string, data: ValidationData): ValidationResult {
    const validator = this.validators.get(schemaId);

    if (!validator) {
      return {
        valid: false,
        errors: [
          {
            path: '',
            message: `Schema not found: ${schemaId}`,
          },
        ],
      };
    }

    const valid = validator(data);

    if (valid) {
      return { valid: true };
    }

    // Format errors
    const errors: ValidationError[] = (validator.errors || []).map((error) => {
      const validationError: ValidationError = {
        path: error.instancePath || error.schemaPath || '',
        message: error.message || 'Validation error',
      };
      if (error.data !== undefined) {
        validationError.data = error.data as ValidationValue;
      }
      return validationError;
    });

    return {
      valid: false,
      errors,
    };
  }

  /**
   * Validate data against schema definition
   */
  validateAgainstSchema(schema: JsonSchema, data: ValidationData): ValidationResult {
    try {
      const validate = this.ajv.compile(schema);
      const valid = validate(data);

      if (valid) {
        return { valid: true };
      }

      // Format errors
      const errors: ValidationError[] = (validate.errors || []).map((error) => {
        const validationError: ValidationError = {
          path: error.instancePath || error.schemaPath || '',
          message: error.message || 'Validation error',
        };
        if (error.data !== undefined) {
          validationError.data = error.data as ValidationValue;
        }
        return validationError;
      });

      return {
        valid: false,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            path: '',
            message: error instanceof Error ? error.message : String(error),
          },
        ],
      };
    }
  }

  /**
   * Update schema
   */
  updateSchema(schemaId: string, updates: Partial<SchemaDefinition>): SchemaDefinition | undefined {
    const existing = this.schemas.get(schemaId);

    if (!existing) {
      return undefined;
    }

    const updated: SchemaDefinition = {
      ...existing,
      ...updates,
      id: schemaId, // Prevent ID change
      updatedAt: new Date(),
    };

    // Re-compile validator if schema changed
    if (updates.schema) {
      try {
        this.ajv.validateSchema(updated.schema);

        if (!this.ajv.errors || this.ajv.errors.length === 0) {
          const validate = this.ajv.compile(updated.schema);
          this.validators.set(schemaId, validate);
        } else {
          throw new Error(`Invalid JSON Schema: ${JSON.stringify(this.ajv.errors)}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to update schema ${schemaId}:`, error);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    }

    this.schemas.set(schemaId, updated);
    this.logger.log(`Schema updated: ${schemaId}`);

    return updated;
  }

  /**
   * Delete schema
   */
  deleteSchema(schemaId: string): boolean {
    const deleted = this.schemas.delete(schemaId);
    this.validators.delete(schemaId);

    if (deleted) {
      this.logger.log(`Schema deleted: ${schemaId}`);
    }

    return deleted;
  }

  /**
   * Create schema from JSON Schema
   */
  createSchema(
    id: string,
    name: string,
    jsonSchema: JsonSchema,
    options?: {
      version?: string;
      description?: string;
      metadata?: SchemaMetadata;
    }
  ): SchemaDefinition {
    const schema: SchemaDefinition = {
      id,
      name,
      version: options?.version || '1.0.0',
      schema: jsonSchema,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (options?.description !== undefined) {
      schema.description = options.description;
    }
    if (options?.metadata !== undefined) {
      schema.metadata = options.metadata;
    }

    this.registerSchema(schema);

    return schema;
  }

  /**
   * Get validator function
   */
  getValidator(schemaId: string): Ajv.ValidateFunction | undefined {
    return this.validators.get(schemaId);
  }

  /**
   * Check if schema exists
   */
  hasSchema(schemaId: string): boolean {
    return this.schemas.has(schemaId);
  }

  /**
   * Get schema versions (if versioning is supported)
   */
  getSchemaVersions(schemaName: string): SchemaDefinition[] {
    return Array.from(this.schemas.values()).filter((s) => s.name === schemaName);
  }
}
