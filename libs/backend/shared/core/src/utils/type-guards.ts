/**
 * Type Guards
 * Type-safe utilities for runtime type checking
 */

/**
 * Type guard to check if value is an object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if object has a specific property
 */
export function hasProperty(obj: unknown, prop: string): boolean {
  return isObject(obj) && prop in obj;
}

/**
 * Type guard to check if object has multiple properties
 */
export function hasProperties(obj: unknown, props: string[]): boolean {
  if (!isObject(obj)) return false;
  return props.every((prop: string) => prop in obj);
}

/**
 * Type guard to check if value is an instance of a class
 */
export function hasType<T>(value: unknown, type: new (...args: unknown[]) => T): value is T {
  return value instanceof type;
}

/**
 * Type guard to check if object has nested property
 */
export function hasNestedProperty(obj: unknown, path: string): boolean {
  if (!isObject(obj)) return false;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (!isObject(current) || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

/**
 * Type guard to check if Prisma client has a specific model
 */
export function hasPrismaModel(
  client: unknown,
  modelName: string
): client is Record<string, unknown> & {
  [key: string]: {
    findMany?: (args: unknown) => Promise<unknown[]>;
    findUnique?: (args: unknown) => Promise<unknown | null>;
    create?: (args: unknown) => Promise<unknown>;
    update?: (args: unknown) => Promise<unknown>;
    delete?: (args: unknown) => Promise<unknown>;
    count?: (args: unknown) => Promise<number>;
  };
} {
  if (!isObject(client)) return false;
  const model = client[modelName];
  if (!isObject(model)) return false;
  // Check if it has Prisma-like methods
  return (
    typeof model.findMany === 'function' ||
    typeof model.findUnique === 'function' ||
    typeof model.create === 'function' ||
    typeof model.update === 'function' ||
    typeof model.delete === 'function' ||
    typeof model.count === 'function'
  );
}

/**
 * Type guard specifically for auditLog model
 */
export function hasAuditLogModel(
  client: unknown
): client is Record<string, unknown> & {
  auditLog: {
    findMany: (args: unknown) => Promise<unknown[]>;
    count: (args: { where: unknown }) => Promise<number>;
  };
} {
  return hasPrismaModel(client, 'auditLog');
}
