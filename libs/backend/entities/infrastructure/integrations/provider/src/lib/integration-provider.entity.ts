/**
 * Integration Provider Entity
 * Represents an integration provider in the system
 */
export class IntegrationProviderEntity {
  id!: string;
  name!: string;
  type!: string;
  config!: Record<string, unknown>;
  credentials!: Record<string, unknown>;
  isActive!: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<IntegrationProviderEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if provider is active
   */
  isActiveProvider(): boolean {
    return this.isActive;
  }
}
