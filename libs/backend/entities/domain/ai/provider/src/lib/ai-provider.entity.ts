/**
 * AI Provider Entity
 * Represents an AI provider in the system
 */
export class AIProviderEntity {
  id!: string;
  providerId!: string;
  name!: string;
  capabilities!: string[];
  supportedLanguages!: string[] | null;
  isActive!: boolean;
  isPrimary!: boolean;
  apiEndpoint!: string | null;
  requestsPerMinute!: number | null;
  concurrentRequests!: number | null;

  constructor(data: Partial<AIProviderEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if provider is active
   */
  isActiveProvider(): boolean {
    return this.isActive;
  }

  /**
   * Check if provider is primary
   */
  isPrimaryProvider(): boolean {
    return this.isPrimary;
  }

  /**
   * Check if provider supports capability
   */
  supportsCapability(capability: string): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Check if provider supports language
   */
  supportsLanguage(language: string): boolean {
    if (!this.supportedLanguages) {
      return false;
    }
    return this.supportedLanguages.includes(language);
  }
}
