/**
 * AWS API Types
 *
 * Этот файл содержит типы из @aws-sdk/client-*
 * После установки пакетов эти типы будут импортироваться из библиотек
 */

// TODO: После установки @aws-sdk/client-s3, @aws-sdk/client-lambda, @aws-sdk/client-ec2 заменить на:
// import type {
//   S3Client,
//   PutObjectCommandOutput,
//   GetObjectCommandOutput,
//   ListObjectsV2CommandOutput,
// } from '@aws-sdk/client-s3';
// import type {
//   LambdaClient,
//   InvokeCommandOutput,
//   ListFunctionsCommandOutput,
//   CreateFunctionCommandOutput,
// } from '@aws-sdk/client-lambda';
// import type {
//   EC2Client,
//   DescribeInstancesCommandOutput,
//   RunInstancesCommandOutput,
//   TerminateInstancesCommandOutput,
// } from '@aws-sdk/client-ec2';

// Временные типы до установки пакетов
// После установки будут заменены на импорты из @aws-sdk

/**
 * S3 Types
 */
export interface S3Client {
  getObject: (params: { Bucket: string; Key: string }) => Promise<{ Body?: Buffer }>;
  putObject: (params: {
    Bucket: string;
    Key: string;
    Body: Buffer | string;
    ContentType?: string;
  }) => Promise<{ ETag?: string }>;
  listObjects: (params: { Bucket: string; Prefix?: string }) => Promise<{
    Contents?: Array<{ Key: string; Size: number; LastModified: Date; ETag: string }>;
  }>;
  deleteObject: (params: { Bucket: string; Key: string }) => Promise<void>;
  [key: string]: unknown;
}

export interface S3UploadResult {
  bucket?: string;
  key: string;
  eTag: string;
  location: string;
  versionId?: string;
  serverSideEncryption?: string;
  [key: string]: unknown;
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  eTag: string;
  storageClass?: string;
  owner?: {
    id: string;
    displayName: string;
  };
  [key: string]: unknown;
}

export interface S3Bucket {
  name: string;
  creationDate: Date;
  region?: string;
  [key: string]: unknown;
}

/**
 * Lambda Types
 */
export interface LambdaClient {
  invoke: (params: {
    FunctionName: string;
    Payload: string | Buffer;
  }) => Promise<{ StatusCode: number; Payload?: string }>;
  listFunctions: () => Promise<{
    Functions?: Array<{
      FunctionName: string;
      FunctionArn: string;
      Runtime: string;
      Handler: string;
      CodeSize: number;
      Timeout: number;
      MemorySize: number;
      LastModified: Date;
      State: string;
    }>;
  }>;
  createFunction: (params: {
    FunctionName: string;
    Runtime: string;
    Handler: string;
    Role: string;
    Code: { ZipFile?: Buffer; S3Bucket?: string; S3Key?: string };
  }) => Promise<{ FunctionName: string }>;
  [key: string]: unknown;
}

export interface LambdaInvocationResult {
  statusCode: number;
  body: {
    message: string;
    input: Record<string, unknown>;
  };
  executedAt: Date;
  requestId?: string;
  functionError?: string;
  logResult?: string;
  [key: string]: unknown;
}

export interface LambdaFunction {
  functionName: string;
  functionArn: string;
  runtime: string;
  handler: string;
  codeSize: number;
  timeout: number;
  memorySize: number;
  lastModified: Date;
  state: string;
  description?: string;
  role?: string;
  environment?: {
    variables?: Record<string, string>;
  };
  vpcConfig?: {
    subnetIds?: string[];
    securityGroupIds?: string[];
    vpcId?: string;
  };
  deadLetterConfig?: {
    targetArn?: string;
  };
  kmsKeyArn?: string;
  tracingConfig?: {
    mode?: string;
  };
  revisionId?: string;
  layers?: Array<{
    arn: string;
    codeSize?: number;
  }>;
  [key: string]: unknown;
}

