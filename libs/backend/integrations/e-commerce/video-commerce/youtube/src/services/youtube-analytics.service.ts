import { Injectable } from '@nestjs/common';

import { RetentionDropPoint } from '../../../../shared/analytics/src/interfaces/analytics.interface';

interface VideoMetrics {
  videoId: string;
  views: number;
  watchTimeMinutes: number;
  likes: number;
  comments: number;
  shares: number;
  subscribers: number;
  ctr: number;
  avgViewDuration: number;
}

@Injectable()
export class YouTubeAnalyticsService {
  constructor() {}

  /**
   * Calculate CTR (Click-Through Rate)
   */
  calculateCTR(impressions: number, clicks: number): number {
    if (impressions === 0) return 0;
    return (clicks / impressions) * 100;
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(likes: number, comments: number, shares: number, views: number): number {
    if (views === 0) return 0;
    return ((likes + comments + shares) / views) * 100;
  }

  /**
   * Calculate average view duration
   */
  calculateAvgViewDuration(totalWatchTimeMinutes: number, views: number): number {
    if (views === 0) return 0;
    return totalWatchTimeMinutes / views;
  }

  /**
   * Analyze video performance
   */
  async analyzeVideoPerformance(stats: VideoMetrics): Promise<{
    videoId: string;
    views: number;
    watchTimeHours: number;
    engagement: string;
    ctr: string;
    avgDuration: string;
    quality: number;
    recommendations: string[];
  }> {
    const engagement = this.calculateEngagementRate(
      stats.likes,
      stats.comments,
      stats.shares,
      stats.views
    );

    return {
      videoId: stats.videoId,
      views: stats.views,
      watchTimeHours: stats.watchTimeMinutes / 60,
      engagement: engagement.toFixed(2),
      ctr: stats.ctr.toFixed(2),
      avgDuration: stats.avgViewDuration.toFixed(1),
      quality: this.rateVideoQuality(stats),
      recommendations: this.generateRecommendations(stats, engagement),
    };
  }

  /**
   * Rate video quality (1-10)
   */
  private rateVideoQuality(stats: VideoMetrics): number {
    let score: 0 = 0;

    // Views: 0-3 points
    if (stats.views > 100000) score += 3;
    else if (stats.views > 10000) score += 2;
    else if (stats.views > 1000) score += 1;

    // Watch time: 0-3 points
    const avgDuration = stats.watchTimeMinutes / (stats.views || 1);
    if (avgDuration > 5) score += 3;
    else if (avgDuration > 3) score += 2;
    else if (avgDuration > 1) score += 1;

    // Engagement: 0-2 points
    const engagement = (stats.likes + stats.comments) / (stats.views || 1);
    if (engagement > 0.05) score += 2;
    else if (engagement > 0.02) score += 1;

    // CTR: 0-2 points
    if (stats.ctr > 5) score += 2;
    else if (stats.ctr > 2) score += 1;

    return Math.min(10, score);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(stats: VideoMetrics, engagement: number): string[] {
    const recommendations: string[] = [];

    if (stats.ctr < 2) {
      recommendations.push('Low CTR - Consider improving thumbnail and title');
    }

    if (stats.avgViewDuration < 3) {
      recommendations.push('Low watch time - Hook viewers in first 30 seconds');
    }

    if (engagement < 0.5) {
      recommendations.push('Low engagement - Add calls-to-action and encourage comments');
    }

    if (stats.subscribers === 0) {
      recommendations.push('No growth - Add subscriber button and links in description');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great performance! Keep up the good work!');
    }

    return recommendations;
  }

  /**
   * Analyze retention curve
   */
  async analyzeRetention(retentionData: { second: number; percentage: number }[]): Promise<{
    avgRetention: string;
    totalDropPoints: number;
    criticalPoints: RetentionDropPoint[];
    recommendations: string[];
  }> {
    const dropPoints: RetentionDropPoint[] = [];

    for (let i = 1; i < retentionData.length; i++) {
      const prev = retentionData[i - 1];
      const curr = retentionData[i];
      if (prev && curr) {
        const drop = prev.percentage - curr.percentage;
        if (drop > 5) {
          // Significant drop
          dropPoints.push({
            second: curr.second,
            dropPercentage: drop.toFixed(1),
            timeFormat: this.secondsToTime(curr.second),
          });
        }
      }
    }

    return {
      avgRetention: (
        retentionData.reduce((sum, d) => sum + d.percentage, 0) / retentionData.length
      ).toFixed(1),
      totalDropPoints: dropPoints.length,
      criticalPoints: dropPoints.filter((d) => Number(d.dropPercentage) > 10),
      recommendations: this.getRetentionRecommendations(dropPoints),
    };
  }

  /**
   * Get retention recommendations
   */
  private getRetentionRecommendations(dropPoints: RetentionDropPoint[]): string[] {
    const recs: string[] = [];

    if (dropPoints.length === 0) {
      recs.push('Excellent retention curve! Viewers are staying engaged.');
      return recs;
    }

    dropPoints.slice(0, 3).forEach((point) => {
      recs.push(`Drop at ${point.timeFormat} - Check what you were doing there`);
    });

    return recs;
  }

  /**
   * Predict optimal posting time
   */
  predictOptimalPostingTime(audienceMetrics: { hour: number; avgViews: number }[]): {
    hour: number;
    views: number;
    timeFormatted: string;
  } {
    if (audienceMetrics.length === 0) {
      throw new Error('No audience metrics provided');
    }

    let best = audienceMetrics[0];
    if (!best) {
      throw new Error('Invalid audience metrics');
    }

    for (const metric of audienceMetrics) {
      if (metric && metric.avgViews > best.avgViews) {
        best = metric;
      }
    }

    return {
      hour: best.hour,
      views: best.avgViews,
      timeFormatted: `${best.hour}:00 UTC`,
    };
  }

  /**
   * Compare video performance
   */
  compareVideos(
    video1: VideoMetrics,
    video2: VideoMetrics
  ): {
    winner: string;
    metrics: Record<string, string>;
  } {
    const ctr1 = video1.ctr;
    const ctr2 = video2.ctr;
    const engagement1 = (video1.likes + video1.comments) / (video1.views || 1);
    const engagement2 = (video2.likes + video2.comments) / (video2.views || 1);

    let video1Score: 0 = 0;
    let video2Score: 0 = 0;

    if (ctr1 > ctr2) video1Score++;
    else video2Score++;

    if (engagement1 > engagement2) video1Score++;
    else video2Score++;

    if (video1.avgViewDuration > video2.avgViewDuration) video1Score++;
    else video2Score++;

    return {
      winner: video1Score > video2Score ? video1.videoId : video2.videoId,
      metrics: {
        ctr1: ctr1.toFixed(2),
        ctr2: ctr2.toFixed(2),
        engagement1: (engagement1 * 100).toFixed(2),
        engagement2: (engagement2 * 100).toFixed(2),
        avgDuration1: video1.avgViewDuration.toFixed(1),
        avgDuration2: video2.avgViewDuration.toFixed(1),
      },
    };
  }

  /**
   * Format seconds to time string
   */
  private secondsToTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }
}
