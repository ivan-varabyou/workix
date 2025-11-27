import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionService } from './execution.service';

describe('ExecutionService', () => {
  let service: ExecutionService;
  let prisma: any;

  const mockExecution = {
    id: 'exec-1',
    pipelineId: 'pipe-1',
    userId: 'user-1',
    status: 'pending',
    inputs: {},
    outputs: {},
    stepResults: {},
    error: null,
    durationMs: null,
    stepsExecuted: 0,
    stepsFailed: 0,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      execution: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new ExecutionService(prisma);
  });

  describe('create', () => {
    it('should create execution', async () => {
      vi.mocked(prisma.execution.create).mockResolvedValue(mockExecution);

      const result = await service.create('pipe-1', 'user-1', { data: 'test' });

      expect(result).toEqual(mockExecution);
      expect(prisma.execution.create).toHaveBeenCalledWith({
        data: {
          pipelineId: 'pipe-1',
          userId: 'user-1',
          inputs: { data: 'test' },
          status: 'pending',
          outputs: {},
          stepResults: {},
          stepsExecuted: 0,
          stepsFailed: 0,
          startedAt: expect.any(Date),
        },
      });
    });
  });

  describe('findById', () => {
    it('should find execution by ID', async () => {
      vi.mocked(prisma.execution.findUnique).mockResolvedValue(mockExecution);

      const result = await service.findById('exec-1');

      expect(result).toEqual(mockExecution);
      expect(prisma.execution.findUnique).toHaveBeenCalledWith({
        where: { id: 'exec-1' },
      });
    });

    it('should return null if not found', async () => {
      vi.mocked(prisma.execution.findUnique).mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find user executions', async () => {
      const executions = [mockExecution];
      vi.mocked(prisma.execution.findMany).mockResolvedValue(executions);
      vi.mocked(prisma.execution.count).mockResolvedValue(1);

      const [result, count] = await service.findByUserId('user-1');

      expect(result).toEqual(executions);
      expect(count).toBe(1);
      expect(prisma.execution.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should support pagination', async () => {
      vi.mocked(prisma.execution.findMany).mockResolvedValue([]);
      vi.mocked(prisma.execution.count).mockResolvedValue(0);

      await service.findByUserId('user-1', { limit: 10, offset: 20 });

      expect(prisma.execution.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 20,
      });
    });
  });

  describe('updateStatus', () => {
    it('should update status to running', async () => {
      const updated = { ...mockExecution, status: 'running' };
      vi.mocked(prisma.execution.findUnique).mockResolvedValue(mockExecution);
      vi.mocked(prisma.execution.update).mockResolvedValue(updated);

      const result = await service.updateStatus('exec-1', 'running');

      expect(result).toBeDefined();
      if (result) {
        expect(result.status).toBe('running');
      }
      expect(prisma.execution.update).toHaveBeenCalled();
    });

    it('should set completedAt and duration when completed', async () => {
      const completed = {
        ...mockExecution,
        status: 'success',
        completedAt: new Date(),
        durationMs: 1000,
      };
      vi.mocked(prisma.execution.findUnique).mockResolvedValue(mockExecution);
      vi.mocked(prisma.execution.update).mockResolvedValue(completed);

      const result = await service.updateStatus('exec-1', 'success');

      expect(result).toBeDefined();
      if (result) {
        expect(result.completedAt).toBeDefined();
        expect(result.durationMs).toBeDefined();
      }
    });

    it('should set error message on failure', async () => {
      const failed = { ...mockExecution, status: 'failed', error: 'Error occurred' };
      vi.mocked(prisma.execution.findUnique).mockResolvedValue(mockExecution);
      vi.mocked(prisma.execution.update).mockResolvedValue(failed);

      const result = await service.updateStatus('exec-1', 'failed', 'Error occurred');

      expect(result).toBeDefined();
      if (result) {
        expect(result.error).toBe('Error occurred');
      }
    });
  });

  describe('addStepResult', () => {
    it('should add step result', async () => {
      const updated = {
        ...mockExecution,
        stepsExecuted: 1,
        stepResults: { 'step-1': { data: 'result' } },
      };
      vi.mocked(prisma.execution.findUnique).mockResolvedValue(mockExecution);
      vi.mocked(prisma.execution.update).mockResolvedValue(updated);

      await service.addStepResult('exec-1', 'step-1', { data: 'result' });

      expect(prisma.execution.update).toHaveBeenCalled();
      const updateCall = vi.mocked(prisma.execution.update).mock.calls[0][0];
      expect(updateCall.data.stepsExecuted).toBe(1);
      expect(updateCall.data.stepResults['step-1']).toBeDefined();
    });

    it('should increment failed counter on error', async () => {
      const updated = {
        ...mockExecution,
        stepsFailed: 1,
        stepResults: { 'step-1': null },
      };
      vi.mocked(prisma.execution.findUnique).mockResolvedValue(mockExecution);
      vi.mocked(prisma.execution.update).mockResolvedValue(updated);

      await service.addStepResult('exec-1', 'step-1', null, 'Error');

      const updateCall = vi.mocked(prisma.execution.update).mock.calls[0][0];
      expect(updateCall.data.stepsFailed).toBe(1);
    });
  });

  describe('setOutputs', () => {
    it('should update execution outputs', async () => {
      const updated = { ...mockExecution, outputs: { result: 'data' } };
      vi.mocked(prisma.execution.findUnique).mockResolvedValue(mockExecution);
      vi.mocked(prisma.execution.update).mockResolvedValue(updated);

      await service.setOutputs('exec-1', { result: 'data' });

      expect(prisma.execution.update).toHaveBeenCalledWith({
        where: { id: 'exec-1' },
        data: { outputs: { result: 'data' } },
      });
    });
  });

  describe('getStats', () => {
    it('should calculate execution statistics', async () => {
      const executions = [
        { ...mockExecution, status: 'success', durationMs: 1000 },
        { ...mockExecution, status: 'success', durationMs: 2000 },
        { ...mockExecution, status: 'failed', durationMs: 500 },
      ];
      vi.mocked(prisma.execution.findMany).mockResolvedValue(executions);
      vi.mocked(prisma.execution.count).mockResolvedValue(3);

      const stats = await service.getStats('pipe-1');

      expect(stats.total).toBe(3);
      expect(stats.successful).toBe(2);
      expect(stats.failed).toBe(1);
      expect(stats.avgDuration).toBeGreaterThan(0);
    });
  });
});
