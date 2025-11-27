import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

export type Language = 'en' | 'ru' | 'ar';

export interface TranslationParams {
  [key: string]: string | number;
}

export interface Translations {
  [key: string]: string | Translations;
}

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  ar: 'العربية',
};

const RTL_LANGUAGES: Language[] = ['ar'];

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly http = inject(HttpClient);
  private translationsCache: Map<Language, Translations> = new Map();
  private currentLanguageSignal = signal<Language>('en');
  private translationsSignal = signal<Translations>({});

  // Computed properties
  currentLanguage = this.currentLanguageSignal.asReadonly();
  languageName = computed(() => LANGUAGE_NAMES[this.currentLanguageSignal()]);
  isRTL = computed(() => RTL_LANGUAGES.includes(this.currentLanguageSignal()));

  supportedLanguages = computed(() =>
    Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
      code: code as Language,
      name,
      flag: this.getFlagEmoji(code as Language),
    }))
  );

  /**
   * Clear translations cache (useful for testing)
   */
  clearCache(): void {
    this.translationsCache.clear();
    this.translationsSignal.set({});
  }

  constructor() {
    this.initializeLanguage();
  }

  /**
   * Initialize language from localStorage or browser
   */
  private initializeLanguage(): void {
    const savedLang = (localStorage.getItem('language') || this.getBrowserLanguage()) as Language;
    if (this.isValidLanguage(savedLang)) {
      this.setLanguage(savedLang);
    } else {
      this.setLanguage('en');
    }
  }

  /**
   * Get browser language
   */
  private getBrowserLanguage(): string {
    // Support for older browsers (IE)
    const navigatorWithUserLanguage = navigator as Navigator & { userLanguage?: string };
    const browserLang: string =
      navigator.language || navigatorWithUserLanguage.userLanguage || 'en';
    const langParts = browserLang.split('-');
    const langCode: string = langParts[0]?.toLowerCase() || 'en';

    // Map browser language to supported language
    if (langCode === 'ru') return 'ru';
    if (langCode === 'ar') return 'ar';
    return 'en';
  }

  /**
   * Check if language is valid
   */
  private isValidLanguage(lang: Language): boolean {
    return ['en', 'ru', 'ar'].includes(lang);
  }

  /**
   * Set current language
   */
  setLanguage(language: Language): void {
    if (!this.isValidLanguage(language)) {
      console.warn(`Unsupported language: ${language}. Falling back to 'en'.`);
      language = 'en';
    }

    this.currentLanguageSignal.set(language);
    localStorage.setItem('language', language);
    this.updateDocumentAttributes();
    this.loadTranslations(language);
  }

  /**
   * Update document attributes for language and direction
   */
  private updateDocumentAttributes(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = this.currentLanguageSignal();
      document.documentElement.dir = this.isRTL() ? 'rtl' : 'ltr';
    }
  }

  /**
   * Load translations for language
   */
  private loadTranslations(language: Language): void {
    // Check cache first
    if (this.translationsCache.has(language)) {
      this.translationsSignal.set(this.translationsCache.get(language)!);
      return;
    }

    // Load from assets
    const translationsPath = `/assets/i18n/${language}/translations.json`;

    this.http
      .get<Translations>(translationsPath)
      .pipe(
        map((translations: Translations) => {
          const trans: Translations = translations;
          this.translationsCache.set(language, trans);
          this.translationsSignal.set(trans);
          return translations;
        }),
        catchError((error) => {
          console.error(`Failed to load translations for ${language}:`, error);
          // Fallback to empty translations
          const emptyTranslations: Translations = {};
          this.translationsCache.set(language, emptyTranslations);
          this.translationsSignal.set(emptyTranslations);
          return of(emptyTranslations);
        }),
        shareReplay(1)
      )
      .subscribe();
  }

  /**
   * Translate key with optional parameters
   */
  translate(key: string, params?: TranslationParams): string {
    const translations = this.translationsSignal();
    let translation = this.getNestedValue(translations, key);

    // Fallback to key if not found
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    // Replace parameters
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      }
    }

    return translation;
  }

  /**
   * Get nested value from translations object
   */
  private getNestedValue(obj: Translations, key: string): string {
    const keys: string[] = key.split('.');
    let value: string | Translations = obj;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        const nextValue: string | Translations | undefined = (value as Translations)[k];
        if (nextValue === undefined) {
          return '';
        }
        value = nextValue;
      } else {
        return '';
      }
    }

    return typeof value === 'string' ? value : '';
  }

  /**
   * Check if translation key exists
   */
  hasKey(key: string): boolean {
    const translations = this.translationsSignal();
    return this.getNestedValue(translations, key) !== '';
  }

  /**
   * Get flag emoji for language
   */
  private getFlagEmoji(lang: Language): string {
    const flagMap: Record<Language, string> = {
      en: '🇬🇧',
      ru: '🇷🇺',
      ar: '🇸🇦',
    };
    return flagMap[lang] || '🏳️';
  }
}
