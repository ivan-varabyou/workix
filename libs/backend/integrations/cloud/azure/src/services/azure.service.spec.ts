import { describe, it, expect, beforeEach } from 'vitest';
import { AzureService } from './azure.service';

describe('AzureService', () => {
  let service: AzureService;

  beforeEach(() => {
    service = new AzureService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload to blob', async () => {
    const result = await service.uploadToBlob('container', 'blob', Buffer.from('test'));
    expect(result).toHaveProperty('container', 'container');
    expect(result).toHaveProperty('blob', 'blob');
  });
});
