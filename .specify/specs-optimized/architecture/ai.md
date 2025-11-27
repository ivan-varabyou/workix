# AI Libraries Architecture

**Version**: 3.0

## Overview

AI abstraction layer with multiple providers, router for intelligent selection, and generation services.

## AI Core (`libs/ai/ai-core`)

### Providers

**7 AI Providers** implementing `AIProvider` interface:

1. **OpenAI** - Text, Image, Vision
   - Models: GPT-4, GPT-3.5, DALL-E
   - Rate limit: 3500 req/min, 200k req/hour

2. **Groq** - Text (Fast & Cheap)
   - Models: Mixtral, Llama 3.1
   - Rate limit: 60 req/min, 10 concurrent

3. **Anthropic** - Text
   - Models: Claude 3
   - Rate limit: Configurable

4. **Stability AI** - Image
   - Models: Stable Diffusion
   - Rate limit: Configurable

5. **Runway** - Video
   - Models: Gen-2
   - Rate limit: Configurable

6. **ElevenLabs** - Speech
   - Models: Text-to-Speech
   - Rate limit: Configurable

7. **Tavily** - Web Search
   - Models: Search API
   - Rate limit: Configurable

### Capabilities

```typescript
enum AICapability {
  TEXT_GENERATION = 'text_generation',
  IMAGE_GENERATION = 'image_generation',
  VIDEO_GENERATION = 'video_generation',
  SPEECH_GENERATION = 'speech_generation',
  VISION_ANALYSIS = 'vision_analysis',
  SEARCH = 'search',
  EMBEDDINGS = 'embeddings',
}
```

### AIRouter

Intelligent provider selection with:
- **Weighted selection**: Based on provider weights
- **Failover**: Automatic fallback on failure
- **A/B testing**: Test different providers
- **Metrics**: Track execution metrics
- **Cost tracking**: Monitor API costs

### Services

- **TokenTrackerService**: Track token usage
- **PromptManagerService**: Manage prompts
- **ModelRegistryService**: Registry of available models
- **AIExecutionRepository**: Store execution history

### Metrics

- Execution metrics (latency, success rate)
- Cost tracking per provider
- Usage statistics
- Performance analytics

## Generation (`libs/ai/generation`)

**11 Generation Services**:

1. **TextGenerationService** - Generate text content
2. **ImageGenerationService** - Generate images
3. **VideoGenerationService** - Generate videos
4. **SpeechGenerationService** - Text-to-speech
5. **VisionAnalysisService** - Analyze images
6. **SearchService** - Web search
7. **EmbeddingService** - Generate embeddings
8. **ContextGenerationService** - Generate context
9. **TranslationService** - Translate text
10. **QualityScoringService** - Score generation quality
11. **GenerationQueueService** - Queue management
12. **GenerationCacheService** - Cache generations

### Controller

**GenerationController**: REST API for all generation services

## ML Integration (`libs/ai/ml-integration`)

**MLIntegrationService**: Machine Learning integration layer

## Usage Pattern

```typescript
// 1. Use AIRouter for intelligent selection
const router = new AIRouter(providers);
const provider = router.selectProvider(capability);

// 2. Execute request
const response = await provider.execute(request);

// 3. Track metrics
router.recordExecution(provider.id, metrics);
```

## Related

- [Libraries](../core/libraries.md)
- [Platform](./platform.md)



