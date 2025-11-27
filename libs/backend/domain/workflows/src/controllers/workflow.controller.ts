import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtGuard } from '@workix/backend/domain/auth';

import { CurrentUser as CurrentUserType } from '../interfaces/user.interface';
import {
  CreateWorkflowDto,
  ExecuteWorkflowDto,
  UpdateWorkflowDto,
} from '../interfaces/workflow-dto.interface';
import { WorkflowService } from '../services/workflow.service';

@ApiTags('workflows')
@Controller('workflows')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new workflow' })
  async createWorkflow(@CurrentUser() user: CurrentUserType, @Body() dto: CreateWorkflowDto) {
    return this.workflowService.createWorkflow(
      user.userId,
      dto.name,
      dto.description,
      dto.steps,
      dto.triggers
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all workflows for current user' })
  async getUserWorkflows(@CurrentUser() user: CurrentUserType) {
    return this.workflowService.getUserWorkflows(user.userId);
  }

  @Post(':workflowId/execute')
  @HttpCode(202)
  @ApiOperation({ summary: 'Execute workflow' })
  async executeWorkflow(@Param('workflowId') workflowId: string, @Body() dto: ExecuteWorkflowDto) {
    return this.workflowService.executeWorkflow(workflowId, dto.input);
  }

  @Get(':workflowId/executions')
  @ApiOperation({ summary: 'Get workflow executions' })
  async getWorkflowExecutions(@Param('workflowId') workflowId: string, @Query('limit') limit = 50) {
    return this.workflowService.getWorkflowExecutions(workflowId, limit);
  }

  @Put(':workflowId')
  @ApiOperation({ summary: 'Update workflow' })
  async updateWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() updates: UpdateWorkflowDto
  ) {
    return this.workflowService.updateWorkflow(workflowId, updates);
  }

  @Delete(':workflowId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete workflow' })
  async deleteWorkflow(@Param('workflowId') workflowId: string) {
    return this.workflowService.deleteWorkflow(workflowId);
  }
}
