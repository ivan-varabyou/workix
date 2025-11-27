import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePipelineDto {
  @ApiProperty({
    description: 'Pipeline name',
    example: 'My Pipeline',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  name = '';

  @ApiProperty({
    description: 'Pipeline description',
    example: 'A pipeline for automating tasks',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Pipeline graph (nodes and edges)',
    example: { nodes: [], edges: [] },
    required: false,
  })
  @IsOptional()
  @IsObject()
  graph?: Record<string, unknown>;

  @ApiProperty({
    description: 'Whether pipeline is public',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
