import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Query parameters for login history
 */
export class GetLoginHistoryQueryDto {
  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', description: 'Start date for filtering' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31T23:59:59Z', description: 'End date for filtering' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '192.168.1.1', description: 'Filter by IP address' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by success status' })
  @IsOptional()
  @Type((): typeof Boolean => Boolean)
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Page number (1-based)', minimum: 1, default: 1 })
  @IsOptional()
  @Type((): typeof Number => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type((): typeof Number => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

/**
 * Login history entry
 */
export class LoginHistoryEntryDto {
  @ApiProperty({ example: 'uuid-here' })
  id!: string;

  @ApiProperty({ example: 'login', description: 'Action type' })
  action!: string;

  @ApiProperty({ example: true, description: 'Whether login was successful' })
  success!: boolean;

  @ApiProperty({ example: '192.168.1.1' })
  ipAddress!: string | null;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  userAgent!: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: { reason: 'Invalid credentials' }, description: 'Additional details' })
  details!: Record<string, unknown> | null;
}

/**
 * Response for login history
 */
export class GetLoginHistoryResponseDto {
  @ApiProperty({ type: [LoginHistoryEntryDto] })
  entries!: LoginHistoryEntryDto[];

  @ApiProperty({ example: 50 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}
