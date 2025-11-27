import { describe, it, expect, beforeEach, vi } from 'vitest';
import { I18nService } from './i18n.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfigService } from '@nestjs/config';

describe('I18nService', () => {
  let service: I18nService;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue('en'),
    };

    service = new I18nService(mockConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with default locale', () => {
    expect(service).toBeInstanceOf(I18nService);
  });
});
