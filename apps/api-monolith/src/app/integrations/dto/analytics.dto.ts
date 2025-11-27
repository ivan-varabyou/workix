import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class VideoStatsDto {
  @IsString()
  @IsNotEmpty()
  videoId = '';

  @IsNumber()
  @Min(0)
  views?: number;

  @IsNumber()
  @Min(0)
  likes?: number;

  @IsNumber()
  @Min(0)
  comments?: number;

  @IsNumber()
  @Min(0)
  shares?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  engagementRate?: number;

  @IsNumber()
  @Min(0)
  watchTime?: number;
}

export class AnalyzeDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  providerOrder?: string[];

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VideoStatsDto)
  stats = new VideoStatsDto();
}

export class RetentionDataPointDto {
  @IsString()
  @IsNotEmpty()
  timestamp = '';

  @IsNumber()
  @Min(0)
  @Max(100)
  retention = 0;

  @IsNumber()
  @Min(0)
  viewers = 0;
}

export class RetentionDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  providerOrder?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RetentionDataPointDto)
  retentionData: RetentionDataPointDto[] = [];
}

export class AudienceMetricDto {
  @IsString()
  @IsNotEmpty()
  metric = '';

  @IsNumber()
  value = 0;

  @IsString()
  @IsOptional()
  segment?: string;
}

export class PredictDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  providerOrder?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AudienceMetricDto)
  audienceMetrics: AudienceMetricDto[] = [];
}

export class CompareDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  providerOrder?: string[];

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VideoStatsDto)
  video1 = new VideoStatsDto();

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VideoStatsDto)
  video2 = new VideoStatsDto();
}
