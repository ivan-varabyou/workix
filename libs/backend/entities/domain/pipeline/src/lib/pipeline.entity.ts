/**
 * Pipeline Entity
 * Represents a pipeline in the system
 */
export class PipelineEntity {
  id!: string;
  userId!: string;
  name!: string;
  description?: string | null;
  config?: Record<string, unknown>;
  tags?: string[];
  category?: string | null;
  version!: number;
  isPublic!: boolean;
  isActive!: boolean;
  isTemplate!: boolean;
  executionCount!: number;
  lastExecutedAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;

  constructor(data: Partial<PipelineEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if pipeline is active
   */
  isActivePipeline(): boolean {
    return this.isActive && !this.deletedAt;
  }

  /**
   * Check if pipeline can be executed
   */
  canExecute(): boolean {
    return this.isActive && !this.deletedAt && !this.isTemplate;
  }
}
