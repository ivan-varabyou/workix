/**
 * Core AI Provider Interface
 * All AI providers must implement this interface
 */

export enum AICapability {
  TEXT_GENERATION = 'text_generation',
  IMAGE_GENERATION = 'image_generation',
  VIDEO_GENERATION = 'video_generation',
  SPEECH_GENERATION = 'speech_generation',
  VISION_ANALYSIS = 'vision_analysis',
  SEARCH = 'search',
  EMBEDDINGS = 'embeddings',
}

export interface RateLimit {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  concurrentRequests?: number;
  tokensPerMinute?: number;
  tokensPerHour?: number;
}

export interface AIRequest {
  id?: string;
  type: AICapability;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  id: string;
  provider: string;
  model: string;
  timestamp: Date;
  tokensUsed?: number;
  cost: number;
  metadata?: Record<string, any>;
}

export interface TextGenerationRequest extends AIRequest {
  type: AICapability.TEXT_GENERATION;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  model?: string;
  systemPrompt?: string;
  stream?: boolean;
}

export interface TextGenerationResponse extends AIResponse {
  content: string;
  finishReason?: string;
}

export interface ImageGenerationRequest extends AIRequest {
  type: AICapability.IMAGE_GENERATION;
  prompt: string;
  model?: string;
  size?: string;
  quantity?: number;
  quality?: 'standard' | 'hd';
  style?: string;
  negativePrompt?: string;
}

export interface ImageGenerationResponse extends AIResponse {
  images: string[]; // URLs or base64
  revisions?: string[];
}

export interface VideoGenerationRequest extends AIRequest {
  type: AICapability.VIDEO_GENERATION;
  prompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: number;
  model?: string;
  resolution?: string;
  motionIntensity?: number;
}

export interface VideoGenerationResponse extends AIResponse {
  videoUrl: string;
  duration: number;
  resolution: string;
  format: string;
}

export interface SpeechGenerationRequest extends AIRequest {
  type: AICapability.SPEECH_GENERATION;
  text: string;
  language?: string;
  voice?: string;
  model?: string;
  speed?: number;
  stability?: number;
}

export interface SpeechGenerationResponse extends AIResponse {
  audioUrl: string;
  duration: number;
  format: string;
}

export interface VisionAnalysisRequest extends AIRequest {
  type: AICapability.VISION_ANALYSIS;
  imageUrl: string;
  prompt: string;
  model?: string;
  detail?: 'low' | 'high' | 'auto';
}

export interface VisionAnalysisResponse extends AIResponse {
  analysis: string;
  details?: Record<string, any>;
}

export interface SearchRequest extends AIRequest {
  type: AICapability.SEARCH;
  query: string;
  model?: string;
  maxResults?: number;
  includeAnswer?: boolean;
}

export interface SearchResponse extends AIResponse {
  results: SearchResult[];
  answer?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score?: number;
}

export interface EmbeddingRequest extends AIRequest {
  type: AICapability.EMBEDDINGS;
  texts: string[];
  model?: string;
}

export interface EmbeddingResponse extends AIResponse {
  embeddings: number[][];
  dimensions: number;
}

export interface AIProvider {
  // Provider identification
  id: string;
  name: string;
  version?: string;

  // Capabilities
  capabilities: AICapability[];
  supportedLanguages?: string[];

  // Rate limiting
  rateLimit?: RateLimit;

  // Core execution methods
  execute<T extends AIResponse>(request: AIRequest): Promise<T>;

  // Optional optimization methods
  canBatch?(requests: AIRequest[]): boolean;
  executeBatch?<T extends AIResponse>(requests: AIRequest[]): Promise<T[]>;

  supportsStreaming?(): boolean;
  stream?<T extends AIResponse>(request: AIRequest): AsyncIterable<T>;

  // Health check
  healthCheck?(): Promise<boolean>;

  // Get provider info
  getInfo(): ProviderInfo;
}

export interface ProviderInfo {
  id: string;
  name: string;
  version?: string;
  capabilities: AICapability[];
  supportedLanguages: string[];
  rateLimit?: RateLimit;
  pricing?: PricingInfo;
  status: 'active' | 'inactive' | 'beta' | 'deprecated';
}

export interface PricingInfo {
  model: 'per_token' | 'per_request' | 'subscription' | 'free';
  costPerUnit?: number;
  currency?: string;
}

export interface SelectionConstraints {
  capability?: AICapability; // Optional, can be inferred from context
  excludeProviders?: string[];
  preferredProviders?: string[];

  // Quality vs Speed vs Cost weights (0-1, sum <= 1)
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;

  // Hard constraints
  maxResponseTimeMs?: number;
  maxCostPerRequest?: number;
  maxFailureRate?: number;

  // Preferences
  preferredLanguages?: string[];
  requireBatching?: boolean;
  requireStreaming?: boolean;

  // A/B testing
  enableAbTesting?: boolean;
  parallelProviderCount?: number;
}

export interface ProviderMetrics {
  providerId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTimeMs: number;
  medianResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  averageCost: number;
  totalCost: number;
  successRate: number;
  errorRate: number;
  averageUserRating?: number;
  lastUpdated: Date;
}

export interface ExecutionResult {
  requestId: string;
  providerId: string;
  modelId?: string;
  success: boolean;
  response?: AIResponse;
  error?: string | Error; // Allow both string and Error for flexibility
  responseTimeMs: number;
  cost: number;
  userRating?: number;
  feedback?: string;
  timestamp: Date;
}
