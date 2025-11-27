import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AICapability,
  AIProvider,
  AIRequest,
  ProviderInfo,
  RateLimit,
  SpeechGenerationRequest,
  SpeechGenerationResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class ElevenLabsProvider implements AIProvider {
  id = 'elevenlabs';
  name = 'ElevenLabs (Text-to-Speech)';
  capabilities = [AICapability.SPEECH_GENERATION];
  supportedLanguages = [
    'en',
    'ru',
    'es',
    'fr',
    'de',
    'it',
    'pt',
    'nl',
    'tr',
    'pl',
    'sv',
    'da',
    'fi',
    'no',
    'cs',
    'sk',
    'hu',
    'ro',
    'el',
    'uk',
    'ar',
    'he',
    'th',
    'zh',
    'ja',
    'ko',
    'vi',
    'id',
    'hi',
    'bn',
  ];

  rateLimit: RateLimit = {
    requestsPerMinute: 100,
  };

  private apiKey: string;
  private apiHost = 'https://api.elevenlabs.io';

  // Popular voices (expandable) - reserved for future use
  // private _voices = [
  //   { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', language: 'en' },
  //   { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Adam', language: 'en' },
  //   { id: 'nPczCjzI2devNBz1zQrb', name: 'Rachel', language: 'en' },
  // ];

  constructor(@Optional() @Inject(ConfigService) private configService?: ConfigService) {
    this.apiKey = this.configService?.get('ELEVENLABS_API_KEY') || '';
    if (!this.apiKey) {
      console.warn('ELEVENLABS_API_KEY not set - ElevenLabs provider will not work');
    }
  }

  async execute<T>(request: AIRequest): Promise<T> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs provider is not configured');
    }

    switch (request.type) {
      case AICapability.SPEECH_GENERATION:
        if (this.isSpeechGenerationRequest(request)) {
          return this.executeSpeechGeneration(request) as Promise<T>;
        }
        throw new Error('Invalid speech generation request');
      default:
        throw new Error(`ElevenLabs provider does not support ${request.type}`);
    }
  }

  private isSpeechGenerationRequest(request: AIRequest): request is SpeechGenerationRequest {
    return request.type === AICapability.SPEECH_GENERATION && 'text' in request;
  }

  private async executeSpeechGeneration(
    request: SpeechGenerationRequest
  ): Promise<SpeechGenerationResponse> {
    const startTime = Date.now();

    try {
      const voiceId = request.voice || 'EXAVITQu4vr4xnSDxMaL'; // Default voice
      const endpoint = `${this.apiHost}/v1/text-to-speech/${voiceId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: request.stability || 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

      // Estimate duration (roughly 150 words per minute)
      const wordCount = request.text.split(' ').length;
      const estimatedDuration = (wordCount / 150) * 60;

      const responseTimeMs = Date.now() - startTime;
      const cost = this.calculateCost(request.text);

      return {
        id: request.id || `elevenlabs-${Date.now()}`,
        provider: this.id,
        model: 'eleven_monolingual_v1',
        audioUrl,
        duration: estimatedDuration,
        format: 'mp3',
        cost,
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
          voiceId,
          language: request.language || 'en',
          characterCount: request.text.length,
        },
      } as any as SpeechGenerationResponse;
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      throw {
        provider: this.id,
        error: error instanceof Error ? error.message : String(error),
        responseTimeMs,
        cost: 0,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await fetch(`${this.apiHost}/v1/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getInfo(): ProviderInfo {
    return {
      id: this.id,
      name: this.name,
      capabilities: this.capabilities,
      supportedLanguages: this.supportedLanguages,
      rateLimit: this.rateLimit,
      pricing: {
        model: 'subscription', // Via subscription
        currency: 'USD',
      },
      status: this.apiKey ? 'active' : 'inactive',
    };
  }

  private calculateCost(text: string): number {
    // ElevenLabs charges per character
    // Free tier: 10,000 characters/month
    // Paid: $5/10,000 characters
    const characterCount = text.length;
    const costPerCharacter = 0.0005; // $0.0005 per character
    return characterCount * costPerCharacter;
  }
}
