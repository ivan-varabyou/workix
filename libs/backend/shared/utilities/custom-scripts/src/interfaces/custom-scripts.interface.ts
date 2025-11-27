/**
 * Custom Scripts Interfaces
 * All interfaces for custom scripts module
 */

/**
 * Prisma Service interface for custom scripts
 * Note: This is a minimal interface. In production, it should match
 * the actual Prisma client methods used by this service.
 */
export interface CustomScriptsPrismaService {
  [key: string]: unknown;
}

/**
 * Script Environment Variables
 */
export type ScriptEnvironment = Record<string, string | number | boolean>;

/**
 * Script Input
 * Generic input data for script execution
 */
export type ScriptInput =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Script Output
 * Generic output data from script execution
 */
export type ScriptOutput =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Script with ID
 */
export interface ScriptWithId {
  id: string;
  name: string;
  language: 'javascript' | 'python' | 'typescript';
  code: string;
  timeout?: number;
  memoryLimit?: number;
  environment?: ScriptEnvironment;
}
