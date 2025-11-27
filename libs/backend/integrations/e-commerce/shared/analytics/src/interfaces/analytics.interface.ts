// Analytics service interfaces

import { BasePayload } from '../../../../../core/src/interfaces/integration-payload.interface';

export interface VideoPerformanceStats extends BasePayload {
  videoId: string;
  views?: number;
  watchTimeMinutes?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  subscribers?: number;
  ctr?: number;
  avgViewDuration?: number;
}

export interface RetentionDataPoint extends BasePayload {
  second: number;
  percentage: number;
}

export interface AudienceMetric extends BasePayload {
  hour: number;
  avgViews: number;
}

export interface VideoComparisonData extends BasePayload {
  videoId: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  ctr?: number;
  avgViewDuration?: number;
}

export interface RetentionDropPoint {
  second: number;
  dropPercentage: string;
  timeFormat: string;
}
