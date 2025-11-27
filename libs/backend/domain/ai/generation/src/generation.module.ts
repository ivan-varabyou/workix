import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AICoreModule } from '@workix/ai/ai-core';

import { GenerationController } from './generation.controller';
import { ContextGenerationService } from './services/context-generation.service';
import { EmbeddingService } from './services/embedding.service';
import { GenerationCacheService } from './services/generation-cache.service';
import { GenerationQueueService } from './services/generation-queue.service';
import { ImageGenerationService } from './services/image-generation.service';
import { QualityScoringService } from './services/quality-scoring.service';
import { SearchService } from './services/search.service';
import { SpeechGenerationService } from './services/speech-generation.service';
// PrismaModule will be provided by the monolith app
// import { PrismaModule } from '@nestjs/common';
import { TextGenerationService } from './services/text-generation.service';
import { TranslationService } from './services/translation.service';
import { VideoGenerationService } from './services/video-generation.service';
import { VisionAnalysisService } from './services/vision-analysis.service';

@Module({
  imports: [HttpModule, ConfigModule, AICoreModule],
  controllers: [GenerationController],
  providers: [
    TextGenerationService,
    ImageGenerationService,
    VideoGenerationService,
    SpeechGenerationService,
    VisionAnalysisService,
    SearchService,
    EmbeddingService,
    ContextGenerationService,
    TranslationService,
    QualityScoringService,
    GenerationCacheService,
    GenerationQueueService,
  ],
  exports: [
    TextGenerationService,
    ImageGenerationService,
    VideoGenerationService,
    SpeechGenerationService,
    VisionAnalysisService,
    SearchService,
    EmbeddingService,
    ContextGenerationService,
    TranslationService,
    QualityScoringService,
    GenerationCacheService,
    GenerationQueueService,
  ],
})
export class GenerationModule {}
