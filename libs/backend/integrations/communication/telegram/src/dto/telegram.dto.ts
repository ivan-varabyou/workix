import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

import { BasePayload } from '../../../../core/src/interfaces/integration-payload.interface';

export class TelegramNotificationDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Message text' })
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Parse mode', required: false })
  @IsOptional()
  @IsString()
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export class TelegramApprovalDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Approval type' })
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Title' })
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: BasePayload;
}
