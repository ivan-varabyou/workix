import { BasePayload } from '../../../core/src/interfaces/integration-payload.interface';

export interface VideoStats extends BasePayload {
  videoId: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  watchTime?: number;
  averageViewDuration?: number;
  retentionData?: RetentionDataPoint[];
  audienceMetrics?: AudienceMetric[];
}

export interface RetentionDataPoint extends BasePayload {
  second: number;
  percentage: number;
}

export interface RetentionDropPoint {
  second: number;
  dropPercentage: string;
  timeFormat: string;
}

export interface RetentionAnalysisResult {
  avgRetention: string;
  totalDropPoints: number;
  criticalPoints: RetentionDropPoint[];
  recommendations: string[];
}

export interface AudienceMetric extends BasePayload {
  hour?: number;
  dayOfWeek?: number;
  engagement?: number;
  views?: number;
  optimalTime?: string;
}

export interface PostingTimePrediction {
  optimalHours: number[];
  optimalDays: number[];
  predictedEngagement: number;
  recommendations: string[];
}

export interface VideoComparisonData extends BasePayload {
  videoId: string;
  title?: string;
  views?: number;
  likes?: number;
  comments?: number;
  watchTime?: number;
  retention?: RetentionDataPoint[];
}

export interface VideoPerformanceAnalysisResult extends BasePayload {
  videoId: string;
  views: number;
  watchTimeHours: number;
  engagement: string;
  ctr: string;
  avgDuration: string;
  quality: number;
  recommendations: string[];
}

export interface VideoComparisonResult extends BasePayload {
  winner: string;
  metrics: {
    ctr1: string;
    ctr2: string;
    engagement1: string;
    engagement2: string;
    avgDuration1: string;
    avgDuration2: string;
  };
}
