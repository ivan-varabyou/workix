import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateExecutionDto {
  @ApiProperty({
    description: 'Pipeline ID to execute',
    example: 'pipeline_123',
  })
  @IsString()
  pipelineId = '';

  @ApiProperty({
    description: 'Execution inputs (key-value pairs)',
    example: { input1: 'value1', input2: 'value2' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  inputs?: Record<string, unknown>;
}