export interface LambdaDeploymentResult {
  functionName: string;
  s3Location: string;
  deployedAt: Date;
  version?: string;
  codeSha256?: string;
  [key: string]: unknown;
}

export type LambdaPayload = Record<string, unknown>;

/**
 * EC2 Types
 */
export interface EC2Client {
  describeInstances: (params?: { InstanceIds?: string[] }) => Promise<{
    Reservations?: Array<{
      Instances?: Array<{
        InstanceId: string;
        State: { Name: string };
        ImageId: string;
        InstanceType: string;
        PublicIpAddress?: string;
        PrivateIpAddress?: string;
        LaunchTime: Date;
        Tags?: Array<{ Key: string; Value: string }>;
      }>;
    }>;
  }>;
  runInstances: (params: {
    ImageId: string;
    InstanceType: string;
    MinCount: number;
    MaxCount: number;
  }) => Promise<{ Instances?: Array<{ InstanceId: string }> }>;
  terminateInstances: (params: {
    InstanceIds: string[];
  }) => Promise<{ TerminatingInstances?: Array<{ InstanceId: string }> }>;
  [key: string]: unknown;
}

export interface EC2Instance {
  instanceId: string;
  state: string;
  imageId: string;
  instanceType: string;
  publicIpAddress?: string;
  privateIpAddress?: string;
  launchTime: Date;
  tags?: Array<{ key: string; value: string }>;
  vpcId?: string;
  subnetId?: string;
  securityGroups?: Array<{
    groupId: string;
    groupName: string;
  }>;
  keyName?: string;
  iamInstanceProfile?: {
    arn?: string;
    id?: string;
  };
  [key: string]: unknown;
}

/**
 * CloudWatch Types
 */
export interface CloudWatchMetric {
  namespace: string;
  metricName: string;
  datapoints: Array<{ timestamp: Date; value: number }>;
  dimensions?: Array<{
    name: string;
    value: string;
  }>;
  unit?: string;
  statistics?: {
    sampleCount?: number;
    sum?: number;
    minimum?: number;
    maximum?: number;
    average?: number;
  };
  [key: string]: unknown;
}

/**
 * AWS Account Info
 */
export interface AWSAccountInfo {
  region?: string;
  services: string[];
  isActive: boolean;
  accountId?: string;
  [key: string]: unknown;
}

export interface InfrastructureStatus {
  region: string;
  s3: { buckets: number; objects: number };
  lambda: { functions: number };
  ec2: { instances: number; running: number };
  [key: string]: unknown;
}

/**
 * Type guards for AWS API responses
 */
export function isS3UploadResult(data: unknown): data is S3UploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.key === 'string' && typeof obj.eTag === 'string' && typeof obj.location === 'string'
  );
}

export function isS3Object(data: unknown): data is S3Object {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.key === 'string' &&
    typeof obj.size === 'number' &&
    obj.lastModified instanceof Date &&
    typeof obj.eTag === 'string'
  );
}

export function isLambdaInvocationResult(data: unknown): data is LambdaInvocationResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.statusCode === 'number' &&
    typeof obj.body === 'object' &&
    obj.body !== null &&
    typeof (obj.body as Record<string, unknown>).message === 'string' &&
    obj.executedAt instanceof Date
  );
}

export function isLambdaFunction(data: unknown): data is LambdaFunction {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.functionName === 'string' &&
    typeof obj.functionArn === 'string' &&
    typeof obj.runtime === 'string' &&
    typeof obj.handler === 'string'
  );
}

export function isEC2Instance(data: unknown): data is EC2Instance {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.instanceId === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.imageId === 'string' &&
    typeof obj.instanceType === 'string' &&
    obj.launchTime instanceof Date
  );
}

export function isCloudWatchMetric(data: unknown): data is CloudWatchMetric {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.namespace === 'string' &&
    typeof obj.metricName === 'string' &&
    Array.isArray(obj.datapoints)
  );
}

export function isAWSAccountInfo(data: unknown): data is AWSAccountInfo {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return Array.isArray(obj.services) && typeof obj.isActive === 'boolean';
}
