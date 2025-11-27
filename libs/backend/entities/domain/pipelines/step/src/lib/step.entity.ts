/**
 * Step Entity
 * Represents a pipeline step in the system
 */
export class StepEntity {
  id!: string;
  pipelineId!: string;
  name!: string;
  type!: string;
  order!: number;
  config!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<StepEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if step is valid
   */
  isValid(): boolean {
    return !!this.name && !!this.type && this.order >= 0;
  }
}
