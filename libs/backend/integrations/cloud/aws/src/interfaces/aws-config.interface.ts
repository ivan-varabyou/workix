export interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export interface S3Config extends AWSConfig {
  bucket: string;
  baseUrl?: string;
}

export interface LambdaConfig extends AWSConfig {
  functionName?: string;
}

export interface EC2Config extends AWSConfig {
  vpcId?: string;
}

export interface RDSConfig extends AWSConfig {
  dbInstanceIdentifier?: string;
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  eTag: string;
  storageClass: string;
  owner?: {
    displayName: string;
    id: string;
  };
}

export interface LambdaFunction {
  functionName: string;
  functionArn: string;
  runtime: string;
  handler: string;
  codeSize: number;
  description?: string;
  timeout: number;
  memorySize: number;
  lastModified: string;
  codeSha256: string;
  version: string;
  state: string;
}

export interface EC2Instance {
  instanceId: string;
  state: string;
  imageId: string;
  instanceType: string;
  publicIpAddress?: string;
  privateIpAddress: string;
  launchTime: Date;
  tags?: Array<{ key: string; value: string }>;
}

export interface AWSIntegrationRecord {
  id: string;
  userId: string;
  region: string;
  services: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
