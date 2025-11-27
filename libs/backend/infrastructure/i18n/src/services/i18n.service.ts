import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

import {
  I18nConfig,
  SupportedLocale,
  TranslationKey,
  Translations,
} from '../interfaces/i18n-config.interface';

/**
 * I18n Service
 * Multi-language support without hardcoded text
 */
@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private translations: Translations = {};
  private config: I18nConfig;
  private currentLocale: SupportedLocale;

  constructor(private configService: ConfigService) {
    const defaultLocale = this.configService?.get<string>('DEFAULT_LOCALE') || 'en';
    this.config = {
      defaultLocale: defaultLocale as SupportedLocale,
      supportedLocales: ['en', 'ru', 'ar'],
      fallbackLocale: 'en',
    };
    this.currentLocale = this.config.defaultLocale;
    this.loadTranslations();
  }

  /**
   * Load translations from locale files
   */
  private loadTranslations(): void {
    // Try multiple paths for development and production
    const possiblePaths = [
      path.join(__dirname, '../locales'),
      path.join(__dirname, '../../locales'),
      path.join(process.cwd(), 'libs/infrastructure/i18n/src/locales'),
      path.join(process.cwd(), 'libs/i18n/src/locales'),
      path.join(process.cwd(), 'dist/libs/infrastructure/i18n/src/locales'),
      path.join(process.cwd(), 'dist/libs/i18n/src/locales'),
      path.join(process.cwd(), 'apps/api-auth/libs/infrastructure/i18n/src/locales'),
    ];

    let localesPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        localesPath = possiblePath;
        this.logger.log(`Found locales directory at: ${localesPath}`);
        break;
      }
    }

    if (!localesPath) {
      this.logger.warn('Could not find locales directory - translations will use fallback values');
      this.logger.debug(`Tried paths: ${possiblePaths.join(', ')}`);
      // Don't return - continue with empty translations
      return;
    }

    for (const locale of this.config.supportedLocales) {
      try {
        const localePath = path.join(localesPath, locale, 'translations.json');
        if (fs.existsSync(localePath)) {
          const content = fs.readFileSync(localePath, 'utf-8');
          this.translations[locale] = JSON.parse(content);
          this.logger.log(`Translations loaded for locale: ${locale}`);
        } else {
          this.logger.warn(`Translation file not found for locale: ${locale} at ${localePath}`);
        }
      } catch (error) {
        this.logger.error(`Failed to load translations for locale ${locale}:`, error);
      }
    }
  }

  /**
   * Set current locale
   */
  setLocale(locale: SupportedLocale): void {
    if (this.config.supportedLocales.includes(locale)) {
      this.currentLocale = locale;
    } else {
      this.logger.warn(
        `Unsupported locale: ${locale}, falling back to ${this.config.fallbackLocale}`
      );
      this.currentLocale = this.config.fallbackLocale;
    }
  }

  /**
   * Get current locale
   */
  getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * Translate key
   */
  translate(key: string, params?: Record<string, string | number>): string {
    return this.translateForLocale(this.currentLocale, key, params);
  }

  /**
   * Translate for specific locale
   */
  translateForLocale(
    locale: SupportedLocale,
    key: string,
    params?: Record<string, string | number>
  ): string {
    const translations =
      this.translations[locale] || this.translations[this.config.fallbackLocale] || {};
    let value = this.getNestedValue(translations, key);

    // Fallback to default locale if key not found
    if (!value && locale !== this.config.fallbackLocale) {
      value = this.getNestedValue(this.translations[this.config.fallbackLocale] || {}, key);
    }

    // Fallback to key itself if still not found
    if (!value) {
      this.logger.warn(`Translation key not found: ${key} for locale: ${locale}`);
      return key;
    }

    // Replace parameters
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      }
    }

    return value;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: TranslationKey, key: string): string | undefined {
    const keys: string[] = key.split('.');
    let value: TranslationKey | string | undefined = obj;

    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, TranslationKey | string | undefined>)[k];
      } else {
        return undefined;
      }
    }

    return typeof value === 'string' ? value : undefined;
  }

  /**
   * Check if key exists
   */
  hasKey(key: string, locale?: SupportedLocale): boolean {
    const targetLocale = locale || this.currentLocale;
    const translations =
      this.translations[targetLocale] || this.translations[this.config.fallbackLocale] || {};
    return this.getNestedValue(translations, key) !== undefined;
  }

  /**
   * Get all translations for locale
   */
  getTranslations(locale?: SupportedLocale): TranslationKey {
    const targetLocale = locale || this.currentLocale;
    return this.translations[targetLocale] || this.translations[this.config.fallbackLocale] || {};
  }
}
