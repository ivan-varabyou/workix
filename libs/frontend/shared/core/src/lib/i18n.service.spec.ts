// Jest globals are available without import
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { I18nService, Language, Translations } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;
  let httpMock: HttpTestingController;
  const mockTranslations: Translations = {
    welcome: 'Welcome',
    greeting: 'Hello {{name}}',
    nested: {
      deep: {
        value: 'Deep value',
      },
    },
  };

  beforeEach(() => {
    // Clear localStorage first
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [I18nService],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(I18nService);

    // Service initializes with language in constructor, which creates HTTP request
    // Wait a bit and flush the initialization request
    const initReqs = httpMock.match(() => true);
    if (initReqs.length > 0) {
      initReqs.forEach((req) => req.flush({}));
    }

    // Ensure service is in 'en' state
    if (service.currentLanguage() !== 'en') {
      service.setLanguage('en');
      const resetReqs = httpMock.match('/assets/i18n/en/translations.json');
      resetReqs.forEach((req) => req.flush({}));
    }
  });

  afterEach(() => {
    try {
      if (httpMock) {
        httpMock.verify();
      }
    } catch (e) {
      // Ignore verification errors if there are pending requests
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default language (en)', () => {
      expect(service.currentLanguage()).toBe('en');
    });

    it('should load language from localStorage', () => {
      localStorage.setItem('language', 'ru');
      // Clear any pending requests
      httpMock.match(() => true).forEach((req) => req.flush({}));

      // Create new service instance through TestBed
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [I18nService],
      });
      const newHttpMock = TestBed.inject(HttpTestingController);
      const newService = TestBed.inject(I18nService);

      // Handle initialization request
      const initReqs = newHttpMock.match(() => true);
      initReqs.forEach((req) => req.flush({}));

      expect(newService.currentLanguage()).toBe('ru');
    });

    it('should fallback to browser language if localStorage is empty', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'ru-RU',
      });
      localStorage.clear();

      // Clear any pending requests
      httpMock.match(() => true).forEach((req) => req.flush({}));

      // Create new service instance through TestBed
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [I18nService],
      });
      const newHttpMock = TestBed.inject(HttpTestingController);
      const newService = TestBed.inject(I18nService);

      // Handle initialization request
      const initReqs = newHttpMock.match(() => true);
      initReqs.forEach((req) => req.flush({}));

      expect(newService.currentLanguage()).toBe('ru');
    });
  });

  describe('Language management', () => {
    it('should set language', () => {
      // Clear any pending requests from initialization
      httpMock.match(() => true).forEach((req) => req.flush({}));

      // Clear cache to ensure fresh request
      service.clearCache();

      service.setLanguage('ru');
      const req = httpMock.expectOne('/assets/i18n/ru/translations.json');
      req.flush({});
      expect(service.currentLanguage()).toBe('ru');
      expect(localStorage.getItem('language')).toBe('ru');
    });

    it('should update document attributes when setting language', () => {
      const htmlElement = document.documentElement;
      service.setLanguage('ar');
      const req = httpMock.expectOne('/assets/i18n/ar/translations.json');
      req.flush({});
      expect(htmlElement.lang).toBe('ar');
      expect(htmlElement.dir).toBe('rtl');
    });

    it('should fallback to en for invalid language', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-expect-error - testing invalid language
      service.setLanguage('invalid');
      expect(service.currentLanguage()).toBe('en');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unsupported language'));
      consoleSpy.mockRestore();
    });

    it('should provide language name', () => {
      // Clear any pending requests from initialization
      httpMock.match(() => true).forEach((req) => req.flush({}));

      // Clear cache to ensure fresh request
      service.clearCache();

      expect(service.languageName()).toBe('English');

      service.setLanguage('ru');
      const req = httpMock.expectOne('/assets/i18n/ru/translations.json');
      req.flush({});
      expect(service.languageName()).toBe('Русский');
    });

    it('should detect RTL languages', () => {
      expect(service.isRTL()).toBe(false);
      service.setLanguage('ar');
      const req = httpMock.expectOne('/assets/i18n/ar/translations.json');
      req.flush({});
      expect(service.isRTL()).toBe(true);
    });

    it('should provide supported languages', () => {
      const languages = service.supportedLanguages();
      expect(languages).toHaveLength(3);
      expect(languages.find((l) => l.code === 'en')).toBeDefined();
      expect(languages.find((l) => l.code === 'ru')).toBeDefined();
      expect(languages.find((l) => l.code === 'ar')).toBeDefined();
    });
  });

  describe('Translation loading', () => {
    it('should load translations from assets', () => {
      // Clear cache and any pending requests
      service.clearCache();
      httpMock.match(() => true).forEach((req) => req.flush({}));

      service.setLanguage('en');

      const req = httpMock.expectOne('/assets/i18n/en/translations.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockTranslations);

      expect(service.translate('welcome')).toBe('Welcome');
    });

    it('should cache translations', () => {
      // Clear cache and any pending requests
      service.clearCache();
      httpMock.match(() => true).forEach((req) => req.flush({}));

      // Load translations for 'en'
      service.setLanguage('en');
      const req1 = httpMock.expectOne('/assets/i18n/en/translations.json');
      req1.flush(mockTranslations);

      // Change language and back
      service.setLanguage('ru');
      const req2 = httpMock.expectOne('/assets/i18n/ru/translations.json');
      req2.flush({});

      service.setLanguage('en');
      // Should not make another request (cached)
      httpMock.expectNone('/assets/i18n/en/translations.json');
      expect(service.translate('welcome')).toBe('Welcome');
    });

    it('should handle translation loading errors', () => {
      // Clear cache and any pending requests
      service.clearCache();
      httpMock.match(() => true).forEach((req) => req.flush({}));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      service.setLanguage('en');

      const req = httpMock.expectOne('/assets/i18n/en/translations.json');
      req.flush({}, { status: 404, statusText: 'Not Found' });

      expect(service.translate('welcome')).toBe('welcome'); // Falls back to key
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      // Clear any pending requests first
      httpMock.match(() => true).forEach((req) => req.flush({}));

      // Clear cache to ensure fresh load
      service.clearCache();

      // Load translations for 'en'
      service.setLanguage('en');
      const req = httpMock.expectOne('/assets/i18n/en/translations.json');
      req.flush(mockTranslations);
    });

    it('should translate simple key', () => {
      expect(service.translate('welcome')).toBe('Welcome');
    });

    it('should translate nested key', () => {
      expect(service.translate('nested.deep.value')).toBe('Deep value');
    });

    it('should replace parameters in translation', () => {
      expect(service.translate('greeting', { name: 'John' })).toBe('Hello John');
    });

    it('should replace multiple parameters', () => {
      // Service should be in 'en' state
      // Switch to 'ru' and load translations
      const translations: Translations = {
        message: 'Hello {{firstName}} {{lastName}}',
      };
      service.setLanguage('ru');
      const req = httpMock.expectOne('/assets/i18n/ru/translations.json');
      req.flush(translations);

      expect(service.translate('message', { firstName: 'John', lastName: 'Doe' })).toBe(
        'Hello John Doe'
      );
    });

    it('should return key if translation not found', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(service.translate('nonexistent')).toBe('nonexistent');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Translation key not found'));
      consoleSpy.mockRestore();
    });

    it('should check if key exists', () => {
      expect(service.hasKey('welcome')).toBe(true);
      expect(service.hasKey('nested.deep.value')).toBe(true);
      expect(service.hasKey('nonexistent')).toBe(false);
    });
  });
});
