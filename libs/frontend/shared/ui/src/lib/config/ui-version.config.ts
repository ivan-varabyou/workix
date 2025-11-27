/**
 * UI Version Configuration
 *
 * Система версионирования UI компонентов.
 * Используется версия v1 с возможностью расширения в будущем.
 * По умолчанию используется PrimeNG.
 * Позволяет легко переключаться между UI библиотеками без изменения кода приложений.
 */

export enum UIVersion {
  V1 = 'v1', // Текущая версия, с возможностью расширения в будущем
}

export enum UIProvider {
  PRIMENG = 'primeng',
  CUSTOM = 'custom',
}

export interface UIConfig {
  provider: UIProvider;
  version: UIVersion;
}

/**
 * Текущая версия UI
 * Можно изменить через переменную окружения UI_VERSION
 */
export const CURRENT_UI_VERSION: UIVersion =
  (typeof process !== 'undefined' && (process.env?.['UI_VERSION'] as UIVersion)) || UIVersion.V1;

/**
 * Текущий провайдер UI
 * Можно изменить через переменную окружения UI_PROVIDER
 */
export const CURRENT_UI_PROVIDER: UIProvider =
  (typeof process !== 'undefined' && (process.env?.['UI_PROVIDER'] as UIProvider)) ||
  UIProvider.PRIMENG;

/**
 * Конфигурация UI по умолчанию
 */
export const DEFAULT_UI_CONFIG: UIConfig = {
  provider: CURRENT_UI_PROVIDER,
  version: CURRENT_UI_VERSION,
};

/**
 * Получить конфигурацию UI
 */
export function getUIConfig(): UIConfig {
  return DEFAULT_UI_CONFIG;
}

/**
 * Получить версию UI
 */
export function getUIVersion(): UIVersion {
  return CURRENT_UI_VERSION;
}

/**
 * Получить провайдера UI
 */
export function getUIProvider(): UIProvider {
  return CURRENT_UI_PROVIDER;
}

/**
 * Проверить, используется ли конкретная версия UI
 */
export function isUIVersion(version: UIVersion): boolean {
  return CURRENT_UI_VERSION === version;
}

/**
 * Проверить, используется ли конкретный провайдер UI
 */
export function isUIProvider(provider: UIProvider): boolean {
  return CURRENT_UI_PROVIDER === provider;
}

/**
 * Получить путь к провайдеру для конкретной версии
 */
export function getProviderPath(version: UIVersion = CURRENT_UI_VERSION): string {
  return `./providers/${version}`;
}
