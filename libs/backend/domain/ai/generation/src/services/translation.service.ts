import { Injectable, Logger } from '@nestjs/common';
import {
  AICapability,
  AIRouter,
  TextGenerationRequest,
  TextGenerationResponse,
} from '@workix/ai/ai-core';

import { GenerationCacheService } from './generation-cache.service';

export interface TranslationOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  preserveFormatting?: boolean;
  context?: string;
  formality?: 'formal' | 'informal' | 'auto';
}

export interface TranslationResult {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
  cached: boolean;
}

// Supported languages (50+)
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  ru: 'Russian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  tr: 'Turkish',
  pl: 'Polish',
  nl: 'Dutch',
  sv: 'Swedish',
  da: 'Danish',
  fi: 'Finnish',
  no: 'Norwegian',
  cs: 'Czech',
  hu: 'Hungarian',
  ro: 'Romanian',
  bg: 'Bulgarian',
  hr: 'Croatian',
  sr: 'Serbian',
  sk: 'Slovak',
  sl: 'Slovenian',
  et: 'Estonian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  el: 'Greek',
  he: 'Hebrew',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
  uk: 'Ukrainian',
  be: 'Belarusian',
  ka: 'Georgian',
  az: 'Azerbaijani',
  kk: 'Kazakh',
  uz: 'Uzbek',
  mn: 'Mongolian',
  ne: 'Nepali',
  si: 'Sinhala',
  my: 'Myanmar',
  km: 'Khmer',
  lo: 'Lao',
  // ... more languages
} as const;

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  constructor(private router: AIRouter, private cache: GenerationCacheService) {}

  /**
   * Translate text to target language
   */
  async translate(text: string, options: TranslationOptions): Promise<TranslationResult> {
    const cacheKey = `translation:${text}:${options.sourceLanguage || 'auto'}:${
      options.targetLanguage
    }`;
    const cached = (await this.cache.get(cacheKey)) as TranslationResult | null;
    if (cached) {
      this.logger.debug(`Translation cache hit for: ${text.substring(0, 50)}...`);
      return { ...cached, cached: true };
    }

    const startTime = Date.now();
    const requestId = `translation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${requestId}] Translating text`, {
      textLength: text.length,
      sourceLanguage: options.sourceLanguage || 'auto',
      targetLanguage: options.targetLanguage,
    });

    try {
      const prompt = this.buildTranslationPrompt(text, options);
      const request: TextGenerationRequest = {
        id: requestId,
        type: AICapability.TEXT_GENERATION,
        prompt,
        maxTokens: text.length * 2, // Estimate tokens needed
        temperature: 0.3, // Lower temperature for more consistent translation
        metadata: {
          sourceLanguage: options.sourceLanguage || 'auto',
          targetLanguage: options.targetLanguage,
          preserveFormatting: options.preserveFormatting ?? true,
          context: options.context,
          formality: options.formality,
        },
      };

      const result = (await this.router.executeWithFailover(
        request,
        AICapability.TEXT_GENERATION,
        3
      )) as TextGenerationResponse;

      const translatedText: string = result.content || text;
      const sourceLang = options.sourceLanguage || 'auto';
      // AI models don't provide confidence scores, so we don't set confidence

      const translationResult: TranslationResult = {
        text: translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: options.targetLanguage,
        cached: false,
      };
      // AI models don't provide confidence scores, so we don't set confidence

      // Cache the result
      await this.cache.set(cacheKey, translationResult, 86400000); // 24 hours

      const latencyMs = Date.now() - startTime;
      this.logger.log(`[${requestId}] Translation completed`, {
        provider: result.provider,
        latencyMs,
      });

      return translationResult;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[${requestId}] Translation failed`, {
        error: error instanceof Error ? error.message : String(error),
        latencyMs,
      });
      throw error;
    }
  }

  /**
   * Translate multiple texts (batch)
   */
  async translateBatch(texts: string[], options: TranslationOptions): Promise<TranslationResult[]> {
    const results = await Promise.all(texts.map((text) => this.translate(text, options)));
    return results;
  }

  /**
   * Build translation prompt
   */
  private buildTranslationPrompt(text: string, options: TranslationOptions): string {
    const sourceLang = options.sourceLanguage || 'auto';
    const targetLang =
      SUPPORTED_LANGUAGES[options.targetLanguage as keyof typeof SUPPORTED_LANGUAGES] ||
      options.targetLanguage;
    const formality =
      options.formality === 'formal'
        ? 'formal'
        : options.formality === 'informal'
        ? 'informal'
        : '';

    let prompt = `Translate the following text from ${
      sourceLang === 'auto' ? 'the detected language' : sourceLang
    } to ${targetLang}`;
    if (formality) {
      prompt += ` in a ${formality} style`;
    }
    if (options.context) {
      prompt += `\nContext: ${options.context}`;
    }
    prompt += `:\n\n${text}\n\nTranslation:`;

    return prompt;
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text: string): Promise<string> {
    const cacheKey = `lang-detect:${text}`;
    const cached: string | null = (await this.cache.get(cacheKey)) as string | null;
    if (cached) {
      return cached;
    }

    try {
      const request: TextGenerationRequest = {
        type: AICapability.TEXT_GENERATION,
        prompt: `Detect the language of the following text and respond with only the ISO 639-1 language code (e.g., "en", "ru", "es"):\n\n${text}`,
        maxTokens: 10,
        temperature: 0.1,
      };

      const result = (await this.router.executeWithFailover(
        request,
        AICapability.TEXT_GENERATION,
        3
      )) as TextGenerationResponse;

      const language: string = result.content?.trim().toLowerCase() || 'en';
      const langCode = language.length === 2 ? language : 'en';
      await this.cache.set(cacheKey, langCode, 86400000);
      return langCode;
    } catch (error) {
      this.logger.warn('Language detection failed, defaulting to English');
      return 'en';
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): typeof SUPPORTED_LANGUAGES {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return languageCode in SUPPORTED_LANGUAGES;
  }
}
