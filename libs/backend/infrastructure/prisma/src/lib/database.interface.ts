/**
 * Database Interface
 * Abstract interface for database operations
 */

import { PrismaClient } from '@prisma/client';

export interface IDatabaseService {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  getClient(): PrismaClient;
}

export interface IDatabaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
