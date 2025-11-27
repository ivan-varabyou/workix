/**
 * Data Validation Interfaces
 * All interfaces for data validation module
 */

/**
 * Prisma Service interface for data validation
 * Note: This is a minimal interface. In production, it should match
 * the actual Prisma client methods used by this service.
 */
export interface DataValidationPrismaService {
  [key: string]: unknown;
}

/**
 * Validation Value Type
 * Can be any value that needs validation
 */
export type ValidationValue =
  | string
  | number
  | boolean
  | unknown[]
  | Record<string, unknown>
  | null
  | undefined;

/**
 * Custom Validation Function
 */
export type CustomValidator = (value: ValidationValue) => boolean;

/**
 * Validation Data
 * Generic data structure for validation
 */
export type ValidationData = Record<string, ValidationValue>;

/**
 * JSON Schema
 * Represents a JSON Schema object
 */
export type JsonSchema = Record<string, unknown>;

/**
 * Schema Metadata
 * Additional metadata for schemas
 */
export type SchemaMetadata = Record<string, unknown>;
