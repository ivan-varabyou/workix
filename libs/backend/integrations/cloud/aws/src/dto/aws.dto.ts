import { BasePayload } from '@workix/integrations/core';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class AwsIntegrationDto {
  @IsString()
  region?: string;

  @IsArray()
  services?: string[];
}

export class S3UploadDto {
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  contentType?: string;
}

export class LambdaInvokeDto {
  @IsString()
  functionName?: string;

  @IsOptional()
  payload?: BasePayload;
}

export class LambdaDeployDto {
  @IsString()
  functionName?: string;

  @IsString()
  runtime?: string;

  @IsString()
  handler?: string;

  @IsNumber()
  memorySize?: number;

  @IsNumber()
  timeout?: number;
}

export class EC2ControlDto {
  @IsString()
  instanceId?: string;

  @IsString()
  action?: 'start' | 'stop' | 'reboot' | 'terminate';
}

export class AwsIntegrationResponseDto {
  id: string;
  userId: string;
  region: string;
  services: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    region: string,
    services: string[],
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.region = region;
    this.services = services;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
