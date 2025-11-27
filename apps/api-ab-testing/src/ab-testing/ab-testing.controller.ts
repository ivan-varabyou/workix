import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@workix/backend/domain/auth';
import {
  ABTest,
  ABTestConfig,
  ABTestingService,
  ABTestResultsResponse,
} from '@workix/backend/domain/ab-testing';

import { TrackEventDto } from './interfaces/ab-testing-dto.interface';

@ApiTags('ab-testing')
@Controller('ab-tests')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class ABTestingController {
  constructor(private abTestingService: ABTestingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new A/B test' })
  @ApiResponse({ status: 201, description: 'A/B test created successfully' })
  async createTest(@Body() config: ABTestConfig): Promise<ABTest> {
    return this.abTestingService.createTest(config);
  }

  @Get()
  @ApiOperation({ summary: 'List all A/B tests' })
  @ApiResponse({ status: 200, description: 'List of A/B tests' })
  async listTests(@Query('status') status?: string): Promise<ABTest[]> {
    return this.abTestingService.listTests(status);
  }

  @Get(':testId')
  @ApiOperation({ summary: 'Get A/B test details' })
  @ApiResponse({ status: 200, description: 'A/B test details' })
  async getTest(@Param('testId') testId: string): Promise<ABTest> {
    return this.abTestingService.getTest(testId);
  }

  @Post(':testId/track')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track an event for a variant' })
  @ApiResponse({ status: 204, description: 'Event tracked successfully' })
  async trackEvent(@Param('testId') testId: string, @Body() body: TrackEventDto): Promise<void> {
    return this.abTestingService.trackEvent(testId, body.variantId, body.event, body.metadata);
  }

  @Get(':testId/results')
  @ApiOperation({ summary: 'Get A/B test results' })
  @ApiResponse({ status: 200, description: 'A/B test results' })
  async getResults(@Param('testId') testId: string): Promise<ABTestResultsResponse> {
    return this.abTestingService.getResults(testId);
  }

  @Put(':testId/end')
  @ApiOperation({ summary: 'End an A/B test' })
  @ApiResponse({ status: 200, description: 'A/B test ended successfully' })
  async endTest(@Param('testId') testId: string): Promise<ABTestResultsResponse> {
    return this.abTestingService.endTest(testId);
  }

  @Put(':testId/pause')
  @ApiOperation({ summary: 'Pause an A/B test' })
  @ApiResponse({ status: 200, description: 'A/B test paused successfully' })
  async pauseTest(@Param('testId') testId: string): Promise<ABTest> {
    return this.abTestingService.pauseTest(testId);
  }

  @Put(':testId/resume')
  @ApiOperation({ summary: 'Resume an A/B test' })
  @ApiResponse({ status: 200, description: 'A/B test resumed successfully' })
  async resumeTest(@Param('testId') testId: string): Promise<ABTest> {
    return this.abTestingService.resumeTest(testId);
  }
}
