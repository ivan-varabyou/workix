import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtGuard, JwtPayload } from '@workix/domain/auth';

import { BatchItemData } from '../interfaces/batch-processing.interface';
import { BatchService } from '../services/batch.service';

@ApiTags('batch')
@Controller('batch')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class BatchController {
  constructor(private batchService: BatchService) {}

  @Post('jobs')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create batch job' })
  async createBatchJob(
    @CurrentUser() user: JwtPayload,
    @Body()
    dto: {
      name: string;
      processor: string;
      items: BatchItemData[];
      priority?: number;
    }
  ) {
    return this.batchService.createBatchJob(
      user.userId,
      dto.name,
      dto.processor,
      dto.items,
      dto.priority
    );
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get batch jobs for current user' })
  async getUserBatchJobs(@CurrentUser() user: JwtPayload) {
    return this.batchService.getUserBatchJobs(user.userId);
  }

  @Get('jobs/:jobId/items')
  @ApiOperation({ summary: 'Get batch items' })
  async getBatchItems(@Param('jobId') jobId: string) {
    return this.batchService.getBatchItems(jobId);
  }

  @Get('jobs/:jobId/stats')
  @ApiOperation({ summary: 'Get batch statistics' })
  async getBatchStatistics(@Param('jobId') jobId: string) {
    return this.batchService.getBatchStatistics(jobId);
  }

  @Post('jobs/:jobId/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel batch job' })
  async cancelBatchJob(@Param('jobId') jobId: string) {
    await this.batchService.cancelBatchJob(jobId);
    return { message: 'Batch job cancelled' };
  }

  @Post('jobs/:jobId/retry')
  @HttpCode(200)
  @ApiOperation({ summary: 'Retry failed items' })
  async retryFailedItems(@Param('jobId') jobId: string) {
    await this.batchService.retryFailedItems(jobId);
    return { message: 'Failed items queued for retry' };
  }
}
