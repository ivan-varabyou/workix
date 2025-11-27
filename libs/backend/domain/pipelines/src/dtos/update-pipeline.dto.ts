import { IsArray, IsBoolean, IsObject, IsOptional, IsString, Length } from 'class-validator';

import { PipelineGraphConfig } from '../types/pipeline-graph';

export class UpdatePipelineDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsObject()
  config?: PipelineGraphConfig;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  category?: string;
}
