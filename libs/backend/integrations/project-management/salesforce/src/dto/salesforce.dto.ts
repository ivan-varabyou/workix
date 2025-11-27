// Salesforce DTO interfaces

import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateIntegrationDto {
  @IsString()
  instanceUrl?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class QueryRecordsDto {
  @IsString()
  objectType?: string;

  @IsOptional()
  @IsString()
  query?: string;
}

export class CreateRecordDto {
  @IsString()
  objectType?: string;

  @IsObject()
  fields?: Record<string, string | number | boolean | null | undefined>;
}

export class UpdateRecordDto {
  @IsString()
  objectType?: string;

  @IsObject()
  fields?: Record<string, string | number | boolean | null | undefined>;
}

export class ExecuteFlowDto {
  @IsString()
  flowName?: string;

  @IsObject()
  input?: Record<string, string | number | boolean | null | undefined>;
}
