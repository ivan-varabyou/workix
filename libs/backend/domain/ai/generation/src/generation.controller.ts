import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@workix/domain/auth';

import {
  ContextGenerationOptions,
  EmbeddingOptions,
  ImageGenerationOptions,
  QualityScoreResult,
  QualityScoringContext,
  SearchOptions,
  SearchResponseExtended,
  SpeechGenerationOptions,
  TextGenerationOptions,
  TranslationOptions,
  VisionAnalysisOptions,
} from './interfaces/generation.interface';
import {
  ContextGenerationService,
  PromptContext,
} from './services/context-generation.service';
import { EmbeddingService } from './services/embedding.service';
import { ImageGenerationService } from './services/image-generation.service';
import { QualityScoringService } from './services/quality-scoring.service';
import { SearchService } from './services/search.service';
import { SpeechGenerationService } from './services/speech-generation.service';
import { TextGenerationService } from './services/text-generation.service';
import { TranslationResult, TranslationService } from './services/translation.service';
import {
  VideoGenerationOptions,
  VideoGenerationService,
} from './services/video-generation.service';
import { ImageAnalysisResult, VisionAnalysisService } from './services/vision-analysis.service';

@ApiTags('generation')
@Controller('generation')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class GenerationController {
  constructor(
    private textGeneration: TextGenerationService,
    private imageGeneration: ImageGenerationService,
    private videoGeneration: VideoGenerationService,
    private speechGeneration: SpeechGenerationService,
    private visionAnalysis: VisionAnalysisService,
    private search: SearchService,
    private embedding: EmbeddingService,
    private contextGeneration: ContextGenerationService,
    private translation: TranslationService,
    private qualityScoring: QualityScoringService
  ) {}

  @Post('text')
  @ApiOperation({ summary: 'Generate text content' })
  @ApiResponse({ status: 200, description: 'Text generated successfully.' })
  async generateText(
    @Body() body: { prompt: string; options?: TextGenerationOptions }
  ): Promise<string> {
    return this.textGeneration.generateText(body.prompt, body.options);
  }

  @Post('text/variations')
  @ApiOperation({ summary: 'Generate multiple text variations for A/B testing' })
  @ApiResponse({ status: 200, description: 'Text variations generated successfully.' })
  async generateTextVariations(
    @Body() body: { prompt: string; count?: number; options?: TextGenerationOptions }
  ): Promise<string[]> {
    return this.textGeneration.generateVariations(body.prompt, body.count, body.options);
  }

  @Post('image')
  @ApiOperation({ summary: 'Generate image content' })
  @ApiResponse({ status: 200, description: 'Image generated successfully.' })
  async generateImage(
    @Body() body: { prompt: string; options?: ImageGenerationOptions }
  ): Promise<string[]> {
    return this.imageGeneration.generateImage(body.prompt, body.options);
  }

  @Post('image/variations')
  @ApiOperation({ summary: 'Generate multiple image variations' })
  @ApiResponse({ status: 200, description: 'Image variations generated successfully.' })
  async generateImageVariations(
    @Body() body: { prompt: string; count?: number; options?: ImageGenerationOptions }
  ): Promise<string[][]> {
    return this.imageGeneration.generateVariations(body.prompt, body.count, body.options);
  }

  @Post('video')
  @ApiOperation({ summary: 'Generate video content' })
  @ApiResponse({ status: 200, description: 'Video generated successfully.' })
  async generateVideo(
    @Body() body: { prompt: string; options?: VideoGenerationOptions }
  ): Promise<string> {
    return this.videoGeneration.generateFromText(body.prompt, body.options);
  }

  @Post('speech')
  @ApiOperation({ summary: 'Generate speech from text' })
  @ApiResponse({ status: 200, description: 'Speech generated successfully.' })
  async generateSpeech(
    @Body() body: { text: string; options?: SpeechGenerationOptions }
  ): Promise<string> {
    return this.speechGeneration.generateSpeech(body.text, body.options);
  }

  @Post('vision/analyze')
  @ApiOperation({ summary: 'Analyze image using AI vision' })
  @ApiResponse({ status: 200, description: 'Image analyzed successfully.' })
  async analyzeImage(
    @Body() body: { imageUrl: string; prompt?: string; options?: VisionAnalysisOptions }
  ): Promise<ImageAnalysisResult> {
    const result: ImageAnalysisResult = await this.visionAnalysis.analyzeImage(
      body.imageUrl,
      body.prompt || '',
      body.options
    );
    return result;
  }

  @Post('search')
  @ApiOperation({ summary: 'Search the web using AI' })
  @ApiResponse({ status: 200, description: 'Search completed successfully.' })
  async searchWeb(
    @Body() body: { query: string; options?: SearchOptions }
  ): Promise<SearchResponseExtended> {
    return this.search.search(body.query, body.options);
  }

  @Post('embedding')
  @ApiOperation({ summary: 'Generate text embedding' })
  @ApiResponse({ status: 200, description: 'Embedding generated successfully.' })
  async generateEmbedding(
    @Body() body: { text: string; options?: EmbeddingOptions }
  ): Promise<{ embedding: number[]; model: string; dimensions: number; cached: boolean }> {
    const result: { embedding: number[]; model: string; dimensions: number; cached: boolean } = await this.embedding.generateEmbedding(body.text, body.options);
    return result;
  }

  @Post('context')
  @ApiOperation({ summary: 'Generate context and optimal prompts' })
  @ApiResponse({ status: 200, description: 'Context generated successfully.' })
  async generateContext(
    @Body() body: { task: string; industry?: string; options?: ContextGenerationOptions }
  ): Promise<string> {
    const promptContext: PromptContext = {
      task: body.task,
    };
    if (body.industry !== undefined) {
      promptContext.industry = body.industry;
    }
    // ContextGenerationOptions fields are not part of PromptContext
    // They are used internally by the service
    return this.contextGeneration.generateOptimalPrompt(promptContext);
  }

  @Post('translate')
  @ApiOperation({ summary: 'Translate text to target language' })
  @ApiResponse({ status: 200, description: 'Text translated successfully.' })
  async translate(
    @Body() body: { text: string; targetLanguage: string; options?: TranslationOptions }
  ): Promise<TranslationResult> {
    return this.translation.translate(body.text, {
      targetLanguage: body.targetLanguage,
      ...body.options,
    });
  }

  @Post('translate/detect')
  @ApiOperation({ summary: 'Detect language of text' })
  @ApiResponse({ status: 200, description: 'Language detected successfully.' })
  async detectLanguage(@Body() body: { text: string }): Promise<string> {
    return this.translation.detectLanguage(body.text);
  }

  @Post('quality/score')
  @ApiOperation({ summary: 'Score content quality' })
  @ApiResponse({ status: 200, description: 'Quality scored successfully.' })
  async scoreQuality(
    @Body() body: { content: string; contentType: string; context?: QualityScoringContext }
  ): Promise<QualityScoreResult> {
    const contentType: 'text' | 'image' | 'video' =
      body.contentType === 'text' || body.contentType === 'image' || body.contentType === 'video'
        ? body.contentType
        : 'text';
    return this.qualityScoring.scoreContent(body.content, contentType, body.context);
  }
}
