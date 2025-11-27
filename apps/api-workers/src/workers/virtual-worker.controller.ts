import {
  Body,
  Controller,
  Delete,
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
  Task,
  VirtualWorkerService,
  WorkerConfig,
  WorkerInstance,
  WorkerListItem,
  WorkerMetrics,
  WorkerState,
  WorkerStatus,
  WorkerType,
} from '@workix/backend/domain/workers';

import { isValidWorkerState, isValidWorkerType } from './interfaces/worker-type-guards.interface';

@ApiTags('workers')
@Controller('workers')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class VirtualWorkerController {
  constructor(private workerService: VirtualWorkerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new virtual worker' })
  @ApiResponse({ status: 201, description: 'Worker created successfully' })
  async createWorker(@Body() config: WorkerConfig): Promise<WorkerInstance> {
    return this.workerService.createWorker(config);
  }

  @Get()
  @ApiOperation({ summary: 'List all virtual workers' })
  @ApiResponse({ status: 200, description: 'List of workers' })
  async listWorkers(
    @Query('type') type?: string,
    @Query('state') state?: string
  ): Promise<WorkerListItem[]> {
    const workerType: WorkerType | undefined = type && isValidWorkerType(type) ? type : undefined;
    const workerState: WorkerState | undefined =
      state && isValidWorkerState(state) ? state : undefined;
    return this.workerService.listWorkers(workerType, workerState);
  }

  @Get(':workerId')
  @ApiOperation({ summary: 'Get worker details' })
  @ApiResponse({ status: 200, description: 'Worker details' })
  async getWorker(
    @Param('workerId') workerId: string
  ): Promise<WorkerInstance & { queuedTasks: number }> {
    return this.workerService.getWorker(workerId);
  }

  @Put(':workerId')
  @ApiOperation({ summary: 'Update worker configuration' })
  @ApiResponse({ status: 200, description: 'Worker updated successfully' })
  async updateWorker(
    @Param('workerId') workerId: string,
    @Body() config: Partial<WorkerConfig>
  ): Promise<WorkerInstance> {
    return this.workerService.updateWorker(workerId, config);
  }

  @Delete(':workerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a virtual worker' })
  @ApiResponse({ status: 204, description: 'Worker deleted successfully' })
  async deleteWorker(@Param('workerId') workerId: string): Promise<void> {
    return this.workerService.deleteWorker(workerId);
  }

  @Post(':workerId/tasks')
  @ApiOperation({ summary: 'Assign a task to a worker' })
  @ApiResponse({ status: 201, description: 'Task assigned successfully' })
  async assignTask(@Param('workerId') workerId: string, @Body() task: Task): Promise<Task> {
    return this.workerService.assignTask(workerId, task);
  }

  @Get(':workerId/tasks')
  @ApiOperation({ summary: 'Get worker tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  async getWorkerTasks(
    @Param('workerId') workerId: string,
    @Query('status') status?: string
  ): Promise<Task[]> {
    return this.workerService.getWorkerTasks(workerId, status);
  }

  @Get(':workerId/tasks/:taskId')
  @ApiOperation({ summary: 'Get task details' })
  @ApiResponse({ status: 200, description: 'Task details' })
  async getTask(
    @Param('workerId') workerId: string,
    @Param('taskId') taskId: string
  ): Promise<Task> {
    return this.workerService.getTask(workerId, taskId);
  }

  @Put(':workerId/tasks/:taskId/cancel')
  @ApiOperation({ summary: 'Cancel a task' })
  @ApiResponse({ status: 200, description: 'Task cancelled successfully' })
  async cancelTask(
    @Param('workerId') workerId: string,
    @Param('taskId') taskId: string
  ): Promise<Task> {
    return this.workerService.cancelTask(workerId, taskId);
  }

  @Get(':workerId/status')
  @ApiOperation({ summary: 'Get worker status and metrics' })
  @ApiResponse({ status: 200, description: 'Worker status' })
  async getWorkerStatus(@Param('workerId') workerId: string): Promise<WorkerStatus> {
    return this.workerService.getWorkerStatus(workerId);
  }

  @Put(':workerId/pause')
  @ApiOperation({ summary: 'Pause a worker' })
  @ApiResponse({ status: 200, description: 'Worker paused successfully' })
  async pauseWorker(@Param('workerId') workerId: string): Promise<WorkerInstance> {
    return this.workerService.pauseWorker(workerId);
  }

  @Put(':workerId/resume')
  @ApiOperation({ summary: 'Resume a worker' })
  @ApiResponse({ status: 200, description: 'Worker resumed successfully' })
  async resumeWorker(@Param('workerId') workerId: string): Promise<WorkerInstance> {
    return this.workerService.resumeWorker(workerId);
  }

  @Get(':workerId/metrics')
  @ApiOperation({ summary: 'Get worker performance metrics' })
  @ApiResponse({ status: 200, description: 'Worker metrics' })
  async getWorkerMetrics(@Param('workerId') workerId: string): Promise<WorkerMetrics> {
    return this.workerService.getWorkerMetrics(workerId);
  }
}
