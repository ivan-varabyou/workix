import { Injectable, Logger } from '@nestjs/common';
import {
  AICapability,
  AIRouter,
  TextGenerationRequest,
  TextGenerationResponse,
} from '@workix/ai/ai-core';

import { QualityScoreResult, QualityScoringContext } from '../interfaces/generation.interface';

// PrismaService will be injected via DI
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface -- Placeholder interface for future Prisma model integration
export interface PrismaService extends Record<string, never> {
  // Add Prisma models as needed
}

export interface QualityScore {
  overall: number; // 0-100
  readability: number;
  relevance: number;
  originality: number;
  grammar: number;
  engagement: number;
  metadata?: {
    wordCount?: number;
    sentenceCount?: number;
    avgSentenceLength?: number;
    readabilityLevel?: string;
  };
}

export interface QualityFeedback {
  contentId: string;
  userId?: string;
  rating: number; // 1-5
  feedback?: string;
  aspects?: {
    clarity?: number;
    usefulness?: number;
    accuracy?: number;
  };
}

@Injectable()
export class QualityScoringService {
  private readonly logger: Logger = new Logger(QualityScoringService.name);

  constructor(
    private router: AIRouter // private prisma: PrismaService, // TODO: Add when needed
  ) {}

  /**
   * Score content quality automatically
   */
  async scoreContent(
    content: string,
    contentType: 'text' | 'image' | 'video' = 'text',
    context?: QualityScoringContext
  ): Promise<QualityScoreResult> {
    const startTime: number = Date.now();
    const requestId: string = `quality-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${requestId}] Scoring content quality`, {
      contentType,
      contentLength: content.length,
    });

    try {
      // Use AI to analyze quality
      const prompt: string = this.buildQualityAnalysisPrompt(content, contentType, context);
      const request: TextGenerationRequest = {
        id: requestId,
        type: AICapability.TEXT_GENERATION,
        prompt,
        maxTokens: 500,
        temperature: 0.3,
        metadata: {
          contentType,
          context,
        },
      };

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Return type from executeWithFailover needs explicit cast
      const result: TextGenerationResponse = (await this.router.executeWithFailover(
        request,
        AICapability.TEXT_GENERATION,
        3
      )) as TextGenerationResponse;

      // Parse AI response (JSON format expected)
      interface AIScoreData {
        readability?: number;
        relevance?: number;
        originality?: number;
        grammar?: number;
        engagement?: number;
        score?: number;
        feedback?: string;
        suggestions?: string[];
      }
      let aiScore: AIScoreData = {};
      try {
        const responseText: string = result.content || '';
        const jsonMatch: RegExpMatchArray | null = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- JSON.parse result needs explicit cast to AIScoreData
          aiScore = JSON.parse(jsonMatch[0]) as AIScoreData;
        }
      } catch (_error: unknown) {
        this.logger.warn('Failed to parse AI quality score, using defaults');
      }

      // Calculate additional metrics
      const metrics: ReturnType<typeof this.calculateMetrics> = this.calculateMetrics(content);

      // Combine AI score with metrics
      const qualityScore: QualityScoreResult = {
        overall: this.calculateOverallScore(aiScore, metrics),
        criteria: {
          relevance: aiScore.relevance || 70,
          clarity: metrics.readability || 70,
          engagement: aiScore.engagement || 70,
          accuracy: aiScore.grammar || metrics.grammar || 80,
        },
        aiScore: {
          score: aiScore.score || this.calculateOverallScore(aiScore, metrics),
          feedback: aiScore.feedback || 'Quality analysis completed',
          suggestions: aiScore.suggestions || [],
        },
        recommendations: this.generateRecommendations(aiScore, metrics),
      };

      const latencyMs: number = Date.now() - startTime;
      this.logger.log(`[${requestId}] Quality score calculated`, {
        overall: qualityScore.overall,
        latencyMs,
      });

