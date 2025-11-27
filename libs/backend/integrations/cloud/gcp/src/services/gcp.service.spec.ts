import { describe, it, expect, beforeEach } from 'vitest';
import { GCPService } from './gcp.service';

describe('GCPService', () => {
  let service: GCPService;

  beforeEach(() => {
    service = new GCPService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload to cloud storage', async () => {
    const result = await service.uploadToCloudStorage('bucket', 'name', Buffer.from('test'));
    expect(result).toHaveProperty('bucket', 'bucket');
    expect(result).toHaveProperty('name', 'name');
  });
});
