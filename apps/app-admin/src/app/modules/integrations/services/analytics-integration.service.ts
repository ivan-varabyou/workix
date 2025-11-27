import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AnalyzeRetentionDto,
  AnalyzeVideoPerformanceDto,
  AudienceMetrics,
  CompareVideosDto,
  PostingTimePrediction,
  PredictPostingTimeDto,
  RetentionAnalysis,
  RetentionData,
  VideoComparison,
  VideoPerformanceAnalysis,
  VideoStats,
} from '../interfaces/analytics-integration.interface';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsIntegrationService {
  private readonly apiUrl: string = '/api/analytics/universal';

  constructor(private readonly http: HttpClient) {}

  analyzeVideoPerformance(
    providerOrder: string[],
    stats: VideoStats
  ): Observable<VideoPerformanceAnalysis> {
    const payload: AnalyzeVideoPerformanceDto = {
      providerOrder,
      stats,
    };
    return this.http.post<VideoPerformanceAnalysis>(`${this.apiUrl}/analyze`, payload);
  }

  analyzeRetention(
    providerOrder: string[],
    retentionData: RetentionData[]
  ): Observable<RetentionAnalysis> {
    const payload: AnalyzeRetentionDto = {
      providerOrder,
      retentionData,
    };
    return this.http.post<RetentionAnalysis>(`${this.apiUrl}/retention`, payload);
  }

  predictPostingTime(
    providerOrder: string[],
    audienceMetrics: AudienceMetrics[]
  ): Observable<PostingTimePrediction> {
    const payload: PredictPostingTimeDto = {
      providerOrder,
      audienceMetrics,
    };
    return this.http.post<PostingTimePrediction>(`${this.apiUrl}/predict`, payload);
  }

  compareVideos(
    providerOrder: string[],
    video1: VideoStats,
    video2: VideoStats
  ): Observable<VideoComparison> {
    const payload: CompareVideosDto = {
      providerOrder,
      video1,
      video2,
    };
    return this.http.post<VideoComparison>(`${this.apiUrl}/compare`, payload);
  }
}