      return qualityScore;
    } catch (error) {
      const latencyMs: number = Date.now() - startTime;
      this.logger.error(`[${requestId}] Quality scoring failed`, {
        error: error instanceof Error ? error.message : String(error),
        latencyMs,
      });

      // Fallback to basic metrics
      const metrics: ReturnType<typeof this.calculateMetrics> = this.calculateMetrics(content);
      const fallbackScore: QualityScoreResult = {
        overall: 60,
        criteria: {
          relevance: 60,
          clarity: metrics.readability || 60,
          engagement: 60,
          accuracy: metrics.grammar || 70,
        },
        aiScore: {
          score: 60,
          feedback: 'Quality analysis failed, using basic metrics',
          suggestions: [],
        },
        recommendations: [],
      };
      return fallbackScore;
    }
  }

  /**
   * Build quality analysis prompt
   */
  private buildQualityAnalysisPrompt(
    content: string,
    contentType: 'text' | 'image' | 'video',
    context?: { task?: string; industry?: string }
  ): string {
    let prompt: string = `Analyze the quality of the following ${contentType} content and provide a JSON response with scores (0-100) for:\n`;
    prompt += `- readability: How easy is it to read/understand?\n`;
    prompt += `- relevance: How relevant is it to the task/context?\n`;
    prompt += `- originality: How original and unique is it?\n`;
    prompt += `- grammar: Grammar and language quality\n`;
    prompt += `- engagement: How engaging and interesting is it?\n\n`;

    if (context?.task) {
      prompt += `Task: ${context.task}\n`;
    }
    if (context?.industry) {
      prompt += `Industry: ${context.industry}\n`;
    }

    prompt += `\nContent:\n${content}\n\n`;
    prompt += `Respond with JSON only: {"readability": 85, "relevance": 90, "originality": 75, "grammar": 88, "engagement": 80}`;

    return prompt;
  }

  /**
   * Calculate basic text metrics
   */
  private calculateMetrics(text: string): QualityScore['metadata'] & {
    readability: number;
    grammar: number;
  } {
    const words: string[] = text.split(/\s+/).filter((w: string): boolean => w.length > 0);
    const sentences: string[] = text.split(/[.!?]+/).filter((s: string): boolean => s.trim().length > 0);
    const wordCount: number = words.length;
    const sentenceCount: number = sentences.length;
    const avgSentenceLength: number = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    // Simple readability score (Flesch-like)
    const avgWordsPerSentence: number = avgSentenceLength;
    const avgSyllablesPerWord: number = this.estimateSyllables(words);
    const readability: number = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Simple grammar check (basic heuristics)
    const grammar: number = this.checkBasicGrammar(text);

    let readabilityLevel: string = 'college';
    if (readability >= 90) readabilityLevel = 'very-easy';
    else if (readability >= 80) readabilityLevel = 'easy';
    else if (readability >= 70) readabilityLevel = 'fairly-easy';
    else if (readability >= 60) readabilityLevel = 'standard';
    else if (readability >= 50) readabilityLevel = 'fairly-difficult';
    else if (readability >= 30) readabilityLevel = 'difficult';
    else readabilityLevel = 'very-difficult';

    return {
      wordCount,
      sentenceCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      readabilityLevel,
      readability: Math.max(0, Math.min(100, Math.round(readability))),
      grammar,
    };
  }

  /**
   * Estimate syllables in words
   */
  private estimateSyllables(words: string[]): number {
    let totalSyllables: number = 0;
    for (const word of words) {
      const wordLower: string = word.toLowerCase();
      if (wordLower.length <= 3) {
        totalSyllables += 1;
      } else {
        const vowels: RegExpMatchArray | null = wordLower.match(/[aeiouy]+/g);
        totalSyllables += vowels ? vowels.length : 1;
      }
    }
    return words.length > 0 ? totalSyllables / words.length : 1;
  }

  /**
   * Basic grammar check
   */
  private checkBasicGrammar(text: string): number {
    let score: number = 100;

    // Check for double spaces
    if (text.includes('  ')) {
      score -= 5;
    }

    // Check for common mistakes
    const commonMistakes: RegExp[] = [
      /\bi\s+am\s+going\s+to\s+go\b/i, // redundant
      /\byour\s+you're/i, // confusion
      /\bit's\s+its/i, // confusion
    ];

    for (const mistake of commonMistakes) {
      if (mistake.test(text)) {
        score -= 10;
      }
    }

    // Check sentence capitalization
    const sentences: string[] = text.split(/[.!?]+/).filter((s: string): boolean => s.trim().length > 0);
    for (const sentence of sentences) {
      const trimmed: string = sentence.trim();
      if (trimmed.length > 0 && !/^[A-Z]/.test(trimmed)) {
        score -= 5;
        break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendations based on scores
   */
  private generateRecommendations(
    aiScore: {
      readability?: number;
      relevance?: number;
      originality?: number;
      grammar?: number;
      engagement?: number;
    },
    metrics: { readability: number; grammar: number }
  ): string[] {
    const recommendations: string[] = [];

    if ((aiScore.readability || metrics.readability) < 70) {
      recommendations.push('Improve readability by using shorter sentences and simpler words');
    }
    if ((aiScore.relevance || 70) < 70) {
      recommendations.push('Make content more relevant to the target audience');
    }
    if ((aiScore.grammar || metrics.grammar) < 80) {
      recommendations.push('Review grammar and fix errors');
    }
    if ((aiScore.engagement || 70) < 70) {
      recommendations.push('Add more engaging elements to capture attention');
    }

    return recommendations;
  }

  /**
   * Calculate overall score from components
   */
  private calculateOverallScore(
    aiScore: {
      readability?: number;
      relevance?: number;
      originality?: number;
      grammar?: number;
      engagement?: number;
    },
    metrics: { readability: number; grammar: number }
  ): number {
    const weights: {
      readability: number;
      relevance: number;
      originality: number;
      grammar: number;
      engagement: number;
    } = {
      readability: 0.2,
      relevance: 0.2,
      originality: 0.15,
      grammar: 0.2,
      engagement: 0.25,
    };

    const overall: number =
      (aiScore.readability || metrics.readability) * weights.readability +
      (aiScore.relevance || 70) * weights.relevance +
      (aiScore.originality || 70) * weights.originality +
      (aiScore.grammar || metrics.grammar) * weights.grammar +
      (aiScore.engagement || 70) * weights.engagement;

    return Math.round(overall);
  }

  /**
   * Submit user feedback for content
   */
  async submitFeedback(feedback: QualityFeedback): Promise<void> {
    try {
      // Store feedback in database (if table exists)
      // For now, just log it
      this.logger.log('User feedback submitted', {
        contentId: feedback.contentId,
        rating: feedback.rating,
        feedback: feedback.feedback,
      });

      // TODO: Store in database when feedback table is created
    } catch (error) {
      this.logger.error('Failed to submit feedback', error);
    }
  }

  /**
   * Get quality trends for content
   */
  async getQualityTrends(
    _contentId: string,
    _days: number = 30
  ): Promise<Array<{ date: Date; score: number }>> {
    // TODO: Implement when quality history table is created
    return [];
  }
}
