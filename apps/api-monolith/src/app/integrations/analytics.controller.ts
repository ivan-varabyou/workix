import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@workix/domain/auth';

import { AnalyzeDto, CompareDto, PredictDto, RetentionDto } from './dto/analytics.dto';

@ApiTags('analytics')
@Controller('analytics/universal')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class AnalyticsController {
  constructor() {}

  @Post('analyze')
  async analyze(@Body() body: AnalyzeDto) {
    const order =
      body.providerOrder && body.providerOrder.length ? body.providerOrder : ['youtube'];
    // TODO: Implement analytics using IntegrationRouter
    return {
      message: 'Analytics endpoint - to be implemented',
      order,
      stats: body.stats,
    };
  }

  @Post('retention')
  async retention(@Body() body: RetentionDto) {
    const order =
      body.providerOrder && body.providerOrder.length ? body.providerOrder : ['youtube'];
    // TODO: Implement retention analysis using IntegrationRouter
    return {
      message: 'Retention endpoint - to be implemented',
      order,
      retentionData: body.retentionData,
    };
  }

  @Post('predict')
  async predict(@Body() body: PredictDto) {
    const order =
      body.providerOrder && body.providerOrder.length ? body.providerOrder : ['youtube'];
    // TODO: Implement prediction using IntegrationRouter
    return {
      message: 'Predict endpoint - to be implemented',
      order,
      audienceMetrics: body.audienceMetrics,
    };
  }

  @Post('compare')
  async compare(@Body() body: CompareDto) {
    const order =
      body.providerOrder && body.providerOrder.length ? body.providerOrder : ['youtube'];
    // TODO: Implement comparison using IntegrationRouter
    return {
      message: 'Compare endpoint - to be implemented',
      order,
      video1: body.video1,
      video2: body.video2,
    };
  }
}
