import { describe, it, expect, beforeEach } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { vi } from 'vitest';
import { AwsService } from './aws.service';

describe('AwsService', () => {
  let service: AwsService;
  let mockS3Config: any;
  let mockLambdaConfig: any;
  let mockEC2Config: any;

  beforeEach(() => {
    mockS3Config = {
      bucket: 'test-bucket',
      baseUrl: 'https://s3.amazonaws.com',
    };
    mockLambdaConfig = {};
    mockEC2Config = {};

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Test file allows any types
    service = new AwsService(mockS3Config, mockLambdaConfig, mockEC2Config);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with config', () => {
    expect(service).toBeInstanceOf(AwsService);
  });
});
