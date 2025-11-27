import { SearchResponse } from '@workix/ai/ai-core';

export interface TextGenerationOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  maxResponseTime?: number;
  language?: string;
  style?: 'formal' | 'casual' | 'creative' | 'professional' | 'friendly';
}

export interface ImageGenerationOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  quality?: 'standard' | 'hd';
  size?: '512x512' | '768x768' | '1024x1024' | '1792x1024' | '1024x1792';
  quantity?: number;
  style?: string;
  negativePrompt?: string;
}

export interface VideoGenerationOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  duration?: number;
  resolution?: string;
  style?: string;
  motionIntensity?: number;
}

export interface SpeechGenerationOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  voice?: string;
  language?: string;
  speed?: number;
  stability?: number;
}

export interface VisionAnalysisOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  maxTokens?: number;
  detail?: 'low' | 'high' | 'auto';
}

export interface SearchOptions {
  maxResults?: number;
  includeAnswer?: boolean;
}

export interface EmbeddingOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  model?: string;
}

export interface ContextGenerationOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  industry?: string;
}

export interface TranslationOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface QualityScoringContext {
  industry?: string;
  targetAudience?: string;
  purpose?: string;
  guidelines?: string[];
  [key: string]: string | string[] | undefined;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score?: number;
}

export interface SearchResponseExtended extends Omit<SearchResponse, 'results'> {
  results?: SearchResult[];
  query?: string;
}

export interface CompetitorPriceResult {
  platform: string;
  price?: number;
  currency?: string;
  url?: string;
  availability?: string;
}

export interface CacheValue<T = unknown> {
  value: T;
  expiry: number;
}

export interface QueueTaskPayload {
  type: string;
  data: Record<string, unknown>;
  [key: string]: string | Record<string, unknown> | undefined;
}

export interface QueueTaskResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  [key: string]: boolean | Record<string, unknown> | string | undefined;
}

export interface QueueTask {
  id: string;
  priority: number;
  payload: QueueTaskPayload;
  createdAt: Date;
  result?: QueueTaskResult;
}

export interface QualityScoreResult {
  overall: number;
  criteria: {
    relevance: number;
    clarity: number;
    engagement: number;
    accuracy: number;
  };
  aiScore: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  recommendations: string[];
}
