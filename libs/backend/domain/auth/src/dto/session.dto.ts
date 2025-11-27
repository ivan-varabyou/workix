import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Create Session DTO
 */
export class CreateSessionDto {
  @ApiPropertyOptional({
    description: 'Device name',
    example: 'My MacBook Pro',
  })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({
    description: 'Device type',
    example: 'desktop',
  })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'IP address',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}

/**
 * Session Response DTO
 */
export class SessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
  })
  sessionId: string;

  @ApiProperty({
    description: 'User ID',
  })
  userId: string;

  @ApiProperty({
    description: 'Device name',
  })
  deviceName: string;

  @ApiProperty({
    description: 'Device type',
  })
  deviceType: string;

  @ApiProperty({
    description: 'Last activity time',
  })
  lastActivityAt: Date;

  @ApiProperty({
    description: 'Created at',
  })
  createdAt: Date;

  constructor(
    sessionId: string = '',
    userId: string = '',
    deviceName: string = '',
    deviceType: string = '',
    lastActivityAt: Date = new Date(),
    createdAt: Date = new Date()
  ) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.deviceName = deviceName;
    this.deviceType = deviceType;
    this.lastActivityAt = lastActivityAt;
    this.createdAt = createdAt;
  }
}

/**
 * Device Response DTO
 */
export class DeviceResponseDto {
  @ApiProperty({
    description: 'Device ID',
  })
  id: string;

  @ApiProperty({
    description: 'Device name',
  })
  deviceName: string;

  @ApiProperty({
    description: 'Device type',
  })
  deviceType: string;

  @ApiPropertyOptional({
    description: 'OS name',
  })
  osName?: string;

  @ApiPropertyOptional({
    description: 'Browser name',
  })
  browserName?: string;

  @ApiProperty({
    description: 'Last seen at',
  })
  lastSeenAt: Date;

  constructor(
    id: string = '',
    deviceName: string = '',
    deviceType: string = '',
    lastSeenAt: Date = new Date(),
    osName?: string,
    browserName?: string
  ) {
    this.id = id;
    this.deviceName = deviceName;
    this.deviceType = deviceType;
    this.lastSeenAt = lastSeenAt;
    if (osName !== undefined) {
      this.osName = osName;
    }
    if (browserName !== undefined) {
      this.browserName = browserName;
    }
  }
}

/**
 * Suspicious Activity DTO
 */
export class SuspiciousActivityDto {
  @ApiProperty({
    description: 'Whether activity is suspicious',
  })
  suspicious: boolean;

  @ApiPropertyOptional({
    description: 'Reason for suspicion',
  })
  reason?: string;

  constructor(suspicious: boolean = false, reason?: string) {
    this.suspicious = suspicious;
    if (reason !== undefined) {
      this.reason = reason;
    }
  }
}
