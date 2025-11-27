import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtGuard } from '@workix/backend/domain/auth';
import { ExecutionService } from '@workix/backend/domain/pipelines';

@Controller('executions')
@ApiTags('executions')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class ExecutionsController {
  constructor(private executionService: ExecutionService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get execution by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Execution ID' })
  @ApiResponse({ status: 200, description: 'Execution details' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async getExecution(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string
  ): Promise<unknown> {
    const execution: { userId: string } | null = await this.executionService.findById(id);

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    // Check if user has access to this execution
    if (execution.userId !== userId) {
      throw new NotFoundException('Execution not found');
    }

    return execution;
  }

  @Get()
  @ApiOperation({ summary: 'Get user executions' })
  @ApiQuery({
    name: 'pipelineId',
    required: false,
    type: String,
    description: 'Filter by pipeline ID',
  })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Executions retrieved' })
  async getUserExecutions(
    @CurrentUser('userId') userId: string,
    @Query('pipelineId') pipelineId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<{ executions: Array<{ pipelineId: string; status: string }>; total: number }> {
    const filters: {
      pipelineId?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {};
    if (pipelineId) {
      filters.pipelineId = pipelineId;
    }
    if (status) {
      filters.status = status;
    }
    if (limit !== undefined) {
      filters.limit = Number(limit);
    }
    if (offset !== undefined) {
      filters.offset = Number(offset);
    }
    // Use findByUserId with filters
    const [executions, total]: [Array<{ pipelineId: string; status: string }>, number] =
      await this.executionService.findByUserId(userId, {
        limit: filters.limit,
        offset: filters.offset,
      });

    // Filter by pipelineId and status if provided
    let filteredExecutions: Array<{ pipelineId: string; status: string }> = executions;
    if (filters.pipelineId) {
      filteredExecutions = filteredExecutions.filter(
        (e: { pipelineId: string }): boolean => e.pipelineId === filters.pipelineId
      );
    }
    if (filters.status) {
      filteredExecutions = filteredExecutions.filter(
        (e: { status: string }): boolean => e.status === filters.status
      );
    }

    return { executions: filteredExecutions, total };
  }
}
