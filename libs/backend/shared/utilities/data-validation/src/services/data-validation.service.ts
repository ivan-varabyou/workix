import { Injectable, Logger } from '@nestjs/common';

import {
  CustomValidator,
  DataValidationPrismaService,
  ValidationData,
  ValidationValue,
} from '../interfaces/data-validation.interface';

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'date';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: CustomValidator;
}

export interface SchemaDefinition {
  name: string;
  rules: ValidationRule[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

@Injectable()
export class DataValidationService {
  private logger = new Logger(DataValidationService.name);
  private schemas: Map<string, SchemaDefinition> = new Map();

  constructor(_prisma: DataValidationPrismaService) {
    // Prisma service reserved for future use
    void _prisma;
  }

  /**
   * Register validation schema
   */
  async registerSchema(schema: SchemaDefinition): Promise<void> {
    this.schemas.set(schema.name, schema);
    this.logger.log(`Schema ${schema.name} registered`);
  }

  /**
   * Validate data against schema
   */
  async validate(schemaName: string, data: ValidationData): Promise<ValidationResult> {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`);
    }

    const errors: Array<{ field: string; message: string }> = [];

    for (const rule of schema.rules) {
      const value = data[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null)) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`,
        });
        continue;
      }

      if (value === undefined || value === null) {
        continue; // Optional field
      }

      // Check type
      if (!this.checkType(value, rule.type)) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must be of type ${rule.type}`,
        });
        continue;
      }

      // Check min/max
      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must be at least ${rule.min}`,
        });
      }

      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must be at most ${rule.max}`,
        });
      }

      // Check pattern
      if (rule.pattern && typeof value === 'string') {
        const regex = new RegExp(rule.pattern);
        if (!regex.test(value)) {
          errors.push({
            field: rule.field,
            message: `${rule.field} does not match pattern`,
          });
        }
      }

      // Check custom validator
      if (rule.custom && !rule.custom(value)) {
        errors.push({
          field: rule.field,
          message: `${rule.field} failed custom validation`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private checkType(value: ValidationValue, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && !Array.isArray(value) && value !== null;
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'url':
        try {
          if (typeof value === 'string') {
            new URL(value);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      case 'date':
        if (value instanceof Date) {
          return true;
        }
        if (typeof value === 'string') {
          return !isNaN(Date.parse(value));
        }
        return false;
      default:
        return true;
    }
  }

  /**
   * Get schema by name
   */
  async getSchema(schemaName: string): Promise<SchemaDefinition | null> {
    return this.schemas.get(schemaName) || null;
  }

  /**
   * List all schemas
   */
  async listSchemas(): Promise<SchemaDefinition[]> {
    return Array.from(this.schemas.values());
  }
}
