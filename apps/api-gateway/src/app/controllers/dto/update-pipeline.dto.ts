import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdatePipelineDto {
  @ApiProperty({
    description: 'Pipeline name',
    example: 'Updated Pipeline Name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Pipeline description',
    example: 'Updated description',
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
  graph?: Record<string, any>;

  @ApiProperty({
    description: 'Whether pipeline is public',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
