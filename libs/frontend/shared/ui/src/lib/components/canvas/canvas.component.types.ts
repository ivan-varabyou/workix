/**
 * Types for Canvas component
 */

export interface CanvasStep {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  order?: number;
}

export interface CanvasConfig {
  width?: number;
  height?: number;
  showConnections?: boolean;
  showGrid?: boolean;
  gridSize?: number;
  stepSize?: { width: number; height: number };
}
