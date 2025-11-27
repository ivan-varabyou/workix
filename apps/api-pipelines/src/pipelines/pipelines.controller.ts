import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtGuard } from '@workix/backend/domain/auth';
import { PipelineService } from '@workix/backend/domain/pipelines';

@Controller('pipelines')
@ApiTags('pipelines')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class PipelinesController {
  constructor(private pipelineService: PipelineService) {}

  @Get()
  @ApiOperation({ summary: 'Get user pipelines' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Pipelines retrieved' })
  async getUserPipelines(
    @CurrentUser('userId') userId: string,
    @Query('isActive') isActive?: boolean,
    @Query('category') category?: string
  ): Promise<unknown> {
    const filters: {
      isActive?: boolean;
      category?: string;
    } = {};
    if (isActive !== undefined) {
      filters.isActive = isActive;
    }
    if (category !== undefined) {
      filters.category = category;
    }
    return await this.pipelineService.findUserPipelines(userId, filters);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get pipeline templates' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Templates retrieved' })
  async getTemplates(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<{ templates: unknown[]; total: number }> {
    const filters: {
      category?: string;
      limit?: number;
      offset?: number;
    } = {};
    if (category !== undefined) {
      filters.category = category;
    }
    if (limit !== undefined) {
      filters.limit = Number(limit);
    }
    if (offset !== undefined) {
      filters.offset = Number(offset);
    }
    const [templates, total]: [unknown[], number] = await this.pipelineService.findTemplates(
      filters
    );
    return { templates, total };
  }

  @Get('marketplace/list')
  @ApiOperation({ summary: 'Get marketplace pipelines' })
  @ApiResponse({ status: 200, description: 'Marketplace pipelines retrieved' })
  async getMarketplacePipelines(
    @Query('category') category?: string
  ): Promise<{ pipelines: unknown[]; total: number }> {
    const filters: {
      category?: string;
    } = {};
    if (category !== undefined) {
      filters.category = category;
    }
    const [pipelines, total]: [unknown[], number] = await this.pipelineService.findPublic(filters);
    return { pipelines, total };
  }

  @Post('templates/:id/clone')
  @ApiOperation({ summary: 'Clone pipeline template' })
  @ApiParam({ name: 'id', type: 'string', description: 'Template ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'New pipeline name' },
        description: { type: 'string', description: 'New pipeline description' },
      },
    },
    required: false,
  })
  @ApiResponse({ status: 201, description: 'Pipeline cloned successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - template is not public' })
  async cloneTemplate(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() body?: { name?: string; description?: string }
  ): Promise<unknown> {
    const newName: string = body?.name || 'Cloned Pipeline';
    return await this.pipelineService.cloneTemplate(id, userId, newName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Pipeline found' })
  async getPipeline(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string
  ): Promise<unknown> {
    return await this.pipelineService.findByIdWithAccess(id, userId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish pipeline to marketplace' })
  @ApiParam({ name: 'id', type: 'string', description: 'Pipeline ID' })
  @ApiResponse({ status: 200, description: 'Pipeline published successfully' })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not pipeline owner' })
  async publishPipeline(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string
  ): Promise<unknown> {
    return await this.pipelineService.publish(id, userId);
  }
}
