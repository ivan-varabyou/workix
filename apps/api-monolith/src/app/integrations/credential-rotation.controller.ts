import { Controller, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@workix/domain/auth';

import { CredentialRotationService } from './credential-rotation.service';

@ApiTags('integrations')
@Controller('integrations/credentials')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class CredentialRotationController {
  constructor(private rotationService: CredentialRotationService) {}

  @Post('rotate/all')
  @ApiOperation({ summary: 'Rotate all credentials for all providers' })
  @ApiResponse({
    status: 200,
    description: 'All credentials rotated successfully',
  })
  async rotateAll() {
    return this.rotationService.rotateAllCredentials();
  }

  @Post('rotate/provider/:providerId')
  @ApiOperation({ summary: 'Rotate all credentials for a specific provider' })
  @ApiResponse({
    status: 200,
    description: 'Provider credentials rotated successfully',
  })
  async rotateProvider(@Param('providerId') providerId: string) {
    return this.rotationService.rotateProviderCredentials(providerId);
  }

  @Post('rotate/expired')
  @ApiOperation({ summary: 'Rotate all expired credentials' })
  @ApiResponse({
    status: 200,
    description: 'Expired credentials rotated successfully',
  })
  async rotateExpired() {
    return this.rotationService.rotateExpiredCredentials();
  }

  @Post('rotate/expiring')
  @ApiOperation({
    summary: 'Rotate credentials expiring within specified days',
  })
  @ApiResponse({
    status: 200,
    description: 'Expiring credentials rotated successfully',
  })
  async rotateExpiring(@Query('days') days?: string) {
    const daysBeforeExpiry = days ? parseInt(days, 10) : 7;
    return this.rotationService.rotateExpiringCredentials(daysBeforeExpiry);
  }
}
