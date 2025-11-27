import { ApiProperty } from '@nestjs/swagger';

/**
 * Admin session information
 */
export class AdminSessionDto {
  @ApiProperty({ example: 'uuid-here' })
  id!: string;

  @ApiProperty({ example: '192.168.1.1' })
  ipAddress!: string | null;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  userAgent!: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T11:00:00Z' })
  expiresAt!: Date;

  @ApiProperty({ example: true, description: 'Whether this is the current session' })
  isCurrent!: boolean;
}

/**
 * Response for getting sessions
 */
export class GetSessionsResponseDto {
  @ApiProperty({ type: [AdminSessionDto] })
  sessions!: AdminSessionDto[];

  @ApiProperty({ example: 3 })
  total!: number;

  @ApiProperty({ example: 1 })
  currentSessionId!: string | null;
}

/**
 * Response for revoking session
 */
export class RevokeSessionResponseDto {
  @ApiProperty({ example: 'Session revoked successfully' })
  message!: string;
}

