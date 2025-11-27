export type SupportedLocale = 'en' | 'ru' | 'ar';

export interface I18nConfig {
  defaultLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
  fallbackLocale: SupportedLocale;
  loadPath?: string;
}

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

export interface Translations {
  [locale: string]: TranslationKey;
}
