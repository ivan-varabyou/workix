import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PipelineService } from './pipeline.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: any;

  const mockPipeline = {
    id: 'pipe-1',
    userId: 'user-1',
    name: 'Test Pipeline',
    description: 'Test',
    config: { version: '1.0', name: 'Test', nodes: [], edges: [] },
    tags: ['test'],
    version: 1,
    isPublic: false,
    isActive: true,
    isTemplate: false,
    executionCount: 0,
    lastExecutedAt: null,
    category: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    prisma = {
      pipeline: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new PipelineService(prisma);
  });

  describe('create', () => {
    it('should create pipeline', async () => {
      const dto = { name: 'New Pipeline', isPublic: false };
      vi.mocked(prisma.pipeline.create).mockResolvedValue(mockPipeline);

      const result = await service.create('user-1', dto);

      expect(result).toEqual(mockPipeline);
      expect(prisma.pipeline.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          userId: 'user-1',
          tags: (dto as any).tags || [],
          version: 1,
          isPublic: false,
          isActive: true,
          isTemplate: false,
          executionCount: 0,
        },
      });
    });
  });

  describe('findUserPipelines', () => {
    it('should find user pipelines', async () => {
      const pipelines = [mockPipeline];
      vi.mocked(prisma.pipeline.findMany).mockResolvedValue(pipelines);
      vi.mocked(prisma.pipeline.count).mockResolvedValue(1);

      const [result, count] = await service.findUserPipelines('user-1');

      expect(result).toEqual(pipelines);
      expect(count).toBe(1);
      expect(prisma.pipeline.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by active status', async () => {
      vi.mocked(prisma.pipeline.findMany).mockResolvedValue([]);
      vi.mocked(prisma.pipeline.count).mockResolvedValue(0);

      await service.findUserPipelines('user-1', { isActive: false });

      expect(prisma.pipeline.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          deletedAt: null,
          isActive: false,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findPublic', () => {
    it('should find public pipelines', async () => {
      const pipelines = [{ ...mockPipeline, isPublic: true }];
      vi.mocked(prisma.pipeline.findMany).mockResolvedValue(pipelines);
      vi.mocked(prisma.pipeline.count).mockResolvedValue(1);

      const [result] = await service.findPublic();

      expect(result).toEqual(pipelines);
      expect(prisma.pipeline.findMany).toHaveBeenCalledWith({
        where: {
          isPublic: true,
          isActive: true,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should find pipeline by ID', async () => {
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(mockPipeline);

      const result = await service.findById('pipe-1');

      expect(result).toEqual(mockPipeline);
      expect(prisma.pipeline.findFirst).toHaveBeenCalledWith({
        where: { id: 'pipe-1', deletedAt: null },
      });
    });

    it('should throw if not found', async () => {
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIdWithAccess', () => {
    it('should allow owner to access own pipeline', async () => {
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(mockPipeline);

      const result = await service.findByIdWithAccess('pipe-1', 'user-1');

      expect(result).toEqual(mockPipeline);
    });

    it('should allow anyone to access public pipeline', async () => {
      const publicPipeline = { ...mockPipeline, isPublic: true };
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(publicPipeline);

      const result = await service.findByIdWithAccess('pipe-1', 'other-user');

      expect(result).toEqual(publicPipeline);
    });

    it('should deny access to private pipeline of other user', async () => {
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(mockPipeline);

      await expect(service.findByIdWithAccess('pipe-1', 'other-user')).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('update', () => {
    it('should update pipeline', async () => {
      const updates = { name: 'Updated' };
      const updated = { ...mockPipeline, ...updates };

      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(mockPipeline);
      vi.mocked(prisma.pipeline.update).mockResolvedValue(updated);

      const result = await service.update('pipe-1', 'user-1', updates);

      expect(result.name).toBe('Updated');
      expect(prisma.pipeline.update).toHaveBeenCalled();
    });

    it('should throw if not owner', async () => {
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(mockPipeline);

      await expect(service.update('pipe-1', 'other-user', {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should soft delete pipeline', async () => {
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(mockPipeline);
      vi.mocked(prisma.pipeline.update).mockResolvedValue({
        ...mockPipeline,
        deletedAt: new Date(),
      });

      await service.delete('pipe-1', 'user-1');

      expect(prisma.pipeline.update).toHaveBeenCalledWith({
        where: { id: 'pipe-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw if not owner', async () => {
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(mockPipeline);

      await expect(service.delete('pipe-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('publish', () => {
    it('should publish pipeline to marketplace', async () => {
      const published = { ...mockPipeline, isPublic: true };
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(mockPipeline);
      vi.mocked(prisma.pipeline.update).mockResolvedValue(published);

      const result = await service.publish('pipe-1', 'user-1');

      expect(result.isPublic).toBe(true);
      expect(prisma.pipeline.update).toHaveBeenCalledWith({
        where: { id: 'pipe-1' },
        data: { isPublic: true },
      });
    });
  });

  describe('cloneTemplate', () => {
    it('should clone template as new pipeline', async () => {
      const template = { ...mockPipeline, isTemplate: true };
      const cloned = {
        ...mockPipeline,
        id: 'pipe-2',
        userId: 'user-2',
        name: 'Cloned',
        isTemplate: false,
      };

      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(template);
      vi.mocked(prisma.pipeline.create).mockResolvedValue(cloned);

      const result = await service.cloneTemplate('pipe-1', 'user-2', 'Cloned');

      expect(result.userId).toBe('user-2');
      expect(result.isTemplate).toBe(false);
      expect(prisma.pipeline.create).toHaveBeenCalled();
    });

    it('should throw if not a template', async () => {
      vi.mocked(prisma.pipeline.findFirst).mockResolvedValue(mockPipeline);

      await expect(service.cloneTemplate('pipe-1', 'user-2', 'Cloned')).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('recordExecution', () => {
    it('should record pipeline execution', async () => {
      vi.mocked(prisma.pipeline.findUnique).mockResolvedValue(mockPipeline);
      vi.mocked(prisma.pipeline.update).mockResolvedValue({ ...mockPipeline, executionCount: 1 });

      await service.recordExecution('pipe-1');

      expect(prisma.pipeline.update).toHaveBeenCalledWith({
        where: { id: 'pipe-1' },
        data: {
          executionCount: 1,
          lastExecutedAt: expect.any(Date),
        },
      });
    });
  });

  describe('findTemplates', () => {
    it('should find pipeline templates', async () => {
      const templates = [{ ...mockPipeline, isTemplate: true }];
      vi.mocked(prisma.pipeline.findMany).mockResolvedValue(templates);
      vi.mocked(prisma.pipeline.count).mockResolvedValue(1);

      const [result] = await service.findTemplates();

      expect(result).toEqual(templates);
      expect(prisma.pipeline.findMany).toHaveBeenCalledWith({
        where: {
          isTemplate: true,
          isActive: true,
        },
        orderBy: [{ executionCount: 'desc' }, { createdAt: 'desc' }],
      });
    });
  });
});
