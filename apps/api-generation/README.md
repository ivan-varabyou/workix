# Generation Service

Microservice for AI-powered content generation.

## Overview

Handles AI-powered content generation including text, image, video, speech, embeddings, and translation.

## Port

- **Port**: `7111`
- **Database Port**: N/A (uses existing AI libraries)
- **Swagger**: `http://localhost:7111/docs`
- **Health**: `http://localhost:7111/health`

## Features

- Text generation
- Image generation
- Video generation
- Speech synthesis
- Vision analysis
- Web search
- Embeddings generation
- Context generation
- Translation
- Quality scoring
- Generation queue management
- Generation caching

## API Endpoints

- `POST /api-generation/v1/generation/text` - Generate text
- `POST /api-generation/v1/generation/image` - Generate image
- `POST /api-generation/v1/generation/video` - Generate video
- `POST /api-generation/v1/generation/speech` - Generate speech
- `POST /api-generation/v1/generation/vision` - Analyze image
- `POST /api-generation/v1/generation/search` - Web search
- `POST /api-generation/v1/generation/embedding` - Generate embedding
- `POST /api-generation/v1/generation/context` - Generate context
- `POST /api-generation/v1/generation/translate` - Translate text
- `POST /api-generation/v1/generation/quality` - Score quality

## AI Providers

Supports multiple AI providers:
- OpenAI (GPT-4, GPT-3.5, DALL-E)
- Groq (Mixtral, Llama 3.1)
- Anthropic (Claude 3)
- Stability AI (Stable Diffusion)
- Runway (Gen-2)
- ElevenLabs (Text-to-Speech)
- Tavily (Web Search)

## Event-Driven Communication

Subscribes to `generation.*` events from API Gateway for async processing.

## Environment Variables

See `env.example` for all configuration options, including AI provider API keys.

## Related

- [API Gateway](../api-gateway/README.md)
- [Port Configuration](../../.specify/specs-optimized/architecture/ports.md)
- [AI Architecture](../../.specify/specs-optimized/architecture/ai.md)
