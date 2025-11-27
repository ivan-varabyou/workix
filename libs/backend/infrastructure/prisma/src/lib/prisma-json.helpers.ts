import { Prisma } from '@prisma/client';

/**
 * Type guard to check if a value is a valid Prisma InputJsonValue
 */
function isValidJsonValue(value: unknown): value is Prisma.InputJsonValue {
  if (value === null) {
    return true;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isValidJsonValue);
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isValidJsonValue);
  }
  return false;
}

/**
 * Converts a value to Prisma.InputJsonValue safely
 * Throws an error if the value cannot be converted
 */
export function toPrismaJsonValue(value: unknown): Prisma.InputJsonValue {
  if (isValidJsonValue(value)) {
    return value;
  }
  // For objects that might not be strictly valid, try JSON serialization
  try {
    const jsonString: string = JSON.stringify(value);
    const serialized: unknown = JSON.parse(jsonString);
    if (isValidJsonValue(serialized)) {
      return serialized;
    }
  } catch {
    // Fall through to error
  }
  throw new Error('Value cannot be converted to Prisma.InputJsonValue');
}

/**
 * Type guard to check if a value is a Record<string, unknown>
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Safely extracts a Record from Prisma JSON field
 */
export function extractRecordFromJson(json: unknown): Record<string, unknown> {
  if (isRecord(json)) {
    return json;
  }
  return {};
}
