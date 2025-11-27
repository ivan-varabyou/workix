// Analytics Integration interfaces for admin app

export interface VideoStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime?: number;
  engagementRate?: number;
  [key: string]: unknown;
}

export interface RetentionData {
  second: number;
  percentage: number;
  provider?: string;
}

export interface AudienceMetrics {
  ageGroup?: string;
  gender?: string;
  location?: string;
  device?: string;
  watchTime?: number;
  [key: string]: unknown;
}

export interface VideoComparison {
  video1: VideoStats;
  video2: VideoStats;
  winner?: string;
  differences: Array<{
    metric: string;
    video1Value: number;
    video2Value: number;
    difference: number;
  }>;
}

export interface VideoPerformanceAnalysis {
  providerOrder: string[];
  recommendations: string[];
  insights: string[];
  bestProvider?: string;
}

export interface RetentionAnalysis {
  providerOrder: string[];
  bestRetentionProvider?: string;
  averageRetention: number;
  insights: string[];
}

export interface PostingTimePrediction {
  providerOrder: string[];
  bestTime?: string;
  predictedEngagement: number;
  recommendations: string[];
}

export interface AnalyzeVideoPerformanceDto {
  providerOrder: string[];
  stats: VideoStats;
}

export interface AnalyzeRetentionDto {
  providerOrder: string[];
  retentionData: RetentionData[];
}

export interface PredictPostingTimeDto {
  providerOrder: string[];
  audienceMetrics: AudienceMetrics[];
}

export interface CompareVideosDto {
  providerOrder: string[];
  video1: VideoStats;
  video2: VideoStats;
}
