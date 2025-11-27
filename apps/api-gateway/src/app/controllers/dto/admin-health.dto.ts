import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckStatusDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok' | 'degraded' | 'down';

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 'api-gateway' })
  service!: string;

  @ApiProperty({ example: 'admin' })
  component!: string;
}

export class DatabaseHealthDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok' | 'error';

  @ApiProperty({ example: 10 })
  responseTimeMs?: number;

  @ApiProperty({ example: 'Connected' })
  message?: string;
}

export class RedisHealthDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok' | 'error' | 'not_configured';

  @ApiProperty({ example: 5 })
  responseTimeMs?: number;

  @ApiProperty({ example: 'Connected' })
  message?: string;
}

export class JwtHealthDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok' | 'error';

  @ApiProperty({ example: 'JWT secret is configured' })
  message?: string;
}

export class AdminHealthCheckResponseDto {
  @ApiProperty({ type: HealthCheckStatusDto })
  overall!: HealthCheckStatusDto;

  @ApiProperty({ type: DatabaseHealthDto })
  database!: DatabaseHealthDto;

  @ApiProperty({ type: RedisHealthDto })
  redis!: RedisHealthDto;

  @ApiProperty({ type: JwtHealthDto })
  jwt!: JwtHealthDto;

  @ApiProperty({ example: { version: '1.0.0' } })
  metadata?: Record<string, unknown>;
}
